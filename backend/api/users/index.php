<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/User.php';
include_once '../../models/Session.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
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
if(!$userData || $userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(array("message" => "Admin access required"));
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $user->read();
        $users = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $user_item = array(
                "id" => $id,
                "email" => $email,
                "role" => $role,
                "magasin_id" => $magasin_id,
                "created_at" => $created_at
            );
            array_push($users, $user_item);
        }
        
        http_response_code(200);
        echo json_encode($users);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->email) && !empty($data->password) && !empty($data->role)) {
            $user->email = $data->email;
            $user->password_hash = $data->password;
            $user->role = $data->role;
            $user->magasin_id = isset($data->magasin_id) ? $data->magasin_id : null;
            
            if($user->create()) {
                http_response_code(201);
                echo json_encode(array("message" => "User created successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create user"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Incomplete data"));
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $user->id = $data->id;
            $user->role = $data->role;
            $user->magasin_id = isset($data->magasin_id) ? $data->magasin_id : null;
            
            if($user->update()) {
                http_response_code(200);
                echo json_encode(array("message" => "User updated successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update user"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "User ID required"));
        }
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $user->id = $data->id;
            
            if($user->delete()) {
                http_response_code(200);
                echo json_encode(array("message" => "User deleted successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete user"));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "User ID required"));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}
?>