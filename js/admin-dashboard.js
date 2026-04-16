import { logoutUser } from "./user.js?v=20260403a";

document.getElementById("admin-logout-btn")?.addEventListener("click", logoutUser);

loadDashboard();

async function loadDashboard() {
    try {
        const response = await fetch(`admin_data.php?ts=${Date.now()}`);
        const data = await response.json();

        if (data.status !== "success") {
            return;
        }

        const summary = data.summary || {};
        const topPlayers = Array.isArray(data.top_players) ? data.top_players : [];
        const flaggedUsers = Array.isArray(data.flagged_users) ? data.flagged_users : [];

        setText("admin-total-users", summary.users ?? 0);
        setText("admin-total-users-note", `${summary.admins ?? 0} admins and ${summary.players ?? 0} players`);
        setText("admin-active-today", summary.active_today ?? 0);
        setText("admin-active-today-note", summary.active_today ? "Players active today" : "No activity recorded today");
        setText("admin-top-score", summary.top_score ?? 0);
        setText("admin-top-score-note", `${summary.runs ?? 0} runs recorded overall`);
        setText("admin-no-run-users", summary.no_run_users ?? 0);
        setText("admin-no-run-users-note", `${summary.no_run_users ?? 0} accounts still need a first game`);

        const topPlayer = topPlayers[0];
        setText("admin-pulse-card", (summary.win_rate ?? 0) < 10 ? "Low win rate" : "System stable");
        setText("admin-signups-card", `${summary.recent_signups ?? 0} recent signups`);
        setText("admin-top-player-card", topPlayer ? `Top: ${topPlayer.username}` : "No top player yet");
        setText("admin-activity-card", `${summary.active_today ?? 0} active today`);
        setText("admin-player-card", `${summary.players ?? 0} players`);
        setText("admin-flagged-card", `${flaggedUsers.length} flagged users`);
    } catch (error) {
        console.error("Admin dashboard load failed", error);
    }
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = String(value);
    }
}
