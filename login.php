<?php
header("Content-Type: application/json");
require_once __DIR__ . "/session_control.php";

banana_game_session_start();

require_once __DIR__ . "/db.php";

try {
    $conn = banana_game_db();
} catch (RuntimeException $exception) {
    banana_game_respond([
        "status" => "error",
        "message" => $exception->getMessage()
    ]);
}

if (!isset($_POST['action'])) {
    banana_game_respond([
        "status" => "error",
        "message" => "Action is required"
    ]);
}

$action = $_POST['action'];

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
        banana_game_respond([
            "status" => "error",
            "message" => "Username and password required"
        ]);
    }

    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    $rememberMe = !empty($_POST["remember_me"]);

    if ($username === "" || $password === "") {
        banana_game_respond([
            "status" => "error",
            "message" => "Username and password cannot be empty"
        ]);
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($action === "register") {
        if ($result->num_rows > 0) {
            banana_game_respond([
                "status" => "error",
                "message" => "User already exists"
            ]);
        }

        $email = trim($_POST['email'] ?? '');
        $phoneNumber = trim($_POST['phone_number'] ?? '');
        $role = banana_game_get_new_user_role($conn);

        if ($email === "") {
            banana_game_respond([
                "status" => "error",
                "message" => "Email is required for registration"
            ]);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            banana_game_respond([
                "status" => "error",
                "message" => "Enter a valid email address"
            ]);
        }

        $phoneNumber = $phoneNumber !== "" ? $phoneNumber : null;
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $insert = $conn->prepare(
            "INSERT INTO users (username, password, email, phone_number, role) VALUES (?, ?, ?, ?, ?)"
        );
        $insert->bind_param("sssss", $username, $hashedPassword, $email, $phoneNumber, $role);

        if ($insert->execute()) {
            $user_id = $insert->insert_id;
            banana_game_create_profile_if_missing($conn, $user_id);
            banana_game_create_settings_if_missing($conn, $user_id);
            banana_game_login_user($user_id, $username, $role, $rememberMe);

            banana_game_respond([
                "status" => "success",
                "message" => "Registered successfully",
                "user" => [
                    "id" => $user_id,
                    "username" => $username,
                    "role" => $role
                ]
            ]);
        }

        banana_game_respond([
            "status" => "error",
            "message" => "Registration failed"
        ]);
    }

    if ($result->num_rows === 0) {
        banana_game_respond([
            "status" => "error",
            "message" => "User not found"
        ]);
    }

    $user = $result->fetch_assoc();
    $storedPassword = (string) ($user["password"] ?? "");
    $passwordMatches = $storedPassword !== "" && password_verify($password, $storedPassword);
    $legacyPlaintextMatch = $storedPassword !== "" && hash_equals($storedPassword, $password);

    if (!$passwordMatches && !$legacyPlaintextMatch) {
        banana_game_respond([
            "status" => "error",
            "message" => "Wrong password"
        ]);
    }

    if ($legacyPlaintextMatch) {
        $upgradedPasswordHash = password_hash($password, PASSWORD_DEFAULT);
        $upgradeStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $upgradeStmt->bind_param("si", $upgradedPasswordHash, $user["id"]);
        $upgradeStmt->execute();
        $upgradeStmt->close();
    }

    banana_game_create_profile_if_missing($conn, (int) $user['id']);
    banana_game_create_settings_if_missing($conn, (int) $user["id"]);
    banana_game_login_user((int) $user['id'], (string) $user['username'], (string) ($user["role"] ?? "player"), $rememberMe);

    banana_game_respond([
        "status" => "success",
        "message" => "Login successful",
        "user" => [
            "id" => $user['id'],
            "username" => $user['username'],
            "role" => $user["role"] ?? "player"
        ]
    ]);
}

if ($action === "social_login") {
    $social_id = trim($_POST['social_id'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $rememberMe = !empty($_POST["remember_me"]);

    if ($social_id === "" || $username === "") {
        banana_game_respond([
            "status" => "error",
            "message" => "Social ID and username are required"
        ]);
    }

    if ($email === "") {
        banana_game_respond([
            "status" => "error",
            "message" => "Email is required for registration"
        ]);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        banana_game_respond([
            "status" => "error",
            "message" => "Enter a valid email address"
        ]);
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE social_id = ?");
    $stmt->bind_param("s", $social_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        banana_game_create_profile_if_missing($conn, (int) $user['id']);
        banana_game_create_settings_if_missing($conn, (int) $user["id"]);
        banana_game_login_user((int) $user['id'], (string) $user['username'], (string) ($user["role"] ?? "player"), $rememberMe);

        banana_game_respond([
            "status" => "success",
            "message" => "Login successful",
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "role" => $user["role"] ?? "player"
            ]
        ]);
    }

    $username = generateUniqueUsername($conn, $username);
    $role = banana_game_get_new_user_role($conn);

    $insert = $conn->prepare("INSERT INTO users (username, social_id, email, role) VALUES (?, ?, ?, ?)");
    $insert->bind_param("ssss", $username, $social_id, $email, $role);

    if ($insert->execute()) {
        $user_id = $insert->insert_id;
        banana_game_create_profile_if_missing($conn, $user_id);
        banana_game_create_settings_if_missing($conn, $user_id);
        banana_game_login_user($user_id, $username, $role, $rememberMe);

        banana_game_respond([
            "status" => "success",
            "message" => "Registered via social login",
            "user" => [
                "id" => $user_id,
                "username" => $username,
                "role" => $role
            ]
        ]);
    }

    banana_game_respond([
        "status" => "error",
        "message" => "Social registration failed: " . $conn->error
    ]);
}

banana_game_respond([
    "status" => "error",
    "message" => "Invalid action"
]);
?>
