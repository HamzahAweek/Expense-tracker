<?php
session_start(); 

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $stmt = $connection->prepare("SELECT id, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($id, $hashed_password);
    $stmt->fetch();

    if ($id && password_verify($password, $hashed_password)) {
        $_SESSION['user_id'] = $id;

        echo json_encode(['success' => true, 'message' => 'Login successful', 'userId' => $id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
    $stmt->close();
}

$connection->close();
?>