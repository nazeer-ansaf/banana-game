// main.js
import { fetchPuzzle } from './api.js';
import { setCorrectAnswer, checkAnswer, getScore, resetScore } from './game.js';
import { startTimer, stopTimer } from './timer.js';
import { unlockAchievement } from './gamification.js';
import { updateLeaderboard, initLeaderboard } from './leaderboard.js';

// ==========================================
// LEVEL CONFIGURATION
// ==========================================
const levelsConfig = [
    { level: 1, time: 120, requiredScore: 20, maxWrong: 5 },
    { level: 2, time: 100, requiredScore: 35, maxWrong: 4 },
    { level: 3, time: 85, requiredScore: 50, maxWrong: 4 },
    { level: 4, time: 80, requiredScore: 70, maxWrong: 3 },
    { level: 5, time: 65, requiredScore: 90, maxWrong: 3 },
    { level: 6, time: 60, requiredScore: 120, maxWrong: 3 },
    { level: 7, time: 45, requiredScore: 150, maxWrong: 2 },
    { level: 8, time: 40, requiredScore: 180, maxWrong: 2 },
    { level: 9, time: 25, requiredScore: 220, maxWrong: 2 },
    { level: 10, time: 20, requiredScore: 300, maxWrong: 1 }
];

let currentLevelIndex = 0;
let currentLevelData = null;
let wrongAttempts = 0;
let levelActive = false;

// ==========================================
// DOM ELEMENTS
// ==========================================
const loginSection = document.getElementById('login-section');
const gameSection = document.getElementById('game-section');
const welcomeUser = document.getElementById('welcome-user');

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');

const levelButtonsContainer = document.getElementById('level-buttons-container');
const levelSelectDiv = document.getElementById('level-select');
const gameContent = document.getElementById('game-content');

const puzzleImage = document.getElementById('puzzle-image');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const scoreDisplay = document.getElementById('score');
const wrongCountDisplay = document.getElementById('wrong-count');
const messageDisplay = document.getElementById('message');

const stopBtn = document.getElementById('stop-btn');
const stopScreen = document.getElementById('stop-screen');
const finalScoreDisplay = document.getElementById('final-score');
const retryBtn = document.getElementById('retry-btn');
const finalLogoutBtn = document.getElementById('final-logout-btn');

// ==========================================
// INITIALIZE
// ==========================================
initLeaderboard();

document.addEventListener('DOMContentLoaded', () => {
    const username = sessionStorage.getItem('loggedInUser');
    if (username) {
        welcomeUser.textContent = `Welcome, ${username}!`;
        showGame();
        renderLevelButtons();
    }
});

// ==========================================
// LOGIN / REGISTER
// ==========================================
loginBtn.addEventListener('click', () => {
    authUser(usernameInput.value.trim(), passwordInput.value.trim(), 'login');
});

registerBtn.addEventListener('click', () => {
    authUser(usernameInput.value.trim(), passwordInput.value.trim(), 'register');
});

logoutBtn?.addEventListener('click', () => {
    sessionStorage.clear();
    location.reload();
});

finalLogoutBtn?.addEventListener('click', () => {
    sessionStorage.clear();
    location.reload();
});

async function authUser(username, password, action) {
    if (!username || !password) return;

    try {
        const res = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`
        });

        const data = await res.json();

        if (data.status === 'success') {
            sessionStorage.setItem('loggedInUser', data.user.username);
            welcomeUser.textContent = `Welcome, ${data.user.username}!`;
            showGame();
            renderLevelButtons();
        } else {
            showMessage(data.message);
        }
    } catch {
        showMessage('Login/Register failed');
    }
}

function showGame() {
    loginSection.style.display = 'none';
    gameSection.style.display = 'block';
}

// ==========================================
// LEVEL BUTTONS
// ==========================================
function renderLevelButtons() {
    levelButtonsContainer.innerHTML = '';

    levelsConfig.forEach((lvl, index) => {
        const btn = document.createElement('button');
        btn.classList.add('level-btn');
        btn.innerHTML = `Level ${lvl.level} <br> ⏳ ${lvl.time}s 🎯 ${lvl.requiredScore} ❌ ${lvl.maxWrong}`;

        // Lock all levels except first or highest unlocked
        if (index !== 0) btn.disabled = true;

        btn.addEventListener('click', () => {
            if (!levelActive) {
                currentLevelIndex = index;
                startLevel();
            }
        });

        levelButtonsContainer.appendChild(btn);
    });
}

// ==========================================
// START LEVEL
// ==========================================
function startLevel() {
    currentLevelData = levelsConfig[currentLevelIndex];
    wrongAttempts = 0;
    levelActive = true;
    resetScore();

    levelSelectDiv.classList.add('hidden');
    stopScreen.classList.add('hidden');
    gameContent.classList.remove('hidden');

    document.getElementById('level-number').textContent = currentLevelData.level;

    updateUI();
    startTimer(currentLevelData.time, handleLevelFailure);
    loadPuzzle();
}

// ==========================================
// UPDATE UI
// ==========================================
function updateUI() {
    scoreDisplay.textContent = getScore();
    wrongCountDisplay.textContent = wrongAttempts;
}

// ==========================================
// LOAD PUZZLE
// ==========================================
async function loadPuzzle() {
    answerInput.value = '';
    answerInput.focus();

    try {
        const data = await fetchPuzzle();
        puzzleImage.src = data.question;
        setCorrectAnswer(data.solution);
    } catch {
        showMessage('Error loading puzzle');
    }
}

// ==========================================
// SUBMIT ANSWER
// ==========================================
submitBtn.addEventListener('click', async () => {
    if (!levelActive) return;

    const userAnswer = answerInput.value.trim();
    if (!userAnswer) return;

    if (checkAnswer(userAnswer)) {
        showMessage('✅ Correct!');
        scoreDisplay.textContent = getScore();

        if (getScore() >= currentLevelData.requiredScore) {
            handleLevelSuccess();
            return;
        }

        await loadPuzzle();
    } else {
        wrongAttempts++;
        wrongCountDisplay.textContent = wrongAttempts;
        showMessage('❌ Wrong!');

        if (wrongAttempts >= currentLevelData.maxWrong) {
            handleLevelFailure();
        }
    }
});

// ==========================================
// STOP BUTTON
// ==========================================
stopBtn.addEventListener('click', () => {
    if (!levelActive) return;

    stopTimer();
    levelActive = false;

    const username = sessionStorage.getItem('loggedInUser');
    const currentScore = getScore();

    updateLeaderboard(username, currentScore);

    finalScoreDisplay.textContent = currentScore;

    gameContent.classList.add('hidden');
    levelSelectDiv.classList.add('hidden');
    stopScreen.classList.remove('hidden');

    // Load full leaderboard from server
    initLeaderboard();
});

// ==========================================
// RETRY BUTTON
// ==========================================
retryBtn.addEventListener('click', () => {
    stopScreen.classList.add('hidden');
    levelSelectDiv.classList.remove('hidden');

    currentLevelIndex = 0;
    wrongAttempts = 0;
    levelActive = false;

    resetScore();
    scoreDisplay.textContent = 0;
    wrongCountDisplay.textContent = 0;

    renderLevelButtons();
});

// ==========================================
// LEVEL SUCCESS
// ==========================================
function handleLevelSuccess() {
    if (!levelActive) return;

    stopTimer();
    levelActive = false;

    unlockAchievement(`Level ${currentLevelData.level} Complete`);

    currentLevelIndex++;

    if (currentLevelIndex < levelsConfig.length) {
        setTimeout(() => startLevel(), 1500);
    } else {
        handleGameVictory();
    }
}

// ==========================================
// LEVEL FAILURE
// ==========================================
function handleLevelFailure() {
    stopTimer();
    levelActive = false;

    showMessage('💀 Game Over! Restarting...');

    currentLevelIndex = 0;

    gameContent.classList.add('hidden');
    levelSelectDiv.classList.remove('hidden');

    renderLevelButtons();
}

// ==========================================
// GAME VICTORY
// ==========================================
function handleGameVictory() {
    const username = sessionStorage.getItem('loggedInUser');

    unlockAchievement('Game Completed');
    updateLeaderboard(username, getScore());

    currentLevelIndex = 0;

    gameContent.classList.add('hidden');
    levelSelectDiv.classList.remove('hidden');

    showMessage('🎉 You completed all levels!');
}

// ==========================================
// SHOW MESSAGE
// ==========================================
function showMessage(text) {
    messageDisplay.textContent = text;
    setTimeout(() => {
        messageDisplay.textContent = '';
    }, 2000);
}