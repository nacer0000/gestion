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
        $query = "SELECT * FROM fournisseurs ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $fournisseurs = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($fournisseurs, $row);
        }
        
        http_response_code(200);
        echo json_encode($fournisseurs);
        break;
        
    case 'POST':
        if($userData['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Admin access required"));
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->nom) && !empty($data->adresse) && !empty($data->contact)) {
            $query = "INSERT INTO fournisseurs SET nom=:nom, adresse=:adresse, contact=:contact, image_url=:image_url";
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":nom", $data->nom);
            $stmt->bindParam(":adresse", $data->adresse);
            $stmt->bindParam(":contact", $data->contact);
            $stmt->bindParam(":image_url", $data->image_url);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Supplier created successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create supplier"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data"));
        }
        break;
        
    case 'PUT':
        if($userData['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Admin access required"));
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $query = "UPDATE fournisseurs SET nom=:nom, adresse=:adresse, contact=:contact, image_url=:image_url WHERE id=:id";
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":id", $data->id);
            $stmt->bindParam(":nom", $data->nom);
            $stmt->bindParam(":adresse", $data->adresse);
            $stmt->bindParam(":contact", $data->contact);
            $stmt->bindParam(":image_url", $data->image_url);
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Supplier updated successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update supplier"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Supplier ID required"));
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
            $query = "DELETE FROM fournisseurs WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->bindParam(1, $data->id);
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Supplier deleted successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete supplier"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Supplier ID required"));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}
?>