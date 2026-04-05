import { bindLeaderboardFilters, initLeaderboard } from "./leaderboard.js?v=20260405a";
import { formatModeLabel } from "./progression.js?v=20260403d";
import { logoutUser } from "./user.js?v=20260403d";

const storedResult = sessionStorage.getItem("bananaGameLastResult");

const resultPanelTitle = document.getElementById("result-panel-title");
const resultPanelSubtitle = document.getElementById("result-panel-subtitle");
const finalScore = document.getElementById("final-score");
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

    resultPanelTitle.textContent = data.title || "Run Finished";
    resultPanelSubtitle.textContent = data.subtitle || "Your score has been saved.";
    finalScore.textContent = String(data.score || 0);
    resultMode.textContent = formatModeLabel(data.mode || "campaign");
    resultLevel.textContent = String(data.highestLevel || 1);
    resultCorrect.textContent = String(data.correctAnswers || 0);
    resultStreak.textContent = String(data.longestStreak || 0);
    resultPlayAgain.href = playAgainHref;
}
