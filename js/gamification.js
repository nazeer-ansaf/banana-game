// Achievements and badges

const achievements = [
    { score: 50, name: "🍌 Banana Beginner", badge: "🌱" },
    { score: 100, name: "🍌 Banana Pro", badge: "⭐" },
    { score: 200, name: "🍌 Banana Master", badge: "🏆" },
    { score: 500, name: "🍌 Banana Legend", badge: "👑" }
];

let unlockedAchievements = [];

export function unlockAchievement(currentScore) {
    achievements.forEach(ach => {
        if (currentScore >= ach.score && !unlockedAchievements.includes(ach.name)) {
            unlockedAchievements.push(ach.name);
            showAchievementPopup(ach.name, ach.badge);
        }
    });
}

function showAchievementPopup(name, badge) {
    const popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.innerHTML = `${badge} Achievement Unlocked: ${name}!`;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.classList.add("show"), 100);
    
    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

export function resetAchievements() {
    unlockedAchievements = [];
}