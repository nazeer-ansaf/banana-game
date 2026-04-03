<?php

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . "/PHPMailer-master/PHPMailer-master/src/Exception.php";
require_once __DIR__ . "/PHPMailer-master/PHPMailer-master/src/PHPMailer.php";
require_once __DIR__ . "/PHPMailer-master/PHPMailer-master/src/SMTP.php";

function banana_game_mail_config(): array
{
    $configPath = __DIR__ . "/mail_config.php";
    if (!file_exists($configPath)) {
        return ["enabled" => false];
    }

    $config = require $configPath;
    return is_array($config) ? $config : ["enabled" => false];
}

function banana_game_can_send_mail(): bool
{
    $config = banana_game_mail_config();

    return !empty($config["enabled"])
        && !empty($config["host"])
        && !empty($config["port"])
        && !empty($config["username"])
        && !empty($config["password"])
        && !empty($config["from_email"]);
}

function banana_game_send_reset_email(string $toEmail, string $username, string $code): array
{
    $config = banana_game_mail_config();

    if (!banana_game_can_send_mail()) {
        return [
            "ok" => false,
            "message" => "SMTP is not configured yet."
        ];
    }

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = (string) $config["host"];
        $mail->SMTPAuth = true;
        $mail->Username = (string) $config["username"];
        $mail->Password = (string) $config["password"];
        $mail->Port = (int) $config["port"];
        $mail->CharSet = "UTF-8";

        $encryption = strtolower((string) ($config["encryption"] ?? "tls"));
        if ($encryption === "ssl") {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } elseif ($encryption === "tls") {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }

        $mail->setFrom(
            (string) $config["from_email"],
            (string) ($config["from_name"] ?? "Banana Puzzle Garden")
        );
        $mail->addAddress($toEmail, $username);
        $mail->isHTML(true);
        $mail->Subject = "Banana Puzzle Garden password reset code";
        $mail->Body = sprintf(
            "<h2>Password Reset Code</h2><p>Hello %s,</p><p>Your Banana Puzzle Garden reset code is:</p><p style=\"font-size:28px;font-weight:800;letter-spacing:4px;\">%s</p><p>This code expires in 15 minutes.</p>",
            htmlspecialchars($username, ENT_QUOTES, "UTF-8"),
            htmlspecialchars($code, ENT_QUOTES, "UTF-8")
        );
        $mail->AltBody = "Hello {$username}, your Banana Puzzle Garden reset code is {$code}. It expires in 15 minutes.";
        $mail->send();

        return [
            "ok" => true,
            "message" => "Reset code sent successfully."
        ];
    } catch (Exception $exception) {
        return [
            "ok" => false,
            "message" => "Mailer error: " . $mail->ErrorInfo
        ];
    }
}
