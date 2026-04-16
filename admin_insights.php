<?php
require_once __DIR__ . "/session_control.php";

banana_game_require_admin_page();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Insights</title>
    <link rel="stylesheet" href="style.css?v=20260415c">
</head>
<body class="admin-ops-body">
<div id="app" class="admin-ops-app">
    <section class="admin-ops-shell">
        <header class="admin-subpage-hero">
            <div>
                <p class="admin-ops-eyebrow">Admin Insights</p>
                <h1>Leaderboard and activity</h1>
                <p class="admin-ops-subtext">Open this page for score-first monitoring, top performers, and the latest run activity without the roster getting in the way.</p>
            </div>
            <div class="admin-subpage-actions">
                <a href="admin.php" class="admin-ops-button admin-ops-button--ghost">Dashboard</a>
                <a href="admin_overview.php" class="admin-ops-button admin-ops-button--ghost">Overview</a>
                <a href="admin_users.php" class="admin-ops-button admin-ops-button--ghost">Users</a>
            </div>
        </header>

        <section class="admin-ops-grid admin-ops-grid--insights">
            <section class="admin-ops-panel">
                <div class="admin-panel-heading">
                    <div>
                        <p class="admin-panel-kicker">Leaderboard</p>
                        <h2>Top performers</h2>
                    </div>
                    <span class="admin-panel-badge">Score-first view</span>
                </div>
                <div id="admin-top-players" class="admin-ranking-list"></div>
            </section>

            <section class="admin-ops-panel">
                <div class="admin-panel-heading">
                    <div>
                        <p class="admin-panel-kicker">Live feed</p>
                        <h2>Recent activity</h2>
                    </div>
                    <span class="admin-panel-badge">Latest 10 runs</span>
                </div>
                <div id="admin-recent-activity" class="admin-activity-list"></div>
            </section>
        </section>
    </section>
</div>
<script type="module" src="js/admin-insights-page.js?v=20260415c"></script>
</body>
</html>
