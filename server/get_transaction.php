<?php
session_start(); 

include 'db.php'; 

if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];

    $stmt = $connection->prepare("SELECT * FROM transactions WHERE user_id = ?");
    $stmt->bind_param("i", $user_id); 

    if ($stmt) {
        $stmt->execute();
        $result = $stmt->get_result();

        $transactions = [];
        while ($row = $result->fetch_assoc()) {
            $transactions[] = $row; 
        }

        echo json_encode(['success' => true, 'transactions' => $transactions]);

        $stmt->close(); 
    } else {
        echo json_encode(['success' => false, 'message' => 'Error preparing SQL statement']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
}

$connection->close(); 
?>
