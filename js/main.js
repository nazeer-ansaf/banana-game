import { fetchPuzzle } from './api.js';
import { setCorrectAnswer, checkAnswer, getScore } from './game.js';
import { login, getUser, logout } from './user.js';

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

// Load puzzle
async function loadPuzzle() {
    const data = await fetchPuzzle();

    if (data) {
        puzzleImage.src = data.question;
        setCorrectAnswer(data.solution);
    }
}

// Handle login
loginBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value;

    if (username.trim() === "") {
        alert("Please enter username");
        return;
    }

    login(username);
    showGame();
});

// Handle logout
logoutBtn.addEventListener("click", () => {
    logout();
    location.reload();
});

// Handle answer submission
submitBtn.addEventListener("click", async () => {
    const userAnswer = answerInput.value;

    if (checkAnswer(userAnswer)) {
        resultDisplay.innerText = "Correct!";
        scoreDisplay.innerText = getScore();
        await loadPuzzle();
    } else {
        resultDisplay.innerText = "Wrong! Try again.";
    }

    answerInput.value = "";
});

// Show game if logged in
function showGame() {
    loginSection.style.display = "none";
    gameSection.style.display = "block";
    welcomeUser.innerText = "Welcome, " + getUser();
    loadPuzzle();
}

// Auto-login if user exists
if (getUser()) {
    showGame();
}
