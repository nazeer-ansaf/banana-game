import { loadPlayerProgress, renderPlayerHub } from "./progression.js?v=20260403a";
import { logoutUser, validatePassword } from "./user.js?v=20260403a";

const currentUser = window.BANANA_USER;
const logoutBtn = document.getElementById("profile-logout-btn");
const settingsForm = document.getElementById("profile-settings-form");
const profilePhotoInput = document.getElementById("profile-photo-input");
const profileUsernameInput = document.getElementById("profile-username");
const removePhotoBtn = document.getElementById("remove-photo-btn");
const removePhotoField = document.getElementById("remove-profile-photo");
const profilePhotoImage = document.getElementById("profile-photo-image");
const profilePhotoInitials = document.getElementById("profile-photo-initials");
const profilePhotoPreview = document.getElementById("profile-photo-preview");
const profileDisplayName = document.getElementById("profile-display-name");
const profileHandle = document.getElementById("profile-handle");
const settingsTabButtons = document.querySelectorAll("[data-settings-tab]");
const settingsTabPanels = document.querySelectorAll("[data-settings-panel]");
let uploadedPhotoUrl = "";

logoutBtn?.addEventListener("click", logoutUser);
settingsForm?.addEventListener("submit", handleSettingsSave);
profilePhotoInput?.addEventListener("change", handleProfilePhotoPreview);
profileUsernameInput?.addEventListener("input", handleUsernamePreviewUpdate);
removePhotoBtn?.addEventListener("click", handleProfilePhotoRemove);
settingsTabButtons.forEach(button => {
    button.addEventListener("click", () => activateSettingsTab(button.dataset.settingsTab || "personal"));
});

window.addEventListener("pageshow", () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
});

initializeProfilePage();

async function initializeProfilePage() {
    if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const response = await fetch("player_data.php");
    const data = await response.json();

    if (data.status !== "success") {
        setFeedback("profile-feedback", data.message || "Unable to load profile", true);
        return;
    }

    const state = await loadPlayerProgress(currentUser);
    renderPlayerHub(state);

    document.getElementById("profile-role-pill").textContent = data.account.role === "admin" ? "Admin" : "Player";
    document.getElementById("profile-username").value = data.account.username || "";
    document.getElementById("profile-email").value = data.account.email || "";
    document.getElementById("profile-phone").value = data.account.phone_number || "";
    document.getElementById("profile-member-since").value = formatMemberSince(data.account.created_at);
    document.getElementById("sound-enabled").checked = Boolean(data.settings.sound_enabled);
    document.getElementById("music-enabled").checked = Boolean(data.settings.music_enabled);
    document.getElementById("effects-enabled").checked = Boolean(data.settings.effects_enabled);
    updateProfileIdentity(data.account.username || currentUser.username || "Player");
    setProfilePhoto(data.account.profile_photo || "", data.account.username || currentUser.username || "Player");
    activateSettingsTab("personal");
}

async function handleSettingsSave(event) {
    event.preventDefault();

    const currentPassword = document.getElementById("current-password").value.trim();
    const newPassword = document.getElementById("new-password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const passwordFieldsUsed = Boolean(currentPassword || newPassword || confirmPassword);

    if (passwordFieldsUsed) {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setFeedback("profile-feedback", "Fill in all password fields to change your password", true);
            return;
        }

        if (!validatePassword(newPassword)) {
            setFeedback("profile-feedback", "New password does not meet the strength rules", true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setFeedback("profile-feedback", "New passwords do not match", true);
            return;
        }
    }

    const formData = new FormData(settingsForm);
    formData.set("action", "save_all_settings");
    formData.set("sound_enabled", document.getElementById("sound-enabled").checked ? "1" : "");
    formData.set("music_enabled", document.getElementById("music-enabled").checked ? "1" : "");
    formData.set("effects_enabled", document.getElementById("effects-enabled").checked ? "1" : "");
    if (profilePhotoInput?.files?.length) {
        formData.set("profile_photo", profilePhotoInput.files[0]);
    } else {
        formData.delete("profile_photo");
    }

    const result = await postForm(formData, true);
    setFeedback("profile-feedback", result.message, result.status !== "success");

    if (result.status === "success") {
        currentUser.username = result.account.username;
        updateProfileIdentity(result.account.username || currentUser.username || "Player");
        setProfilePhoto(result.account.profile_photo || "", result.account.username || currentUser.username || "Player");
        if (profilePhotoInput) {
            profilePhotoInput.value = "";
        }
        if (removePhotoField) {
            removePhotoField.value = "0";
        }
        document.getElementById("current-password").value = "";
        document.getElementById("new-password").value = "";
        document.getElementById("confirm-password").value = "";
    }
}

function handleProfilePhotoPreview(event) {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }

    removePhotoField.value = "0";
    const objectUrl = URL.createObjectURL(file);
    setProfilePhoto(objectUrl, document.getElementById("profile-username")?.value || currentUser.username || "Player", true);
}

function handleProfilePhotoRemove() {
    if (profilePhotoInput) {
        profilePhotoInput.value = "";
    }

    if (removePhotoField) {
        removePhotoField.value = "1";
    }

    setProfilePhoto("", document.getElementById("profile-username")?.value || currentUser.username || "Player");
}

function handleUsernamePreviewUpdate(event) {
    updateProfileIdentity(event.target.value || currentUser.username || "Player");

    if (profilePhotoPreview?.classList.contains("has-image")) {
        return;
    }

    setProfilePhoto("", event.target.value || currentUser.username || "Player");
}

async function postForm(formData, isMultipart = false) {
    const response = await fetch("profile_actions.php", {
        method: "POST",
        body: isMultipart ? formData : new URLSearchParams([...formData.entries()])
    });

    return response.json();
}

function setProfilePhoto(photoPath, username, isObjectUrl = false) {
    const initials = getInitials(username);
    if (profilePhotoInitials) {
        profilePhotoInitials.textContent = initials;
    }

    if (uploadedPhotoUrl && uploadedPhotoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedPhotoUrl);
    }

    uploadedPhotoUrl = "";
    const hasPhoto = Boolean(photoPath);

    if (profilePhotoPreview) {
        profilePhotoPreview.classList.toggle("has-image", hasPhoto);
    }

    if (profilePhotoImage) {
        if (hasPhoto) {
            uploadedPhotoUrl = photoPath;
            profilePhotoImage.src = isObjectUrl ? photoPath : encodeURI(photoPath);
            profilePhotoImage.hidden = false;
        } else {
            profilePhotoImage.removeAttribute("src");
            profilePhotoImage.hidden = true;
        }
    }
}

function getInitials(name) {
    const cleaned = (name || "Player").trim();
    if (!cleaned) {
        return "P";
    }

    const parts = cleaned.split(/\s+/).slice(0, 2);
    return parts.map(part => part.charAt(0).toUpperCase()).join("") || "P";
}

function updateProfileIdentity(name) {
    const cleaned = (name || "Player").trim() || "Player";
    if (profileDisplayName) {
        profileDisplayName.textContent = cleaned;
    }

    if (profileHandle) {
        profileHandle.textContent = `@${cleaned.replace(/\s+/g, "")}`;
    }
}

function activateSettingsTab(tabName) {
    settingsTabButtons.forEach(button => {
        const active = button.dataset.settingsTab === tabName;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
    });

    settingsTabPanels.forEach(panel => {
        const active = panel.dataset.settingsPanel === tabName;
        panel.classList.toggle("active", active);
        panel.hidden = !active;
    });
}

function formatMemberSince(value) {
    if (!value) {
        return "Member";
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return "Member";
    }

    return parsedDate.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric"
    });
}

function setFeedback(id, message, isError = false) {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    element.textContent = message || "";
    element.className = `settings-feedback${message ? (isError ? " error" : " success") : ""}`;
}
