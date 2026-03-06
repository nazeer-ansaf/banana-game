// leaderboard.js

// Initialize leaderboard on page load
export async function initLeaderboard() {

    const list = document.getElementById("leaderboard-list");
    list.innerHTML = "Loading...";

    try {

        const res = await fetch("http://localhost/banana_game/submit_score.php");
        let data = await res.json();

        data = Array.isArray(data) ? data : Object.values(data);

        list.innerHTML = "";

        data.forEach((entry, index) => {

            const li = document.createElement("li");

            const username = entry.username ?? "Unknown";
            const score = entry.score ?? 0;

            let medal = "";
            if (index === 0) medal = "🥇";
            else if (index === 1) medal = "🥈";
            else if (index === 2) medal = "🥉";

            li.innerHTML = `
                <span class="username">${medal} ${username}</span>
                <span class="score">${score}</span>
            `;

            list.appendChild(li);

        });

    } catch (err) {

        console.error("Leaderboard error:", err);
        list.innerHTML = "Failed to load leaderboard";

    }

}


// Update leaderboard locally after score submission
export function updateLeaderboard(username, score) {

    const list = document.getElementById("leaderboard-list");

    const li = document.createElement("li");

    li.innerHTML = `
        <span class="username">${username}</span>
        <span class="score">${score}</span>
    `;

    list.prepend(li);
}