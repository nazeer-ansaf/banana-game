// main.js
import { fetchPuzzle } from './api.js';
import { setCorrectAnswer, checkAnswer, getScore, resetScore } from './game.js';
import { authUser, getLoggedInUser, logoutUser } from './user.js';
import { startTimer, stopTimer, resetTimer } from './timer.js';
import { unlockAchievement, resetAchievements } from './gamification.js';
import { updateLeaderboard, initLeaderboard } from './leaderboard.js';

// -------------------------
// DOM Elements
// -------------------------
const loginSection = document.getElementById("login-section");
const gameSection = document.getElementById("game-section");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const stopBtn = document.getElementById("stop-btn");

const puzzleImage = document.getElementById("puzzle-image");
const submitBtn = document.getElementById("submit-btn");
const answerInput = document.getElementById("answer-input");
const scoreDisplay = document.getElementById("score");
const resultDisplay = document.getElementById("result");
const welcomeUser = document.getElementById("welcome-user");

// -------------------------
// Load puzzle function
// -------------------------
async function loadPuzzle() {
    stopTimer();
    resultDisplay.innerText = "";
    answerInput.value = "";
    answerInput.focus();

    const data = await fetchPuzzle();
    if (data) {
        puzzleImage.src = data.question;
        setCorrectAnswer(data.solution);

        startTimer(60, async () => {
            resultDisplay.innerText = "⏰ Time's up! Loading next puzzle...";
            setTimeout(async () => {
                await loadPuzzle();
            }, 2000);
        });
    }
}

// -------------------------
// Show game section
// -------------------------
function showGame(user) {
    loginSection.classList.add("hidden");
    gameSection.classList.remove("hidden");
    document.getElementById("leaderboard-section").classList.remove("hidden");

    welcomeUser.innerText = `Welcome, ${user.username}`;

    resetScore();
    resetAchievements();
    scoreDisplay.innerText = getScore();

    initLeaderboard();

    loadPuzzle();
}

// -------------------------
// Finish / Stop game
// -------------------------
stopBtn.addEventListener("click", finishGame);

async function finishGame() {
    stopTimer();

    const user = getLoggedInUser();
    if (user) {
        // Save score to backend
        try {
            await fetch("http://localhost/banana-game/submit_score.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    user_id: user.id,
                    score: getScore()
                })
            });
        } catch (err) {
            console.error("Error saving score:", err);
        }

        updateLeaderboard(user.username, getScore());
    }

    alert("🎉 Game Finished! Final Score: " + getScore());

    resetScore();
    resetAchievements();
}

// -------------------------
// Handle Login
// -------------------------
loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Enter username and password");
        return;
    }

    const success = await authUser(username, password, "login");
    if (success) {
        const user = getLoggedInUser();
        showGame(user);
    }
});

// -------------------------
// Handle Register
// -------------------------
registerBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Enter username and password");
        return;
    }

    const success = await authUser(username, password, "register");
    if (success) {
        alert("✅ Registration successful! You are now logged in.");
        const user = getLoggedInUser();
        showGame(user);
    }
});

// -------------------------
// Handle Logout
// -------------------------
logoutBtn.addEventListener("click", () => {
    logoutUser();
    location.reload();
});

// -------------------------
// Handle Answer Submission
// -------------------------
submitBtn.addEventListener("click", async () => {
    const userAnswer = answerInput.value.trim();
    if (!userAnswer) return;

    if (checkAnswer(userAnswer)) {
        resultDisplay.innerText = "✅ Correct!";
        scoreDisplay.innerText = getScore();

        unlockAchievement(getScore());

        const user = getLoggedInUser();
        if (user) {
            updateLeaderboard(user.username, getScore());
        }

        setTimeout(async () => {
            await loadPuzzle();
        }, 800);
    } else {
        resultDisplay.innerText = "❌ Wrong! Try again.";
    }
});

// -------------------------
// Auto-login if user exists
// -------------------------
const currentUser = getLoggedInUser();
if (currentUser) {
    showGame(currentUser);
} else {
    initLeaderboard();
}
