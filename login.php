<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

$conn = new mysqli("localhost", "root", "", "banana_game");
if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]);
    exit();
}

if (!isset($_POST['action'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Action is required"
    ]);
    exit();
}

$action = $_POST['action'];

function respond($payload) {
    echo json_encode($payload);
    exit();
}

function sanitizeUsername($value) {
    $clean = preg_replace('/[^a-zA-Z0-9_]/', '_', trim($value));
    $clean = preg_replace('/_+/', '_', $clean);
    return trim($clean, '_');
}

function generateUniqueUsername($conn, $baseUsername) {
    $base = sanitizeUsername($baseUsername);
    if ($base === "") {
        $base = "player";
    }

    $candidate = substr($base, 0, 40);
    $suffix = 1;

    while (true) {
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $candidate);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return $candidate;
        }

        $candidate = substr($base, 0, 34) . "_" . $suffix;
        $suffix++;
    }
}

if ($action === "register" || $action === "login") {
    if (!isset($_POST['username'], $_POST['password'])) {
        respond([
            "status" => "error",
            "message" => "Username and password required"
        ]);
    }

    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    if ($username === "" || $password === "") {
        respond([
            "status" => "error",
            "message" => "Username and password cannot be empty"
        ]);
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($action === "register") {
        if ($result->num_rows > 0) {
            respond([
                "status" => "error",
                "message" => "User already exists"
            ]);
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $insert = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $insert->bind_param("ss", $username, $hashedPassword);

        if ($insert->execute()) {
            $user_id = $insert->insert_id;
            $_SESSION['username'] = $username;
            $_SESSION['user_id'] = $user_id;

            respond([
                "status" => "success",
                "message" => "Registered successfully",
                "user" => [
                    "id" => $user_id,
                    "username" => $username
                ]
            ]);
        }

        respond([
            "status" => "error",
            "message" => "Registration failed"
        ]);
    }

    if ($result->num_rows === 0) {
        respond([
            "status" => "error",
            "message" => "User not found"
        ]);
    }

    $user = $result->fetch_assoc();
    if (!password_verify($password, $user['password'])) {
        respond([
            "status" => "error",
            "message" => "Wrong password"
        ]);
    }

    $_SESSION['username'] = $username;
    $_SESSION['user_id'] = $user['id'];

    respond([
        "status" => "success",
        "message" => "Login successful",
        "user" => [
            "id" => $user['id'],
            "username" => $username
        ]
    ]);
}

if ($action === "social_login") {
    $social_id = trim($_POST['social_id'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');

    if ($social_id === "" || $username === "") {
        respond([
            "status" => "error",
            "message" => "Social ID and username are required"
        ]);
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE social_id = ?");
    $stmt->bind_param("s", $social_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $_SESSION['username'] = $user['username'];
        $_SESSION['user_id'] = $user['id'];

        respond([
            "status" => "success",
            "message" => "Login successful",
            "user" => [
                "id" => $user['id'],
                "username" => $user['username']
            ]
        ]);
    }

    $username = generateUniqueUsername($conn, $username);
    $email = $email !== "" ? $email : null;

    $insert = $conn->prepare("INSERT INTO users (username, social_id, email) VALUES (?, ?, ?)");
    $insert->bind_param("sss", $username, $social_id, $email);

    if ($insert->execute()) {
        $user_id = $insert->insert_id;
        $_SESSION['username'] = $username;
        $_SESSION['user_id'] = $user_id;

        respond([
            "status" => "success",
            "message" => "Registered via social login",
            "user" => [
                "id" => $user_id,
                "username" => $username
            ]
        ]);
    }

    respond([
        "status" => "error",
        "message" => "Social registration failed: " . $conn->error
    ]);
}

respond([
    "status" => "error",
    "message" => "Invalid action"
]);
?>
