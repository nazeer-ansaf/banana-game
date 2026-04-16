<?php
require_once __DIR__ . "/session_control.php";

banana_game_require_admin_page();

$userId = (int) $_SESSION["user_id"];
$role = (string) ($_SESSION["role"] ?? "admin");
$username = htmlspecialchars((string) ($_SESSION["username"] ?? "Admin"), ENT_QUOTES, "UTF-8");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banana Puzzle Garden Admin</title>
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
                <a href="admin.php" class="admin-compact-link is-active" aria-current="page">Dashboard</a>
                <a href="admin_overview.php" class="admin-compact-link">Overview</a>
                <a href="admin_insights.php" class="admin-compact-link">Insights</a>
                <a href="admin_users.php" class="admin-compact-link">Users</a>
            </nav>
            <div class="admin-compact-tools">
                <a href="profile.php" class="admin-compact-link">Profile</a>
                <button type="button" id="admin-logout-btn" class="admin-compact-link admin-compact-link--strong">Logout</button>
            </div>
        </header>

        <header class="admin-ops-hero">
            <div class="admin-ops-hero-copy">
                <p class="admin-ops-eyebrow">Banana Puzzle Garden Control Room</p>
                <h1>Admin dashboard for <?php echo $username; ?></h1>
                <p class="admin-ops-subtext">Use the dashboard as a home screen. The compact bar keeps page switching close by, so this area can stay focused on status and quick entry points.</p>
                <div class="admin-ops-hero-tags" aria-hidden="true">
                    <span>Overview page</span>
                    <span>Insights page</span>
                    <span>User management page</span>
                </div>
            </div>
        </header>

        <section class="admin-kpi-grid admin-kpi-grid--dashboard">
            <article class="admin-kpi-card">
                <span>Total users</span>
                <strong id="admin-total-users">0</strong>
                <small id="admin-total-users-note">Loading user counts</small>
            </article>
            <article class="admin-kpi-card">
                <span>Active today</span>
                <strong id="admin-active-today">0</strong>
                <small id="admin-active-today-note">Loading today activity</small>
            </article>
            <article class="admin-kpi-card">
                <span>Top score</span>
                <strong id="admin-top-score">0</strong>
                <small id="admin-top-score-note">Loading best score</small>
            </article>
            <article class="admin-kpi-card">
                <span>No-run users</span>
                <strong id="admin-no-run-users">0</strong>
                <small id="admin-no-run-users-note">Loading onboarding queue</small>
            </article>
        </section>

        <section class="admin-home-grid">
            <article class="admin-home-card">
                <div class="admin-home-card__copy">
                    <p class="admin-panel-kicker">Overview</p>
                    <h2>System pulse</h2>
                    <p>Open the full overview page to see account health, admin/player split, recent signups, and flagged accounts.</p>
                </div>
                <div class="admin-home-card__stats">
                    <span class="admin-stat-pill" id="admin-pulse-card">Checking pulse</span>
                    <span class="admin-stat-pill" id="admin-signups-card">0 recent signups</span>
                </div>
                <a href="admin_overview.php" class="admin-action-button">Open overview</a>
            </article>

            <article class="admin-home-card">
                <div class="admin-home-card__copy">
                    <p class="admin-panel-kicker">Insights</p>
                    <h2>Score and activity</h2>
                    <p>Open the insights page to inspect leaderboard movement and the most recent player activity in full detail.</p>
                </div>
                <div class="admin-home-card__stats">
                    <span class="admin-stat-pill" id="admin-top-player-card">Top player loading</span>
                    <span class="admin-stat-pill" id="admin-activity-card">Activity loading</span>
                </div>
                <a href="admin_insights.php" class="admin-action-button">Open insights</a>
            </article>

            <article class="admin-home-card">
                <div class="admin-home-card__copy">
                    <p class="admin-panel-kicker">Users</p>
                    <h2>Manage accounts</h2>
                    <p>Open the users page to search accounts, change roles, reset progress, and clear profile photos without crowding the dashboard.</p>
                </div>
                <div class="admin-home-card__stats">
                    <span class="admin-stat-pill" id="admin-player-card">0 players</span>
                    <span class="admin-stat-pill" id="admin-flagged-card">0 flagged users</span>
                </div>
                <a href="admin_users.php" class="admin-action-button">Open users</a>
            </article>
        </section>
    </section>
</div>

<script>
window.BANANA_USER = {
    id: <?php echo $userId; ?>,
    role: <?php echo json_encode($role); ?>
};
</script>
<script type="module" src="js/admin-dashboard.js?v=20260415c"></script>
</body>
</html>
