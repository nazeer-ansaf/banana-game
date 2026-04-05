<?php
header("Content-Type: application/json");

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/session_control.php";

try {
    $conn = banana_game_db();
} catch (RuntimeException $exception) {
    banana_game_respond([
        "status" => "error",
        "message" => $exception->getMessage()
    ]);
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    banana_game_session_start();
    $period = $_GET["period"] ?? "all_time";
    $whereSql = "";

    if ($period === "weekly") {
        $whereSql = "WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    }

    $query = "
        SELECT
            u.username,
            u.profile_photo,
            MAX(s.score) AS score,
            MAX(s.highest_level) AS highest_level,
            SUM(CASE WHEN s.result = 'won' THEN 1 ELSE 0 END) AS wins
        FROM scores s
        JOIN users u ON s.user_id = u.id
        {$whereSql}
        GROUP BY s.user_id, u.username, u.profile_photo
        ORDER BY score DESC, highest_level DESC, wins DESC, u.username ASC
        LIMIT 10
    ";

    $result = $conn->query($query);
    $leaderboard = [];

    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = [
            "username" => $row["username"],
            "profile_photo" => $row["profile_photo"] ?? "",
            "score" => (int) $row["score"],
            "highest_level" => (int) $row["highest_level"],
            "wins" => (int) $row["wins"]
        ];
    }

    echo json_encode(array_values($leaderboard));
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    banana_game_respond([
        "status" => "error",
        "message" => "Unsupported request method"
    ]);
}

banana_game_require_auth_json();

$userId = banana_game_current_user_id();
$score = (int) ($_POST["score"] ?? 0);
$mode = trim((string) ($_POST["mode"] ?? "campaign"));
$highestLevel = (int) ($_POST["highest_level"] ?? 1);
$totalCorrect = (int) ($_POST["total_correct"] ?? 0);
$totalWrong = (int) ($_POST["total_wrong"] ?? 0);
$longestStreak = (int) ($_POST["longest_streak"] ?? 0);
$result = trim((string) ($_POST["result"] ?? "failed"));
$xpGain = (int) ($_POST["xp_gain"] ?? 0);
$coinsGain = (int) ($_POST["coins_gain"] ?? 0);
$achievementKeys = json_decode($_POST["achievement_keys"] ?? "[]", true);

if ($userId <= 0) {
    banana_game_respond([
        "status" => "error",
        "message" => "Valid user_id is required"
    ]);
}

$allowedResults = ["won", "failed", "stopped"];
if (!in_array($result, $allowedResults, true)) {
    $result = "failed";
}

banana_game_create_profile_if_missing($conn, $userId);

$insertScore = $conn->prepare(
    "INSERT INTO scores (
        user_id,
        score,
        mode,
        highest_level,
        total_correct,
        total_wrong,
        longest_streak,
        result,
        created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())"
);
$insertScore->bind_param(
    "iisiiiis",
    $userId,
    $score,
    $mode,
    $highestLevel,
    $totalCorrect,
    $totalWrong,
    $longestStreak,
    $result
);

if (!$insertScore->execute()) {
    banana_game_respond([
        "status" => "error",
        "message" => "Unable to save run"
    ]);
}

$insertScore->close();

$winsIncrement = $result === "won" ? 1 : 0;

$updateProfile = $conn->prepare(
    "UPDATE player_profiles
    SET
        xp = xp + ?,
        coins = coins + ?,
        total_runs = total_runs + 1,
        wins = wins + ?,
        best_score = GREATEST(best_score, ?),
        best_level = GREATEST(best_level, ?),
        total_correct = total_correct + ?,
        total_wrong = total_wrong + ?,
        longest_streak = GREATEST(longest_streak, ?),
        last_mode = ?
    WHERE user_id = ?"
);
$updateProfile->bind_param(
    "iiiiiiiisi",
    $xpGain,
    $coinsGain,
    $winsIncrement,
    $score,
    $highestLevel,
    $totalCorrect,
    $totalWrong,
    $longestStreak,
    $mode,
    $userId
);
$updateProfile->execute();
$updateProfile->close();

banana_game_insert_achievements(
    $conn,
    $userId,
    is_array($achievementKeys) ? $achievementKeys : []
);

banana_game_respond([
    "status" => "success",
    "message" => "Run saved"
]);
?>
