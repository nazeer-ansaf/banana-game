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

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    banana_game_respond([
        "status" => "error",
        "message" => "Only GET requests are supported"
    ]);
}

$summary = [
    "users" => 0,
    "admins" => 0,
    "runs" => 0,
    "wins" => 0,
];

$summaryResult = $conn->query(
    "SELECT
        COUNT(*) AS users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins
     FROM users"
);
if ($summaryRow = $summaryResult?->fetch_assoc()) {
    $summary["users"] = (int) ($summaryRow["users"] ?? 0);
    $summary["admins"] = (int) ($summaryRow["admins"] ?? 0);
}

$runSummaryResult = $conn->query(
    "SELECT
        COUNT(*) AS runs,
        SUM(CASE WHEN result = 'won' THEN 1 ELSE 0 END) AS wins
     FROM scores"
);
if ($runSummaryRow = $runSummaryResult?->fetch_assoc()) {
    $summary["runs"] = (int) ($runSummaryRow["runs"] ?? 0);
    $summary["wins"] = (int) ($runSummaryRow["wins"] ?? 0);
}

$usersResult = $conn->query(
    "SELECT
        u.id,
        u.username,
        u.email,
        u.phone_number,
        u.role,
        u.profile_photo,
        COALESCE(p.total_runs, 0) AS total_runs,
        COALESCE(p.best_score, 0) AS best_score,
        COALESCE(p.last_mode, 'campaign') AS last_mode
     FROM users u
     LEFT JOIN player_profiles p ON p.user_id = u.id
     ORDER BY
        CASE WHEN u.role = 'admin' THEN 0 ELSE 1 END,
        u.username ASC"
);

$users = [];
while ($row = $usersResult?->fetch_assoc()) {
    $users[] = [
        "id" => (int) $row["id"],
        "username" => $row["username"],
        "email" => $row["email"] ?? "",
        "phone_number" => $row["phone_number"] ?? "",
        "role" => $row["role"] ?? "player",
        "profile_photo" => $row["profile_photo"] ?? "",
        "total_runs" => (int) $row["total_runs"],
        "best_score" => (int) $row["best_score"],
        "last_mode" => $row["last_mode"] ?? "campaign",
    ];
}

banana_game_respond([
    "status" => "success",
    "summary" => $summary,
    "users" => $users
]);
