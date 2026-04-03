<?php
session_start();

require_once __DIR__ . "/db.php";

$message = "";
$messageClass = "";
$previewCode = "";
$deliveryLabel = "";

try {
    $conn = banana_game_db();
} catch (RuntimeException $exception) {
    $message = $exception->getMessage();
    $messageClass = "error";
}

if ($_SERVER["REQUEST_METHOD"] === "POST" && $messageClass !== "error") {
    $deliveryMethod = $_POST["delivery_method"] ?? "email";
    $identifier = trim($_POST["identifier"] ?? "");
    $deliveryMethod = in_array($deliveryMethod, ["email", "sms"], true) ? $deliveryMethod : "email";

    if ($identifier === "") {
        $message = "Enter your username, email, or phone number first.";
        $messageClass = "error";
    } else {
        $user = banana_game_find_user_for_reset($conn, $identifier, $deliveryMethod);

        if (!$user) {
            $message = "No matching account was found for that reset method.";
            $messageClass = "error";
        } else {
            $destination = $deliveryMethod === "sms"
                ? trim((string) ($user["phone_number"] ?? ""))
                : trim((string) ($user["email"] ?? ""));

            if ($destination === "") {
                $message = $deliveryMethod === "sms"
                    ? "That account does not have a phone number saved for SMS reset yet."
                    : "That account does not have an email address saved for email reset yet.";
                $messageClass = "error";
            } else {
                $previewCode = banana_game_create_reset_code(
                    $conn,
                    (int) $user["id"],
                    $deliveryMethod,
                    $destination
                );
                $deliveryLabel = $deliveryMethod === "sms" ? "SMS" : "Email";
                $message = "Reset code created. In local preview mode the code is shown below so you can test the flow.";
                $messageClass = "success";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banana Puzzle Garden Forgot Password</title>
    <link rel="stylesheet" href="style.css?v=20260403a">
</head>
<body>
<div id="app" class="auth-page">
    <section class="section auth-card">
        <div class="auth-card-header">
            <p class="welcome-kicker">Password Reset</p>
            <h2>Request Reset Code</h2>
            <p class="auth-note">Choose email or SMS, then enter the account detail linked to that method.</p>
        </div>

        <?php if ($message !== ""): ?>
            <div class="auth-feedback <?php echo htmlspecialchars($messageClass, ENT_QUOTES, "UTF-8"); ?>">
                <?php echo htmlspecialchars($message, ENT_QUOTES, "UTF-8"); ?>
                <?php if ($previewCode !== ""): ?>
                    <br><br>
                    <strong><?php echo htmlspecialchars($deliveryLabel, ENT_QUOTES, "UTF-8"); ?> preview code:</strong>
                    <?php echo htmlspecialchars($previewCode, ENT_QUOTES, "UTF-8"); ?>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <form method="post" class="auth-form">
            <label>
                Delivery Method
                <select name="delivery_method">
                    <option value="email">Email Reset</option>
                    <option value="sms">SMS Reset</option>
                </select>
            </label>

            <label>
                Username / Email / Phone
                <input type="text" name="identifier" placeholder="username, email, or phone" required>
            </label>

            <button type="submit">Send Reset Code</button>
        </form>

        <p class="auth-meta">Local preview mode is active now. When SMTP or SMS provider credentials are added later, this same flow can deliver real messages.</p>

        <div class="auth-actions">
            <a href="reset_password.php" class="auth-link-btn">I Have A Code</a>
            <a href="index.html" class="auth-link-btn secondary">Back to Login</a>
        </div>
    </section>
</div>
</body>
</html>
