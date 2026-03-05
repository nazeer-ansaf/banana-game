<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// --- Database connection ---
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'banana_game';

$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    die(json_encode(['status'=>'error','message'=>'Database connection failed']));
}

// -------------------
// GET: Fetch leaderboard
// -------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = "SELECT u.username, MAX(s.score) AS score 
              FROM scores s 
              JOIN users u ON s.user_id = u.id 
              GROUP BY s.user_id 
              ORDER BY score DESC 
              LIMIT 10";

    $result = $conn->query($query);
    $leaderboard = [];

    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = [
            'username' => $row['username'],       // must match JS
            'score' => (int)$row['score']         // ensure number
        ];
    }

    // Reindex array to ensure numeric indices for JS
    echo json_encode(array_values($leaderboard));
    exit();
}

// -------------------
// POST: Save user score
// -------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Use $_POST because JS sends application/x-www-form-urlencoded
    $user_id = $_POST['user_id'] ?? null;
    $score = $_POST['score'] ?? null;

    if (!$user_id || !$score) {
        echo json_encode(['status'=>'error','message'=>'Missing data']);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO scores (user_id, score, created_at) VALUES (?, ?, NOW())");
    $stmt->bind_param("ii", $user_id, $score);

    if ($stmt->execute()) {
        echo json_encode(['status'=>'success','message'=>'Score saved']);
    } else {
        echo json_encode(['status'=>'error','message'=>$conn->error]);
    }

    $stmt->close();
}

$conn->close();
?>