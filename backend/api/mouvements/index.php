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
        $query = "SELECT * FROM mouvements ORDER BY date DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $mouvements = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($mouvements, $row);
        }
        
        http_response_code(200);
        echo json_encode($mouvements);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->produit_id) && !empty($data->magasin_id) && !empty($data->type) && 
           isset($data->quantite) && !empty($data->motif)) {
            
            // Commencer une transaction
            $db->beginTransaction();
            
            try {
                // Insérer le mouvement
                $query = "INSERT INTO mouvements SET produit_id=:produit_id, magasin_id=:magasin_id, 
                          user_id=:user_id, type=:type, quantite=:quantite, motif=:motif";
                
                $stmt = $db->prepare($query);
                
                $stmt->bindParam(":produit_id", $data->produit_id);
                $stmt->bindParam(":magasin_id", $data->magasin_id);
                $stmt->bindParam(":user_id", $userData['user_id']);
                $stmt->bindParam(":type", $data->type);
                $stmt->bindParam(":quantite", $data->quantite);
                $stmt->bindParam(":motif", $data->motif);
                
                $stmt->execute();
                
                // Mettre à jour le stock
                $stockQuery = "SELECT quantite FROM stocks WHERE produit_id = ? AND magasin_id = ?";
                $stockStmt = $db->prepare($stockQuery);
                $stockStmt->bindParam(1, $data->produit_id);
                $stockStmt->bindParam(2, $data->magasin_id);
                $stockStmt->execute();
                
                $currentStock = $stockStmt->fetch(PDO::FETCH_ASSOC);
                
                if($currentStock) {
                    $newQuantity = $data->type === 'entrée' 
                        ? $currentStock['quantite'] + $data->quantite
                        : max(0, $currentStock['quantite'] - $data->quantite);
                    
                    $updateQuery = "UPDATE stocks SET quantite = ? WHERE produit_id = ? AND magasin_id = ?";
                    $updateStmt = $db->prepare($updateQuery);
                    $updateStmt->bindParam(1, $newQuantity);
                    $updateStmt->bindParam(2, $data->produit_id);
                    $updateStmt->bindParam(3, $data->magasin_id);
                    $updateStmt->execute();
                } else if($data->type === 'entrée') {
                    // Créer un nouveau stock si c'est une entrée
                    $createQuery = "INSERT INTO stocks SET produit_id = ?, magasin_id = ?, quantite = ?";
                    $createStmt = $db->prepare($createQuery);
                    $createStmt->bindParam(1, $data->produit_id);
                    $createStmt->bindParam(2, $data->magasin_id);
                    $createStmt->bindParam(3, $data->quantite);
                    $createStmt->execute();
                }
                
                $db->commit();
                
                http_response_code(201);
                echo json_encode(array("message" => "Movement created successfully"));
                
            } catch(Exception $e) {
                $db->rollback();
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create movement"));
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