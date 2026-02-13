// main.js
import { fetchPuzzle } from './api.js';
import { setCorrectAnswer, checkAnswer, getScore, resetScore } from './game.js';
import { login, getUser, logout } from './user.js';
import { startTimer, stopTimer, resetTimer } from './timer.js';
import { unlockAchievement, resetAchievements } from './gamification.js';
import { updateLeaderboard, initLeaderboard } from './leaderboard.js';

// -------------------------
// DOM Elements
// -------------------------
const loginSection = document.getElementById("login-section");
const gameSection = document.getElementById("game-section");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");

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
    stopTimer(); // stop any running timer
    resultDisplay.innerText = ""; // clear previous result
    answerInput.value = "";
    answerInput.focus();

    const data = await fetchPuzzle();
    if (data) {
        puzzleImage.src = data.question;
        setCorrectAnswer(data.solution);

        // Start timer with callback when time runs out
        startTimer(60, async () => {
            resultDisplay.innerText = "⏰ Time's up! Loading next puzzle...";

            // small delay so user can see message
            setTimeout(async () => {
                await loadPuzzle();
            }, 2000);
        });
    }
}

// -------------------------
// Show game section
// -------------------------
function showGame() {
    loginSection.classList.add("hidden");
    gameSection.classList.remove("hidden");
    document.getElementById("leaderboard-section").classList.remove("hidden");

    welcomeUser.innerText = `Welcome, ${getUser()}`;

    resetScore();
    resetAchievements(); // reset badges for new game
    scoreDisplay.innerText = getScore();

    initLeaderboard(); // render leaderboard on game start

    loadPuzzle();
}

// -------------------------
// Handle Login
// -------------------------
loginBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    if (!username) {
        alert("Please enter a username");
        return;
    }

    login(username);
    showGame();
});

// -------------------------
// Handle Logout
// -------------------------
logoutBtn.addEventListener("click", () => {
    logout();
    location.reload(); // reset everything
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

        // Unlock achievements if any
        unlockAchievement(getScore());

        // Update leaderboard
        updateLeaderboard(getUser(), getScore());

        // small delay so user sees message
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
if (getUser()) {
    showGame();
} else {
    // Ensure leaderboard visible even before login (optional)
    initLeaderboard();
}
