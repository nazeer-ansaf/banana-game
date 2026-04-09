<?php
header("Content-Type: application/json");

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/session_control.php";

banana_game_require_auth_json();

try {
    $conn = banana_game_db();
} catch (RuntimeException $exception) {
    banana_game_respond([
        "status" => "error",
        "message" => $exception->getMessage()
    ]);
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    banana_game_respond([
        "status" => "error",
        "message" => "Only GET requests are supported"
    ]);
}

$userId = banana_game_current_user_id();

if ($userId <= 0) {
    banana_game_respond([
        "status" => "error",
        "message" => "Valid user_id is required"
    ]);
}

banana_game_create_profile_if_missing($conn, $userId);

$profileStmt = $conn->prepare(
    "SELECT
        u.id,
        u.username,
        u.email,
        u.phone_number,
        u.role,
        u.profile_photo,
        u.created_at,
        p.xp,
        p.coins,
        p.total_runs,
        p.wins,
        p.best_score,
        p.best_level,
        p.total_correct,
        p.total_wrong,
        p.longest_streak,
        p.last_mode
    FROM users u
    LEFT JOIN player_profiles p ON p.user_id = u.id
    WHERE u.id = ?"
);
$profileStmt->bind_param("i", $userId);
$profileStmt->execute();
$profile = $profileStmt->get_result()->fetch_assoc();
$profileStmt->close();

if (!$profile) {
    banana_game_respond([
        "status" => "error",
        "message" => "User not found"
    ]);
}

$achievementStmt = $conn->prepare(
    "SELECT achievement_key, unlocked_at
    FROM user_achievements
    WHERE user_id = ?
    ORDER BY unlocked_at DESC"
);
$achievementStmt->bind_param("i", $userId);
$achievementStmt->execute();
$achievementResult = $achievementStmt->get_result();
$achievements = [];

while ($row = $achievementResult->fetch_assoc()) {
    $achievements[] = [
        "key" => $row["achievement_key"],
        "unlocked_at" => $row["unlocked_at"]
    ];
}

$achievementStmt->close();

$runsStmt = $conn->prepare(
    "SELECT mode, score, highest_level, total_correct, total_wrong, longest_streak, result, created_at
    FROM scores
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 5"
);
$runsStmt->bind_param("i", $userId);
$runsStmt->execute();
$runsResult = $runsStmt->get_result();
$recentRuns = [];

while ($row = $runsResult->fetch_assoc()) {
    $recentRuns[] = [
        "mode" => $row["mode"],
        "score" => (int) $row["score"],
        "highest_level" => (int) $row["highest_level"],
        "total_correct" => (int) $row["total_correct"],
        "total_wrong" => (int) $row["total_wrong"],
        "longest_streak" => (int) $row["longest_streak"],
        "result" => $row["result"],
        "created_at" => $row["created_at"]
    ];
}

$runsStmt->close();

$settings = banana_game_get_user_settings($conn, $userId);

banana_game_respond([
    "status" => "success",
    "account" => [
        "id" => (int) $profile["id"],
        "username" => $profile["username"],
        "email" => $profile["email"] ?? "",
        "phone_number" => $profile["phone_number"] ?? "",
        "role" => $profile["role"] ?? "player",
        "profile_photo" => $profile["profile_photo"] ?? "",
        "created_at" => $profile["created_at"] ?? null
    ],
    "profile" => [
        "id" => (int) $profile["id"],
        "username" => $profile["username"],
        "xp" => (int) ($profile["xp"] ?? 0),
        "coins" => (int) ($profile["coins"] ?? 0),
        "total_runs" => (int) ($profile["total_runs"] ?? 0),
        "wins" => (int) ($profile["wins"] ?? 0),
        "best_score" => (int) ($profile["best_score"] ?? 0),
        "best_level" => (int) ($profile["best_level"] ?? 0),
        "total_correct" => (int) ($profile["total_correct"] ?? 0),
        "total_wrong" => (int) ($profile["total_wrong"] ?? 0),
        "longest_streak" => (int) ($profile["longest_streak"] ?? 0),
        "last_mode" => $profile["last_mode"] ?? "campaign"
    ],
    "settings" => $settings,
    "achievements" => $achievements,
    "recent_runs" => $recentRuns
]);
?>
