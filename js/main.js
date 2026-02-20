import { fetchPuzzle } from './api.js';
import { setCorrectAnswer, checkAnswer, getScore, resetScore, getDifficulty } from './game.js';
import { getLoggedInUser, logoutUser, guestLogin, authUser, validateUsername, validatePassword, validatePasswordMatch, validateEmail } from './user.js';
import { startTimer, stopTimer } from './timer.js';
import { unlockAchievement } from './gamification.js';
import { updateLeaderboard, initLeaderboard } from './leaderboard.js';

// DOM Elements
const loginSection = document.getElementById("login-section");
const gameSection = document.getElementById("game-section");
const leaderboardSection = document.getElementById("leaderboard-section");
const loginBtn = document.getElementById("login-submit-btn");
const registerBtn = document.getElementById("register-submit-btn");
const logoutBtn = document.getElementById("logout-btn");
const stopBtn = document.getElementById("stop-btn");
const puzzleImage = document.getElementById("puzzle-image");
const submitBtn = document.getElementById("submit-btn");
const answerInput = document.getElementById("answer-input");
const scoreDisplay = document.getElementById("score");
const resultDisplay = document.getElementById("result");
const welcomeUser = document.getElementById("welcome-user");
const difficultySelect = document.getElementById("difficulty-select");

// Game state
let isGameActive = false;

// Show notification
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load puzzle
async function loadPuzzle() {
    stopTimer();
    isGameActive = true;
    resultDisplay.textContent = "";
    answerInput.value = "";
    answerInput.disabled = false;
    submitBtn.disabled = false;
    answerInput.focus();
    
    puzzleImage.classList.add("loading");
    
    const data = await fetchPuzzle();
    
    if (data) {
        puzzleImage.src = data.question;
        puzzleImage.classList.remove("loading");
        
        const difficulty = difficultySelect ? difficultySelect.value : "easy";
        setCorrectAnswer(data.solution, difficulty);
        
        const timeLimit = difficulty === "easy" ? 60 : 
                         difficulty === "medium" ? 45 : 30;
        
        startTimer(timeLimit, async () => {
            if (isGameActive) {
                resultDisplay.textContent = "⏰ Time's up!";
                resultDisplay.style.color = "#e76f51";
                setTimeout(loadPuzzle, 1500);
            }
        });
    }
}

// Show game
function showGame(user) {
    loginSection.classList.add("hidden");
    gameSection.classList.remove("hidden");
    leaderboardSection.classList.remove("hidden");
    
    welcomeUser.textContent = `Welcome, ${user.username}! 🍌`;
    
    resetScore();
    scoreDisplay.textContent = "0";
    
    initLeaderboard();
    loadPuzzle();
}

// Handle login
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        const username = document.getElementById("login-username")?.value.trim();
        const password = document.getElementById("login-password")?.value.trim();
        
        if (!username || !password) {
            showNotification("Please enter username and password", "error");
            return;
        }
        
        loginBtn.classList.add("loading");
        loginBtn.disabled = true;
        
        const result = await authUser(username, password, "login");
        
        if (result.success) {
            showNotification("Login successful! 🎉", "success");
            showGame(result.user);
        } else {
            showNotification(result.message || "Login failed", "error");
            loginBtn.classList.remove("loading");
            loginBtn.disabled = false;
        }
    });
}

// Handle register
if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
        const username = document.getElementById("register-username")?.value.trim();
        const email = document.getElementById("register-email")?.value.trim();
        const password = document.getElementById("register-password")?.value.trim();
        const confirm = document.getElementById("register-confirm-password")?.value.trim();
        const terms = document.getElementById("accept-terms")?.checked;
        
        // Validate all fields
        const usernameCheck = validateUsername(username);
        if (!usernameCheck.valid) {
            showNotification(usernameCheck.message, "error");
            return;
        }
        
        if (email) {
            const emailCheck = validateEmail(email);
            if (!emailCheck.valid) {
                showNotification(emailCheck.message, "error");
                return;
            }
        }
        
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            showNotification("Password must be at least 6 characters", "error");
            return;
        }
        
        const matchCheck = validatePasswordMatch(password, confirm);
        if (!matchCheck.valid) {
            showNotification(matchCheck.message, "error");
            return;
        }
        
        if (!terms) {
            showNotification("Please accept the terms and conditions", "error");
            return;
        }
        
        registerBtn.classList.add("loading");
        registerBtn.disabled = true;
        
        const result = await authUser(username, password, "register", email);
        
        if (result.success) {
            showNotification("Registration successful! 🎉", "success");
            showGame(result.user);
        } else {
            showNotification(result.message || "Registration failed", "error");
            registerBtn.classList.remove("loading");
            registerBtn.disabled = false;
        }
    });
}

// Handle logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        if (isGameActive) {
            stopTimer();
        }
        logoutUser();
        loginSection.classList.remove("hidden");
        gameSection.classList.add("hidden");
        leaderboardSection.classList.add("hidden");
        showNotification("Logged out successfully", "success");
    });
}

// Handle stop game
if (stopBtn) {
    stopBtn.addEventListener("click", () => {
        if (isGameActive) {
            stopTimer();
            isGameActive = false;
            const finalScore = getScore();
            showNotification(`Game Over! Final Score: ${finalScore}`, "info");
        }
    });
}

// Handle submit answer
if (submitBtn) {
    submitBtn.addEventListener("click", handleSubmit);
}

if (answerInput) {
    answerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSubmit();
    });
}

async function handleSubmit() {
    if (!isGameActive) return;
    
    const answer = answerInput.value.trim();
    if (!answer) {
        showNotification("Please enter an answer", "error");
        return;
    }
    
    submitBtn.disabled = true;
    
    if (checkAnswer(answer)) {
        resultDisplay.textContent = "✅ Correct!";
        resultDisplay.style.color = "#2a9d8f";
        const currentScore = getScore();
        scoreDisplay.textContent = currentScore;
        
        unlockAchievement(currentScore);
        
        const user = getLoggedInUser();
        if (user && !user.isGuest) {
            await updateLeaderboard(user.username, user.id, currentScore);
        } else if (user) {
            await updateLeaderboard(user.username, null, currentScore);
        }
        
        setTimeout(loadPuzzle, 800);
    } else {
        resultDisplay.textContent = "❌ Wrong! Try again.";
        resultDisplay.style.color = "#e76f51";
        submitBtn.disabled = false;
        answerInput.focus();
    }
}

// Difficulty change
if (difficultySelect) {
    difficultySelect.addEventListener("change", () => {
        if (isGameActive) {
            loadPuzzle();
        }
    });
}

// Check for existing session
const currentUser = getLoggedInUser();
if (currentUser) {
    showGame(currentUser);
} else {
    initLeaderboard();
}

// Global functions for inline onclick handlers
window.showRegisterForm = function() {
    document.getElementById("login-form").classList.remove("active");
    document.getElementById("register-form").classList.add("active");
};

window.showLoginForm = function() {
    document.getElementById("register-form").classList.remove("active");
    document.getElementById("login-form").classList.add("active");
};

window.continueAsGuest = function() {
    const guest = guestLogin();
    showGame(guest);
    showNotification("Playing as guest! 🍌", "info");
};

window.showForgotPassword = function() {
    alert("Please contact support to reset your password.");
};