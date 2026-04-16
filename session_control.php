<?php
require_once __DIR__ . "/db.php";

const BANANA_GAME_SESSION_NAME = "banana_game_session";
const BANANA_GAME_SESSION_TIMEOUT = 1800;
const BANANA_GAME_REMEMBER_COOKIE = "banana_game_remember";
const BANANA_GAME_REMEMBER_DAYS = 30;

function banana_game_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        banana_game_session_refresh_activity();
        return;
    }

    $cookie = banana_game_session_cookie_options();

    session_name(BANANA_GAME_SESSION_NAME);
    session_set_cookie_params([
        "lifetime" => 0,
        "path" => $cookie["path"],
        "domain" => $cookie["domain"],
        "secure" => $cookie["secure"],
        "httponly" => true,
        "samesite" => "Lax",
    ]);

    ini_set("session.use_only_cookies", "1");
    ini_set("session.use_strict_mode", "1");

    session_start();

    if (!banana_game_is_authenticated()) {
        banana_game_attempt_remember_login();
    } else {
        banana_game_sync_session_user();
    }

    banana_game_session_refresh_activity();
}

function banana_game_session_cookie_options(): array
{
    return [
        "path" => "/",
        "domain" => "",
        "secure" => !empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off",
    ];
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

function banana_game_complete_login(int $userId, string $username, string $role): void
{
    $_SESSION["user_id"] = $userId;
    $_SESSION["username"] = $username;
    $_SESSION["role"] = $role;
    $_SESSION["last_activity_at"] = time();
}

function banana_game_login_user(int $userId, string $username, string $role = "player", bool $remember = false): void
{
    banana_game_session_start();
    session_regenerate_id(true);
    banana_game_complete_login($userId, $username, $role);

    if ($remember) {
        banana_game_issue_remember_token($userId);
        return;
    }

    banana_game_clear_remember_token();
}

function banana_game_is_authenticated(): bool
{
    return isset($_SESSION["user_id"], $_SESSION["username"]);
}

function banana_game_current_user_id(): int
{
    return (int) ($_SESSION["user_id"] ?? 0);
}

function banana_game_current_user_role(): string
{
    return (string) ($_SESSION["role"] ?? "player");
}

function banana_game_is_admin(): bool
{
    return banana_game_current_user_role() === "admin";
}

function banana_game_sync_session_user(): void
{
    $userId = (int) ($_SESSION["user_id"] ?? 0);
    if ($userId <= 0) {
        return;
    }

    if (!isset($_SESSION["role"]) || !isset($_SESSION["username"])) {
        try {
            $conn = banana_game_db();
        } catch (RuntimeException $exception) {
            return;
        }

        $user = banana_game_get_user_by_id($conn, $userId);
        if (!$user) {
            return;
        }

        $_SESSION["username"] = (string) $user["username"];
        $_SESSION["role"] = (string) ($user["role"] ?? "player");
    }
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

function banana_game_require_admin_page(string $redirect = "dashboard.php"): void
{
    banana_game_require_auth_page();

    if (banana_game_is_admin()) {
        return;
    }

    header("Location: {$redirect}");
    exit();
}

function banana_game_require_admin_json(): void
{
    banana_game_require_auth_json();

    if (banana_game_is_admin()) {
        return;
    }

    header("Content-Type: application/json");
    http_response_code(403);
    echo json_encode([
        "status" => "error",
        "message" => "Admin access required"
    ]);
    exit();
}

function banana_game_require_player_page(string $redirect = "admin.php"): void
{
    banana_game_require_auth_page();

    if (!banana_game_is_admin()) {
        return;
    }

    header("Location: {$redirect}");
    exit();
}

function banana_game_require_player_json(): void
{
    banana_game_require_auth_json();

    if (!banana_game_is_admin()) {
        return;
    }

    header("Content-Type: application/json");
    http_response_code(403);
    echo json_encode([
        "status" => "error",
        "message" => "Player access required"
    ]);
    exit();
}

function banana_game_attempt_remember_login(): void
{
    $rememberValue = $_COOKIE[BANANA_GAME_REMEMBER_COOKIE] ?? "";
    if ($rememberValue === "" || strpos($rememberValue, ":") === false) {
        return;
    }

    [$selector, $validator] = explode(":", $rememberValue, 2);
    if ($selector === "" || $validator === "") {
        banana_game_clear_remember_token();
        return;
    }

    try {
        $conn = banana_game_db();
    } catch (RuntimeException $exception) {
        return;
    }

    $stmt = $conn->prepare(
        "SELECT rt.user_id, rt.token_hash, u.username, u.role
         FROM remember_tokens rt
         JOIN users u ON u.id = rt.user_id
         WHERE rt.selector = ?
           AND rt.expires_at >= NOW()
         LIMIT 1"
    );
    $stmt->bind_param("s", $selector);
    $stmt->execute();
    $tokenRow = $stmt->get_result()->fetch_assoc() ?: null;
    $stmt->close();

    if (!$tokenRow) {
        banana_game_clear_remember_token();
        return;
    }

    $validatorHash = hash("sha256", $validator);
    if (!hash_equals((string) $tokenRow["token_hash"], $validatorHash)) {
        banana_game_delete_remember_token_by_selector($selector);
        banana_game_clear_remember_token();
        return;
    }

    session_regenerate_id(true);
    banana_game_complete_login(
        (int) $tokenRow["user_id"],
        (string) $tokenRow["username"],
        (string) ($tokenRow["role"] ?? "player")
    );

    banana_game_rotate_remember_token((int) $tokenRow["user_id"], $selector);
}

function banana_game_issue_remember_token(int $userId): void
{
    banana_game_clear_remember_token();

    $selector = bin2hex(random_bytes(12));
    $validator = bin2hex(random_bytes(32));
    $tokenHash = hash("sha256", $validator);
    $expiresAt = (new DateTimeImmutable("+" . BANANA_GAME_REMEMBER_DAYS . " days"))->format("Y-m-d H:i:s");

    $conn = banana_game_db();

    $stmt = $conn->prepare(
        "INSERT INTO remember_tokens (user_id, selector, token_hash, expires_at, last_used_at)
         VALUES (?, ?, ?, ?, NOW())"
    );
    $stmt->bind_param("isss", $userId, $selector, $tokenHash, $expiresAt);
    $stmt->execute();
    $stmt->close();

    $cookie = banana_game_session_cookie_options();
    setcookie(
        BANANA_GAME_REMEMBER_COOKIE,
        $selector . ":" . $validator,
        [
            "expires" => time() + (86400 * BANANA_GAME_REMEMBER_DAYS),
            "path" => $cookie["path"],
            "domain" => $cookie["domain"],
            "secure" => $cookie["secure"],
            "httponly" => true,
            "samesite" => "Lax",
        ]
    );

    $_COOKIE[BANANA_GAME_REMEMBER_COOKIE] = $selector . ":" . $validator;
}

function banana_game_rotate_remember_token(int $userId, string $oldSelector): void
{
    banana_game_delete_remember_token_by_selector($oldSelector);
    banana_game_issue_remember_token($userId);
}

function banana_game_delete_remember_token_by_selector(string $selector): void
{
    if ($selector === "") {
        return;
    }

    try {
        $conn = banana_game_db();
    } catch (RuntimeException $exception) {
        return;
    }

    $stmt = $conn->prepare("DELETE FROM remember_tokens WHERE selector = ?");
    $stmt->bind_param("s", $selector);
    $stmt->execute();
    $stmt->close();
}

function banana_game_clear_remember_token(): void
{
    $existing = $_COOKIE[BANANA_GAME_REMEMBER_COOKIE] ?? "";
    if ($existing !== "" && strpos($existing, ":") !== false) {
        [$selector] = explode(":", $existing, 2);
        banana_game_delete_remember_token_by_selector($selector);
    }

    $cookie = banana_game_session_cookie_options();
    setcookie(
        BANANA_GAME_REMEMBER_COOKIE,
        "",
        [
            "expires" => time() - 42000,
            "path" => $cookie["path"],
            "domain" => $cookie["domain"],
            "secure" => $cookie["secure"],
            "httponly" => true,
            "samesite" => "Lax",
        ]
    );

    unset($_COOKIE[BANANA_GAME_REMEMBER_COOKIE]);
}

function banana_game_logout_user(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        banana_game_session_start();
    }

    banana_game_clear_remember_token();
    $_SESSION = [];

    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            "",
            [
                "expires" => time() - 42000,
                "path" => $params["path"] ?? "/",
                "domain" => $params["domain"] ?? "",
                "secure" => (bool) ($params["secure"] ?? false),
                "httponly" => (bool) ($params["httponly"] ?? true),
                "samesite" => $params["samesite"] ?? "Lax",
            ]
        );
    }

    session_destroy();
}
