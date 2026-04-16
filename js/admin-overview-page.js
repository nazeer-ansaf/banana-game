loadOverview();

async function loadOverview() {
    try {
        const response = await fetch(`admin_data.php?ts=${Date.now()}`);
        const data = await response.json();

        if (data.status !== "success") {
            return;
        }

        renderSummary(data.summary || {});
        renderRecentSignups(Array.isArray(data.recent_signups) ? data.recent_signups : []);
        renderFlaggedUsers(Array.isArray(data.flagged_users) ? data.flagged_users : []);
    } catch (error) {
        console.error("Admin overview load failed", error);
    }
}

function renderSummary(summary) {
    setText("admin-total-users", summary.users ?? 0);
    setText("admin-total-users-note", `${summary.admins ?? 0} admins and ${summary.players ?? 0} players`);
    setText("admin-active-today", summary.active_today ?? 0);
    setText("admin-active-today-note", summary.active_today ? "Players active today" : "No activity recorded today");
    setText("admin-no-run-users", summary.no_run_users ?? 0);
    setText("admin-no-run-users-note", `${summary.no_run_users ?? 0} accounts still need a first game`);
    setText("admin-recent-signups-count", summary.recent_signups ?? 0);
    setText("admin-recent-signups-note", `${summary.recent_signups ?? 0} created in the last 7 days`);

    setText("admin-total-admins", summary.admins ?? 0);
    setText("admin-total-players", summary.players ?? 0);
    setText("admin-total-runs", summary.runs ?? 0);
    setText("admin-win-rate", `${formatNumber(summary.win_rate ?? 0)}%`);
    setText("admin-total-wins-note", `${summary.wins ?? 0} total wins`);

    const pulse = document.getElementById("admin-pulse-status");
    if (pulse) {
        pulse.textContent = (summary.no_run_users ?? 0) >= 3 ? "Needs onboarding" : ((summary.win_rate ?? 0) < 10 ? "Low win rate" : "Stable");
    }
}

function renderRecentSignups(items) {
    const container = document.getElementById("admin-recent-signups");
    if (!container) {
        return;
    }

    if (items.length === 0) {
        container.innerHTML = emptyState("No signups yet", "New accounts will appear here.");
        return;
    }

    container.innerHTML = items.map(item => `
        <article class="admin-mini-item">
            <strong>${escapeHtml(item.username)}</strong>
            <span>${escapeHtml(item.role)} | Joined ${escapeHtml(formatTimestamp(item.created_at))}</span>
        </article>
    `).join("");
}

function renderFlaggedUsers(items) {
    const container = document.getElementById("admin-flagged-users");
    if (!container) {
        return;
    }

    if (items.length === 0) {
        container.innerHTML = emptyState("No flagged users", "Everyone currently looks healthy.");
        return;
    }

    container.innerHTML = items.map(item => `
        <article class="admin-mini-item">
            <strong>${escapeHtml(item.username)}</strong>
            <span>${escapeHtml(item.status_label || "Needs review")} | ${item.total_runs} runs | ${formatNumber(item.accuracy)}% accuracy</span>
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

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = String(value);
    }
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
