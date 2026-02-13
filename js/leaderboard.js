// leaderboard.js – Track scores and display leaderboard

const leaderboardKey = "bananaGameLeaderboard";

// DOM Element
const leaderboardList = document.getElementById("leaderboard-list");

// -------------------------
// Save score for current user
// -------------------------
export function updateLeaderboard(username, score) {
    if (!username) return;

    // Get existing leaderboard
    let leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];

    // Check if user exists
    const userIndex = leaderboard.findIndex(entry => entry.username === username);
    if (userIndex !== -1) {
        // Update score if higher
        if (score > leaderboard[userIndex].score) {
            leaderboard[userIndex].score = score;
        }
    } else {
        leaderboard.push({ username, score });
    }

    // Sort descending
    leaderboard.sort((a, b) => b.score - a.score);

    // Keep top 5
    leaderboard = leaderboard.slice(0, 5);

    // Save back to localStorage
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));

    // Update UI
    renderLeaderboard();
}

// -------------------------
// Render leaderboard in HTML
// -------------------------
export function renderLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];
    leaderboardList.innerHTML = "";

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = "<li>No scores yet</li>";
        return;
    }

    leaderboard.forEach(entry => {
        const li = document.createElement("li");
        li.innerText = `${entry.username}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

// -------------------------
// Reset leaderboard (optional)
// -------------------------
export function resetLeaderboard() {
    localStorage.removeItem(leaderboardKey);
    renderLeaderboard();
}

// -------------------------
// Initialize leaderboard on page load
// -------------------------
export function initLeaderboard() {
    renderLeaderboard();
}
