const createUserForm = document.getElementById("admin-create-user-form");
const feedbackElement = document.getElementById("admin-create-feedback");

createUserForm?.addEventListener("submit", handleCreateUser);

async function handleCreateUser(event) {
    event.preventDefault();

    const formData = new FormData(createUserForm);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");
    const submitButton = createUserForm.querySelector('button[type="submit"]');

    const email = String(formData.get("email") || "").trim();

    if (!username || !email || !password || !confirmPassword) {
        setFeedback("Fill in username, email, password, and confirm password", true);
        return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        setFeedback("Enter a valid email address", true);
        return;
    }

    if (password !== confirmPassword) {
        setFeedback("Passwords do not match", true);
        return;
    }

    submitButton.disabled = true;

    try {
        const response = await fetch("admin_actions.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                action: "create_user",
                username,
                email,
                phone_number: String(formData.get("phone_number") || "").trim(),
                role: String(formData.get("role") || "player"),
                password,
                confirm_password: confirmPassword
            })
        });

        const data = await response.json();
        if (data.status !== "success") {
            setFeedback(data.message || "Unable to create the account", true);
            return;
        }

        window.location.href = `admin_users.php?created=${encodeURIComponent(username)}`;
    } catch (error) {
        setFeedback("Unable to create user right now", true);
    } finally {
        submitButton.disabled = false;
    }
}

function setFeedback(message, isError = false) {
    if (!feedbackElement) {
        return;
    }

    feedbackElement.textContent = message || "";
    feedbackElement.className = `settings-feedback${message ? (isError ? " error" : " success") : ""}`;
}
