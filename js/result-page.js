import { bindLeaderboardFilters, initLeaderboard } from "./leaderboard.js?v=20260413a";
import { formatModeLabel } from "./progression.js?v=20260403d";
import { logoutUser } from "./user.js?v=20260403d";

const storedResult = sessionStorage.getItem("bananaGameLastResult");

const resultPanelTitle = document.getElementById("result-panel-title");
const resultPanelSubtitle = document.getElementById("result-panel-subtitle");
const finalScore = document.getElementById("final-score");
const resultStatusBadge = document.getElementById("result-status-badge");
const resultRewardStrip = document.getElementById("result-reward-strip");
const resultMode = document.getElementById("result-mode");
const resultLevel = document.getElementById("result-level");
const resultCorrect = document.getElementById("result-correct");
const resultStreak = document.getElementById("result-streak");
const resultPlayAgain = document.getElementById("result-play-again");
const resultLogoutBtn = document.getElementById("result-logout-btn");

bindLeaderboardFilters();
initLeaderboard();
resultLogoutBtn?.addEventListener("click", logoutUser);
hydrateResultPage();

function hydrateResultPage() {
    if (!storedResult) {
        window.location.href = "dashboard.php";
        return;
    }

    const data = JSON.parse(storedResult);
    const playAgainHref = `play.php?mode=${encodeURIComponent(data.mode || "campaign")}`;
    const score = Number(data.score || 0);
    const highestLevel = Number(data.highestLevel || 1);
    const correctAnswers = Number(data.correctAnswers || 0);
    const longestStreak = Number(data.longestStreak || 0);
    const mode = data.mode || "campaign";
    const isWin = String(data.result || "").toLowerCase() === "win";
    const isStopped = /stopped|ended early/i.test(String(data.title || "")) || /ended .*early/i.test(String(data.subtitle || ""));

    resultPanelTitle.textContent = data.title || "Run Finished";
    resultPanelSubtitle.textContent = data.subtitle || "Your score has been saved.";
    resultMode.textContent = formatModeLabel(mode);
    resultLevel.textContent = String(highestLevel);
    resultCorrect.textContent = String(correctAnswers);
    resultStreak.textContent = String(longestStreak);
    resultPlayAgain.href = playAgainHref;

    animateCount(finalScore, score);
    updateHeroState({
        mode,
        score,
        highestLevel,
        correctAnswers,
        longestStreak,
        isWin,
        isStopped
    });
}

function updateHeroState({ mode, score, highestLevel, correctAnswers, longestStreak, isWin, isStopped }) {
    if (!resultStatusBadge || !resultRewardStrip) {
        return;
    }

    const modeLabel = formatModeLabel(mode);
    const rewardPills = [
        `${modeLabel} logged`,
        `Level ${highestLevel} reached`,
        `${correctAnswers} correct`,
        `${longestStreak} streak`
    ];

    if (isWin) {
        document.body.classList.add("result-state-win");
        resultStatusBadge.textContent = "Garden Cleared";
        rewardPills.unshift("Victory bonus");
    } else if (isStopped) {
        document.body.classList.add("result-state-stopped");
        resultStatusBadge.textContent = "Run Stopped";
        rewardPills.unshift("Progress preserved");
    } else {
        document.body.classList.add("result-state-finished");
        resultStatusBadge.textContent = "Run Finished";
        rewardPills.unshift(score > 0 ? "Rewards counted" : "Fresh run saved");
    }

    resultRewardStrip.innerHTML = rewardPills
        .filter(Boolean)
        .slice(0, 4)
        .map((label) => `<span class="result-reward-pill">${escapeHtml(label)}</span>`)
        .join("");
}

function animateCount(node, target) {
    if (!node) {
        return;
    }

    const safeTarget = Math.max(0, Number(target) || 0);
    const duration = 850;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = String(Math.round(safeTarget * eased));

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}
