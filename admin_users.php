<?php
require_once __DIR__ . "/session_control.php";

banana_game_require_admin_page();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Users</title>
    <link rel="stylesheet" href="style.css?v=20260415c">
</head>
<body class="admin-ops-body admin-users-screen">
<div id="app" class="admin-ops-app">
    <section class="admin-ops-shell">
        <header class="admin-compact-bar" aria-label="Admin navigation">
            <div class="admin-compact-brand">
                <p class="admin-compact-brand__eyebrow">Admin</p>
                <strong>Control Room</strong>
            </div>
            <nav class="admin-compact-nav">
                <a href="admin.php" class="admin-compact-link">Dashboard</a>
                <a href="admin_overview.php" class="admin-compact-link">Overview</a>
                <a href="admin_insights.php" class="admin-compact-link">Insights</a>
                <a href="admin_users.php" class="admin-compact-link is-active" aria-current="page">Users</a>
            </nav>
            <div class="admin-compact-tools">
                <button type="button" id="admin-users-refresh-btn" class="admin-compact-link admin-compact-link--strong">Refresh users</button>
            </div>
        </header>

        <header class="admin-subpage-hero admin-users-hero">
            <div>
                <p class="admin-ops-eyebrow">Admin Users</p>
                <h1>User management</h1>
                <p class="admin-ops-subtext">Search accounts, review status, and apply account actions from a cleaner admin workspace.</p>
            </div>
            <div class="admin-users-hero-actions">
                <a href="admin_create_user.php" class="admin-action-button">Create account</a>
            </div>
        </header>

        <section class="admin-users-filters-card">
            <div class="admin-users-filters-card__top">
                <div class="admin-users-filters-card__title">
                    <p class="admin-panel-kicker">Filters</p>
                    <h2>Find the right accounts fast</h2>
                </div>
                <button type="button" id="admin-apply-filters-btn" class="admin-ops-button">Apply filters</button>
            </div>

            <div class="admin-toolbar admin-toolbar--users">
                <label class="admin-toolbar-field admin-toolbar-field--search">
                    <span>Search</span>
                    <input type="search" id="admin-user-search" placeholder="Search users...">
                </label>
                <label class="admin-toolbar-field">
                    <span>Role</span>
                    <select id="admin-role-filter">
                        <option value="all">All roles</option>
                        <option value="admin">Admins only</option>
                        <option value="player">Players only</option>
                    </select>
                </label>
                <label class="admin-toolbar-field">
                    <span>Status</span>
                    <select id="admin-status-filter">
                        <option value="all">All statuses</option>
                        <option value="no_runs">No runs yet</option>
                        <option value="inactive">Inactive 7+ days</option>
                        <option value="flagged">Flagged only</option>
                    </select>
                </label>
                <label class="admin-toolbar-field">
                    <span>Sort</span>
                    <select id="admin-sort-order">
                        <option value="impact">Most active</option>
                        <option value="score">Best score</option>
                        <option value="recent">Recently active</option>
                        <option value="joined">Recently joined</option>
                        <option value="name">Name (A-Z)</option>
                    </select>
                </label>
                <label class="admin-toolbar-field">
                    <span>Per page</span>
                    <select id="admin-page-size">
                        <option value="4">4 users</option>
                        <option value="6" selected>6 users</option>
                        <option value="8">8 users</option>
                    </select>
                </label>
            </div>
        </section>

        <section class="admin-ops-panel admin-roster-panel admin-roster-panel--grid">
            <div class="admin-panel-heading admin-panel-heading--users">
                <div>
                    <p class="admin-panel-kicker">Users</p>
                    <h2>User management</h2>
                </div>
                <div class="admin-users-heading-actions">
                    <span class="admin-panel-badge" id="admin-roster-count">0 visible</span>
                </div>
            </div>

            <p class="settings-feedback" id="admin-feedback"></p>
            <div id="admin-user-list" class="admin-user-list admin-user-list--grid"></div>
            <div class="admin-pagination" id="admin-pagination"></div>
        </section>
    </section>
</div>
<script type="module" src="js/admin-users-page.js?v=20260415c"></script>
</body>
</html>
