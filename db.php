<?php
function banana_game_db(): mysqli
{
    static $conn = null;

    if ($conn instanceof mysqli) {
        return $conn;
    }

    $conn = new mysqli("localhost", "root", "", "banana_game");

    if ($conn->connect_error) {
        throw new RuntimeException("Database connection failed");
    }

    $conn->set_charset("utf8mb4");
    banana_game_ensure_schema($conn);

    return $conn;
}

function banana_game_respond(array $payload): void
{
    echo json_encode($payload);
    exit();
}

function banana_game_ensure_schema(mysqli $conn): void
{
    $conn->query(
        "CREATE TABLE IF NOT EXISTS user_settings (
            user_id INT NOT NULL PRIMARY KEY,
            sound_enabled TINYINT(1) NOT NULL DEFAULT 1,
            music_enabled TINYINT(1) NOT NULL DEFAULT 1,
            effects_enabled TINYINT(1) NOT NULL DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_user_settings_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $conn->query(
        "CREATE TABLE IF NOT EXISTS remember_tokens (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            selector CHAR(24) NOT NULL,
            token_hash CHAR(64) NOT NULL,
            expires_at DATETIME NOT NULL,
            last_used_at DATETIME NULL DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_selector (selector),
            KEY idx_remember_user_id (user_id),
            KEY idx_remember_expires_at (expires_at),
            CONSTRAINT fk_remember_tokens_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $conn->query(
        "CREATE TABLE IF NOT EXISTS player_profiles (
            user_id INT NOT NULL PRIMARY KEY,
            xp INT NOT NULL DEFAULT 0,
            coins INT NOT NULL DEFAULT 0,
            total_runs INT NOT NULL DEFAULT 0,
            wins INT NOT NULL DEFAULT 0,
            best_score INT NOT NULL DEFAULT 0,
            best_level INT NOT NULL DEFAULT 0,
            total_correct INT NOT NULL DEFAULT 0,
            total_wrong INT NOT NULL DEFAULT 0,
            longest_streak INT NOT NULL DEFAULT 0,
            last_mode VARCHAR(50) NOT NULL DEFAULT 'campaign',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_player_profiles_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $conn->query(
        "CREATE TABLE IF NOT EXISTS user_achievements (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            achievement_key VARCHAR(80) NOT NULL,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_achievement (user_id, achievement_key),
            CONSTRAINT fk_user_achievements_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $conn->query(
        "CREATE TABLE IF NOT EXISTS scores (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            score INT NOT NULL DEFAULT 0,
            mode VARCHAR(50) NOT NULL DEFAULT 'campaign',
            highest_level INT NOT NULL DEFAULT 1,
            total_correct INT NOT NULL DEFAULT 0,
            total_wrong INT NOT NULL DEFAULT 0,
            longest_streak INT NOT NULL DEFAULT 0,
            result VARCHAR(20) NOT NULL DEFAULT 'failed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY idx_scores_user_id (user_id),
            KEY idx_scores_created_at (created_at),
            CONSTRAINT fk_scores_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $conn->query(
        "CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            delivery_method VARCHAR(10) NOT NULL DEFAULT 'email',
            destination VARCHAR(120) NOT NULL,
            code_hash VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            KEY idx_reset_user_id (user_id),
            KEY idx_reset_expires_at (expires_at),
            CONSTRAINT fk_password_reset_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    banana_game_ensure_column($conn, "users", "email", "VARCHAR(100) DEFAULT NULL");
    banana_game_ensure_column($conn, "users", "phone_number", "VARCHAR(30) DEFAULT NULL");
    banana_game_ensure_column($conn, "users", "role", "VARCHAR(20) NOT NULL DEFAULT 'player'");
    banana_game_ensure_column($conn, "users", "profile_photo", "VARCHAR(255) DEFAULT NULL");
    banana_game_ensure_column($conn, "scores", "mode", "VARCHAR(50) NOT NULL DEFAULT 'campaign'");
    banana_game_ensure_column($conn, "scores", "highest_level", "INT NOT NULL DEFAULT 1");
    banana_game_ensure_column($conn, "scores", "total_correct", "INT NOT NULL DEFAULT 0");
    banana_game_ensure_column($conn, "scores", "total_wrong", "INT NOT NULL DEFAULT 0");
    banana_game_ensure_column($conn, "scores", "longest_streak", "INT NOT NULL DEFAULT 0");
    banana_game_ensure_column($conn, "scores", "result", "VARCHAR(20) NOT NULL DEFAULT 'failed'");
}

function banana_game_ensure_column(mysqli $conn, string $table, string $column, string $definition): void
{
    $tableName = $conn->real_escape_string($table);
    $columnName = $conn->real_escape_string($column);
    $result = $conn->query("SHOW COLUMNS FROM `{$tableName}` LIKE '{$columnName}'");

    if ($result && $result->num_rows > 0) {
        return;
    }

    $conn->query("ALTER TABLE `{$tableName}` ADD COLUMN `{$columnName}` {$definition}");
}

function banana_game_create_profile_if_missing(mysqli $conn, int $userId): void
{
    $stmt = $conn->prepare("INSERT IGNORE INTO player_profiles (user_id) VALUES (?)");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();
}

function banana_game_insert_achievements(mysqli $conn, int $userId, array $achievementKeys): void
{
    if (!$achievementKeys) {
        return;
    }

    $stmt = $conn->prepare(
        "INSERT IGNORE INTO user_achievements (user_id, achievement_key) VALUES (?, ?)"
    );

    foreach ($achievementKeys as $achievementKey) {
        $cleanKey = trim((string) $achievementKey);
        if ($cleanKey === "") {
            continue;
        }

        $stmt->bind_param("is", $userId, $cleanKey);
        $stmt->execute();
    }

    $stmt->close();
}

function banana_game_create_settings_if_missing(mysqli $conn, int $userId): void
{
    $stmt = $conn->prepare("INSERT IGNORE INTO user_settings (user_id) VALUES (?)");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->close();
}

function banana_game_get_user_settings(mysqli $conn, int $userId): array
{
    banana_game_create_settings_if_missing($conn, $userId);

    $stmt = $conn->prepare(
        "SELECT sound_enabled, music_enabled, effects_enabled
         FROM user_settings
         WHERE user_id = ?"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $settings = $stmt->get_result()->fetch_assoc() ?: [];
    $stmt->close();

    return [
        "sound_enabled" => (bool) ($settings["sound_enabled"] ?? true),
        "music_enabled" => (bool) ($settings["music_enabled"] ?? true),
        "effects_enabled" => (bool) ($settings["effects_enabled"] ?? true),
    ];
}

function banana_game_update_user_settings(mysqli $conn, int $userId, array $settings): array
{
    banana_game_create_settings_if_missing($conn, $userId);

    $soundEnabled = !empty($settings["sound_enabled"]) ? 1 : 0;
    $musicEnabled = !empty($settings["music_enabled"]) ? 1 : 0;
    $effectsEnabled = !empty($settings["effects_enabled"]) ? 1 : 0;

    $stmt = $conn->prepare(
        "UPDATE user_settings
         SET sound_enabled = ?, music_enabled = ?, effects_enabled = ?
         WHERE user_id = ?"
    );
    $stmt->bind_param("iiii", $soundEnabled, $musicEnabled, $effectsEnabled, $userId);
    $stmt->execute();
    $stmt->close();

    return banana_game_get_user_settings($conn, $userId);
}

function banana_game_get_user_by_id(mysqli $conn, int $userId): ?array
{
    $stmt = $conn->prepare(
        "SELECT id, username, email, phone_number, role, profile_photo
         FROM users
         WHERE id = ?
         LIMIT 1"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc() ?: null;
    $stmt->close();

    return $user;
}

function banana_game_get_new_user_role(mysqli $conn): string
{
    $result = $conn->query("SELECT COUNT(*) AS admin_count FROM users WHERE role = 'admin'");
    $row = $result ? $result->fetch_assoc() : null;
    $adminCount = (int) ($row["admin_count"] ?? 0);

    return $adminCount === 0 ? "admin" : "player";
}

function banana_game_find_user_for_reset(mysqli $conn, string $identifier, string $method): ?array
{
    $cleanIdentifier = trim($identifier);
    if ($cleanIdentifier === "") {
        return null;
    }

    if ($method === "sms") {
        $stmt = $conn->prepare(
            "SELECT id, username, email, phone_number
             FROM users
             WHERE username = ? OR phone_number = ?
             LIMIT 1"
        );
    } else {
        $stmt = $conn->prepare(
            "SELECT id, username, email, phone_number
             FROM users
             WHERE username = ? OR email = ?
             LIMIT 1"
        );
    }

    $stmt->bind_param("ss", $cleanIdentifier, $cleanIdentifier);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc() ?: null;
    $stmt->close();

    return $user;
}

function banana_game_create_reset_code(
    mysqli $conn,
    int $userId,
    string $method,
    string $destination,
    int $minutes = 15
): string {
    $code = (string) random_int(100000, 999999);

    $clearExisting = $conn->prepare(
        "UPDATE password_reset_tokens
         SET used_at = NOW()
         WHERE user_id = ? AND used_at IS NULL"
    );
    $clearExisting->bind_param("i", $userId);
    $clearExisting->execute();
    $clearExisting->close();

    $expiresAt = (new DateTimeImmutable("+{$minutes} minutes"))->format("Y-m-d H:i:s");
    $codeHash = password_hash($code, PASSWORD_DEFAULT);
    $stmt = $conn->prepare(
        "INSERT INTO password_reset_tokens (user_id, delivery_method, destination, code_hash, expires_at)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->bind_param("issss", $userId, $method, $destination, $codeHash, $expiresAt);
    $stmt->execute();
    $stmt->close();

    return $code;
}

function banana_game_complete_password_reset(
    mysqli $conn,
    string $identifier,
    string $method,
    string $code,
    string $newPassword
): bool {
    $user = banana_game_find_user_for_reset($conn, $identifier, $method);
    if (!$user) {
        return false;
    }

    $stmt = $conn->prepare(
        "SELECT id, code_hash
         FROM password_reset_tokens
         WHERE user_id = ?
           AND delivery_method = ?
           AND used_at IS NULL
           AND expires_at >= NOW()
         ORDER BY created_at DESC
         LIMIT 1"
    );
    $stmt->bind_param("is", $user["id"], $method);
    $stmt->execute();
    $result = $stmt->get_result();
    $token = $result->fetch_assoc();
    $stmt->close();

    if (!$token || !password_verify($code, $token["code_hash"])) {
        return false;
    }

    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateUser = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $updateUser->bind_param("si", $passwordHash, $user["id"]);
    $updateUser->execute();
    $updateUser->close();

    $consumeToken = $conn->prepare("UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?");
    $consumeToken->bind_param("i", $token["id"]);
    $consumeToken->execute();
    $consumeToken->close();

    return true;
}
?>
