import {
    authUser,
    getPasswordStrength,
    registerUser,
    socialAuthUser
} from "./user.js?v=20260403a";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const rememberMeCheckbox = document.getElementById("remember-me");
const regUsernameInput = document.getElementById("reg-username");
const regEmailInput = document.getElementById("reg-email");
const regPhoneInput = document.getElementById("reg-phone");
const regPasswordInput = document.getElementById("reg-password");
const regConfirmPasswordInput = document.getElementById("reg-confirm-password");
const regRememberMeCheckbox = document.getElementById("reg-remember-me");
const passwordStrength = document.getElementById("password-strength");
const passwordStrengthFill = document.getElementById("password-strength-fill");
const passwordStrengthText = document.getElementById("password-strength-text");
const confirmPasswordFeedback = document.getElementById("confirm-password-feedback");

const passwordChecklistItems = {
    length: document.getElementById("check-length"),
    upper: document.getElementById("check-upper"),
    lower: document.getElementById("check-lower"),
    number: document.getElementById("check-number"),
    special: document.getElementById("check-special")
};

document.getElementById("show-register").addEventListener("click", event => {
    event.preventDefault();
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    updatePasswordUI();
});

document.getElementById("back-to-login").addEventListener("click", event => {
    event.preventDefault();
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

loginBtn.addEventListener("click", async () => {
    const user = await authUser(
        usernameInput.value.trim(),
        passwordInput.value.trim(),
        "login",
        rememberMeCheckbox.checked
    );

    if (user) {
        window.location.href = "dashboard.php";
    }
});

registerBtn.addEventListener("click", async () => {
    const user = await registerUser({
        username: regUsernameInput.value.trim(),
        email: regEmailInput.value.trim(),
        phoneNumber: regPhoneInput.value.trim(),
        password: regPasswordInput.value.trim(),
        confirmPassword: regConfirmPasswordInput.value.trim(),
        rememberMe: regRememberMeCheckbox.checked
    });

    if (user) {
        window.location.href = "dashboard.php";
    }
});

regPasswordInput?.addEventListener("input", updatePasswordUI);
regConfirmPasswordInput?.addEventListener("input", updateConfirmPasswordUI);

window.handleCredentialResponse = async response => {
    try {
        const data = JSON.parse(atob(response.credential.split(".")[1]));
        const user = await socialAuthUser({
            username: data.name,
            email: data.email,
            socialId: data.sub,
            rememberMe: true
        });

        if (user) {
            window.location.href = "dashboard.php";
        }
    } catch (error) {
        console.error("Social login error:", error);
        alert("Something went wrong during social login");
    }
};

function updatePasswordUI() {
    const password = regPasswordInput?.value.trim() || "";
    const { score, label, tone, checks } = getPasswordStrength(password);

    passwordStrength?.classList.remove("hidden", "weak", "medium", "strong", "empty");
    passwordStrength?.classList.add(tone);

    if (!password) {
        passwordStrength?.classList.add("hidden");
    }

    if (passwordStrengthFill) {
        passwordStrengthFill.style.width = `${(score / 5) * 100}%`;
    }

    if (passwordStrengthText) {
        passwordStrengthText.textContent = label;
    }

    Object.entries(passwordChecklistItems).forEach(([key, item]) => {
        if (!item) {
            return;
        }

        item.classList.toggle("met", checks[key]);
    });

    updateConfirmPasswordUI();
}

function updateConfirmPasswordUI() {
    const password = regPasswordInput?.value.trim() || "";
    const confirmPassword = regConfirmPasswordInput?.value.trim() || "";

    if (!confirmPassword) {
        confirmPasswordFeedback.textContent = "";
        confirmPasswordFeedback.className = "field-feedback";
        return;
    }

    if (password === confirmPassword) {
        confirmPasswordFeedback.textContent = "Passwords match";
        confirmPasswordFeedback.className = "field-feedback success";
        return;
    }

    confirmPasswordFeedback.textContent = "Passwords do not match yet";
    confirmPasswordFeedback.className = "field-feedback error";
}
