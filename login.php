<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
$conn = new mysqli("localhost", "root", "", "banana_game");
if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]);
    exit();
}

// Check required fields
if (!isset($_POST['username'], $_POST['password'], $_POST['action'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required fields"
    ]);
    exit();
}

$username = trim($_POST['username']);
$password = trim($_POST['password']);
$action   = $_POST['action'];

if ($username === "" || $password === "") {
    echo json_encode([
        "status" => "error",
        "message" => "Username and password required"
    ]);
    exit();
}

// Check if user exists
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

// =============================
// REGISTER
// =============================
if ($action === "register") {
    if ($result->num_rows > 0) {
        echo json_encode([
            "status" => "error",
            "message" => "User already exists"
        ]);
    } else {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $insert = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $insert->bind_param("ss", $username, $hashedPassword);

        if ($insert->execute()) {
            $user_id = $insert->insert_id;
            echo json_encode([
                "status" => "success",
                "message" => "Registered successfully",
                "user" => [
                    "id" => $user_id,
                    "username" => $username
                ]
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Registration failed"
            ]);
        }
    }
}

// =============================
// LOGIN
// =============================
elseif ($action === "login") {
    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "User not found"
        ]);
    } else {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            session_start();
            $_SESSION['username'] = $username;
            $_SESSION['user_id'] = $user['id'];

            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "user" => [
                    "id" => $user['id'],
                    "username" => $username
                ]
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Wrong password"
            ]);
        }
    }
}

// =============================
// INVALID ACTION
// =============================
else {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid action"
    ]);
}

$conn->close();
?>
