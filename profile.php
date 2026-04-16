<?php
require_once __DIR__ . "/session_control.php";

banana_game_require_auth_page();

$userId = (int) $_SESSION["user_id"];
$username = htmlspecialchars($_SESSION["username"], ENT_QUOTES, "UTF-8");
$role = (string) ($_SESSION["role"] ?? "player");
$isAdmin = $role === "admin";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $isAdmin ? "Banana Puzzle Garden Admin Profile" : "Banana Puzzle Garden Profile"; ?></title>
    <link rel="stylesheet" href="style.css?v=20260416a">
</head>
<?php if ($isAdmin): ?>
<body class="admin-ops-body admin-profile-screen">
<div id="app" class="admin-ops-app admin-profile-app">
    <section class="admin-ops-shell admin-profile-shell">
        <header class="admin-compact-bar" aria-label="Admin navigation">
            <div class="admin-compact-brand">
                <p class="admin-compact-brand__eyebrow">Admin</p>
                <strong>Account Center</strong>
            </div>
            <nav class="admin-compact-nav">
                <a href="admin.php" class="admin-compact-link">Dashboard</a>
                <a href="admin_overview.php" class="admin-compact-link">Overview</a>
                <a href="admin_insights.php" class="admin-compact-link">Insights</a>
                <a href="admin_users.php" class="admin-compact-link">Users</a>
            </nav>
            <div class="admin-compact-tools">
                <a href="profile.php" class="admin-compact-link is-active" aria-current="page">Profile</a>
                <button type="button" id="profile-logout-btn" class="admin-compact-link admin-compact-link--strong">Logout</button>
            </div>
        </header>

        <header class="admin-subpage-hero admin-profile-hero">
            <div>
                <p class="admin-ops-eyebrow">Admin Account</p>
                <h1>Profile and settings</h1>
                <p class="admin-ops-subtext">Manage your admin identity, workspace preferences, and security from a profile screen that matches the control room instead of the player settings view.</p>
            </div>
            <div class="admin-profile-hero-badges" aria-hidden="true">
                <span class="admin-panel-badge">Admin identity</span>
                <span class="admin-panel-badge">Workspace sound</span>
                <span class="admin-panel-badge">Password security</span>
            </div>
        </header>

        <form id="profile-settings-form" class="admin-profile-grid" enctype="multipart/form-data">
            <section class="admin-ops-panel admin-profile-summary">
                <div class="admin-panel-heading">
                    <div>
                        <p class="admin-panel-kicker">Profile</p>
                        <h2>Account snapshot</h2>
                    </div>
                    <span class="admin-panel-badge" id="profile-role-pill">Admin</span>
                </div>

                <div class="admin-profile-identity">
                    <div class="profile-showcase-avatar-wrap admin-profile-avatar-wrap">
                        <div class="profile-photo-preview profile-showcase-avatar admin-profile-avatar" id="profile-photo-preview" aria-label="Profile photo preview">
                            <span id="profile-photo-initials"><?php echo strtoupper(substr($username, 0, 1)); ?></span>
                            <img id="profile-photo-image" alt="Profile photo" hidden>
                        </div>
                        <label class="profile-avatar-fab" for="profile-photo-input" title="Choose profile photo">Upload</label>
                        <input type="file" id="profile-photo-input" name="profile_photo" accept="image/*">
                    </div>

                    <div class="admin-profile-identity-copy">
                        <h3 id="profile-display-name"><?php echo $username; ?></h3>
                        <p id="profile-handle">@<?php echo $username; ?></p>
                        <span class="admin-profile-caption">Administrator access enabled</span>
                    </div>
                </div>

                <div class="admin-profile-actions">
                    <label class="profile-photo-upload profile-inline-button" for="profile-photo-input">Upload Photo</label>
                    <button type="button" id="remove-photo-btn" class="profile-photo-remove profile-inline-button">Remove Photo</button>
                    <p class="profile-photo-hint profile-inline-hint">Supported formats: JPG, JPEG, PNG, GIF, WEBP.</p>
                </div>

                <div class="admin-profile-meta">
                    <article>
                        <span>Role</span>
                        <strong id="profile-role-summary">Admin</strong>
                    </article>
                    <article>
                        <span>Member since</span>
                        <strong id="profile-member-since-summary">Member</strong>
                    </article>
                    <article>
                        <span>Email</span>
                        <strong id="profile-email-summary">Add email</strong>
                    </article>
                    <article>
                        <span>Workspace</span>
                        <strong>Control Room</strong>
                    </article>
                </div>

                
            </section>

            <section class="admin-ops-panel admin-profile-settings">
                <div class="admin-panel-heading">
                    <div>
                        <p class="admin-panel-kicker">Settings Workspace</p>
                        <h2>Update your admin account</h2>
                    </div>
                    <span class="admin-panel-badge">Live changes</span>
                </div>

                <div class="settings-tab-bar admin-profile-tab-bar" role="tablist" aria-label="Profile settings sections">
                    <button type="button" class="settings-tab active" data-settings-tab="personal" role="tab" aria-selected="true">Personal</button>
                    <button type="button" class="settings-tab" data-settings-tab="sound" role="tab" aria-selected="false">Preferences</button>
                    <button type="button" class="settings-tab" data-settings-tab="security" role="tab" aria-selected="false">Security</button>
                </div>

                <div class="settings-panel-stack admin-profile-panel-stack">
                    <section class="settings-tab-panel active" data-settings-panel="personal" role="tabpanel">
                        <div class="panel-heading settings-section-heading">
                            <p class="panel-kicker">Personal Information</p>
                            <strong>Edit account details</strong>
                        </div>
                        <div class="settings-form profile-fields-grid">
                            <label>
                                Username
                                <input type="text" id="profile-username" name="username" required>
                            </label>
                            <label>
                                Email
                                <input type="email" id="profile-email" name="email">
                            </label>
                            <label>
                                Phone Number
                                <input type="tel" id="profile-phone" name="phone_number">
                            </label>
                            <label>
                                Member Since
                                <input type="text" id="profile-member-since" value="" readonly>
                            </label>
                            <input type="hidden" id="remove-profile-photo" name="remove_profile_photo" value="0">
                        </div>
                    </section>

                    <section class="settings-tab-panel" data-settings-panel="sound" role="tabpanel" hidden>
                        <div class="panel-heading settings-section-heading">
                            <p class="panel-kicker">Workspace Preferences</p>
                            <strong>Choose what you hear while managing the game</strong>
                        </div>
                        <div class="settings-form sound-setting-list">
                            <label class="toggle-row">
                                <span>Master Sound</span>
                                <input type="checkbox" id="sound-enabled" name="sound_enabled">
                            </label>
                            <label class="toggle-row">
                                <span>Music</span>
                                <input type="checkbox" id="music-enabled" name="music_enabled">
                            </label>
                            <label class="toggle-row">
                                <span>Effects</span>
                                <input type="checkbox" id="effects-enabled" name="effects_enabled">
                            </label>
                        </div>
                    </section>

                    <section class="settings-tab-panel" data-settings-panel="security" role="tabpanel" hidden>
                        <div class="panel-heading settings-section-heading">
                            <p class="panel-kicker">Security</p>
                            <strong>Protect your admin account</strong>
                        </div>
                        <div class="settings-form">
                            <label>
                                Current Password
                                <input type="password" id="current-password" name="current_password">
                            </label>
                            <label>
                                New Password
                                <input type="password" id="new-password" name="new_password">
                            </label>
                            <label>
                                Confirm New Password
                                <input type="password" id="confirm-password" name="confirm_password">
                            </label>
                        </div>
                    </section>
                </div>

                <div class="profile-save-inline admin-profile-save-inline">
                    <div class="settings-feedback-wrap">
                        <p class="settings-feedback" id="profile-feedback"></p>
                    </div>
                    <button type="submit" class="admin-action-button">Save Settings</button>
                </div>
            </section>
        </form>
    </section>
</div>
<?php else: ?>
<body class="profile-screen-body">
<div id="app" class="dashboard-app profile-app sketch-profile-app">
    <section class="section dashboard-shell">
        <div class="welcome-banner dashboard-hero page-hero profile-page-hero sketch-profile-hero">
            <div class="welcome-copy sketch-profile-hero-copy">
                <p class="welcome-kicker">Player Settings</p>
                <h2>Profile Screen</h2>
                <p class="welcome-subtext">Update your account, sound, and password from one clean workspace.</p>
            </div>
            <div class="page-hero-actions sketch-profile-actions">
                <a href="dashboard.php" class="dashboard-action-link secondary">Dashboard</a>
                <button type="button" id="profile-logout-btn" class="dashboard-action-link">Logout</button>
            </div>
        </div>

        <form id="profile-settings-form" class="profile-page-grid profile-grid profile-settings-layout sketch-profile-layout" enctype="multipart/form-data">
            <section class="profile-page-card profile-page-card--summary profile-summary-card profile-showcase-card sketch-profile-card sketch-profile-card--summary">
                <div class="sketch-card-ribbon">
                    <span>Overview</span>
                </div>

                <div class="profile-identity-block sketch-profile-identity">
                    <div class="profile-showcase-avatar-wrap sketch-avatar-wrap">
                        <div class="profile-photo-preview profile-showcase-avatar sketch-profile-avatar" id="profile-photo-preview" aria-label="Profile photo preview">
                            <span id="profile-photo-initials"><?php echo strtoupper(substr($username, 0, 1)); ?></span>
                            <img id="profile-photo-image" alt="Profile photo" hidden>
                        </div>
                        <label class="profile-avatar-fab" for="profile-photo-input" title="Choose profile photo">Upload</label>
                        <input type="file" id="profile-photo-input" name="profile_photo" accept="image/*">
                    </div>

                    <div class="profile-identity-copy sketch-profile-copy">
                        <h3 id="profile-display-name"><?php echo $username; ?></h3>
                        <p id="profile-handle">@<?php echo $username; ?></p>
                        <span class="profile-role-badge" id="profile-role-pill">Player</span>
                    </div>
                </div>

                <div class="profile-inline-actions sketch-inline-actions">
                    <label class="profile-photo-upload profile-inline-button" for="profile-photo-input">Upload Photo</label>
                    <button type="button" id="remove-photo-btn" class="profile-photo-remove profile-inline-button">Remove Photo</button>
                    <p class="profile-photo-hint profile-inline-hint">Supported formats: JPG, JPEG, PNG, GIF, WEBP.</p>
                </div>

                <div class="profile-progress-card sketch-progress-card">
                    <div class="profile-topline">
                        <span id="profile-xp">0 XP</span>
                        <span class="profile-coins">Coins <strong id="profile-coin-count">0</strong></span>
                    </div>
                    <div class="xp-progress">
                        <span id="xp-progress-fill"></span>
                    </div>
                    <p class="xp-progress-label" id="xp-progress-label">0 / 250 to next rank</p>
                </div>

                <div class="profile-stats-grid sketch-stats-grid">
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
            </section>

            <section class="profile-page-card profile-page-card--editor settings-card profile-details-card sample-inspired-card compact-settings-card sketch-profile-card sketch-profile-card--editor">
                <div class="sample-card-header sketch-editor-header">
                    <p class="panel-kicker">Settings Workspace</p>
                    <strong>Open the view first, then switch between personal, sound, and security.</strong>
                </div>
                <div class="settings-tab-bar" role="tablist" aria-label="Profile settings sections">
                    <button type="button" class="settings-tab active" data-settings-tab="personal" role="tab" aria-selected="true">Personal</button>
                    <button type="button" class="settings-tab" data-settings-tab="sound" role="tab" aria-selected="false">Sound</button>
                    <button type="button" class="settings-tab" data-settings-tab="security" role="tab" aria-selected="false">Security</button>
                </div>

                <div class="settings-panel-stack">
                    <section class="settings-tab-panel active" data-settings-panel="personal" role="tabpanel">
                        <div class="panel-heading settings-section-heading">
                            <p class="panel-kicker">Personal Information</p>
                            <strong>Edit account info</strong>
                        </div>
                        <div class="settings-form profile-fields-grid">
                            <label>
                                Username
                                <input type="text" id="profile-username" name="username" required>
                            </label>
                            <label>
                                Email
                                <input type="email" id="profile-email" name="email">
                            </label>
                            <label>
                                Phone Number
                                <input type="tel" id="profile-phone" name="phone_number">
                            </label>
                            <label>
                                Member Since
                                <input type="text" id="profile-member-since" value="" readonly>
                            </label>
                            <input type="hidden" id="remove-profile-photo" name="remove_profile_photo" value="0">
                        </div>
                    </section>

                    <section class="settings-tab-panel" data-settings-panel="sound" role="tabpanel" hidden>
                        <div class="panel-heading settings-section-heading">
                            <p class="panel-kicker">Sound Settings</p>
                            <strong>Choose what you want to hear in-game</strong>
                        </div>
                        <div class="settings-form sound-setting-list">
                            <label class="toggle-row">
                                <span>Master Sound</span>
                                <input type="checkbox" id="sound-enabled" name="sound_enabled">
                            </label>
                            <label class="toggle-row">
                                <span>Music</span>
                                <input type="checkbox" id="music-enabled" name="music_enabled">
                            </label>
                            <label class="toggle-row">
                                <span>Effects</span>
                                <input type="checkbox" id="effects-enabled" name="effects_enabled">
                            </label>
                        </div>
                    </section>

                    <section class="settings-tab-panel" data-settings-panel="security" role="tabpanel" hidden>
                        <div class="panel-heading settings-section-heading">
                            <p class="panel-kicker">Security</p>
                            <strong>Change password only when needed</strong>
                        </div>
                        <div class="settings-form">
                            <label>
                                Current Password
                                <input type="password" id="current-password" name="current_password">
                            </label>
                            <label>
                                New Password
                                <input type="password" id="new-password" name="new_password">
                            </label>
                            <label>
                                Confirm New Password
                                <input type="password" id="confirm-password" name="confirm_password">
                            </label>
                        </div>
                    </section>
                </div>

                <div class="profile-save-inline">
                    <div class="settings-feedback-wrap">
                        <p class="settings-feedback" id="profile-feedback"></p>
                    </div>
                    <button type="submit" class="dashboard-action-link profile-save-button">Save Settings</button>
                </div>
            </section>
        </form>
    </section>
</div>
<?php endif; ?>

<script>
window.BANANA_USER = {
    id: <?php echo $userId; ?>,
    username: <?php echo json_encode($_SESSION["username"]); ?>,
    role: <?php echo json_encode($role); ?>
};
</script>
<script type="module" src="js/profile-page.js?v=20260416a"></script>
</body>
</html>
