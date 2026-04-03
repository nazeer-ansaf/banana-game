import { modeConfigs } from "./modes.js?v=20260403a";

const campaign = modeConfigs.campaign;
const levelButtonsContainer = document.getElementById("level-buttons-container");
const campaignCurrentLevel = document.getElementById("campaign-current-level");
const campaignStatus = document.getElementById("campaign-status");
const campaignScreenTitle = document.getElementById("campaign-screen-title");
const campaignScreenCopy = document.getElementById("campaign-screen-copy");
const campaignScreenTime = document.getElementById("campaign-screen-time");
const campaignScreenTarget = document.getElementById("campaign-screen-target");
const campaignScreenMistakes = document.getElementById("campaign-screen-mistakes");

renderCampaignLevels();

function renderCampaignLevels() {
    if (!levelButtonsContainer) {
        return;
    }

    const firstLevel = campaign.levels[0];
    levelButtonsContainer.innerHTML = "";
    campaignCurrentLevel.textContent = "1";
    campaignStatus.textContent = "Ready to begin your run from Level 1.";

    if (campaignScreenTitle) {
        campaignScreenTitle.textContent = "Level 1 ready to launch";
    }

    if (campaignScreenCopy) {
        campaignScreenCopy.textContent = "The first stage opens with a longer timer so you can settle into the run.";
    }

    if (campaignScreenTime) {
        campaignScreenTime.textContent = `${firstLevel.time}s`;
    }

    if (campaignScreenTarget) {
        campaignScreenTarget.textContent = String(firstLevel.requiredScore);
    }

    if (campaignScreenMistakes) {
        campaignScreenMistakes.textContent = String(firstLevel.maxWrong);
    }

    campaign.levels.forEach((level, index) => {
        const card = document.createElement("article");
        card.className = `level-card ${index === 0 ? "next" : "locked"}`;
        card.style.setProperty("--card-delay", `${index * 0.05}s`);
        card.innerHTML = `
            <div class="level-card-top">
                <span class="level-chip">${index === 0 ? "Next" : "Locked"}</span>
                <span class="level-index">Level ${level.level}</span>
            </div>
            <div class="level-card-body">
                <div class="level-stat"><span>&#9203;</span><strong>${level.time}s</strong></div>
                <div class="level-stat"><span>&#127919;</span><strong>${level.requiredScore}</strong></div>
                <div class="level-stat"><span>&#10060;</span><strong>${level.maxWrong}</strong></div>
            </div>
            <p class="level-caption">${index === 0 ? "Your next checkpoint" : "Unlocks after the previous level"}</p>
        `;
        levelButtonsContainer.appendChild(card);
    });
}
