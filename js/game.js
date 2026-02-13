// game.js – Puzzle Loading, Answer Checking, Level Handling

let score = 0;
let correctAnswer = null;
let currentLevel = 1;
const maxLevels = 10; // Optional: total levels

// -------------------------
// Set correct answer for current puzzle
// -------------------------
export function setCorrectAnswer(answer) {
    correctAnswer = answer;
}

// -------------------------
// Check user answer
// Returns true if correct, increments score
// -------------------------
export function checkAnswer(userAnswer) {
    if (parseInt(userAnswer) === parseInt(correctAnswer)) {
        score++;
        advanceLevel();
        return true;
    }
    return false;
}

// -------------------------
// Get current score
// -------------------------
export function getScore() {
    return score;
}

// -------------------------
// Reset score & level
// -------------------------
export function resetScore() {
    score = 0;
    currentLevel = 1;
}

// -------------------------
// Handle level progression
// -------------------------
export function advanceLevel() {
    if (currentLevel < maxLevels) {
        currentLevel++;
    }
    // Optional: trigger special event on last level
    if (currentLevel === maxLevels) {
        console.log("🎉 Final Level reached!");
    }
}

// -------------------------
// Get current level
// -------------------------
export function getLevel() {
    return currentLevel;
}
