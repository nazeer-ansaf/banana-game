import { logoutUser } from "./user.js?v=20260403a";

const logoutBtn = document.getElementById("admin-logout-btn");
const refreshBtn = document.getElementById("admin-refresh-btn");
const userList = document.getElementById("admin-user-list");
const topPlayersList = document.getElementById("admin-top-players");
const recentActivityList = document.getElementById("admin-recent-activity");
const recentSignupsList = document.getElementById("admin-recent-signups");
const flaggedUsersList = document.getElementById("admin-flagged-users");
const searchInput = document.getElementById("admin-user-search");
const roleFilter = document.getElementById("admin-role-filter");
const sortOrder = document.getElementById("admin-sort-order");
const statusFilter = document.getElementById("admin-status-filter");
const pageSizeSelect = document.getElementById("admin-page-size");
const pagination = document.getElementById("admin-pagination");
const tabTriggers = Array.from(document.querySelectorAll(".admin-tab-trigger"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));

let adminState = {
    users: [],
    currentPage: 1,
};

logoutBtn?.addEventListener("click", logoutUser);
refreshBtn?.addEventListener("click", () => initializeAdminPage(true));
searchInput?.addEventListener("input", () => resetAndRenderUsers());
roleFilter?.addEventListener("change", () => resetAndRenderUsers());
sortOrder?.addEventListener("change", () => resetAndRenderUsers());
statusFilter?.addEventListener("change", () => resetAndRenderUsers());
pageSizeSelect?.addEventListener("change", () => resetAndRenderUsers());
tabTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => activateTab(trigger.dataset.tabTarget || "overview"));
});

initializeAdminPage();
activateTab(getInitialTab());

async function initializeAdminPage(showMessage = false) {
    try {
        const response = await fetch(`admin_data.php?ts=${Date.now()}`);
        const data = await response.json();

        if (data.status !== "success") {
            setFeedback(data.message || "Unable to load admin data", true);
            return;
        }

        adminState.users = Array.isArray(data.users) ? data.users : [];

        renderSummary(data.summary || {});
        renderTopPlayers(Array.isArray(data.top_players) ? data.top_players : []);
        renderRecentActivity(Array.isArray(data.recent_activity) ? data.recent_activity : []);
        renderRecentSignups(Array.isArray(data.recent_signups) ? data.recent_signups : []);
        renderFlaggedUsers(Array.isArray(data.flagged_users) ? data.flagged_users : []);
        renderUsersFromState();

        if (showMessage) {
            setFeedback("Admin data refreshed");
        }
    } catch (error) {
        setFeedback("Unable to load admin data right now", true);
    }
}

function renderSummary(summary) {
    setText("admin-total-users", summary.users ?? 0);
    setText("admin-total-admins", summary.admins ?? 0);
    setText("admin-total-players", summary.players ?? 0);
    setText("admin-total-runs", summary.runs ?? 0);
    setText("admin-win-rate", `${formatNumber(summary.win_rate ?? 0)}%`);
    setText("admin-top-score", summary.top_score ?? 0);
    setText("admin-average-score", formatNumber(summary.average_score ?? 0));
    setText("admin-active-today", summary.active_today ?? 0);
    setText("admin-no-run-users", summary.no_run_users ?? 0);
    setText("admin-recent-signups-count", summary.recent_signups ?? 0);

    setText("admin-total-users-note", `${summary.admins ?? 0} admins and ${summary.players ?? 0} players`);
    setText("admin-active-today-note", summary.active_today ? "Players active today" : "No activity recorded today");
    setText("admin-top-score-note", `${summary.runs ?? 0} runs recorded overall`);
    setText("admin-average-score-note", `${formatNumber(summary.wins ?? 0)} total wins across all runs`);
    setText("admin-no-run-users-note", `${summary.no_run_users ?? 0} accounts still need a first game`);
    setText("admin-recent-signups-note", `${summary.recent_signups ?? 0} created in the last 7 days`);
    setText("admin-total-wins-note", `${summary.wins ?? 0} total wins`);
    setPulseStatus(summary);
}

function getInitialTab() {
    const hash = window.location.hash.replace("#", "");
    if (hash === "admin-roster") {
        return "users";
    }

    if (hash === "admin-insights") {
        return "insights";
    }

    return "overview";
}

function activateTab(tabName) {
    const nextTab = ["overview", "insights", "users"].includes(tabName) ? tabName : "overview";

    tabTriggers.forEach(trigger => {
        trigger.classList.toggle("is-active", trigger.dataset.tabTarget === nextTab);
    });

    tabPanels.forEach(panel => {
        panel.classList.toggle("is-active", panel.dataset.tabPanel === nextTab);
    });

    if (nextTab === "users") {
        window.history.replaceState(null, "", "#admin-roster");
    } else if (nextTab === "insights") {
        window.history.replaceState(null, "", "#admin-insights");
    } else {
        window.history.replaceState(null, "", "#admin-overview");
    }
}

function setPulseStatus(summary) {
    const pulse = document.getElementById("admin-pulse-status");
    if (!pulse) {
        return;
    }

    let label = "Stable";
    pulse.className = "admin-panel-badge";

    if ((summary.no_run_users ?? 0) >= 3) {
        label = "Needs onboarding";
        pulse.classList.add("is-alert");
    } else if ((summary.active_today ?? 0) === 0) {
        label = "Quiet today";
    } else if ((summary.win_rate ?? 0) < 10) {
        label = "Low win rate";
        pulse.classList.add("is-alert");
    }

    pulse.textContent = label;
}

function renderUsersFromState() {
    const filteredUsers = getFilteredUsers(adminState.users);
    const pageSize = Number(pageSizeSelect?.value || 6);
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    adminState.currentPage = Math.min(adminState.currentPage, totalPages);
    adminState.currentPage = Math.max(adminState.currentPage, 1);

    const startIndex = (adminState.currentPage - 1) * pageSize;
    const pagedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

    renderUsers(pagedUsers);
    renderPagination(filteredUsers.length, pageSize, totalPages);
    setText("admin-roster-count", `${filteredUsers.length} visible | page ${adminState.currentPage} of ${totalPages}`);
}

function resetAndRenderUsers() {
    adminState.currentPage = 1;
    renderUsersFromState();
}

function getFilteredUsers(users) {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const selectedRole = roleFilter?.value || "all";
    const selectedSort = sortOrder?.value || "impact";
    const selectedStatus = statusFilter?.value || "all";

    const filtered = users.filter(user => {
        const matchesRole = selectedRole === "all" || user.role === selectedRole;
        const haystack = [
            user.username,
            user.email,
            user.phone_number,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesQuery = query === "" || haystack.includes(query);
        const matchesStatus = matchStatusFilter(user, selectedStatus);
        return matchesRole && matchesQuery && matchesStatus;
    });

    return filtered.sort((left, right) => compareUsers(left, right, selectedSort));
}

function matchStatusFilter(user, selectedStatus) {
    if (selectedStatus === "no_runs") {
        return Number(user.total_runs || 0) === 0;
    }

    if (selectedStatus === "inactive") {
        if (!user.last_played_at) {
            return true;
        }

        const lastPlayed = Date.parse(normalizeTimestamp(user.last_played_at));
        if (Number.isNaN(lastPlayed)) {
            return false;
        }

        return (Date.now() - lastPlayed) >= (7 * 24 * 60 * 60 * 1000);
    }

    if (selectedStatus === "flagged") {
        return Boolean(user.is_flagged);
    }

    return true;
}

function compareUsers(left, right, selectedSort) {
    if (selectedSort === "score") {
        return compareNumbers(right.best_score, left.best_score)
            || compareNumbers(right.average_score, left.average_score)
            || compareNames(left.username, right.username);
    }

    if (selectedSort === "recent") {
        return compareDates(right.last_played_at, left.last_played_at)
            || compareNames(left.username, right.username);
    }

    if (selectedSort === "joined") {
        return compareDates(right.joined_at, left.joined_at)
            || compareNames(left.username, right.username);
    }

    if (selectedSort === "name") {
        return compareNames(left.username, right.username);
    }

    return compareNumbers(right.total_runs, left.total_runs)
        || compareNumbers(right.best_score, left.best_score)
        || compareDates(right.last_played_at, left.last_played_at)
        || compareNames(left.username, right.username);
}

function renderUsers(users) {
    userList.innerHTML = "";

    if (users.length === 0) {
        userList.innerHTML = `
            <article class="admin-empty-state">
                <strong>No users match this view</strong>
                <span>Try changing the search text or filters.</span>
            </article>
        `;
        return;
    }

    users.forEach(user => {
        const article = document.createElement("article");
        article.className = "admin-user-card";
        const avatarMarkup = user.profile_photo
            ? `<img src="${escapeAttribute(user.profile_photo)}" alt="${escapeAttribute(user.username)} profile photo">`
            : `<span>${escapeHtml(getInitials(user.username))}</span>`;

        article.innerHTML = `
            <div class="admin-user-card__identity">
                <div class="admin-user-avatar${user.profile_photo ? " has-image" : ""}">
                    ${avatarMarkup}
                </div>
                <div class="admin-user-card__copy">
                    <div class="admin-user-card__title">
                        <strong>${escapeHtml(user.username)}</strong>
                        <span class="admin-role-chip ${user.role === "admin" ? "is-admin" : "is-player"}">${escapeHtml(user.role)}</span>
                        ${user.is_flagged ? '<span class="admin-flag-chip">Flagged</span>' : ""}
                    </div>
                    <span>${escapeHtml(user.email || "No email")} | ${escapeHtml(user.phone_number || "No phone")}</span>
                    <small>Joined ${escapeHtml(formatTimestamp(user.joined_at))} | ${escapeHtml(user.status_label || "Healthy")}</small>
                </div>
            </div>
            <div class="admin-user-card__stats">
                ${createStatPill(`${user.total_runs} runs`)}
                ${createStatPill(`${user.wins} wins`)}
                ${createStatPill(`${formatNumber(user.win_rate)}% win rate`)}
                ${createStatPill(`Best ${user.best_score}`)}
                ${createStatPill(`Avg ${formatNumber(user.average_score)}`)}
                ${createStatPill(`Level ${user.best_level}`)}
                ${createStatPill(`${formatNumber(user.accuracy)}% accuracy`)}
                ${createStatPill(`Streak ${user.longest_streak}`)}
                ${createStatPill(formatLastPlayed(user.last_played_at, user.last_mode))}
            </div>
            <div class="admin-user-card__actions">
                <label class="admin-select-stack">
                    <span>Role</span>
                    <select class="admin-role-select" data-user-id="${user.id}">
                        <option value="player"${user.role === "player" ? " selected" : ""}>Player</option>
                        <option value="admin"${user.role === "admin" ? " selected" : ""}>Admin</option>
                    </select>
                </label>
                <button type="button" class="admin-action-button" data-action="update_role" data-user-id="${user.id}">Save role</button>
                <button type="button" class="admin-action-button admin-action-button--ghost" data-action="reset_progress" data-user-id="${user.id}">Reset progress</button>
                <button type="button" class="admin-action-button admin-action-button--ghost" data-action="clear_photo" data-user-id="${user.id}">Clear photo</button>
            </div>
        `;

        article.querySelectorAll("[data-action]").forEach(button => {
            button.addEventListener("click", event => handleActionClick(event, user));
        });

        userList.appendChild(article);
    });
}

function renderPagination(totalItems, pageSize, totalPages) {
    if (!pagination) {
        return;
    }

    if (totalItems <= pageSize) {
        pagination.innerHTML = "";
        return;
    }

    pagination.innerHTML = `
        <button type="button" class="admin-page-button" data-page-action="prev"${adminState.currentPage <= 1 ? " disabled" : ""}>Previous</button>
        <span class="admin-page-status">Showing ${(adminState.currentPage - 1) * pageSize + 1}-${Math.min(adminState.currentPage * pageSize, totalItems)} of ${totalItems}</span>
        <button type="button" class="admin-page-button" data-page-action="next"${adminState.currentPage >= totalPages ? " disabled" : ""}>Next</button>
    `;

    pagination.querySelectorAll("[data-page-action]").forEach(button => {
        button.addEventListener("click", () => {
            const action = button.dataset.pageAction;
            if (action === "prev" && adminState.currentPage > 1) {
                adminState.currentPage -= 1;
            }

            if (action === "next" && adminState.currentPage < totalPages) {
                adminState.currentPage += 1;
            }

            renderUsersFromState();
            pagination.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    });
}

function renderTopPlayers(players) {
    topPlayersList.innerHTML = "";

    if (players.length === 0) {
        topPlayersList.innerHTML = emptyCompactState("No score data yet", "Top performers will appear after runs are completed.");
        return;
    }

    players.forEach((player, index) => {
        const article = document.createElement("article");
        article.className = "admin-ranking-item";
        article.innerHTML = `
            <span class="admin-ranking-position">#${index + 1}</span>
            <div class="admin-ranking-copy">
                <strong>${escapeHtml(player.username)}</strong>
                <span>${player.best_score} best | Avg ${formatNumber(player.average_score)} | ${player.total_runs} runs | ${formatNumber(player.win_rate)}% win rate</span>
            </div>
        `;
        topPlayersList.appendChild(article);
    });
}

function renderRecentActivity(items) {
    recentActivityList.innerHTML = "";

    if (items.length === 0) {
        recentActivityList.innerHTML = emptyCompactState("No recent games", "Recent score activity will appear here automatically.");
        return;
    }

    items.forEach(item => {
        const article = document.createElement("article");
        article.className = "admin-activity-item";
        article.innerHTML = `
            <div class="admin-activity-copy">
                <strong>${escapeHtml(item.username)}</strong>
                <span>${escapeHtml(item.mode)} mode | Score ${item.score} | Level ${item.highest_level}</span>
            </div>
            <div class="admin-activity-meta">
                <span class="admin-result-pill ${item.result === "won" ? "is-win" : item.result === "failed" ? "is-loss" : "is-neutral"}">${escapeHtml(item.result)}</span>
                <small>${escapeHtml(formatTimestamp(item.created_at))}</small>
            </div>
        `;
        recentActivityList.appendChild(article);
    });
}

function renderRecentSignups(items) {
    recentSignupsList.innerHTML = "";

    if (items.length === 0) {
        recentSignupsList.innerHTML = emptyCompactState("No signups yet", "New accounts will appear here.");
        return;
    }

    items.forEach(item => {
        const article = document.createElement("article");
        article.className = "admin-mini-item";
        article.innerHTML = `
            <strong>${escapeHtml(item.username)}</strong>
            <span>${escapeHtml(item.role)} | Joined ${escapeHtml(formatTimestamp(item.created_at))}</span>
        `;
        recentSignupsList.appendChild(article);
    });
}

function renderFlaggedUsers(items) {
    flaggedUsersList.innerHTML = "";

    if (items.length === 0) {
        flaggedUsersList.innerHTML = emptyCompactState("No flagged users", "Everyone currently looks healthy.");
        return;
    }

    items.forEach(item => {
        const article = document.createElement("article");
        article.className = "admin-mini-item";
        article.innerHTML = `
            <strong>${escapeHtml(item.username)}</strong>
            <span>${escapeHtml(item.status_label || "Needs review")} | ${item.total_runs} runs | ${formatNumber(item.accuracy)}% accuracy</span>
        `;
        flaggedUsersList.appendChild(article);
    });
}

async function handleActionClick(event, user) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const userId = Number(button.dataset.userId || 0);

    if (!action || !userId) {
        return;
    }

    const roleSelect = button.parentElement?.querySelector(".admin-role-select");
    const nextRole = roleSelect?.value || user.role || "player";

    if (action === "reset_progress") {
        const shouldContinue = window.confirm(`Reset all scores, achievements, and progress for ${user.username}?`);
        if (!shouldContinue) {
            return;
        }
    }

    if (action === "clear_photo") {
        const shouldContinue = window.confirm(`Clear the profile photo for ${user.username}?`);
        if (!shouldContinue) {
            return;
        }
    }

    button.disabled = true;

    const body = new URLSearchParams({
        action,
        user_id: String(userId),
    });

    if (action === "update_role") {
        body.set("role", nextRole);
    }

    try {
        const response = await fetch("admin_actions.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body
        });

        const data = await response.json();
        setFeedback(data.message || "Action complete", data.status !== "success");

        if (data.status === "success") {
            initializeAdminPage();
        }
    } catch (error) {
        setFeedback("Action failed. Please try again.", true);
    } finally {
        button.disabled = false;
    }
}

function setFeedback(message, isError = false) {
    const element = document.getElementById("admin-feedback");
    if (!element) {
        return;
    }

    element.textContent = message || "";
    element.className = `settings-feedback${message ? (isError ? " error" : " success") : ""}`;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = String(value);
    }
}

function createStatPill(text) {
    return `<span class="admin-stat-pill">${escapeHtml(text)}</span>`;
}

function emptyCompactState(title, subtitle) {
    return `
        <article class="admin-empty-state compact">
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(subtitle)}</span>
        </article>
    `;
}

function compareNumbers(left, right) {
    return Number(left || 0) - Number(right || 0);
}

function compareNames(left, right) {
    return String(left || "").localeCompare(String(right || ""));
}

function compareDates(left, right) {
    const leftTime = left ? Date.parse(normalizeTimestamp(left)) : 0;
    const rightTime = right ? Date.parse(normalizeTimestamp(right)) : 0;
    return leftTime - rightTime;
}

function formatNumber(value) {
    const numericValue = Number(value || 0);
    return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(1);
}

function formatLastPlayed(timestamp, mode) {
    if (!timestamp) {
        return "No games played yet";
    }

    return `Last played ${formatTimestamp(timestamp)} in ${mode || "campaign"}`;
}

function formatTimestamp(timestamp) {
    if (!timestamp) {
        return "Unknown time";
    }

    const date = new Date(normalizeTimestamp(timestamp));
    if (Number.isNaN(date.getTime())) {
        return String(timestamp);
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function normalizeTimestamp(timestamp) {
    return String(timestamp).replace(" ", "T");
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
