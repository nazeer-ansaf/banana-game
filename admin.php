<?php
require_once __DIR__ . "/session_control.php";

banana_game_require_admin_page();

$userId = (int) $_SESSION["user_id"];
$role = (string) ($_SESSION["role"] ?? "admin");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banana Puzzle Garden Admin</title>
    <link rel="stylesheet" href="style.css?v=20260405h">
</head>
<body>
<div id="app" class="dashboard-app">
    <section class="section dashboard-shell">
        <div class="welcome-banner dashboard-hero page-hero">
            <div class="welcome-copy">
                <p class="welcome-kicker">Admin Panel</p>
                <h2>Manage Players</h2>
                <p class="welcome-subtext">Review player activity, monitor scores, and manage account roles.</p>
            </div>
            <div class="page-hero-actions">
                <a href="dashboard.php" class="dashboard-action-link secondary">Dashboard</a>
                <a href="profile.php" class="dashboard-action-link secondary">Profile</a>
                <button type="button" id="admin-logout-btn" class="dashboard-action-link">Logout</button>
            </div>
        </div>

        <div class="dashboard-grid admin-grid">
            <section class="dashboard-card dashboard-card--profile admin-summary-card">
                <div class="panel-heading">
                    <p class="panel-kicker">Overview</p>
                    <strong>Project health</strong>
                </div>
                <div class="admin-summary-grid">
                    <article>
                        <span>Total Users</span>
                        <strong id="admin-total-users">0</strong>
                    </article>
                    <article>
                        <span>Admins</span>
                        <strong id="admin-total-admins">0</strong>
                    </article>
                    <article>
                        <span>Total Runs</span>
                        <strong id="admin-total-runs">0</strong>
                    </article>
                    <article>
                        <span>Total Wins</span>
                        <strong id="admin-total-wins">0</strong>
                    </article>
                </div>
            </section>

            <section class="dashboard-card dashboard-card--modes admin-users-card">
                <div class="panel-heading">
                    <p class="panel-kicker">Users</p>
                    <strong>Role management</strong>
                </div>
                <p class="settings-feedback" id="admin-feedback"></p>
                <div id="admin-user-list" class="admin-user-list"></div>
            </section>
        </div>
    </section>
</div>

<script>
window.BANANA_USER = {
    id: <?php echo $userId; ?>,
    role: <?php echo json_encode($role); ?>
};
</script>
<script type="module" src="js/admin-page.js?v=20260405a"></script>
</body>
</html>
