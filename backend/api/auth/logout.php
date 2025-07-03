<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Session.php';

$database = new Database();
$db = $database->getConnection();

$session = new Session($db);

$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if($token && $session->deleteToken($token)) {
    http_response_code(200);
    echo json_encode(array("message" => "Logout successful"));
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid token"));
}
?>