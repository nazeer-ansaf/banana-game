// User authentication and session management

const API_URL = "http://localhost/banana-game/login.php";

// Store current user
export function setLoggedInUser(user) {
    localStorage.setItem("bananaGameUser", JSON.stringify(user));
}

export function getLoggedInUser() {
    const user = localStorage.getItem("bananaGameUser");
    return user ? JSON.parse(user) : null;
}

export function logoutUser() {
    localStorage.removeItem("bananaGameUser");
    localStorage.removeItem("bananaScores");
}

// Validation functions
export function validateUsername(username) {
    if (!username || username.length < 3) {
        return { valid: false, message: "Username must be at least 3 characters" };
    }
    if (username.length > 30) {
        return { valid: false, message: "Username must be less than 30 characters" };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: "Username can only contain letters, numbers, and underscores" };
    }
    return { valid: true, message: "✓ Username available" };
}

export function validatePassword(password) {
    if (!password || password.length < 6) {
        return { 
            valid: false, 
            message: "Password must be at least 6 characters",
            strength: 0
        };
    }
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengthText = ["Weak", "Fair", "Good", "Strong"][strength] || "Weak";
    
    return { 
        valid: strength >= 1, 
        message: strengthText,
        strength: strength
    };
}

export function validatePasswordMatch(password, confirm) {
    if (password !== confirm) {
        return { valid: false, message: "Passwords do not match" };
    }
    return { valid: true, message: "✓ Passwords match" };
}

export function validateEmail(email) {
    if (!email) return { valid: true, message: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: "Invalid email format" };
    }
    return { valid: true, message: "✓ Email valid" };
}

// Guest login
export function guestLogin() {
    const guestUser = {
        id: "guest_" + Date.now(),
        username: "Guest_" + Math.floor(Math.random() * 1000),
        isGuest: true
    };
    setLoggedInUser(guestUser);
    return guestUser;
}

// Social login simulation
export function socialLogin(provider) {
    showNotification(`Connecting to ${provider}...`, "info");
    
    setTimeout(() => {
        const socialUser = {
            id: `${provider}_${Date.now()}`,
            username: `${provider}_user_${Math.floor(Math.random() * 1000)}`,
            provider: provider
        };
        setLoggedInUser(socialUser);
        window.location.reload();
    }, 1000);
}

// Authenticate user
export async function authUser(username, password, action, email = "") {
    try {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("action", action);
        if (email) formData.append("email", email);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const data = await response.json();

        if (data.status === "success") {
            setLoggedInUser({
                id: data.user.id,
                username: data.user.username,
                email: data.user.email || null
            });
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message };
        }
    } catch (err) {
        console.error("Auth error:", err);
        return { success: false, message: "Connection error. Please try again." };
    }
}

// Notification function
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}