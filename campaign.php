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
    <title>Banana Puzzle Garden Campaign</title>
    <link rel="stylesheet" href="style.css?v=20260403a">
</head>
<body>
<div id="app" class="campaign-page-app">
    <section class="section campaign-page-shell">
        <div class="campaign-page-topbar">
            <div>
                <p class="welcome-kicker">Banana Run Mode</p>
                <h2 class="campaign-page-title">Campaign</h2>
            </div>
            <div class="campaign-page-actions">
                <a href="dashboard.php" class="dashboard-action-link secondary">Back to Dashboard</a>
                <a href="play.php?mode=campaign" class="dashboard-action-link">Start Now</a>
            </div>
        </div>

        <div id="level-select" class="campaign-page-board">
            <div class="campaign-hero">
                <div>
                    <p class="campaign-kicker">Banana Run Mode</p>
                    <h3>10 levels. One life. No skips.</h3>
                    <p class="campaign-copy">Start at Level 1 and survive the full sequence. Every stage gets faster, harsher, and more competitive.</p>
                </div>
                <div class="campaign-orb" aria-hidden="true">
                    <span id="campaign-current-level">1</span>
                </div>
            </div>

            <div class="campaign-rules">
                <div class="campaign-rule">
                    <span>Structure</span>
                    <strong>Clear levels in order</strong>
                </div>
                <div class="campaign-rule">
                    <span>Pressure</span>
                    <strong>Timer and mistake limits apply</strong>
                </div>
                <div class="campaign-rule">
                    <span>Goal</span>
                    <strong>Finish all 10 levels</strong>
                </div>
            </div>

            <p class="campaign-status" id="campaign-status">Ready to begin your run from Level 1.</p>
            <a id="start-run-btn" class="campaign-start-btn campaign-link-btn" href="play.php?mode=campaign">Start Run</a>
            <div class="campaign-screen">
                <div class="campaign-screen-copy">
                    <span class="campaign-screen-kicker">Run Screen</span>
                    <strong id="campaign-screen-title">Level 1 ready to launch</strong>
                    <p id="campaign-screen-copy">The first stage opens with a longer timer so you can settle into the run.</p>
                </div>
                <div class="campaign-screen-stats">
                    <span><strong id="campaign-screen-time">120s</strong> timer</span>
                    <span><strong id="campaign-screen-target">20</strong> target</span>
                    <span><strong id="campaign-screen-mistakes">5</strong> mistakes</span>
                </div>
            </div>
            <div id="level-buttons-container"></div>
        </div>
    </section>
</div>

<script>
window.BANANA_USER = {
    id: <?php echo $userId; ?>,
    role: <?php echo json_encode($role); ?>
};
</script>
<script type="module" src="js/campaign-page.js?v=20260403a"></script>
</body>
</html>
