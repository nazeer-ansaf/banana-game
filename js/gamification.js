// gamification.js – Badges, achievements, progress

// Define milestones and corresponding badges
const achievements = [
    { score: 5, name: "🍌 Banana Beginner" },
    { score: 10, name: "🍌 Banana Pro" },
    { score: 20, name: "🍌 Banana Master" },
    { score: 30, name: "🍌 Banana Legend" }
];

// Keep track of unlocked achievements
let unlocked = [];

// -------------------------
// Unlock achievement if milestone reached
// -------------------------
export function unlockAchievement(currentScore) {
    achievements.forEach((ach) => {
        if (currentScore >= ach.score && !unlocked.includes(ach.name)) {
            unlocked.push(ach.name);
            showAchievementPopup(ach.name);
        }
    });
}

// -------------------------
// Display pop-up notification
// -------------------------
function showAchievementPopup(name) {
    const popup = document.createElement("div");
    popup.className = "achievement-popup";
    popup.innerText = `🎉 Achievement Unlocked: ${name}!`;
    document.body.appendChild(popup);

    // Animate: fade in/out
    setTimeout(() => {
        popup.classList.add("show");
    }, 100);

    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.remove(), 500); // remove from DOM
    }, 3000);
}

// -------------------------
// Reset achievements (new game)
// -------------------------
export function resetAchievements() {
    unlocked = [];
}
