<?php
require_once __DIR__ . "/session_control.php";

banana_game_require_admin_page();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create User Account</title>
    <link rel="stylesheet" href="style.css?v=20260416b">
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
                <a href="admin_users.php" class="admin-compact-link">Back to users</a>
            </div>
        </header>

        <header class="admin-subpage-hero admin-users-hero">
            <div>
                <p class="admin-ops-eyebrow">Create User</p>
                <h1>Add a new admin or player</h1>
                <p class="admin-ops-subtext">Use a dedicated registration page to create accounts cleanly, then return to the user roster once the new account is ready.</p>
            </div>
        </header>

        <section class="admin-users-filters-card admin-users-create-page-card">
            <div class="admin-users-filters-card__top">
                <div class="admin-users-filters-card__title">
                    <p class="admin-panel-kicker">New Account</p>
                    <h2>Register a new admin or player</h2>
                </div>
                <a href="admin_users.php" class="admin-ops-button admin-ops-button--ghost">Cancel</a>
            </div>

            <form id="admin-create-user-form" class="admin-toolbar admin-toolbar--create-user-page">
                <label class="admin-toolbar-field">
                    <span>Username</span>
                    <input type="text" id="admin-create-username" name="username" placeholder="New username" required>
                </label>
                <label class="admin-toolbar-field">
                    <span>Email</span>
                    <input type="email" id="admin-create-email" name="email" placeholder="Email address (required)" required>
                </label>
                <label class="admin-toolbar-field">
                    <span>Phone</span>
                    <input type="tel" id="admin-create-phone" name="phone_number" placeholder="+94 77 123 4567">
                </label>
                <label class="admin-toolbar-field">
                    <span>Role</span>
                    <select id="admin-create-role" name="role">
                        <option value="player" selected>Player</option>
                        <option value="admin">Admin</option>
                    </select>
                </label>
                <label class="admin-toolbar-field">
                    <span>Password</span>
                    <input type="password" id="admin-create-password" name="password" placeholder="Strong password" required>
                </label>
                <label class="admin-toolbar-field">
                    <span>Confirm Password</span>
                    <input type="password" id="admin-create-confirm-password" name="confirm_password" placeholder="Repeat password" required>
                </label>
                <div class="admin-create-user-actions">
                    <p class="settings-feedback" id="admin-create-feedback"></p>
                    <button type="submit" class="admin-action-button">Create account</button>
                </div>
            </form>
        </section>
    </section>
</div>
<script type="module" src="js/admin-create-user-page.js?v=20260416b"></script>
</body>
</html>
