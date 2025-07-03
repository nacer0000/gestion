<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Session.php';

$database = new Database();
$db = $database->getConnection();

$session = new Session($db);

$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if($token) {
    $userData = $session->validateToken($token);
    
    if($userData) {
        http_response_code(200);
        echo json_encode(array(
            "valid" => true,
            "user" => array(
                "id" => $userData['user_id'],
                "email" => $userData['email'],
                "role" => $userData['role'],
                "magasin_id" => $userData['magasin_id'],
                "created_at" => $userData['created_at']
            )
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("valid" => false, "message" => "Invalid or expired token"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("valid" => false, "message" => "Token required"));
}
?>