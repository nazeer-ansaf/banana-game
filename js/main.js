// main.js
import { fetchPuzzle } from './api.js';
import { setCorrectAnswer, checkAnswer, getScore, resetScore } from './game.js';
import { startTimer, stopTimer } from './timer.js';
import { unlockAchievement } from './gamification.js';
import { updateLeaderboard, initLeaderboard } from './leaderboard.js';
import {
    authUser,
    getLoggedInUser,
    logoutUser,
    registerUser,
    getPasswordStrength
} from './user.js';

// LEVEL CONFIGURATION
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

// DOM ELEMENTS
const loginSection = document.getElementById('login-section');
const gameSection = document.getElementById('game-section');
const welcomeUser = document.getElementById('welcome-user');

// LOGIN INPUTS
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const rememberMeCheckbox = document.getElementById('remember-me');

// REGISTER INPUTS
const regUsernameInput = document.getElementById('reg-username');
const regPasswordInput = document.getElementById('reg-password');
const regConfirmPasswordInput = document.getElementById('reg-confirm-password');
const registerBtn = document.getElementById('register-btn');
const regRememberMeCheckbox = document.getElementById('reg-remember-me');
const passwordStrength = document.getElementById('password-strength');
const passwordStrengthFill = document.getElementById('password-strength-fill');
const passwordStrengthText = document.getElementById('password-strength-text');
const confirmPasswordFeedback = document.getElementById('confirm-password-feedback');

const passwordChecklistItems = {
    length: document.getElementById('check-length'),
    upper: document.getElementById('check-upper'),
    lower: document.getElementById('check-lower'),
    number: document.getElementById('check-number'),
    special: document.getElementById('check-special')
};

const logoutBtn = document.getElementById('logout-btn');
const finalLogoutBtn = document.getElementById('final-logout-btn');

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

const plantImage = document.getElementById('plant-animation');

// INITIALIZE
initLeaderboard();

// LOGIN / REGISTER TOGGLE HANDLING
document.getElementById('show-register').addEventListener('click', e => {
    e.preventDefault();
    loginSection.querySelector('#login-form').classList.add('hidden');
    loginSection.querySelector('#register-form').classList.remove('hidden');
    updatePasswordUI();
});

document.getElementById('back-to-login').addEventListener('click', e => {
    e.preventDefault();
    loginSection.querySelector('#register-form').classList.add('hidden');
    loginSection.querySelector('#login-form').classList.remove('hidden');
});

// CHECK REMEMBER ME ON LOAD
document.addEventListener('DOMContentLoaded', () => {
    const user = getLoggedInUser();
    if (user) {
        welcomeUser.textContent = `Welcome ${user.username} 🍌`;
        showGame();
        renderLevelButtons();
        return;
    }

    updatePasswordUI();
});

// MANUAL LOGIN
loginBtn.addEventListener('click', async () => {
    const user = await authUser(
        usernameInput.value.trim(),
        passwordInput.value.trim(),
        'login',
        rememberMeCheckbox.checked
    );

    if (user) {
        welcomeUser.textContent = `Welcome ${user.username} 🍌`;
        showGame();
        renderLevelButtons();
    }
});

// REGISTER USER
registerBtn.addEventListener('click', async () => {
    const user = await registerUser({
        username: regUsernameInput.value.trim(),
        password: regPasswordInput.value.trim(),
        confirmPassword: regConfirmPasswordInput.value.trim(),
        rememberMe: regRememberMeCheckbox.checked
    });

    if (user) {
        welcomeUser.textContent = `Welcome ${user.username} 🍌`;
        showGame();
        renderLevelButtons();
    }
});

regPasswordInput?.addEventListener('input', updatePasswordUI);
regConfirmPasswordInput?.addEventListener('input', updateConfirmPasswordUI);

// LOGOUT
logoutBtn?.addEventListener('click', logoutUser);
finalLogoutBtn?.addEventListener('click', logoutUser);

// SHOW GAME SECTION
function showGame() {
    loginSection.style.display = 'none';
    gameSection.style.display = 'block';
}

// LEVEL BUTTONS
export function renderLevelButtons() {
    levelButtonsContainer.innerHTML = '';

    levelsConfig.forEach((lvl, index) => {
        const btn = document.createElement('button');
        btn.classList.add('level-btn');
        btn.innerHTML = `Level ${lvl.level} <br> ⏳ ${lvl.time}s 🎯 ${lvl.requiredScore} ❌ ${lvl.maxWrong}`;

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

// START LEVEL
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

// UPDATE UI
function updateUI() {
    scoreDisplay.textContent = getScore();
    wrongCountDisplay.textContent = wrongAttempts;
}

// LOAD PUZZLE
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

// SUBMIT ANSWER
submitBtn.addEventListener('click', async () => {
    if (!levelActive) return;

    const userAnswer = answerInput.value.trim();
    if (!userAnswer) return;

    if (checkAnswer(userAnswer)) {
        showMessage('✅ Correct!');
        scoreDisplay.textContent = getScore();
        if (plantImage) {
            plantImage.src = 'https://media.giphy.com/media/l0MYB8Ory7Hqefo9a/giphy.gif';
        }

        if (getScore() >= currentLevelData.requiredScore) {
            handleLevelSuccess();
            return;
        }
        await loadPuzzle();
    } else {
        wrongAttempts++;
        wrongCountDisplay.textContent = wrongAttempts;
        showMessage('❌ Wrong!');
        if (wrongAttempts >= currentLevelData.maxWrong) handleLevelFailure();
    }
});

// STOP GAME
stopBtn.addEventListener('click', () => {
    if (!levelActive) return;

    stopTimer();
    levelActive = false;

    const user = getLoggedInUser();
    const currentScore = getScore();

    updateLeaderboard(user?.username || 'Guest', currentScore);

    finalScoreDisplay.textContent = currentScore;

    gameContent.classList.add('hidden');
    levelSelectDiv.classList.add('hidden');
    stopScreen.classList.remove('hidden');

    initLeaderboard();
});

// RETRY
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

// LEVEL SUCCESS
function handleLevelSuccess() {
    if (!levelActive) return;

    stopTimer();
    levelActive = false;

    unlockAchievement(`Level ${currentLevelData.level} Complete`);
    currentLevelIndex++;

    if (currentLevelIndex < levelsConfig.length) setTimeout(() => startLevel(), 1500);
    else handleGameVictory();
}

// LEVEL FAILURE
function handleLevelFailure() {
    stopTimer();
    levelActive = false;

    showMessage('💀 Game Over! Restarting...');

    currentLevelIndex = 0;

    gameContent.classList.add('hidden');
    levelSelectDiv.classList.remove('hidden');

    renderLevelButtons();
}

// GAME VICTORY
function handleGameVictory() {
    const user = getLoggedInUser();
    unlockAchievement('Game Completed');
    updateLeaderboard(user?.username || 'Guest', getScore());

    currentLevelIndex = 0;

    gameContent.classList.add('hidden');
    levelSelectDiv.classList.remove('hidden');

    showMessage('🎉 You completed all levels!');
}

// SHOW MESSAGE
function showMessage(text) {
    messageDisplay.textContent = text;
    setTimeout(() => {
        messageDisplay.textContent = '';
    }, 2000);
}

// SOCIAL LOGIN (Google)
export function googleLogin(user) {
    if (!user) return;

    localStorage.setItem('bananaGameUser', JSON.stringify(user));

    welcomeUser.textContent = `Welcome, ${user.username} 🍌`;
    showGame();
    renderLevelButtons();
}

function updatePasswordUI() {
    const password = regPasswordInput?.value.trim() || '';
    const { score, label, tone, checks } = getPasswordStrength(password);

    passwordStrength?.classList.remove('hidden', 'weak', 'medium', 'strong', 'empty');
    passwordStrength?.classList.add(tone);

    if (!password) {
        passwordStrength?.classList.add('hidden');
    }

    if (passwordStrengthFill) {
        passwordStrengthFill.style.width = `${(score / 5) * 100}%`;
    }

    if (passwordStrengthText) {
        passwordStrengthText.textContent = label;
    }

    Object.entries(passwordChecklistItems).forEach(([key, item]) => {
        if (!item) return;
        item.classList.toggle('met', checks[key]);
    });

    updateConfirmPasswordUI();
}

function updateConfirmPasswordUI() {
    const password = regPasswordInput?.value.trim() || '';
    const confirmPassword = regConfirmPasswordInput?.value.trim() || '';

    if (!confirmPassword) {
        confirmPasswordFeedback.textContent = '';
        confirmPasswordFeedback.className = 'field-feedback';
        return;
    }

    if (password === confirmPassword) {
        confirmPasswordFeedback.textContent = 'Passwords match';
        confirmPasswordFeedback.className = 'field-feedback success';
        return;
    }

    confirmPasswordFeedback.textContent = 'Passwords do not match yet';
    confirmPasswordFeedback.className = 'field-feedback error';
}
