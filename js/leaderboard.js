// Leaderboard functions

export async function updateLeaderboard(username, userId, score) {
    const leaderboardList = document.getElementById("leaderboard-list");
    if (!leaderboardList) return;
    
    // Get existing scores from localStorage
    let scores = JSON.parse(localStorage.getItem("bananaScores")) || [];
    
    // Add new score
    scores.push({
        username: username,
        score: score,
        timestamp: Date.now()
    });
    
    // Sort by score (highest first) and take top 10
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem("bananaScores", JSON.stringify(scores));
    
    // Update display
    renderLeaderboard(scores);
}

export function renderLeaderboard(scores) {
    const leaderboardList = document.getElementById("leaderboard-list");
    if (!leaderboardList) return;
    
    leaderboardList.innerHTML = "";
    
    if (!scores || scores.length === 0) {
        leaderboardList.innerHTML = "<li>No scores yet. Be the first!</li>";
        return;
    }
    
    scores.forEach((entry, index) => {
        const li = document.createElement("li");
        
        let medal = "";
        if (index === 0) medal = "🥇 ";
        else if (index === 1) medal = "🥈 ";
        else if (index === 2) medal = "🥉 ";
        else medal = `${index + 1}. `;
        
        li.innerHTML = `<span>${medal}${entry.username}</span> <span>${entry.score}</span>`;
        leaderboardList.appendChild(li);
    });
}

export function initLeaderboard() {
    const scores = JSON.parse(localStorage.getItem("bananaScores")) || [];
    renderLeaderboard(scores);
}