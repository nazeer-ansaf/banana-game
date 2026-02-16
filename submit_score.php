<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
$conn = new mysqli("localhost", "root", "", "banana_game");
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

// Check required fields
if (!isset($_POST['user_id'], $_POST['score'])) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

$user_id = intval($_POST['user_id']);
$score   = intval($_POST['score']);

// Insert score
$stmt = $conn->prepare("INSERT INTO scores (user_id, score) VALUES (?, ?)");
$stmt->bind_param("ii", $user_id, $score);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Score saved"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to save score"]);
}

$conn->close();
?>
