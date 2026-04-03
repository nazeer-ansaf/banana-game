<?php
require_once __DIR__ . "/session_control.php";

banana_game_logout_user();

header("Location: index.html");
exit();
?>
