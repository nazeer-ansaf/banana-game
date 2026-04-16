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
$targetUserId = (int) ($_POST["user_id"] ?? 0);

if ($targetUserId <= 0) {
    banana_game_respond([
        "status" => "error",
        "message" => "User selection is required"
    ]);
}

if ($action === "update_role") {
    $role = trim((string) ($_POST["role"] ?? "player"));

    if (!in_array($role, ["admin", "player"], true)) {
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

if ($action === "reset_progress") {
    $conn->begin_transaction();

    try {
        $deleteScores = $conn->prepare("DELETE FROM scores WHERE user_id = ?");
        $deleteScores->bind_param("i", $targetUserId);
        $deleteScores->execute();
        $deleteScores->close();

        $deleteAchievements = $conn->prepare("DELETE FROM user_achievements WHERE user_id = ?");
        $deleteAchievements->bind_param("i", $targetUserId);
        $deleteAchievements->execute();
        $deleteAchievements->close();

        $resetProfile = $conn->prepare(
            "UPDATE player_profiles
             SET xp = 0,
                 coins = 0,
                 total_runs = 0,
                 wins = 0,
                 best_score = 0,
                 best_level = 0,
                 total_correct = 0,
                 total_wrong = 0,
                 longest_streak = 0,
                 last_mode = 'campaign'
             WHERE user_id = ?"
        );
        $resetProfile->bind_param("i", $targetUserId);
        $resetProfile->execute();
        $resetProfile->close();

        $conn->commit();
    } catch (Throwable $throwable) {
        $conn->rollback();
        banana_game_respond([
            "status" => "error",
            "message" => "Unable to reset player progress"
        ]);
    }

    banana_game_respond([
        "status" => "success",
        "message" => "Player progress reset"
    ]);
}

if ($action === "clear_photo") {
    $photoStmt = $conn->prepare("SELECT profile_photo FROM users WHERE id = ? LIMIT 1");
    $photoStmt->bind_param("i", $targetUserId);
    $photoStmt->execute();
    $photo = $photoStmt->get_result()->fetch_assoc()["profile_photo"] ?? "";
    $photoStmt->close();

    $updateStmt = $conn->prepare("UPDATE users SET profile_photo = NULL WHERE id = ?");
    $updateStmt->bind_param("i", $targetUserId);
    $updateStmt->execute();
    $updateStmt->close();

    if (is_string($photo) && str_starts_with($photo, "uploads/")) {
        $fullPath = __DIR__ . DIRECTORY_SEPARATOR . str_replace("/", DIRECTORY_SEPARATOR, $photo);
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }

    banana_game_respond([
        "status" => "success",
        "message" => "Profile photo cleared"
    ]);
}

banana_game_respond([
    "status" => "error",
    "message" => "Invalid action"
]);
