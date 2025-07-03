<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/User.php';
include_once '../../models/Session.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$session = new Session($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)) {
    $user->email = $data->email;
    
    if($user->findByEmail()) {
        if($user->verifyPassword($data->password)) {
            $session->user_id = $user->id;
            $token = $session->create();
            
            if($token) {
                http_response_code(200);
                echo json_encode(array(
                    "message" => "Login successful",
                    "token" => $token,
                    "user" => array(
                        "id" => $user->id,
                        "email" => $user->email,
                        "role" => $user->role,
                        "magasin_id" => $user->magasin_id,
                        "created_at" => $user->created_at
                    )
                ));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Session creation failed"));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Invalid credentials"));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "User not found"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Email and password required"));
}
?>