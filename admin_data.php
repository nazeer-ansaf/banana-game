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
    "players" => 0,
    "runs" => 0,
    "wins" => 0,
    "win_rate" => 0,
    "top_score" => 0,
    "average_score" => 0,
    "active_today" => 0,
    "no_run_users" => 0,
    "recent_signups" => 0,
];

$summaryResult = $conn->query(
    "SELECT
        COUNT(*) AS users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins,
        SUM(CASE WHEN role = 'player' THEN 1 ELSE 0 END) AS players,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS recent_signups
     FROM users"
);

if ($summaryRow = $summaryResult?->fetch_assoc()) {
    $summary["users"] = (int) ($summaryRow["users"] ?? 0);
    $summary["admins"] = (int) ($summaryRow["admins"] ?? 0);
    $summary["players"] = (int) ($summaryRow["players"] ?? 0);
    $summary["recent_signups"] = (int) ($summaryRow["recent_signups"] ?? 0);
}

$runSummaryResult = $conn->query(
    "SELECT
        COUNT(*) AS runs,
        SUM(CASE WHEN result = 'won' THEN 1 ELSE 0 END) AS wins,
        MAX(score) AS top_score,
        AVG(score) AS average_score,
        COUNT(DISTINCT CASE WHEN DATE(created_at) = CURDATE() THEN user_id END) AS active_today
     FROM scores"
);

if ($runSummaryRow = $runSummaryResult?->fetch_assoc()) {
    $summary["runs"] = (int) ($runSummaryRow["runs"] ?? 0);
    $summary["wins"] = (int) ($runSummaryRow["wins"] ?? 0);
    $summary["top_score"] = (int) ($runSummaryRow["top_score"] ?? 0);
    $summary["average_score"] = round((float) ($runSummaryRow["average_score"] ?? 0), 1);
    $summary["active_today"] = (int) ($runSummaryRow["active_today"] ?? 0);
    $summary["win_rate"] = $summary["runs"] > 0
        ? round(($summary["wins"] / $summary["runs"]) * 100, 1)
        : 0;
}

$usersResult = $conn->query(
    "SELECT
        u.id,
        u.username,
        u.email,
        u.phone_number,
        u.role,
        u.profile_photo,
        u.created_at,
        COALESCE(s.total_runs, 0) AS total_runs,
        COALESCE(s.wins, 0) AS wins,
        COALESCE(s.best_score, 0) AS best_score,
        COALESCE(s.best_level, 0) AS best_level,
        COALESCE(s.total_correct, 0) AS total_correct,
        COALESCE(s.total_wrong, 0) AS total_wrong,
        COALESCE(s.longest_streak, 0) AS longest_streak,
        COALESCE(s.average_score, 0) AS average_score,
        COALESCE(s.last_mode, COALESCE(p.last_mode, 'campaign')) AS last_mode,
        s.last_played_at
     FROM users u
     LEFT JOIN player_profiles p ON p.user_id = u.id
     LEFT JOIN (
        SELECT
            user_id,
            COUNT(*) AS total_runs,
            SUM(CASE WHEN result = 'won' THEN 1 ELSE 0 END) AS wins,
            MAX(score) AS best_score,
            MAX(highest_level) AS best_level,
            SUM(total_correct) AS total_correct,
            SUM(total_wrong) AS total_wrong,
            MAX(longest_streak) AS longest_streak,
            AVG(score) AS average_score,
            SUBSTRING_INDEX(
                GROUP_CONCAT(mode ORDER BY created_at DESC SEPARATOR ','),
                ',',
                1
            ) AS last_mode,
            MAX(created_at) AS last_played_at
        FROM scores
        GROUP BY user_id
     ) s ON s.user_id = u.id
     ORDER BY
        CASE WHEN u.role = 'admin' THEN 0 ELSE 1 END,
        u.username ASC"
);

$users = [];
while ($row = $usersResult?->fetch_assoc()) {
    $totalRuns = (int) ($row["total_runs"] ?? 0);
    $wins = (int) ($row["wins"] ?? 0);
    $totalCorrect = (int) ($row["total_correct"] ?? 0);
    $totalWrong = (int) ($row["total_wrong"] ?? 0);
    $attempts = $totalCorrect + $totalWrong;
    $accuracy = $attempts > 0 ? round(($totalCorrect / $attempts) * 100, 1) : 0;
    $winRate = $totalRuns > 0 ? round(($wins / $totalRuns) * 100, 1) : 0;
    $lastPlayedAt = $row["last_played_at"] ?? null;
    $joinedAt = $row["created_at"] ?? null;

    $isFlagged = $totalRuns === 0;
    if (!$isFlagged && $lastPlayedAt !== null) {
        $isFlagged = strtotime((string) $lastPlayedAt) < strtotime("-7 days");
    }
    if (!$isFlagged && $attempts > 0) {
        $isFlagged = $accuracy < 35;
    }

    if ($totalRuns === 0) {
        $summary["no_run_users"]++;
    }

    $users[] = [
        "id" => (int) $row["id"],
        "username" => (string) $row["username"],
        "email" => (string) ($row["email"] ?? ""),
        "phone_number" => (string) ($row["phone_number"] ?? ""),
        "role" => (string) ($row["role"] ?? "player"),
        "profile_photo" => (string) ($row["profile_photo"] ?? ""),
        "joined_at" => $joinedAt,
        "total_runs" => $totalRuns,
        "wins" => $wins,
        "win_rate" => $winRate,
        "best_score" => (int) ($row["best_score"] ?? 0),
        "best_level" => (int) ($row["best_level"] ?? 0),
        "total_correct" => $totalCorrect,
        "total_wrong" => $totalWrong,
        "accuracy" => $accuracy,
        "average_score" => round((float) ($row["average_score"] ?? 0), 1),
        "longest_streak" => (int) ($row["longest_streak"] ?? 0),
        "last_mode" => (string) ($row["last_mode"] ?? "campaign"),
        "last_played_at" => $lastPlayedAt,
        "is_flagged" => $isFlagged,
        "status_label" => $totalRuns === 0
            ? "New account"
            : ($isFlagged ? "Needs review" : "Healthy"),
    ];
}

$topPlayersResult = $conn->query(
    "SELECT
        u.id,
        u.username,
        COALESCE(MAX(s.score), 0) AS best_score,
        COALESCE(AVG(s.score), 0) AS average_score,
        COALESCE(SUM(CASE WHEN s.result = 'won' THEN 1 ELSE 0 END), 0) AS wins,
        COUNT(s.id) AS total_runs
     FROM users u
     LEFT JOIN scores s ON s.user_id = u.id
     GROUP BY u.id, u.username
     ORDER BY best_score DESC, average_score DESC, wins DESC, total_runs DESC, u.username ASC
     LIMIT 6"
);

$topPlayers = [];
while ($row = $topPlayersResult?->fetch_assoc()) {
    $totalRuns = (int) ($row["total_runs"] ?? 0);
    $wins = (int) ($row["wins"] ?? 0);
    $topPlayers[] = [
        "id" => (int) $row["id"],
        "username" => (string) $row["username"],
        "best_score" => (int) ($row["best_score"] ?? 0),
        "average_score" => round((float) ($row["average_score"] ?? 0), 1),
        "wins" => $wins,
        "total_runs" => $totalRuns,
        "win_rate" => $totalRuns > 0 ? round(($wins / $totalRuns) * 100, 1) : 0,
    ];
}

$recentActivityResult = $conn->query(
    "SELECT
        s.id,
        u.username,
        s.score,
        s.mode,
        s.highest_level,
        s.result,
        s.created_at
     FROM scores s
     INNER JOIN users u ON u.id = s.user_id
     ORDER BY s.created_at DESC, s.id DESC
     LIMIT 10"
);

$recentActivity = [];
while ($row = $recentActivityResult?->fetch_assoc()) {
    $recentActivity[] = [
        "id" => (int) $row["id"],
        "username" => (string) $row["username"],
        "score" => (int) ($row["score"] ?? 0),
        "mode" => (string) ($row["mode"] ?? "campaign"),
        "highest_level" => (int) ($row["highest_level"] ?? 0),
        "result" => (string) ($row["result"] ?? "failed"),
        "created_at" => $row["created_at"] ?? null,
    ];
}

$recentSignupsResult = $conn->query(
    "SELECT id, username, role, created_at
     FROM users
     ORDER BY created_at DESC, id DESC
     LIMIT 6"
);

$recentSignups = [];
while ($row = $recentSignupsResult?->fetch_assoc()) {
    $recentSignups[] = [
        "id" => (int) $row["id"],
        "username" => (string) $row["username"],
        "role" => (string) ($row["role"] ?? "player"),
        "created_at" => $row["created_at"] ?? null,
    ];
}

$flaggedUsers = array_values(array_slice(array_filter($users, static function (array $user): bool {
    return !empty($user["is_flagged"]);
}), 0, 6));

banana_game_respond([
    "status" => "success",
    "summary" => $summary,
    "users" => $users,
    "top_players" => $topPlayers,
    "recent_activity" => $recentActivity,
    "recent_signups" => $recentSignups,
    "flagged_users" => $flaggedUsers,
]);
