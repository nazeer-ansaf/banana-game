<?php
require_once __DIR__ . "/session_control.php";

banana_game_require_auth_page();

$userId = (int) $_SESSION["user_id"];
$role = (string) ($_SESSION["role"] ?? "player");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banana Puzzle Garden Result</title>
    <link rel="stylesheet" href="style.css?v=20260405h">
</head>
<body class="result-page">
<div id="app" class="play-app">
    <section class="section play-shell result-shell">
        <section class="stop-panel result-page-panel">
            <div class="stop-panel-card">
                <h2 class="stop-title" id="result-panel-title">Run Finished</h2>
                <p class="stop-subtitle" id="result-panel-subtitle">Your run result is ready.</p>

                <div class="final-score-card">
                    Your Score <span id="final-score">0</span>
                </div>

                <div class="result-summary-grid">
                    <article class="result-stat-card">
                        <span>Mode</span>
                        <strong id="result-mode">Campaign</strong>
                    </article>
                    <article class="result-stat-card">
                        <span>Top Level</span>
                        <strong id="result-level">1</strong>
                    </article>
                    <article class="result-stat-card">
                        <span>Correct</span>
                        <strong id="result-correct">0</strong>
                    </article>
                    <article class="result-stat-card">
                        <span>Best Streak</span>
                        <strong id="result-streak">0</strong>
                    </article>
                </div>

                <div id="leaderboard-panel">
                    <h3 class="leaderboard-title">Leaderboard</h3>
                    <div class="leaderboard-filters">
                        <button type="button" class="leaderboard-filter active" data-period="all_time">All Time</button>
                        <button type="button" class="leaderboard-filter" data-period="weekly">Weekly</button>
                    </div>
                    <ul id="leaderboard-list"></ul>
                </div>

                <div class="stop-actions result-actions">
                    <a href="dashboard.php" class="dashboard-action-link">Return to Dashboard</a>
                    <a id="result-play-again" href="play.php?mode=campaign" class="dashboard-action-link">Play Again</a>
                    <button type="button" id="result-logout-btn" class="dashboard-action-link secondary">Logout</button>
                </div>
            </div>
        </section>
    </section>
</div>

<script>
window.BANANA_USER = {
    id: <?php echo $userId; ?>,
    username: <?php echo json_encode($_SESSION["username"]); ?>,
    role: <?php echo json_encode($role); ?>
};
</script>
<script type="module" src="js/result-page.js?v=20260405a"></script>
</body>
</html>
