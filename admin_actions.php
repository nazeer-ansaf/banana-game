<?php
header("Content-Type: application/json");

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/session_control.php";

banana_game_require_admin_json();

try {
    $conn = banana_game_db();
} catch (RuntimeException $exception) {
    banana_game_respond([
        "status" => "error",
        "message" => $exception->getMessage()
    ]);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    banana_game_respond([
        "status" => "error",
        "message" => "Unsupported request method"
    ]);
}

$action = trim((string) ($_POST["action"] ?? ""));

if ($action === "update_role") {
    $targetUserId = (int) ($_POST["user_id"] ?? 0);
    $role = trim((string) ($_POST["role"] ?? "player"));

    if ($targetUserId <= 0 || !in_array($role, ["admin", "player"], true)) {
        banana_game_respond([
            "status" => "error",
            "message" => "Invalid role update request"
        ]);
    }

    if ($targetUserId === banana_game_current_user_id() && $role !== "admin") {
        $adminCountResult = $conn->query("SELECT COUNT(*) AS admin_count FROM users WHERE role = 'admin'");
        $adminCountRow = $adminCountResult?->fetch_assoc();
        if ((int) ($adminCountRow["admin_count"] ?? 0) <= 1) {
            banana_game_respond([
                "status" => "error",
                "message" => "At least one admin must remain"
            ]);
        }
    }

    $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->bind_param("si", $role, $targetUserId);
    $stmt->execute();
    $stmt->close();

    if ($targetUserId === banana_game_current_user_id()) {
        $_SESSION["role"] = $role;
    }

    banana_game_respond([
        "status" => "success",
        "message" => "User role updated"
    ]);
}

banana_game_respond([
    "status" => "error",
    "message" => "Invalid action"
]);
