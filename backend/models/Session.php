<?php
class Session {
    private $conn;
    private $table_name = "sessions";

    public $id;
    public $user_id;
    public $token;
    public $expires_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET user_id=:user_id, token=:token, expires_at=:expires_at";

        $stmt = $this->conn->prepare($query);

        $this->token = bin2hex(random_bytes(32));
        $this->expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":token", $this->token);
        $stmt->bindParam(":expires_at", $this->expires_at);

        if($stmt->execute()) {
            return $this->token;
        }

        return false;
    }

    public function validateToken($token) {
        $query = "SELECT s.*, u.* FROM " . $this->table_name . " s 
                  JOIN users u ON s.user_id = u.id 
                  WHERE s.token = ? AND s.expires_at > NOW() LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $token);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deleteToken($token) {
        $query = "DELETE FROM " . $this->table_name . " WHERE token = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $token);
        return $stmt->execute();
    }

    public function cleanExpiredTokens() {
        $query = "DELETE FROM " . $this->table_name . " WHERE expires_at < NOW()";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute();
    }
}
?>