<?php
session_start(); 

include 'db.php';

if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $id = $_POST['id'];
        $amount = $_POST['amount'];
        $type = $_POST['type'];
        $date = $_POST['date'];
        $notes = $_POST['notes'];

        $stmt = $connection->prepare("SELECT user_id FROM transactions WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->bind_result($transaction_user_id);
        $stmt->fetch();

        if ($transaction_user_id == $user_id) {
            $stmt->close(); 

            $stmt = $connection->prepare("UPDATE transactions SET amount = ?, type = ?, date = ?, notes = ? WHERE id = ?");
            $stmt->bind_param("dsssi", $amount, $type, $date, $notes, $id);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Transaction updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error updating transaction']);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => 'You are not authorized to edit this transaction']);
        }
    }
} else {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
}

$connection->close();
?>
