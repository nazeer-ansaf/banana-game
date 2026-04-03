<?php
const BANANA_GAME_SESSION_NAME = "banana_game_session";
const BANANA_GAME_SESSION_TIMEOUT = 1800;

function banana_game_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        banana_game_session_refresh_activity();
        return;
    }

    $isSecure = !empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off";

    session_name(BANANA_GAME_SESSION_NAME);
    session_set_cookie_params([
        "lifetime" => 0,
        "path" => "/",
        "domain" => "",
        "secure" => $isSecure,
        "httponly" => true,
        "samesite" => "Lax",
    ]);

    ini_set("session.use_only_cookies", "1");
    ini_set("session.use_strict_mode", "1");

    session_start();
    banana_game_session_refresh_activity();
}

function banana_game_session_refresh_activity(): void
{
    if (!isset($_SESSION["user_id"])) {
        $_SESSION["last_activity_at"] = time();
        return;
    }

    $now = time();
    $lastActivity = (int) ($_SESSION["last_activity_at"] ?? 0);

    if ($lastActivity > 0 && ($now - $lastActivity) > BANANA_GAME_SESSION_TIMEOUT) {
        banana_game_logout_user();
        return;
    }

    $_SESSION["last_activity_at"] = $now;
}

function banana_game_login_user(int $userId, string $username): void
{
    banana_game_session_start();
    session_regenerate_id(true);

    $_SESSION["user_id"] = $userId;
    $_SESSION["username"] = $username;
    $_SESSION["last_activity_at"] = time();
}

function banana_game_is_authenticated(): bool
{
    return isset($_SESSION["user_id"], $_SESSION["username"]);
}

function banana_game_current_user_id(): int
{
    return (int) ($_SESSION["user_id"] ?? 0);
}

function banana_game_require_auth_page(string $redirect = "index.html"): void
{
    banana_game_session_start();

    if (!banana_game_is_authenticated()) {
        header("Location: {$redirect}");
        exit();
    }
}

function banana_game_require_auth_json(): void
{
    banana_game_session_start();

    if (banana_game_is_authenticated()) {
        return;
    }

    header("Content-Type: application/json");
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Authentication required"
    ]);
    exit();
}

function banana_game_logout_user(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        banana_game_session_start();
    }

    $_SESSION = [];

    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            "",
            time() - 42000,
            $params["path"] ?? "/",
            $params["domain"] ?? "",
            (bool) ($params["secure"] ?? false),
            (bool) ($params["httponly"] ?? true)
        );
    }

    session_destroy();
}
