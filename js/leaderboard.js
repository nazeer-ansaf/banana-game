// leaderboard.js

// Initialize leaderboard on page load
export async function initLeaderboard() {
    const list = document.getElementById("leaderboard-list");
    list.innerHTML = "Loading...";

    try {
        const res = await fetch("http://localhost/banana_game/submit_score.php");
        let data = await res.json();

        // Ensure data is an array
        data = Array.isArray(data) ? data : Object.values(data);

        list.innerHTML = "";

        data.forEach((entry, index) => {
            const li = document.createElement("li");
            const username = entry.username ?? "Unknown";
            const score = entry.score ?? 0;

            // Add medal emojis for top 3
            let medal = "";
            if (index === 0) medal = "🥇 ";
            else if (index === 1) medal = "🥈 ";
            else if (index === 2) medal = "🥉 ";

            li.innerText = `${medal}${username}: ${score}`;
            list.appendChild(li);
        });

    } catch (err) {
        console.error("Leaderboard error:", err);
        list.innerHTML = "Failed to load leaderboard";
    }
}

// Update leaderboard locally after score submission (optional)
export function updateLeaderboard(username, score) {
    const list = document.getElementById("leaderboard-list");

    // Create new entry at the top
    const li = document.createElement("li");
    li.innerText = `${username}: ${score}`;
    list.prepend(li);
}