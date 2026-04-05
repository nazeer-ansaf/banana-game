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
                <div class="user-avatar leaderboard-avatar${entry.profile_photo ? " has-image" : ""}">
                    ${entry.profile_photo
                        ? `<img src="${escapeAttribute(entry.profile_photo)}" alt="${escapeAttribute(entry.username)} profile photo">`
                        : `<span>${escapeHtml(getInitials(entry.username))}</span>`}
                </div>
                <div class="leaderboard-copy">
                    <span class="leaderboard-username">${index + 1}. ${escapeHtml(entry.username)}</span>
                    <small class="leaderboard-meta">Best level ${entry.highest_level} | ${entry.wins} wins</small>
                </div>
            </div>
            <span class="leaderboard-score">${entry.score}</span>
        `;
        list.appendChild(item);
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function getInitials(name) {
    return String(name || "Player")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("") || "P";
}
