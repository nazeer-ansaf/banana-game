<?php
require_once __DIR__ . "/session_control.php";

banana_game_require_player_page();

$userId = (int) $_SESSION["user_id"];
$role = (string) ($_SESSION["role"] ?? "player");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banana Puzzle Garden Play</title>
    <link rel="stylesheet" href="style.css?v=20260405h">
</head>
<body class="play-page">
<div id="app" class="play-app">
    <section id="play-shell" class="section play-shell">
        <div class="play-header">
            <div class="play-header-copy">
                <p class="welcome-kicker" id="play-mode-kicker">Active Run</p>
                <h2 id="play-mode-title">Campaign</h2>
                <p id="play-mode-description" class="welcome-subtext">Clear the full selected mode to lock in your best result.</p>
                <div class="play-meta-strip">
                    <span class="play-meta-pill"><strong id="play-level-count">10</strong> levels</span>
                    <span class="play-meta-pill">Rewards x<strong id="play-reward-multiplier">1.00</strong></span>
                    <span class="play-meta-pill" id="play-goal-badge">Level 1 target: 20</span>
                </div>
            </div>
            <div class="play-header-actions">
                <button type="button" id="sound-toggle-btn" class="dashboard-action-link sound-toggle-btn secondary">Sound On</button>
                <a href="dashboard.php" class="dashboard-action-link secondary">Back to Dashboard</a>
                <button type="button" id="play-logout-btn" class="dashboard-action-link secondary">Logout</button>
            </div>
        </div>

        <div class="play-layout">
            <aside class="play-sidebar">
                <div id="current-level" class="game-header">
                    <span class="hud-icon" aria-hidden="true">🎯</span>
                    <span class="hud-short">Level</span>
                    <span id="level-number">1</span>
                </div>
                <div class="score-badge">
                    <span class="hud-icon" aria-hidden="true">⭐</span>
                    <span class="hud-short">Score</span>
                    <span id="score">0</span>
                </div>
                <div class="score-badge wrong attempt-badge">
                    <span class="hud-icon" aria-hidden="true">❌</span>
                    <span class="attempt-label">Attempts</span>
                    <span id="wrong-count">0</span>
                </div>
                <div id="timer-container">
                    <span class="hud-icon" aria-hidden="true">⏳</span>
                    <span class="hud-short">Time</span>
                    <span id="timer">60s</span>
                </div>
                <button id="stop-btn" class="stop-run-btn">
                    <span class="hud-icon" aria-hidden="true">■</span>
                    <span class="hud-short">Stop</span>
                </button>
            </aside>

            <div class="play-main">
                <div class="run-progress-panel">
                    <div class="run-progress-copy">
                        <strong id="goal-status">0 / 20 score</strong>
                        <span id="goal-caption">Reach the required score before time ends.</span>
                    </div>
                    <div class="run-progress-track" aria-hidden="true">
                        <span id="goal-progress-fill"></span>
                    </div>
                    <div class="attempt-lives" id="attempt-lives" aria-label="Remaining attempts"></div>
                </div>

                <p id="message"></p>

                <div id="puzzle-container">
                    <div class="puzzle-stage">
                        <img id="puzzle-image" alt="Puzzle Image">
                    </div>
                </div>

                <div id="answer-container">
                    <div class="answer-shell">
                        <input type="number" id="answer-input" placeholder="Enter answer">
                    </div>
                    <button id="submit-btn">Submit</button>
                </div>
            </div>
        </div>

        <section id="stop-screen" class="stop-panel hidden">
            <div class="stop-panel-card">
                <h2 class="stop-title">Run Finished</h2>
                <p class="stop-subtitle" id="stop-subtitle">Your run result is ready.</p>

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

                <div class="stop-actions">
                    <a href="dashboard.php" class="dashboard-action-link">Return to Dashboard</a>
                    <a id="retry-link" href="play.php?mode=campaign" class="dashboard-action-link">Play Again</a>
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
<script type="module" src="js/play-page.js?v=20260403b"></script>
</body>
</html>
