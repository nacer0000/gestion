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
        $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        
        if($user_id) {
            $query = "SELECT * FROM presences WHERE user_id = ? ORDER BY date_pointage DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(1, $user_id);
        } else {
            // Seuls les admins peuvent voir toutes les présences
            if($userData['role'] !== 'admin') {
                $query = "SELECT * FROM presences WHERE user_id = ? ORDER BY date_pointage DESC";
                $stmt = $db->prepare($query);
                $stmt->bindParam(1, $userData['user_id']);
            } else {
                $query = "SELECT * FROM presences ORDER BY date_pointage DESC";
                $stmt = $db->prepare($query);
            }
        }
        
        $stmt->execute();
        
        $presences = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($presences, $row);
        }
        
        http_response_code(200);
        echo json_encode($presences);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->magasin_id) && isset($data->latitude) && isset($data->longitude)) {
            $query = "INSERT INTO presences SET user_id=:user_id, magasin_id=:magasin_id, 
                      latitude=:latitude, longitude=:longitude, type=:type";
            
            $stmt = $db->prepare($query);
            
            $type = isset($data->type) ? $data->type : 'arrivee';
            
            $stmt->bindParam(":user_id", $userData['user_id']);
            $stmt->bindParam(":magasin_id", $data->magasin_id);
            $stmt->bindParam(":latitude", $data->latitude);
            $stmt->bindParam(":longitude", $data->longitude);
            $stmt->bindParam(":type", $type);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Presence recorded successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to record presence"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data"));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}
?>