<?php
session_start();

require_once __DIR__ . "/db.php";

$message = "";
$messageClass = "";

try {
    $conn = banana_game_db();
} catch (RuntimeException $exception) {
    $message = $exception->getMessage();
    $messageClass = "error";
}

if ($_SERVER["REQUEST_METHOD"] === "POST" && $messageClass !== "error") {
    $deliveryMethod = $_POST["delivery_method"] ?? "email";
    $identifier = trim($_POST["identifier"] ?? "");
    $code = trim($_POST["code"] ?? "");
    $password = trim($_POST["password"] ?? "");
    $confirmPassword = trim($_POST["confirm_password"] ?? "");
    $deliveryMethod = in_array($deliveryMethod, ["email", "sms"], true) ? $deliveryMethod : "email";

    if ($identifier === "" || $code === "" || $password === "" || $confirmPassword === "") {
        $message = "Fill in every reset field before submitting.";
        $messageClass = "error";
    } elseif ($password !== $confirmPassword) {
        $message = "The new password and confirm password do not match.";
        $messageClass = "error";
    } elseif (!preg_match("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/", $password)) {
        $message = "Password must include uppercase, lowercase, number, special character, and at least 8 characters.";
        $messageClass = "error";
    } elseif (!banana_game_complete_password_reset($conn, $identifier, $deliveryMethod, $code, $password)) {
        $message = "That reset code is invalid or expired. Request a fresh one and try again.";
        $messageClass = "error";
    } else {
        $message = "Password updated successfully. You can sign in now with your username or email.";
        $messageClass = "success";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banana Puzzle Garden Reset Password</title>
    <link rel="stylesheet" href="style.css?v=20260403a">
</head>
<body>
<div id="app" class="auth-page">
    <section class="section auth-card">
        <div class="auth-card-header">
            <p class="welcome-kicker">Password Reset</p>
            <h2>Set New Password</h2>
            <p class="auth-note">Enter the reset code from email or SMS, then choose a strong new password.</p>
        </div>

        <?php if ($message !== ""): ?>
            <div class="auth-feedback <?php echo htmlspecialchars($messageClass, ENT_QUOTES, "UTF-8"); ?>">
                <?php echo htmlspecialchars($message, ENT_QUOTES, "UTF-8"); ?>
            </div>
        <?php endif; ?>

        <form method="post" class="auth-form">
            <div class="auth-inline">
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
            </div>

            <label>
                Reset Code
                <input type="text" name="code" inputmode="numeric" placeholder="6-digit code" required>
            </label>

            <div class="auth-inline">
                <label>
                    New Password
                    <input type="password" name="password" placeholder="New password" required>
                </label>

                <label>
                    Confirm Password
                    <input type="password" name="confirm_password" placeholder="Confirm password" required>
                </label>
            </div>

            <button type="submit">Update Password</button>
        </form>

        <div class="auth-actions">
            <a href="forgot_password.php" class="auth-link-btn secondary">Request New Code</a>
            <a href="index.html" class="auth-link-btn">Back to Login</a>
        </div>
    </section>
</div>
</body>
</html>
