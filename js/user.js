// user.js
// Handles virtual identity using localStorage

export function login(username) {
    localStorage.setItem("bananaUser", username);
}

export function getUser() {
    return localStorage.getItem("bananaUser");
}

export function logout() {
    localStorage.removeItem("bananaUser");
}
