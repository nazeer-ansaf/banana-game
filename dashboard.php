<?php
require_once __DIR__ . "/session_control.php";

banana_game_require_player_page();

$userId = (int) $_SESSION["user_id"];
$username = htmlspecialchars($_SESSION["username"], ENT_QUOTES, "UTF-8");
$role = (string) ($_SESSION["role"] ?? "player");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banana Puzzle Garden Dashboard</title>
    <link rel="stylesheet" href="style.css?v=20260413g">
</head>
<body>
<div id="app" class="dashboard-app">
    <section class="section dashboard-shell">
        <div class="welcome-banner dashboard-hero">
            <div class="welcome-copy">
                <p class="welcome-kicker">Player Logged In</p>
                <h2 id="welcome-user">Welcome <?php echo $username; ?></h2>
                <p class="welcome-subtext">Choose a mode, track your progress, and jump into the next banana run.</p>
                <div class="dashboard-hero-pills" aria-hidden="true">
                    <span class="dashboard-hero-pill">Start Game</span>
                    <span class="dashboard-hero-pill">Modes</span>
                    <span class="dashboard-hero-pill">Progress</span>
                </div>
            </div>
            <div class="dashboard-quick-actions">
                <a href="#game-modes" class="dashboard-action-link secondary">Start Game</a>
                <?php if ($role === "admin"): ?>
                    <a href="admin.php" class="dashboard-action-link secondary">Admin Panel</a>
                <?php endif; ?>
                <button type="button" id="dashboard-logout-btn" class="dashboard-action-link">Logout</button>
            </div>
            <div class="welcome-badge" aria-hidden="true">
                <span>🍌</span>
            </div>
        </div>

        <div class="dashboard-grid">
            <section class="profile-panel dashboard-card dashboard-card--profile dashboard-profile-card">
                <div class="panel-heading">
                    <p class="panel-kicker">Player Profile</p>
                    <strong id="profile-rank">Rank 1</strong>
                </div>
                <div class="dashboard-profile-progress profile-progress-card">
                    <div class="profile-topline">
                        <span id="profile-xp">0 XP</span>
                        <span class="profile-coins">Coins <strong id="profile-coin-count">0</strong></span>
                    </div>
                    <div class="xp-progress">
                        <span id="xp-progress-fill"></span>
                    </div>
                    <p class="xp-progress-label" id="xp-progress-label">0 / 250 to next rank</p>
                </div>

                <div class="profile-stats-grid sketch-stats-grid dashboard-profile-stats">
                    <article>
                        <span>Best Score</span>
                        <strong id="profile-best-score">0</strong>
                    </article>
                    <article>
                        <span>Best Level</span>
                        <strong id="profile-best-level">0</strong>
                    </article>
                    <article>
                        <span>Total Runs</span>
                        <strong id="profile-run-count">0</strong>
                    </article>
                    <article>
                        <span>Win Rate</span>
                        <strong id="profile-win-rate">0%</strong>
                    </article>
                    <article>
                        <span>Best Streak</span>
                        <strong id="profile-streak">0</strong>
                    </article>
                    <article>
                        <span>Last Mode</span>
                        <strong id="profile-last-mode">Campaign</strong>
                    </article>
                </div>

                <div class="dashboard-profile-footer">
                    <div class="dashboard-profile-footer-copy">
                        <p class="dashboard-profile-footer-label">Profile</p>
                        <strong>Manage your player space</strong>
                        <span><?php echo $role === "admin" ? "Open your profile to update account details and admin-ready settings." : "Open your profile to update account details and preferences."; ?></span>
                    </div>
                    <a href="profile.php?view=top" class="dashboard-profile-footer-link">Profile</a>
                </div>
            </section>

            <section id="game-modes" class="mode-panel dashboard-mode-panel dashboard-card dashboard-card--modes">
                <div class="panel-heading">
                    <p class="panel-kicker">Game Modes</p>
                    <strong>Choose your run</strong>
                </div>
                <div id="mode-card-container" class="mode-grid"></div>
            </section>

            <section class="mission-panel dashboard-card dashboard-card--stack">
                <div class="panel-heading">
                    <p class="panel-kicker">Daily Missions</p>
                    <strong>Fresh goals every day</strong>
                </div>
                <ul id="daily-missions-list" class="mission-list"></ul>
            </section>

            <section class="achievement-panel dashboard-card dashboard-card--stack">
                <div class="panel-heading">
                    <p class="panel-kicker">Achievements</p>
                    <strong id="achievement-total">0 unlocked</strong>
                </div>
                <div id="achievement-list" class="achievement-list"></div>
            </section>

            <section class="recent-runs-panel dashboard-card dashboard-card--stack">
                <div class="panel-heading">
                    <p class="panel-kicker">Recent Runs</p>
                    <strong>Latest results</strong>
                </div>
                <ul id="recent-runs-list" class="recent-runs-list"></ul>
            </section>

        </div>
    </section>
</div>

<script>
window.BANANA_USER = {
    id: <?php echo $userId; ?>,
    username: <?php echo json_encode($_SESSION["username"]); ?>,
    role: <?php echo json_encode($role); ?>
};
</script>
<script type="module" src="js/dashboard-page.js?v=20260409a"></script>
</body>
</html>
