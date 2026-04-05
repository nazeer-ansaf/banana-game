import { fetchPuzzle } from "./api.js?v=20260403a";
import {
    setCorrectAnswer,
    checkAnswer,
    getScore,
    getRunStats,
    resetScore,
    setScoringProfile
} from "./game.js?v=20260403a";
import { modeConfigs } from "./modes.js?v=20260403a";
import { applyRunProgress, buildProgressSummary, describeAchievements, getAchievementPayload, loadPlayerProgress, formatModeLabel } from "./progression.js?v=20260403a";
import { startTimer, stopTimer } from "./timer.js?v=20260403a";
import { logoutUser } from "./user.js?v=20260403a";

const currentUser = window.BANANA_USER;
const params = new URLSearchParams(window.location.search);
const selectedModeKey = params.get("mode") || "campaign";
const currentMode = modeConfigs[selectedModeKey] || modeConfigs.campaign;

let currentLevelIndex = 0;
let currentLevelData = null;
let wrongAttempts = 0;
let playerProgress = null;
let finalizingRun = false;
let soundEnabled = true;
let musicEnabled = true;
let effectsEnabled = true;

const playModeTitle = document.getElementById("play-mode-title");
const playModeKicker = document.getElementById("play-mode-kicker");
const playModeDescription = document.getElementById("play-mode-description");
const playLevelCount = document.getElementById("play-level-count");
const playRewardMultiplier = document.getElementById("play-reward-multiplier");
const playGoalBadge = document.getElementById("play-goal-badge");
const levelNumber = document.getElementById("level-number");
const scoreDisplay = document.getElementById("score");
const wrongCountDisplay = document.getElementById("wrong-count");
const stopBtn = document.getElementById("stop-btn");
const logoutBtn = document.getElementById("play-logout-btn");
const soundToggleBtn = document.getElementById("sound-toggle-btn");
const puzzleImage = document.getElementById("puzzle-image");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const goalStatus = document.getElementById("goal-status");
const goalCaption = document.getElementById("goal-caption");
const goalProgressFill = document.getElementById("goal-progress-fill");
const attemptLives = document.getElementById("attempt-lives");
const messageDisplay = document.getElementById("message");
logoutBtn?.addEventListener("click", logoutUser);
soundToggleBtn?.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    syncSoundButton();
    persistSoundSettings();
    if (soundEnabled) {
        playToneSequence([440, 660], 0.05, "triangle");
    }
});

stopBtn?.addEventListener("click", async () => {
    playToneSequence([220, 180], 0.08, "sawtooth");
    await finishRun({
        result: "stopped",
        title: "Run Stopped",
        subtitle: `You ended ${formatModeLabel(currentMode.key)} early. Rewards were still counted toward your profile.`
    });
});

submitBtn?.addEventListener("click", async () => {
    const userAnswer = answerInput.value.trim();
    if (!userAnswer || finalizingRun) {
        return;
    }

    if (checkAnswer(userAnswer)) {
        scoreDisplay.textContent = getScore();
        playToneSequence([720, 880], 0.06, "triangle");
        showMessage("Correct answer. Keep going.", "correct");
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
    playToneSequence([240, 180], 0.07, "square");
    updateRunProgress();
    showMessage("Wrong answer. Recover on the next puzzle.", "wrong");

    if (wrongAttempts >= currentLevelData.maxWrong) {
        await finishRun({
            result: "failed",
            title: "Run Failed",
            subtitle: "You hit the mistake limit for this run."
        });
    }
});

initializePlayPage();

async function initializePlayPage() {
    playModeKicker.textContent = currentMode.kicker;
    playModeTitle.textContent = formatModeLabel(currentMode.key);
    playModeDescription.textContent = currentMode.description;
    playLevelCount.textContent = String(currentMode.levels.length);
    playRewardMultiplier.textContent = currentMode.rewardMultiplier.toFixed(2);
    playerProgress = await loadPlayerProgress(currentUser);
    soundEnabled = Boolean(playerProgress.settings?.soundEnabled ?? true);
    musicEnabled = Boolean(playerProgress.settings?.musicEnabled ?? true);
    effectsEnabled = Boolean(playerProgress.settings?.effectsEnabled ?? true);
    syncSoundButton();

    resetScore();
    startLevel();
}

function startLevel() {
    currentLevelData = currentMode.levels[currentLevelIndex];
    wrongAttempts = 0;
    levelNumber.textContent = String(currentLevelData.level);
    scoreDisplay.textContent = String(getScore());
    wrongCountDisplay.textContent = "0";
    playGoalBadge.textContent = `Level ${currentLevelData.level} target: ${currentLevelData.requiredScore}`;

    setScoringProfile({
        points: currentMode.pointsPerAnswer,
        multiplier: 1 + currentLevelIndex * 0.12
    });

    updateRunProgress();

    startTimer(currentLevelData.time, async () => {
        if (getScore() < currentLevelData.requiredScore) {
            playToneSequence([160, 130, 100], 0.08, "sawtooth");
            await finishRun({
                result: "failed",
                title: "Time Up",
                subtitle: "The timer expired before you reached the target score."
            });
        }
    });

    loadPuzzle();
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
        showMessage("Puzzle loading failed.", "wrong");
    }
}

function handleLevelSuccess() {
    stopTimer();
    currentLevelIndex += 1;

    if (currentLevelIndex < currentMode.levels.length) {
        playToneSequence([520, 660, 820], 0.07, "triangle");
        showMessage(`Level ${currentLevelData.level} cleared. Next level loading.`, "success");
        window.setTimeout(() => {
            startLevel();
        }, 1000);
        return;
    }

    playToneSequence([520, 660, 820, 980], 0.08, "triangle");
    finishRun({
        result: "won",
        title: "Victory",
        subtitle: `You cleared every level in ${formatModeLabel(currentMode.key)}.`
    });
}

function updateRunProgress() {
    const currentScore = getScore();
    const requiredScore = currentLevelData.requiredScore;
    const attemptsLeft = Math.max(currentLevelData.maxWrong - wrongAttempts, 0);
    const progress = Math.min((currentScore / requiredScore) * 100, 100);

    goalStatus.textContent = `${currentScore} / ${requiredScore} score`;
    goalCaption.textContent = `${attemptsLeft} mistake${attemptsLeft === 1 ? "" : "s"} left in this level.`;
    goalProgressFill.style.width = `${progress}%`;

    attemptLives.innerHTML = "";
    for (let index = 0; index < currentLevelData.maxWrong; index += 1) {
        const life = document.createElement("span");
        life.className = `attempt-life ${index < wrongAttempts ? "used" : "active"}`;
        life.textContent = "❤️";
        attemptLives.appendChild(life);
    }
}

async function finishRun({ result, title, subtitle }) {
    if (finalizingRun) {
        return;
    }

    finalizingRun = true;
    stopTimer();

    const stats = getRunStats();
    const highestLevelReached = currentLevelData
        ? Math.max(currentLevelData.level, currentLevelIndex)
        : 1;
    const runSummary = {
        mode: currentMode.key,
        score: stats.score,
        highestLevel: highestLevelReached,
        correctAnswers: stats.correctAnswers,
        totalWrong: stats.wrongAnswers,
        longestStreak: stats.longestStreak,
        result,
        rewardMultiplier: currentMode.rewardMultiplier
    };

    const progressResult = applyRunProgress(playerProgress, runSummary);
    const summaryText = buildProgressSummary(progressResult);
    const achievementNames = describeAchievements(progressResult.unlockedAchievementKeys);

    await persistRun(runSummary, progressResult);

    const resultSubtitle = achievementNames
        ? `${subtitle} ${summaryText} | ${achievementNames}`
        : `${subtitle} ${summaryText}`;

    sessionStorage.setItem("bananaGameLastResult", JSON.stringify({
        title,
        subtitle: resultSubtitle,
        mode: currentMode.key,
        score: runSummary.score,
        highestLevel: runSummary.highestLevel,
        correctAnswers: runSummary.correctAnswers,
        longestStreak: runSummary.longestStreak,
        result: runSummary.result
    }));

    finalizingRun = false;
    window.location.href = `result.php?mode=${encodeURIComponent(currentMode.key)}`;
}

async function persistRun(runSummary, progressResult) {
    try {
        await fetch("submit_score.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
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
    } catch (error) {
        console.error("Persist run error:", error);
    }
}

function showMessage(text, tone) {
    messageDisplay.textContent = text;
    messageDisplay.className = tone;

    window.clearTimeout(showMessage.timeoutId);
    showMessage.timeoutId = window.setTimeout(() => {
        messageDisplay.textContent = "";
        messageDisplay.className = "";
    }, 2000);
}

function playToneSequence(frequencies, duration = 0.06, type = "sine") {
    if (!soundEnabled || !effectsEnabled || !window.AudioContext && !window.webkitAudioContext) {
        return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = playToneSequence.audioContext || new AudioContextClass();
    playToneSequence.audioContext = audioContext;

    const now = audioContext.currentTime;

    frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gainNode.gain.setValueAtTime(0.0001, now + index * duration);
        gainNode.gain.exponentialRampToValueAtTime(0.05, now + index * duration + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * duration + duration);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(now + index * duration);
        oscillator.stop(now + index * duration + duration);
    });
}

function syncSoundButton() {
    if (!soundToggleBtn) {
        return;
    }

    soundToggleBtn.textContent = soundEnabled ? "Sound On" : "Sound Off";
    soundToggleBtn.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
}

async function persistSoundSettings() {
    if (playerProgress?.settings) {
        playerProgress.settings.soundEnabled = soundEnabled;
        playerProgress.settings.musicEnabled = musicEnabled;
        playerProgress.settings.effectsEnabled = effectsEnabled;
    }

    try {
        await fetch("profile_actions.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                action: "update_sound_settings",
                sound_enabled: soundEnabled ? "1" : "",
                music_enabled: musicEnabled ? "1" : "",
                effects_enabled: effectsEnabled ? "1" : ""
            })
        });
    } catch (error) {
        console.warn("Unable to save sound settings", error);
    }
}
