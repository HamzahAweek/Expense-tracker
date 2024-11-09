<?php
session_start(); 

include 'db.php';

if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id']; 

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $amount = $_POST['amount'];
        $type = $_POST['type'];
        $date = $_POST['date'];
        $notes = $_POST['notes'];

        $stmt = $connection->prepare("INSERT INTO transactions (user_id, amount, type, date, notes) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("idsss", $user_id, $amount, $type, $date, $notes);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Transaction added successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error adding transaction']);
        }

        $stmt->close();
    }
} else {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
}

$connection->close();
?>
