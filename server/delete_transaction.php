<?php
session_start(); 

include 'db.php';

if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $id = $_POST['id'];

        $stmt = $connection->prepare("SELECT user_id FROM transactions WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->bind_result($transaction_user_id);
        $stmt->fetch();

        if ($transaction_user_id == $user_id) {
            $stmt->close(); 
            $stmt = $connection->prepare("DELETE FROM transactions WHERE id = ?");
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Transaction deleted successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error deleting transaction']);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => 'You are not authorized to delete this transaction']);
        }
    }
} else {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
}

$connection->close();
?>
