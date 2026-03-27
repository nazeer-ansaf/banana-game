// user.js

// ================================
// PASSWORD STRENGTH VALIDATION
// ================================
export function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return strongPassword.test(password);
}

// ================================
// AUTHENTICATE USER (LOGIN / REGISTER)
// ================================
export async function authUser(username, password, action = "login", rememberMe = false) {
    if (!username || !password) {
        alert("Username and password are required");
        return null;
    }

    // Strong password check only for registration
    if (action === "register" && !validatePassword(password)) {
        alert("Password must contain uppercase, lowercase, number, and special character.");
        return null;
    }

    try {
        const response = await fetch("login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                username,
                password,
                action
            })
        });

        const data = await response.json();

        if (data.status === "success") {
            // Create user object
            const userData = {
                id: data.user.id,
                username: data.user.username,
                role: data.user.role || "player"
            };

            // Save user in localStorage or sessionStorage
            if (rememberMe) {
                localStorage.setItem("bananaGameUser", JSON.stringify(userData));
            } else {
                sessionStorage.setItem("bananaGameUser", JSON.stringify(userData));
            }

            return userData;
        } else {
            alert(data.message || "Authentication failed");
            return null;
        }

    } catch (err) {
        console.error("Auth error:", err);
        alert("Server error. Please try again later.");
        return null;
    }
}

// ================================
// GET CURRENT LOGGED-IN USER
// ================================
export function getLoggedInUser() {
    // Check sessionStorage first
    let user = sessionStorage.getItem("bananaGameUser");

    // If not found, check localStorage (Remember Me)
    if (!user) {
        user = localStorage.getItem("bananaGameUser");
    }

    return user ? JSON.parse(user) : null;
}

// ================================
// LOGOUT USER
// ================================
export function logoutUser() {
    sessionStorage.removeItem("bananaGameUser");
    localStorage.removeItem("bananaGameUser");

    // Redirect to login section
    location.reload();
}

// ================================
// CREATE NEW USER (Optional Wrapper)
// ================================
export async function createUser(username, password, rememberMe = false) {
    return await authUser(username, password, "register", rememberMe);
}

export async function socialAuthUser({ username, email, socialId, rememberMe = true }) {
    if (!username || !socialId) {
        alert("Social login information is incomplete");
        return null;
    }

    try {
        const response = await fetch("login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                username,
                email: email || "",
                social_id: socialId,
                action: "social_login"
            })
        });

        const data = await response.json();

        if (data.status === "success") {
            const userData = {
                id: data.user.id,
                username: data.user.username,
                role: data.user.role || "player"
            };

            if (rememberMe) {
                localStorage.setItem("bananaGameUser", JSON.stringify(userData));
            } else {
                sessionStorage.setItem("bananaGameUser", JSON.stringify(userData));
            }

            return userData;
        }

        alert(data.message || "Social login failed");
        return null;
    } catch (err) {
        console.error("Social auth error:", err);
        alert("Server error. Please try again later.");
        return null;
    }
}
