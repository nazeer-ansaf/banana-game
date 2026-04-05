import { logoutUser } from "./user.js?v=20260403a";

const logoutBtn = document.getElementById("admin-logout-btn");
const userList = document.getElementById("admin-user-list");

logoutBtn?.addEventListener("click", logoutUser);

initializeAdminPage();

async function initializeAdminPage() {
    const response = await fetch("admin_data.php");
    const data = await response.json();

    if (data.status !== "success") {
        setFeedback(data.message || "Unable to load admin data", true);
        return;
    }

    document.getElementById("admin-total-users").textContent = String(data.summary.users);
    document.getElementById("admin-total-admins").textContent = String(data.summary.admins);
    document.getElementById("admin-total-runs").textContent = String(data.summary.runs);
    document.getElementById("admin-total-wins").textContent = String(data.summary.wins);

    renderUsers(data.users || []);
}

function renderUsers(users) {
    userList.innerHTML = "";

    users.forEach(user => {
        const article = document.createElement("article");
        article.className = "admin-user-item";
        article.innerHTML = `
            <div class="admin-user-main">
                <div class="user-avatar admin-user-avatar${user.profile_photo ? " has-image" : ""}">
                    ${user.profile_photo
                        ? `<img src="${escapeAttribute(user.profile_photo)}" alt="${escapeAttribute(user.username)} profile photo">`
                        : `<span>${escapeHtml(getInitials(user.username))}</span>`}
                </div>
                <div class="admin-user-copy">
                    <strong>${escapeHtml(user.username)}</strong>
                    <span>${escapeHtml(user.email || "No email")} | ${escapeHtml(user.phone_number || "No phone")}</span>
                    <small>${user.total_runs} runs | Best ${user.best_score} | Last mode ${escapeHtml(user.last_mode)}</small>
                </div>
            </div>
            <form class="admin-role-form" data-user-id="${user.id}">
                <select name="role">
                    <option value="player"${user.role === "player" ? " selected" : ""}>Player</option>
                    <option value="admin"${user.role === "admin" ? " selected" : ""}>Admin</option>
                </select>
                <button type="submit" class="dashboard-action-link">Save Role</button>
            </form>
        `;

        const form = article.querySelector(".admin-role-form");
        form?.addEventListener("submit", event => updateRole(event, user.id));
        userList.appendChild(article);
    });
}

async function updateRole(event, userId) {
    event.preventDefault();
    const form = event.currentTarget;
    const role = form.querySelector("select")?.value || "player";

    const response = await fetch("admin_actions.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            action: "update_role",
            user_id: String(userId),
            role
        })
    });

    const data = await response.json();
    setFeedback(data.message, data.status !== "success");

    if (data.status === "success") {
        initializeAdminPage();
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
