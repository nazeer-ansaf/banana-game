// leaderboard.js – Full server-backed leaderboard

// DOM element
const leaderboardList = document.getElementById("leaderboard-list");

// -------------------------
// Save score for current user
// -------------------------
export async function updateLeaderboard(username, score) {
    if (!username) return;

    const user = JSON.parse(localStorage.getItem("bananaGameUser"));
    if (!user) return;

    try {
        // Send score to backend
        await fetch("http://localhost/banana-game/submit_score.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                user_id: user.id,
                score: score
            })
        });

        // Refresh leaderboard from backend
        await fetchLeaderboard();

    } catch (err) {
        console.error("Failed to update leaderboard:", err);
    }
}

// -------------------------
// Fetch top scores from backend
// -------------------------
export async function fetchLeaderboard() {
    try {
        const response = await fetch("http://localhost/banana-game/get_leaderboard.php");
        const data = await response.json();

        if (data.status === "success" && Array.isArray(data.leaderboard)) {
            renderLeaderboard(data.leaderboard);
        } else {
            renderLeaderboard([]);
        }
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        renderLeaderboard([]);
    }
}

// -------------------------
// Render leaderboard in HTML
// -------------------------
export function renderLeaderboard(entries = []) {
    leaderboardList.innerHTML = "";

    if (entries.length === 0) {
        leaderboardList.innerHTML = "<li>No scores yet</li>";
        return;
    }

    entries.forEach(entry => {
        const li = document.createElement("li");
        li.innerText = `${entry.username}: ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

// -------------------------
// Reset leaderboard (optional admin feature)
// -------------------------
export async function resetLeaderboard() {
    try {
        await fetch("http://localhost/banana-game/reset_leaderboard.php");
        renderLeaderboard([]);
    } catch (err) {
        console.error("Failed to reset leaderboard:", err);
    }
}

// -------------------------
// Initialize leaderboard on page load
// -------------------------
export function initLeaderboard() {
    fetchLeaderboard();
}
