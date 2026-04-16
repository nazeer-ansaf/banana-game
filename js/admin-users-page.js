let adminState = {
    users: [],
    currentPage: 1,
};

const userList = document.getElementById("admin-user-list");
const searchInput = document.getElementById("admin-user-search");
const roleFilter = document.getElementById("admin-role-filter");
const sortOrder = document.getElementById("admin-sort-order");
const statusFilter = document.getElementById("admin-status-filter");
const pageSizeSelect = document.getElementById("admin-page-size");
const pagination = document.getElementById("admin-pagination");
const refreshBtn = document.getElementById("admin-users-refresh-btn");
const applyFiltersBtn = document.getElementById("admin-apply-filters-btn");

searchInput?.addEventListener("input", resetAndRenderUsers);
roleFilter?.addEventListener("change", resetAndRenderUsers);
sortOrder?.addEventListener("change", resetAndRenderUsers);
statusFilter?.addEventListener("change", resetAndRenderUsers);
pageSizeSelect?.addEventListener("change", resetAndRenderUsers);
refreshBtn?.addEventListener("click", () => loadUsersPage(true));
applyFiltersBtn?.addEventListener("click", resetAndRenderUsers);

loadUsersPage();

async function loadUsersPage(showMessage = false) {
    try {
        const response = await fetch(`admin_data.php?ts=${Date.now()}`);
        const data = await response.json();

        if (data.status !== "success") {
            setFeedback(data.message || "Unable to load users", true);
            return;
        }

        adminState.users = Array.isArray(data.users) ? data.users : [];
        renderUsersFromState();

        if (showMessage) {
            setFeedback("Users refreshed");
        }

        showCreateSuccessMessage();
    } catch (error) {
        setFeedback("Unable to load users right now", true);
    }
}

function resetAndRenderUsers() {
    adminState.currentPage = 1;
    renderUsersFromState();
}

function renderUsersFromState() {
    const filteredUsers = getFilteredUsers(adminState.users);
    const pageSize = Number(pageSizeSelect?.value || 6);
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    adminState.currentPage = Math.min(adminState.currentPage, totalPages);
    adminState.currentPage = Math.max(adminState.currentPage, 1);

    const startIndex = (adminState.currentPage - 1) * pageSize;
    renderUsers(filteredUsers.slice(startIndex, startIndex + pageSize));
    renderPagination(filteredUsers.length, pageSize, totalPages);
    setText("admin-roster-count", `${filteredUsers.length} visible | page ${adminState.currentPage} of ${totalPages}`);
}

function getFilteredUsers(users) {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const selectedRole = roleFilter?.value || "all";
    const selectedSort = sortOrder?.value || "impact";
    const selectedStatus = statusFilter?.value || "all";

    const filtered = users.filter(user => {
        const matchesRole = selectedRole === "all" || user.role === selectedRole;
        const haystack = [user.username, user.email, user.phone_number].filter(Boolean).join(" ").toLowerCase();
        return matchesRole && (query === "" || haystack.includes(query)) && matchStatusFilter(user, selectedStatus);
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
        return !Number.isNaN(lastPlayed) && (Date.now() - lastPlayed) >= (7 * 24 * 60 * 60 * 1000);
    }
    if (selectedStatus === "flagged") {
        return Boolean(user.is_flagged);
    }
    return true;
}

function compareUsers(left, right, selectedSort) {
    if (selectedSort === "score") {
        return compareNumbers(right.best_score, left.best_score) || compareNumbers(right.average_score, left.average_score) || compareNames(left.username, right.username);
    }
    if (selectedSort === "recent") {
        return compareDates(right.last_played_at, left.last_played_at) || compareNames(left.username, right.username);
    }
    if (selectedSort === "joined") {
        return compareDates(right.joined_at, left.joined_at) || compareNames(left.username, right.username);
    }
    if (selectedSort === "name") {
        return compareNames(left.username, right.username);
    }
    return compareNumbers(right.total_runs, left.total_runs) || compareNumbers(right.best_score, left.best_score) || compareDates(right.last_played_at, left.last_played_at) || compareNames(left.username, right.username);
}

function renderUsers(users) {
    if (!userList) {
        return;
    }

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
        article.innerHTML = `
            <div class="admin-user-card__topline">
                <span class="admin-user-index">#${user.id}</span>
                <span class="admin-role-chip ${user.role === "admin" ? "is-admin" : "is-player"}">${escapeHtml(user.role)}</span>
            </div>
            <div class="admin-user-card__identity admin-user-card__identity--stack">
                <div class="admin-user-avatar admin-user-avatar--compact${user.profile_photo ? " has-image" : ""}">
                    ${user.profile_photo ? `<img src="${escapeAttribute(user.profile_photo)}" alt="${escapeAttribute(user.username)} profile photo">` : `<span>${escapeHtml(getInitials(user.username))}</span>`}
                </div>
                <div class="admin-user-card__copy">
                    <div class="admin-user-card__title">
                        <strong>${escapeHtml(user.username)}</strong>
                        ${user.is_flagged ? '<span class="admin-flag-chip">Flagged</span>' : ""}
                    </div>
                    <span>${escapeHtml(user.email || "No email")}</span>
                    <span>${escapeHtml(user.phone_number || "No phone")}</span>
                    <small>${escapeHtml(user.status_label || "Healthy")}</small>
                </div>
            </div>
            <div class="admin-user-card__stats">
                ${stat(`${user.total_runs} runs`)}
                ${stat(`${user.wins} wins`)}
                ${stat(`${formatNumber(user.win_rate)}% win rate`)}
                ${stat(`Best ${user.best_score}`)}
                ${stat(`Level ${user.best_level}`)}
                ${stat(formatLastPlayed(user.last_played_at, user.last_mode))}
            </div>
            <div class="admin-user-card__meta">
                <span>Joined ${escapeHtml(formatTimestamp(user.joined_at))}</span>
                <span>Avg ${escapeHtml(formatNumber(user.average_score))}</span>
                <span>${escapeHtml(formatNumber(user.accuracy))}% accuracy</span>
                <span>Streak ${escapeHtml(String(user.longest_streak))}</span>
            </div>
            <div class="admin-user-card__actions">
                <label class="admin-select-stack">
                    <span>Role</span>
                    <select class="admin-role-select">
                        <option value="player"${user.role === "player" ? " selected" : ""}>Player</option>
                        <option value="admin"${user.role === "admin" ? " selected" : ""}>Admin</option>
                    </select>
                </label>
                <button type="button" class="admin-action-button" data-action="update_role">Save role</button>
                <button type="button" class="admin-action-button admin-action-button--ghost" data-action="reset_progress">Reset progress</button>
                <button type="button" class="admin-action-button admin-action-button--ghost" data-action="clear_photo">Clear photo</button>
            </div>
        `;

        article.querySelectorAll("[data-action]").forEach(button => {
            button.addEventListener("click", event => handleAction(event, user));
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
        <button type="button" class="admin-page-button" data-page="prev"${adminState.currentPage <= 1 ? " disabled" : ""}>Previous</button>
        <span class="admin-page-status">Showing ${(adminState.currentPage - 1) * pageSize + 1}-${Math.min(adminState.currentPage * pageSize, totalItems)} of ${totalItems}</span>
        <button type="button" class="admin-page-button" data-page="next"${adminState.currentPage >= totalPages ? " disabled" : ""}>Next</button>
    `;

    pagination.querySelectorAll("[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            adminState.currentPage += button.dataset.page === "next" ? 1 : -1;
            renderUsersFromState();
        });
    });
}

async function handleAction(event, user) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const role = button.parentElement?.querySelector(".admin-role-select")?.value || user.role;

    if (action === "reset_progress" && !window.confirm(`Reset all progress for ${user.username}?`)) {
        return;
    }
    if (action === "clear_photo" && !window.confirm(`Clear profile photo for ${user.username}?`)) {
        return;
    }

    button.disabled = true;

    try {
        const response = await fetch("admin_actions.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                action,
                user_id: String(user.id),
                role
            })
        });

        const data = await response.json();
        setFeedback(data.message || "Action complete", data.status !== "success");
        if (data.status === "success") {
            await loadUsersPage();
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

function stat(text) {
    return `<span class="admin-stat-pill">${escapeHtml(text)}</span>`;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = String(value);
    }
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

function showCreateSuccessMessage() {
    const params = new URLSearchParams(window.location.search);
    const createdUser = params.get("created");
    if (!createdUser) {
        return;
    }

    setFeedback(`Account created for ${createdUser}`);
    params.delete("created");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);
}
