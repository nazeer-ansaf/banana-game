<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Database configuration
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'banana_game';

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]));
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// If JSON decode fails, try form data
if (!$input) {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $action = $_POST['action'] ?? '';
    $email = $_POST['email'] ?? '';
} else {
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    $action = $input['action'] ?? '';
    $email = $input['email'] ?? '';
}

// Validate input
if (empty($username) || empty($password) || empty($action)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Username and password are required'
    ]);
    exit;
}

// Handle different actions
if ($action === 'login') {
    // Login user
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $username); // $username holds username OR email
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username']
                ]
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid password'
            ]);
        }
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'User not found'
        ]);
    }
    $stmt->close();
    
} elseif ($action === 'register') {
    // Check if user exists
    $check = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $check->bind_param("s", $username);
    $check->execute();
    $check->store_result();
    
    if ($check->num_rows > 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Username already exists'
        ]);
        $check->close();
        exit;
    }
    $check->close();
    
    // Hash password and insert new user
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $hashedPassword, $email);
    
    if ($stmt->execute()) {
        $user_id = $stmt->insert_id;
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $username;
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Registration successful',
            'user' => [
                'id' => $user_id,
                'username' => $username,
                'email' => $email
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Registration failed: ' . $conn->error
        ]);
    }
    $stmt->close();
    
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid action'
    ]);
}

$conn->close();
?>