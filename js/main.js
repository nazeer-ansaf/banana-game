import { fetchPuzzle } from "./api.js";
import {
    setCorrectAnswer,
    checkAnswer,
    getScore,
    getRunStats,
    resetScore,
    setScoringProfile
} from "./game.js";
import { startTimer, stopTimer } from "./timer.js";
import { bindLeaderboardFilters, initLeaderboard } from "./leaderboard.js";
import {
    authUser,
    getLoggedInUser,
    logoutUser,
    registerUser,
    getPasswordStrength
} from "./user.js";
import {
    applyRunProgress,
    buildProgressSummary,
    describeAchievements,
    formatModeLabel,
    getAchievementPayload,
    loadPlayerProgress,
    renderPlayerHub
} from "./progression.js";

const modeConfigs = {
    campaign: {
        key: "campaign",
        kicker: "Banana Run Mode",
        title: "10 levels. One life. No skips.",
        description: "Start at level 1 and survive the full sequence. Every stage gets faster, harsher, and more competitive.",
        rewardMultiplier: 1,
        pointsPerAnswer: 5,
        levels: [
            { level: 1, time: 120, requiredScore: 20, maxWrong: 5 },
            { level: 2, time: 100, requiredScore: 35, maxWrong: 4 },
            { level: 3, time: 85, requiredScore: 50, maxWrong: 4 },
            { level: 4, time: 80, requiredScore: 70, maxWrong: 3 },
            { level: 5, time: 70, requiredScore: 90, maxWrong: 3 },
            { level: 6, time: 60, requiredScore: 120, maxWrong: 3 },
            { level: 7, time: 50, requiredScore: 150, maxWrong: 2 },
            { level: 8, time: 40, requiredScore: 180, maxWrong: 2 },
            { level: 9, time: 30, requiredScore: 220, maxWrong: 2 },
            { level: 10, time: 20, requiredScore: 300, maxWrong: 1 }
        ]
    },
    practice: {
        key: "practice",
        kicker: "Practice Mode",
        title: "Relaxed pacing. Build streaks and learn the flow.",
        description: "A softer run for warming up. Longer timers, more mistakes allowed, and easier score targets.",
        rewardMultiplier: 0.75,
        pointsPerAnswer: 4,
        levels: [
            { level: 1, time: 140, requiredScore: 16, maxWrong: 8 },
            { level: 2, time: 130, requiredScore: 30, maxWrong: 7 },
            { level: 3, time: 115, requiredScore: 45, maxWrong: 6 },
            { level: 4, time: 95, requiredScore: 60, maxWrong: 5 },
            { level: 5, time: 80, requiredScore: 80, maxWrong: 4 }
        ]
    },
    sprint: {
        key: "sprint",
        kicker: "Sprint Mode",
        title: "Short clock. Fast scoring. No wasted moves.",
        description: "Push for fast points under pressure. Great for leaderboard hunting and daily mission bursts.",
        rewardMultiplier: 1.4,
        pointsPerAnswer: 7,
        levels: [
            { level: 1, time: 50, requiredScore: 28, maxWrong: 4 },
            { level: 2, time: 45, requiredScore: 49, maxWrong: 3 },
            { level: 3, time: 40, requiredScore: 70, maxWrong: 3 },
            { level: 4, time: 35, requiredScore: 98, maxWrong: 2 },
            { level: 5, time: 30, requiredScore: 126, maxWrong: 2 }
        ]
    },
    one_life: {
        key: "one_life",
        kicker: "One Life Mode",
        title: "Single mistake pressure from the first level.",
        description: "High-risk, high-reward. Every correct answer matters because every level gives you just one mistake.",
        rewardMultiplier: 1.8,
        pointsPerAnswer: 8,
        levels: [
            { level: 1, time: 90, requiredScore: 24, maxWrong: 1 },
            { level: 2, time: 80, requiredScore: 48, maxWrong: 1 },
            { level: 3, time: 70, requiredScore: 72, maxWrong: 1 },
            { level: 4, time: 60, requiredScore: 96, maxWrong: 1 },
            { level: 5, time: 50, requiredScore: 128, maxWrong: 1 },
            { level: 6, time: 40, requiredScore: 160, maxWrong: 1 }
        ]
    }
};

let currentModeKey = "campaign";
let currentMode = modeConfigs[currentModeKey];
let currentLevelIndex = 0;
let currentLevelData = null;
let wrongAttempts = 0;
let levelActive = false;
let runStarted = false;
let currentUser = null;
let playerProgress = null;
let finalizingRun = false;

const loginSection = document.getElementById("login-section");
const gameSection = document.getElementById("game-section");
const welcomeUser = document.getElementById("welcome-user");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const rememberMeCheckbox = document.getElementById("remember-me");

const regUsernameInput = document.getElementById("reg-username");
const regPasswordInput = document.getElementById("reg-password");
const regConfirmPasswordInput = document.getElementById("reg-confirm-password");
const registerBtn = document.getElementById("register-btn");
const regRememberMeCheckbox = document.getElementById("reg-remember-me");
const passwordStrength = document.getElementById("password-strength");
const passwordStrengthFill = document.getElementById("password-strength-fill");
const passwordStrengthText = document.getElementById("password-strength-text");
const confirmPasswordFeedback = document.getElementById("confirm-password-feedback");

const passwordChecklistItems = {
    length: document.getElementById("check-length"),
    upper: document.getElementById("check-upper"),
    lower: document.getElementById("check-lower"),
    number: document.getElementById("check-number"),
    special: document.getElementById("check-special")
};

const levelButtonsContainer = document.getElementById("level-buttons-container");
const levelSelectDiv = document.getElementById("level-select");
const gameContent = document.getElementById("game-content");
const startRunBtn = document.getElementById("start-run-btn");
const campaignCurrentLevel = document.getElementById("campaign-current-level");
const campaignStatus = document.getElementById("campaign-status");
const modeKicker = document.getElementById("mode-kicker");
const modeTitle = document.getElementById("mode-title");
const modeDescription = document.getElementById("mode-description");
const modeCardContainer = document.getElementById("mode-card-container");

const puzzleImage = document.getElementById("puzzle-image");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const scoreDisplay = document.getElementById("score");
const wrongCountDisplay = document.getElementById("wrong-count");
const messageDisplay = document.getElementById("message");
const goalStatus = document.getElementById("goal-status");
const goalCaption = document.getElementById("goal-caption");
const goalProgressFill = document.getElementById("goal-progress-fill");
const attemptLives = document.getElementById("attempt-lives");

const stopBtn = document.getElementById("stop-btn");
const stopScreen = document.getElementById("stop-screen");
const finalScoreDisplay = document.getElementById("final-score");
const retryBtn = document.getElementById("retry-btn");
const finalLogoutBtn = document.getElementById("final-logout-btn");
const stopTitle = document.querySelector(".stop-title");
const stopSubtitle = document.getElementById("stop-subtitle");

bindLeaderboardFilters();
initLeaderboard();

document.getElementById("show-register").addEventListener("click", event => {
    event.preventDefault();
    loginSection.querySelector("#login-form").classList.add("hidden");
    loginSection.querySelector("#register-form").classList.remove("hidden");
    updatePasswordUI();
});

document.getElementById("back-to-login").addEventListener("click", event => {
    event.preventDefault();
    loginSection.querySelector("#register-form").classList.add("hidden");
    loginSection.querySelector("#login-form").classList.remove("hidden");
});

document.addEventListener("DOMContentLoaded", async () => {
    currentUser = getLoggedInUser();

    if (currentUser) {
        await handleAuthenticatedUser(currentUser);
        return;
    }

    applyModeCopy();
    renderModeCards();
    updatePasswordUI();
});

loginBtn.addEventListener("click", async () => {
    const user = await authUser(
        usernameInput.value.trim(),
        passwordInput.value.trim(),
        "login",
        rememberMeCheckbox.checked
    );

    if (user) {
        await handleAuthenticatedUser(user);
    }
});

registerBtn.addEventListener("click", async () => {
    const user = await registerUser({
        username: regUsernameInput.value.trim(),
        password: regPasswordInput.value.trim(),
        confirmPassword: regConfirmPasswordInput.value.trim(),
        rememberMe: regRememberMeCheckbox.checked
    });

    if (user) {
        await handleAuthenticatedUser(user);
    }
});

regPasswordInput?.addEventListener("input", updatePasswordUI);
regConfirmPasswordInput?.addEventListener("input", updateConfirmPasswordUI);

startRunBtn?.addEventListener("click", () => {
    startNewRun();
});

finalLogoutBtn?.addEventListener("click", logoutUser);

submitBtn.addEventListener("click", async () => {
    if (!levelActive) {
        return;
    }

    const userAnswer = answerInput.value.trim();
    if (!userAnswer) {
        return;
    }

    if (checkAnswer(userAnswer)) {
        showMessage("Correct answer. Keep the streak alive.", "correct");
        scoreDisplay.textContent = getScore();
        updateRunProgress();

        if (getScore() >= currentLevelData.requiredScore) {
            handleLevelSuccess();
            return;
        }

        await loadPuzzle();
        return;
    }

    wrongAttempts += 1;
    wrongCountDisplay.textContent = wrongAttempts;
    updateRunProgress();
    showMessage("Wrong answer. Stay calm and recover.", "wrong");

    if (wrongAttempts >= currentLevelData.maxWrong) {
        await finishRun({
            result: "failed",
            title: "Run Failed",
            subtitle: "You hit the mistake limit. The run has been recorded and reset.",
            retryLabel: "Try Again"
        });
    }
});

stopBtn.addEventListener("click", async () => {
    if (!levelActive && !runStarted) {
        return;
    }

    await finishRun({
        result: "stopped",
        title: "Run Stopped",
        subtitle: "You ended this run early. Rewards were still counted toward your profile.",
        retryLabel: "Start Again"
    });
});

retryBtn.addEventListener("click", () => {
    startNewRun();
});

async function handleAuthenticatedUser(user) {
    currentUser = user;
    playerProgress = await loadPlayerProgress(user);

    welcomeUser.textContent = `Welcome ${user.username}`;
    renderPlayerHub(playerProgress);
    showGame();
    applyModeCopy();
    renderModeCards();
    renderLevelButtons();
}

function showGame() {
    loginSection.style.display = "none";
    gameSection.style.display = "block";
    gameSection.classList.remove("active-run");
    levelSelectDiv.classList.remove("hidden");
    gameContent.classList.add("hidden");
    stopScreen.classList.add("hidden");
}

function renderModeCards() {
    if (!modeCardContainer) {
        return;
    }

    modeCardContainer.innerHTML = "";

    Object.values(modeConfigs).forEach(mode => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `mode-card${mode.key === currentModeKey ? " active" : ""}`;
        button.innerHTML = `
            <strong>${formatModeLabel(mode.key)}</strong>
            <span>${mode.title}</span>
            <small>${mode.levels.length} levels | x${mode.rewardMultiplier.toFixed(2)} rewards</small>
        `;
        button.addEventListener("click", () => {
            if (levelActive) {
                return;
            }
            currentModeKey = mode.key;
            currentMode = mode;
            currentLevelIndex = 0;
            applyModeCopy();
            renderModeCards();
            renderLevelButtons();
        });
        modeCardContainer.appendChild(button);
    });
}

function applyModeCopy() {
    modeKicker.textContent = currentMode.kicker;
    modeTitle.textContent = currentMode.title;
    modeDescription.textContent = currentMode.description;
}

export function renderLevelButtons() {
    if (!levelButtonsContainer) {
        return;
    }

    levelButtonsContainer.innerHTML = "";

    currentMode.levels.forEach((level, index) => {
        const card = document.createElement("article");
        card.className = "level-card";

        if (index < currentLevelIndex) {
            card.classList.add("completed");
        } else if (index === currentLevelIndex) {
            card.classList.add(levelActive ? "active" : "next");
        } else {
            card.classList.add("locked");
        }

        card.innerHTML = `
            <div class="level-card-top">
                <span class="level-chip">${index < currentLevelIndex ? "Cleared" : index === currentLevelIndex ? (levelActive ? "Live" : "Next") : "Locked"}</span>
                <span class="level-index">Level ${level.level}</span>
            </div>
            <div class="level-card-body">
                <div class="level-stat"><span>Time</span><strong>${level.time}s</strong></div>
                <div class="level-stat"><span>Goal</span><strong>${level.requiredScore}</strong></div>
                <div class="level-stat"><span>Mistakes</span><strong>${level.maxWrong}</strong></div>
            </div>
            <p class="level-caption">${getLevelCaption(index)}</p>
        `;

        levelButtonsContainer.appendChild(card);
    });

    campaignCurrentLevel.textContent = String(Math.min(currentLevelIndex + 1, currentMode.levels.length));

    if (levelActive) {
        campaignStatus.textContent = `${formatModeLabel(currentModeKey)} level ${currentLevelData.level} is live. Reach ${currentLevelData.requiredScore} score before the clock or mistakes run out.`;
        startRunBtn.textContent = "Run In Progress";
        startRunBtn.disabled = true;
        return;
    }

    campaignStatus.textContent = runStarted
        ? `${formatModeLabel(currentModeKey)} is paused on level ${currentLevelIndex + 1}. Restart to begin a fresh run.`
        : `Ready to begin ${formatModeLabel(currentModeKey)} from level ${currentLevelIndex + 1}.`;
    startRunBtn.textContent = runStarted ? "Restart Run" : "Start Run";
    startRunBtn.disabled = false;
}

function getLevelCaption(index) {
    if (index < currentLevelIndex) {
        return "Completed in this run";
    }

    if (index === currentLevelIndex) {
        return levelActive ? "Current challenge" : "Your next checkpoint";
    }

    return "Unlocks after the previous level";
}

function startNewRun() {
    stopTimer();
    resetScore();
    currentLevelIndex = 0;
    wrongAttempts = 0;
    levelActive = false;
    runStarted = true;
    finalizingRun = false;
    stopScreen.classList.add("hidden");
    startLevel();
}

function startLevel() {
    currentLevelData = currentMode.levels[currentLevelIndex];
    wrongAttempts = 0;
    levelActive = true;

    gameSection.classList.add("active-run");
    levelSelectDiv.classList.add("hidden");
    stopScreen.classList.add("hidden");
    gameContent.classList.remove("hidden");

    document.getElementById("level-number").textContent = currentLevelData.level;
    setScoringProfile({
        points: currentMode.pointsPerAnswer,
        multiplier: 1 + currentLevelIndex * 0.12
    });

    updateUI();
    renderLevelButtons();

    startTimer(currentLevelData.time, async () => {
        if (getScore() < currentLevelData.requiredScore) {
            await finishRun({
                result: "failed",
                title: "Time Up",
                subtitle: "The timer expired before you reached the target score.",
                retryLabel: "Run It Back"
            });
        }
    });

    loadPuzzle();
}

function updateUI() {
    scoreDisplay.textContent = getScore();
    wrongCountDisplay.textContent = wrongAttempts;
    updateRunProgress();
}

function updateRunProgress() {
    if (!currentLevelData) {
        return;
    }

    const currentScore = getScore();
    const requiredScore = currentLevelData.requiredScore;
    const attemptsLeft = Math.max(currentLevelData.maxWrong - wrongAttempts, 0);
    const progress = Math.min((currentScore / requiredScore) * 100, 100);

    goalStatus.textContent = `${currentScore} / ${requiredScore} score`;
    goalCaption.textContent = attemptsLeft > 0
        ? `${attemptsLeft} mistake${attemptsLeft === 1 ? "" : "s"} left in this level.`
        : "No mistakes left.";
    goalProgressFill.style.width = `${progress}%`;

    attemptLives.innerHTML = "";
    for (let index = 0; index < currentLevelData.maxWrong; index += 1) {
        const life = document.createElement("span");
        life.className = `attempt-life ${index < wrongAttempts ? "used" : "active"}`;
        life.textContent = "life";
        attemptLives.appendChild(life);
    }
}

async function loadPuzzle() {
    answerInput.value = "";
    answerInput.focus();

    try {
        const data = await fetchPuzzle();
        puzzleImage.src = data.question;
        setCorrectAnswer(data.solution);
    } catch (error) {
        console.error("Puzzle error:", error);
        showMessage("Puzzle loading failed. Try again.", "wrong");
    }
}

function handleLevelSuccess() {
    if (!levelActive) {
        return;
    }

    stopTimer();
    levelActive = false;
    currentLevelIndex += 1;
    renderLevelButtons();

    if (currentLevelIndex < currentMode.levels.length) {
        showMessage(`Level cleared. Loading level ${currentLevelIndex + 1}.`, "success");
        setTimeout(() => {
            startLevel();
        }, 1200);
        return;
    }

    finishRun({
        result: "won",
        title: "Victory",
        subtitle: `You cleared every ${formatModeLabel(currentModeKey)} level in this run.`,
        retryLabel: "Play Again"
    });
}

async function finishRun({ result, title, subtitle, retryLabel }) {
    if (finalizingRun) {
        return;
    }

    finalizingRun = true;
    stopTimer();
    levelActive = false;
    gameSection.classList.remove("active-run");

    const highestLevelReached = currentLevelData
        ? Math.max(currentLevelData.level, currentLevelIndex)
        : Math.max(currentLevelIndex, 1);
    const stats = getRunStats();
    const runSummary = {
        mode: currentModeKey,
        score: stats.score,
        highestLevel: highestLevelReached,
        correctAnswers: stats.correctAnswers,
        totalWrong: stats.wrongAnswers,
        longestStreak: stats.longestStreak,
        result,
        rewardMultiplier: currentMode.rewardMultiplier
    };

    let summaryLabel = "";

    if (playerProgress && currentUser?.id) {
        const progressResult = applyRunProgress(playerProgress, runSummary);
        renderPlayerHub(playerProgress);
        summaryLabel = buildProgressSummary(progressResult);
        await persistRun(runSummary, progressResult);

        const achievementSummary = describeAchievements(progressResult.unlockedAchievementKeys);
        if (achievementSummary) {
            summaryLabel = `${summaryLabel} | ${achievementSummary}`;
        }
    }

    runStarted = false;
    currentLevelIndex = 0;
    showStopScreen(title, summaryLabel ? `${subtitle} ${summaryLabel}` : subtitle, retryLabel);
    renderLevelButtons();
    initLeaderboard();
    finalizingRun = false;
}

async function persistRun(runSummary, progressResult) {
    try {
        const response = await fetch("submit_score.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                user_id: currentUser.id,
                score: String(runSummary.score),
                mode: runSummary.mode,
                highest_level: String(runSummary.highestLevel),
                total_correct: String(runSummary.correctAnswers),
                total_wrong: String(runSummary.totalWrong),
                longest_streak: String(runSummary.longestStreak),
                result: runSummary.result,
                xp_gain: String(progressResult.xpGain),
                coins_gain: String(progressResult.coinsGain),
                achievement_keys: JSON.stringify(getAchievementPayload(playerProgress))
            })
        });

        if (!response.ok) {
            throw new Error("Run save failed");
        }
    } catch (error) {
        console.error("Persist run error:", error);
        showMessage("Run saved locally, but server sync failed.", "wrong");
    }
}

function showStopScreen(title, subtitle, retryLabel) {
    finalScoreDisplay.textContent = getScore();
    stopTitle.textContent = title;
    stopSubtitle.textContent = subtitle;
    retryBtn.textContent = retryLabel;

    gameContent.classList.add("hidden");
    levelSelectDiv.classList.add("hidden");
    stopScreen.classList.remove("hidden");
}

function showMessage(text, tone = "") {
    messageDisplay.textContent = text;
    messageDisplay.className = tone;

    window.clearTimeout(showMessage.timeoutId);
    showMessage.timeoutId = window.setTimeout(() => {
        messageDisplay.textContent = "";
        messageDisplay.className = "";
    }, 2200);
}

function updatePasswordUI() {
    const password = regPasswordInput?.value.trim() || "";
    const { score, label, tone, checks } = getPasswordStrength(password);

    passwordStrength?.classList.remove("hidden", "weak", "medium", "strong", "empty");
    passwordStrength?.classList.add(tone);

    if (!password) {
        passwordStrength?.classList.add("hidden");
    }

    if (passwordStrengthFill) {
        passwordStrengthFill.style.width = `${(score / 5) * 100}%`;
    }

    if (passwordStrengthText) {
        passwordStrengthText.textContent = label;
    }

    Object.entries(passwordChecklistItems).forEach(([key, item]) => {
        if (!item) {
            return;
        }

        const isMet = checks[key];
        item.classList.toggle("met", isMet);
    });

    updateConfirmPasswordUI();
}

function updateConfirmPasswordUI() {
    const password = regPasswordInput?.value.trim() || "";
    const confirmPassword = regConfirmPasswordInput?.value.trim() || "";

    if (!confirmPassword) {
        confirmPasswordFeedback.textContent = "";
        confirmPasswordFeedback.className = "field-feedback";
        return;
    }

    if (password === confirmPassword) {
        confirmPasswordFeedback.textContent = "Passwords match";
        confirmPasswordFeedback.className = "field-feedback success";
        return;
    }

    confirmPasswordFeedback.textContent = "Passwords do not match yet";
    confirmPasswordFeedback.className = "field-feedback error";
}

export async function googleLogin(user) {
    if (!user) {
        return;
    }

    await handleAuthenticatedUser(user);
}
