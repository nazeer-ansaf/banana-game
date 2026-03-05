<?php
session_start();

// Redirect to login if not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: index.html");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>🍌 Choose Your Level</title>
    <link rel="stylesheet" href="style.css">
    <style>
        /* --- Body & Container --- */
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(to bottom, #fffefc, #f3f7ff);
            margin: 0;
            padding: 0;
        }

        h1 {
            text-align: center;
            margin-top: 40px;
            font-size: 2.5em;
            color: #333;
        }

        .level-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 25px;
            max-width: 1000px;
            margin: 50px auto;
            padding: 0 20px;
        }

        /* --- Level Cards --- */
        .level-card {
            position: relative;
            border-radius: 25px;
            padding: 25px;
            text-align: center;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
            box-shadow: 0 8px 15px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .level-card:hover {
            transform: scale(1.08) translateY(-8px);
            box-shadow: 0 15px 25px rgba(0,0,0,0.2);
        }

        /* --- Colors for Difficulty --- */
        .level-card.easy { background: #d4f7dc; }
        .level-card.medium { background: #fff3c4; }
        .level-card.hard { background: #ffc4c4; }
        .level-card.expert { background: #e0c4ff; }

        /* --- Floating Icons --- */
        .level-icon {
            font-size: 60px;
            margin-bottom: 15px;
            display: inline-block;
        }

        .level-icon.easy { animation: float 3s ease-in-out infinite; }
        .level-icon.medium { animation: float 2s ease-in-out infinite; }
        .level-icon.hard { animation: float 1s ease-in-out infinite; }
        .level-icon.expert { animation: float 0.7s ease-in-out infinite; }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
        }

        /* --- Wobble on hover --- */
        .level-card:hover .level-icon {
            animation: float 0.5s ease-in-out infinite, wobble 0.5s ease-in-out infinite;
        }

        @keyframes wobble {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(5deg); }
            50% { transform: rotate(-5deg); }
            75% { transform: rotate(3deg); }
            100% { transform: rotate(0deg); }
        }

        /* --- Shine Effect --- */
        .level-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: -75%;
            width: 50%;
            height: 100%;
            background: linear-gradient(120deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
            transform: skewX(-25deg);
            pointer-events: none;
            transition: left 0.5s;
            border-radius: 25px;
        }

        .level-card:hover::after {
            left: 125%;
        }

        /* --- Titles & Text --- */
        h3 {
            margin: 10px 0;
            font-size: 1.4em;
            color: #333;
        }

        p {
            margin: 5px 0;
            font-size: 1em;
            color: #555;
        }

        /* --- Responsive --- */
        @media (max-width: 500px) {
            .level-icon { font-size: 50px; }
            h1 { font-size: 2em; }
        }
    </style>
</head>
<body>

    <h1>🍌 Select Your Level 🍌</h1>

    <div class="level-container">
        <div class="level-card easy" onclick="selectLevel(1)">
            <div class="level-icon easy">🍌</div>
            <h3>Easy</h3>
            <p>⌛ 15 seconds</p>
            <p>✏️ Simple math</p>
            <p>🎯 3 attempts</p>
        </div>

        <div class="level-card medium" onclick="selectLevel(2)">
            <div class="level-icon medium">🍌🍌</div>
            <h3>Medium</h3>
            <p>⌛ 10 seconds</p>
            <p>✏️ Moderate math</p>
            <p>🎯 5 attempts</p>
        </div>

        <div class="level-card hard" onclick="selectLevel(3)">
            <div class="level-icon hard">🍌🍌🍌</div>
            <h3>Hard</h3>
            <p>⌛ 7 seconds</p>
            <p>✏️ Hard math</p>
            <p>🎯 7 attempts</p>
        </div>

        <div class="level-card expert" onclick="selectLevel(4)">
            <div class="level-icon expert">🐵🍌</div>
            <h3>Expert</h3>
            <p>⌛ 5 seconds</p>
            <p>✏️ Lightning math</p>
            <p>🎯 1 attempt</p>
        </div>
    </div>

    <script>
        function selectLevel(levelNumber) {
            sessionStorage.setItem('selectedLevel', levelNumber);
            window.location.href = "game.php"; // Redirect to game page
        }
    </script>

</body>
</html>