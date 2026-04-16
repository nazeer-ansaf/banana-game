loadInsights();

async function loadInsights() {
    try {
        const response = await fetch(`admin_data.php?ts=${Date.now()}`);
        const data = await response.json();

        if (data.status !== "success") {
            return;
        }

        renderTopPlayers(Array.isArray(data.top_players) ? data.top_players : []);
        renderRecentActivity(Array.isArray(data.recent_activity) ? data.recent_activity : []);
    } catch (error) {
        console.error("Admin insights load failed", error);
    }
}

function renderTopPlayers(players) {
    const container = document.getElementById("admin-top-players");
    if (!container) {
        return;
    }

    if (players.length === 0) {
        container.innerHTML = emptyState("No score data yet", "Top performers will appear after runs are completed.");
        return;
    }

    container.innerHTML = players.map((player, index) => `
        <article class="admin-ranking-item">
            <span class="admin-ranking-position">#${index + 1}</span>
            <div class="admin-ranking-copy">
                <strong>${escapeHtml(player.username)}</strong>
                <span>${player.best_score} best | Avg ${formatNumber(player.average_score)} | ${player.total_runs} runs | ${formatNumber(player.win_rate)}% win rate</span>
            </div>
        </article>
    `).join("");
}

function renderRecentActivity(items) {
    const container = document.getElementById("admin-recent-activity");
    if (!container) {
        return;
    }

    if (items.length === 0) {
        container.innerHTML = emptyState("No recent games", "Recent score activity will appear here automatically.");
        return;
    }

    container.innerHTML = items.map(item => `
        <article class="admin-activity-item">
            <div class="admin-activity-copy">
                <strong>${escapeHtml(item.username)}</strong>
                <span>${escapeHtml(item.mode)} mode | Score ${item.score} | Level ${item.highest_level}</span>
            </div>
            <div class="admin-activity-meta">
                <span class="admin-result-pill ${item.result === "won" ? "is-win" : item.result === "failed" ? "is-loss" : "is-neutral"}">${escapeHtml(item.result)}</span>
                <small>${escapeHtml(formatTimestamp(item.created_at))}</small>
            </div>
        </article>
    `).join("");
}

function emptyState(title, subtitle) {
    return `
        <article class="admin-empty-state compact">
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(subtitle)}</span>
        </article>
    `;
}

function formatNumber(value) {
    const numericValue = Number(value || 0);
    return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(1);
}

function formatTimestamp(timestamp) {
    if (!timestamp) {
        return "Unknown time";
    }

    const date = new Date(String(timestamp).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) {
        return String(timestamp);
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}
