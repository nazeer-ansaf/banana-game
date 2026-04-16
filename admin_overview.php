<?php
require_once __DIR__ . "/session_control.php";

banana_game_require_admin_page();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Overview</title>
    <link rel="stylesheet" href="style.css?v=20260415c">
</head>
<body class="admin-ops-body">
<div id="app" class="admin-ops-app">
    <section class="admin-ops-shell">
        <header class="admin-compact-bar" aria-label="Admin navigation">
            <div class="admin-compact-brand">
                <p class="admin-compact-brand__eyebrow">Admin</p>
                <strong>Control Room</strong>
            </div>
            <nav class="admin-compact-nav">
                <a href="admin.php" class="admin-compact-link">Dashboard</a>
                <a href="admin_overview.php" class="admin-compact-link is-active" aria-current="page">Overview</a>
                <a href="admin_insights.php" class="admin-compact-link">Insights</a>
                <a href="admin_users.php" class="admin-compact-link">Users</a>
            </nav>
        </header>

        <header class="admin-subpage-hero">
            <div>
                <p class="admin-ops-eyebrow">Admin Overview</p>
                <h1>System pulse</h1>
                <p class="admin-ops-subtext">Account health, onboarding signals, and admin-side attention items in one focused page.</p>
            </div>
        </header>

        <section class="admin-kpi-grid">
            <article class="admin-kpi-card"><span>Total users</span><strong id="admin-total-users">0</strong><small id="admin-total-users-note"></small></article>
            <article class="admin-kpi-card"><span>Active today</span><strong id="admin-active-today">0</strong><small id="admin-active-today-note"></small></article>
            <article class="admin-kpi-card"><span>No-run users</span><strong id="admin-no-run-users">0</strong><small id="admin-no-run-users-note"></small></article>
            <article class="admin-kpi-card"><span>Recent signups</span><strong id="admin-recent-signups-count">0</strong><small id="admin-recent-signups-note"></small></article>
        </section>

        <section class="admin-overview-grid">
            <section class="admin-ops-panel admin-ops-panel--spotlight">
                <div class="admin-panel-heading">
                    <div>
                        <p class="admin-panel-kicker">Snapshot</p>
                        <h2>Current health</h2>
                    </div>
                    <span class="admin-panel-badge" id="admin-pulse-status">Stable</span>
                </div>
                <div class="admin-spotlight-grid">
                    <article class="admin-spotlight-card"><span>Admins</span><strong id="admin-total-admins">0</strong><small>Protected accounts</small></article>
                    <article class="admin-spotlight-card"><span>Players</span><strong id="admin-total-players">0</strong><small>Playable accounts</small></article>
                    <article class="admin-spotlight-card"><span>Total runs</span><strong id="admin-total-runs">0</strong><small>Across all modes</small></article>
                    <article class="admin-spotlight-card"><span>Win rate</span><strong id="admin-win-rate">0%</strong><small id="admin-total-wins-note"></small></article>
                </div>
            </section>

            <section class="admin-ops-panel">
                <div class="admin-panel-heading">
                    <div>
                        <p class="admin-panel-kicker">Signups</p>
                        <h2>Recent accounts</h2>
                    </div>
                    <span class="admin-panel-badge">Last 7 days</span>
                </div>
                <div id="admin-recent-signups" class="admin-mini-list"></div>
            </section>

            <section class="admin-ops-panel">
                <div class="admin-panel-heading">
                    <div>
                        <p class="admin-panel-kicker">Attention</p>
                        <h2>Flagged users</h2>
                    </div>
                    <span class="admin-panel-badge">Needs attention</span>
                </div>
                <div id="admin-flagged-users" class="admin-mini-list"></div>
            </section>
        </section>
    </section>
</div>
<script type="module" src="js/admin-overview-page.js?v=20260415c"></script>
</body>
</html>
