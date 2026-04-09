<?php
header("Content-Type: application/json");

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/session_control.php";

banana_game_require_auth_json();

try {
    $conn = banana_game_db();
} catch (RuntimeException $exception) {
    banana_game_respond([
        "status" => "error",
        "message" => $exception->getMessage()
    ]);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    banana_game_respond([
        "status" => "error",
        "message" => "Unsupported request method"
    ]);
}

$action = trim((string) ($_POST["action"] ?? ""));
$userId = banana_game_current_user_id();

if ($action === "save_all_settings" || $action === "update_profile") {
    $username = trim((string) ($_POST["username"] ?? ""));
    $email = trim((string) ($_POST["email"] ?? ""));
    $phoneNumber = trim((string) ($_POST["phone_number"] ?? ""));
    $removePhoto = !empty($_POST["remove_profile_photo"]);
    $soundEnabled = !empty($_POST["sound_enabled"]);
    $musicEnabled = !empty($_POST["music_enabled"]);
    $effectsEnabled = !empty($_POST["effects_enabled"]);
    $currentPassword = trim((string) ($_POST["current_password"] ?? ""));
    $newPassword = trim((string) ($_POST["new_password"] ?? ""));
    $confirmPassword = trim((string) ($_POST["confirm_password"] ?? ""));
    $shouldChangePassword = $action === "save_all_settings"
        ? ($currentPassword !== "" || $newPassword !== "" || $confirmPassword !== "")
        : false;

    if ($username === "") {
        banana_game_respond([
            "status" => "error",
            "message" => "Username is required"
        ]);
    }

    if ($email !== "" && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        banana_game_respond([
            "status" => "error",
            "message" => "Enter a valid email address"
        ]);
    }

    $checkStmt = $conn->prepare(
        "SELECT id
         FROM users
         WHERE (username = ? OR (? <> '' AND email = ?))
           AND id <> ?
         LIMIT 1"
    );
    $checkStmt->bind_param("sssi", $username, $email, $email, $userId);
    $checkStmt->execute();
    $existing = $checkStmt->get_result()->fetch_assoc();
    $checkStmt->close();

    if ($existing) {
        banana_game_respond([
            "status" => "error",
            "message" => "Username or email is already in use"
        ]);
    }

    $currentUser = banana_game_get_user_by_id($conn, $userId);
    if (!$currentUser) {
        banana_game_respond([
            "status" => "error",
            "message" => "User not found"
        ]);
    }

    $emailValue = $email !== "" ? $email : null;
    $phoneValue = $phoneNumber !== "" ? $phoneNumber : null;
    $photoValue = $currentUser["profile_photo"] ?? null;
    $passwordHash = null;

    if ($shouldChangePassword) {
        if ($currentPassword === "" || $newPassword === "" || $confirmPassword === "") {
            banana_game_respond([
                "status" => "error",
                "message" => "Fill in all password fields to change your password"
            ]);
        }

        if ($newPassword !== $confirmPassword) {
            banana_game_respond([
                "status" => "error",
                "message" => "New passwords do not match"
            ]);
        }

        if (!preg_match("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/", $newPassword)) {
            banana_game_respond([
                "status" => "error",
                "message" => "New password must meet the strength rules"
            ]);
        }

        $passwordStmt = $conn->prepare("SELECT password FROM users WHERE id = ? LIMIT 1");
        $passwordStmt->bind_param("i", $userId);
        $passwordStmt->execute();
        $passwordRow = $passwordStmt->get_result()->fetch_assoc() ?: null;
        $passwordStmt->close();

        if (!$passwordRow || !password_verify($currentPassword, $passwordRow["password"])) {
            banana_game_respond([
                "status" => "error",
                "message" => "Current password is incorrect"
            ]);
        }

        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    }

    if ($removePhoto) {
        banana_game_delete_profile_photo($photoValue);
        $photoValue = null;
    }

    if (!empty($_FILES["profile_photo"]) && (int) $_FILES["profile_photo"]["error"] !== UPLOAD_ERR_NO_FILE) {
        $upload = banana_game_store_profile_photo($_FILES["profile_photo"], $userId);
        if ($upload["status"] !== "success") {
            banana_game_respond($upload);
        }

        banana_game_delete_profile_photo($photoValue);
        $photoValue = $upload["path"];
    }

    $updateStmt = $conn->prepare(
        "UPDATE users
         SET username = ?, email = ?, phone_number = ?, profile_photo = ?
         WHERE id = ?"
    );
    $updateStmt->bind_param("ssssi", $username, $emailValue, $phoneValue, $photoValue, $userId);
    $updateStmt->execute();
    $updateStmt->close();

    $_SESSION["username"] = $username;

    if ($action === "save_all_settings") {
        $settings = banana_game_update_user_settings($conn, $userId, [
            "sound_enabled" => $soundEnabled,
            "music_enabled" => $musicEnabled,
            "effects_enabled" => $effectsEnabled,
        ]);

        if ($shouldChangePassword) {
            $passwordUpdateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $passwordUpdateStmt->bind_param("si", $passwordHash, $userId);
            $passwordUpdateStmt->execute();
            $passwordUpdateStmt->close();
        }

        banana_game_respond([
            "status" => "success",
            "message" => $shouldChangePassword ? "Settings and password updated" : "Settings updated",
            "account" => [
                "username" => $username,
                "email" => $emailValue ?? "",
                "phone_number" => $phoneValue ?? "",
                "profile_photo" => $photoValue ?? ""
            ],
            "settings" => $settings
        ]);
    }

    banana_game_respond([
        "status" => "success",
        "message" => "Profile updated",
        "account" => [
            "username" => $username,
            "email" => $emailValue ?? "",
            "phone_number" => $phoneValue ?? "",
            "profile_photo" => $photoValue ?? ""
        ]
    ]);
}

if ($action === "update_sound_settings") {
    $settings = banana_game_update_user_settings($conn, $userId, [
        "sound_enabled" => !empty($_POST["sound_enabled"]),
        "music_enabled" => !empty($_POST["music_enabled"]),
        "effects_enabled" => !empty($_POST["effects_enabled"]),
    ]);

    banana_game_respond([
        "status" => "success",
        "message" => "Sound settings saved",
        "settings" => $settings
    ]);
}

if ($action === "change_password") {
    $currentPassword = trim((string) ($_POST["current_password"] ?? ""));
    $newPassword = trim((string) ($_POST["new_password"] ?? ""));
    $confirmPassword = trim((string) ($_POST["confirm_password"] ?? ""));

    if ($currentPassword === "" || $newPassword === "" || $confirmPassword === "") {
        banana_game_respond([
            "status" => "error",
            "message" => "Fill in every password field"
        ]);
    }

    if ($newPassword !== $confirmPassword) {
        banana_game_respond([
            "status" => "error",
            "message" => "New passwords do not match"
        ]);
    }

    if (!preg_match("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/", $newPassword)) {
        banana_game_respond([
            "status" => "error",
            "message" => "New password must meet the strength rules"
        ]);
    }

    $user = banana_game_get_user_by_id($conn, $userId);
    if (!$user) {
        banana_game_respond([
            "status" => "error",
            "message" => "User not found"
        ]);
    }

    $passwordStmt = $conn->prepare("SELECT password FROM users WHERE id = ? LIMIT 1");
    $passwordStmt->bind_param("i", $userId);
    $passwordStmt->execute();
    $passwordRow = $passwordStmt->get_result()->fetch_assoc() ?: null;
    $passwordStmt->close();

    if (!$passwordRow || !password_verify($currentPassword, $passwordRow["password"])) {
        banana_game_respond([
            "status" => "error",
            "message" => "Current password is incorrect"
        ]);
    }

    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $updateStmt->bind_param("si", $passwordHash, $userId);
    $updateStmt->execute();
    $updateStmt->close();

    banana_game_respond([
        "status" => "success",
        "message" => "Password updated"
    ]);
}

banana_game_respond([
    "status" => "error",
    "message" => "Invalid action"
]);

function banana_game_store_profile_photo(array $file, int $userId): array
{
    $errorCode = (int) ($file["error"] ?? UPLOAD_ERR_NO_FILE);
    if ($errorCode !== UPLOAD_ERR_OK) {
        return [
            "status" => "error",
            "message" => "Profile photo upload failed"
        ];
    }

    $tmpName = (string) ($file["tmp_name"] ?? "");
    if ($tmpName === "" || !is_uploaded_file($tmpName)) {
        return [
            "status" => "error",
            "message" => "Uploaded file is invalid"
        ];
    }

    $fileSize = (int) ($file["size"] ?? 0);
    if ($fileSize <= 0 || $fileSize > 2 * 1024 * 1024) {
        return [
            "status" => "error",
            "message" => "Profile photo must be under 2 MB"
        ];
    }

    $imageInfo = @getimagesize($tmpName);
    if ($imageInfo === false) {
        return [
            "status" => "error",
            "message" => "Upload a valid JPG, PNG, GIF, or WebP image"
        ];
    }

    $mimeType = (string) ($imageInfo["mime"] ?? "");
    $allowedTypes = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/gif" => "gif",
        "image/webp" => "webp"
    ];

    if (!isset($allowedTypes[$mimeType])) {
        return [
            "status" => "error",
            "message" => "Only JPG, PNG, GIF, and WebP images are allowed"
        ];
    }

    $uploadRoot = __DIR__ . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . "profile_photos";
    if (!is_dir($uploadRoot) && !mkdir($uploadRoot, 0775, true) && !is_dir($uploadRoot)) {
        return [
            "status" => "error",
            "message" => "Could not create the upload folder"
        ];
    }

    $extension = $allowedTypes[$mimeType];
    $filename = "user_" . $userId . "_" . bin2hex(random_bytes(8)) . "." . $extension;
    $destination = $uploadRoot . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($tmpName, $destination)) {
        return [
            "status" => "error",
            "message" => "Could not save the uploaded photo"
        ];
    }

    return [
        "status" => "success",
        "path" => "uploads/profile_photos/" . $filename
    ];
}

function banana_game_delete_profile_photo(?string $photoPath): void
{
    $relativePath = trim((string) $photoPath);
    if ($relativePath === "" || strpos($relativePath, "uploads/profile_photos/") !== 0) {
        return;
    }

    $fullPath = __DIR__ . DIRECTORY_SEPARATOR . str_replace("/", DIRECTORY_SEPARATOR, $relativePath);
    if (is_file($fullPath)) {
        @unlink($fullPath);
    }
}
