// user.js
export async function authUser(username, password, action) {
    try {
        const response = await fetch("http://localhost/banana_game/login.php", {
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
            // Store full user info for session
            localStorage.setItem("bananaGameUser", JSON.stringify({
                username: username,
                id: data.user?.id || null // optional, if PHP sends user id
            }));
            return true;
        } else {
            alert(data.message);
            return false;
        }
    } catch (err) {
        console.error("Auth error:", err);
        alert("Something went wrong. Try again.");
        return false;
    }
}

// Check if user is logged in
export function getLoggedInUser() {
    const user = localStorage.getItem("bananaGameUser");
    return user ? JSON.parse(user) : null;
}

// Logout function
export function logoutUser() {
    localStorage.removeItem("bananaGameUser");
    window.location.reload(); // redirect to login view
}
