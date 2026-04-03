import { bindLeaderboardFilters, initLeaderboard } from "./leaderboard.js?v=20260403b";
import { formatModeLabel } from "./progression.js?v=20260403b";

const storedResult = sessionStorage.getItem("bananaGameLastResult");

const resultPageTitle = document.getElementById("result-page-title");
const resultPageSubtitle = document.getElementById("result-page-subtitle");
const resultPanelTitle = document.getElementById("result-panel-title");
const resultPanelSubtitle = document.getElementById("result-panel-subtitle");
const finalScore = document.getElementById("final-score");
const resultMode = document.getElementById("result-mode");
const resultLevel = document.getElementById("result-level");
const resultCorrect = document.getElementById("result-correct");
const resultStreak = document.getElementById("result-streak");
const resultPlayAgain = document.getElementById("result-play-again");
const resultPlayAgainTop = document.getElementById("result-play-again-top");

bindLeaderboardFilters();
initLeaderboard();
hydrateResultPage();

function hydrateResultPage() {
    if (!storedResult) {
        window.location.href = "dashboard.php";
        return;
    }

    const data = JSON.parse(storedResult);
    const playAgainHref = `play.php?mode=${encodeURIComponent(data.mode || "campaign")}`;

    resultPageTitle.textContent = data.title || "Run Finished";
    resultPageSubtitle.textContent = data.subtitle || "Your score has been saved.";
    resultPanelTitle.textContent = data.title || "Run Finished";
    resultPanelSubtitle.textContent = data.subtitle || "Your score has been saved.";
    finalScore.textContent = String(data.score || 0);
    resultMode.textContent = formatModeLabel(data.mode || "campaign");
    resultLevel.textContent = String(data.highestLevel || 1);
    resultCorrect.textContent = String(data.correctAnswers || 0);
    resultStreak.textContent = String(data.longestStreak || 0);
    resultPlayAgain.href = playAgainHref;
    resultPlayAgainTop.href = playAgainHref;
}
