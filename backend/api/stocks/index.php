<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Session.php';

$database = new Database();
$db = $database->getConnection();

$session = new Session($db);

// Vérification de l'authentification
$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if(!$token) {
    http_response_code(401);
    echo json_encode(array("message" => "Access denied"));
    exit;
}

$userData = $session->validateToken($token);
if(!$userData) {
    http_response_code(403);
    echo json_encode(array("message" => "Invalid token"));
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $magasin_id = isset($_GET['magasin_id']) ? $_GET['magasin_id'] : null;
        
        if($magasin_id) {
            $query = "SELECT * FROM stocks WHERE magasin_id = ? ORDER BY updated_at DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(1, $magasin_id);
        } else {
            $query = "SELECT * FROM stocks ORDER BY updated_at DESC";
            $stmt = $db->prepare($query);
        }
        
        $stmt->execute();
        
        $stocks = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($stocks, $row);
        }
        
        http_response_code(200);
        echo json_encode($stocks);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->produit_id) && !empty($data->magasin_id) && isset($data->quantite)) {
            // Vérifier si le stock existe déjà
            $checkQuery = "SELECT id FROM stocks WHERE produit_id = ? AND magasin_id = ?";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(1, $data->produit_id);
            $checkStmt->bindParam(2, $data->magasin_id);
            $checkStmt->execute();
            
            if($checkStmt->rowCount() > 0) {
                // Mettre à jour le stock existant
                $query = "UPDATE stocks SET quantite=:quantite WHERE produit_id=:produit_id AND magasin_id=:magasin_id";
            } else {
                // Créer un nouveau stock
                $query = "INSERT INTO stocks SET produit_id=:produit_id, magasin_id=:magasin_id, quantite=:quantite";
            }
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":produit_id", $data->produit_id);
            $stmt->bindParam(":magasin_id", $data->magasin_id);
            $stmt->bindParam(":quantite", $data->quantite);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Stock updated successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update stock"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data"));
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $query = "UPDATE stocks SET quantite=:quantite WHERE id=:id";
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":id", $data->id);
            $stmt->bindParam(":quantite", $data->quantite);
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Stock updated successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update stock"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Stock ID required"));
        }
        break;
        
    case 'DELETE':
        if($userData['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Admin access required"));
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $query = "DELETE FROM stocks WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->bindParam(1, $data->id);
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Stock deleted successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete stock"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Stock ID required"));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}
?>