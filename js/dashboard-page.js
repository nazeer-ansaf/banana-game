import { bindLeaderboardFilters, initLeaderboard } from "./leaderboard.js?v=20260403a";
import { modeConfigs } from "./modes.js?v=20260403a";
import { loadPlayerProgress, renderPlayerHub, formatModeLabel } from "./progression.js?v=20260403a";
import { logoutUser } from "./user.js?v=20260403a";

const currentUser = window.BANANA_USER;
const modeCardContainer = document.getElementById("mode-card-container");
const logoutBtn = document.getElementById("dashboard-logout-btn");

bindLeaderboardFilters();
initLeaderboard();

logoutBtn?.addEventListener("click", logoutUser);

initializeDashboard();

async function initializeDashboard() {
    const progress = await loadPlayerProgress(currentUser);
    renderPlayerHub(progress);
    renderModeCards();
}

function renderModeCards() {
    if (!modeCardContainer) {
        return;
    }

    modeCardContainer.innerHTML = "";

    Object.values(modeConfigs).forEach(mode => {
        const playHref = mode.key === "campaign"
            ? "campaign.php"
            : `play.php?mode=${encodeURIComponent(mode.key)}`;
        const card = document.createElement("article");
        card.className = "dashboard-mode-card";
        card.innerHTML = `
            <p class="panel-kicker">${mode.kicker}</p>
            <h3>${formatModeLabel(mode.key)}</h3>
            <p>${mode.description}</p>
            <div class="dashboard-mode-meta">
                <span>${mode.levels.length} levels</span>
                <span>x${mode.rewardMultiplier.toFixed(2)} rewards</span>
            </div>
            <a class="dashboard-action-link" href="${playHref}">${mode.key === "campaign" ? "View Campaign" : `Play ${formatModeLabel(mode.key)}`}</a>
        `;
        modeCardContainer.appendChild(card);
    });
}
