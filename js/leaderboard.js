let activePeriod = "all_time";

export async function initLeaderboard(period = activePeriod) {
    activePeriod = period;

    const list = document.getElementById("leaderboard-list");
    if (!list) {
        return;
    }

    list.innerHTML = `<li class="leaderboard-empty">Loading leaderboard...</li>`;

    try {
        const response = await fetch(`submit_score.php?period=${encodeURIComponent(period)}`);
        const data = await response.json();

        renderLeaderboard(Array.isArray(data) ? data : [], period);
    } catch (error) {
        console.error("Leaderboard error:", error);
        list.innerHTML = `<li class="leaderboard-empty">Failed to load leaderboard</li>`;
    }
}

export function bindLeaderboardFilters() {
    document.querySelectorAll("[data-period]").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll("[data-period]").forEach(item => {
                item.classList.toggle("active", item === button);
            });
            initLeaderboard(button.dataset.period || "all_time");
        });
    });
}

function renderLeaderboard(entries, period) {
    const list = document.getElementById("leaderboard-list");
    if (!list) {
        return;
    }

    if (!entries.length) {
        list.innerHTML = `
            <li class="leaderboard-empty">
                No ${period === "weekly" ? "weekly" : "all-time"} runs recorded yet.
            </li>
        `;
        return;
    }

    list.innerHTML = "";

    entries.forEach((entry, index) => {
        const item = document.createElement("li");
        item.className = "leaderboard-entry";
        item.innerHTML = `
            <div class="leaderboard-entry-main">
                <span class="leaderboard-username">${index + 1}. ${entry.username}</span>
                <small class="leaderboard-meta">Best level ${entry.highest_level} | ${entry.wins} wins</small>
            </div>
            <span class="leaderboard-score">${entry.score}</span>
        `;
        list.appendChild(item);
    });
}
