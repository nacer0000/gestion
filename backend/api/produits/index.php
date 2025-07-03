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
        $query = "SELECT * FROM produits ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $produits = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($produits, $row);
        }
        
        http_response_code(200);
        echo json_encode($produits);
        break;
        
    case 'POST':
        if($userData['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Admin access required"));
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->nom) && !empty($data->reference) && !empty($data->categorie) && isset($data->prix_unitaire)) {
            $query = "INSERT INTO produits SET nom=:nom, reference=:reference, categorie=:categorie, 
                      prix_unitaire=:prix_unitaire, seuil_alerte=:seuil_alerte, image_url=:image_url, 
                      fournisseur_id=:fournisseur_id";
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":nom", $data->nom);
            $stmt->bindParam(":reference", $data->reference);
            $stmt->bindParam(":categorie", $data->categorie);
            $stmt->bindParam(":prix_unitaire", $data->prix_unitaire);
            $stmt->bindParam(":seuil_alerte", $data->seuil_alerte);
            $stmt->bindParam(":image_url", $data->image_url);
            $stmt->bindParam(":fournisseur_id", $data->fournisseur_id);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Product created successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create product"));
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
            $query = "UPDATE produits SET nom=:nom, reference=:reference, categorie=:categorie, 
                      prix_unitaire=:prix_unitaire, seuil_alerte=:seuil_alerte, image_url=:image_url, 
                      fournisseur_id=:fournisseur_id WHERE id=:id";
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":id", $data->id);
            $stmt->bindParam(":nom", $data->nom);
            $stmt->bindParam(":reference", $data->reference);
            $stmt->bindParam(":categorie", $data->categorie);
            $stmt->bindParam(":prix_unitaire", $data->prix_unitaire);
            $stmt->bindParam(":seuil_alerte", $data->seuil_alerte);
            $stmt->bindParam(":image_url", $data->image_url);
            $stmt->bindParam(":fournisseur_id", $data->fournisseur_id);
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Product updated successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update product"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Product ID required"));
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
            $query = "DELETE FROM produits WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->bindParam(1, $data->id);
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Product deleted successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete product"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Product ID required"));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}
?>