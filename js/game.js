// game.js
let score = 0;                 // current session score
let correctAnswer = null;
let streak = 0;

// -------------------------
// Set correct answer
// -------------------------
export function setCorrectAnswer(answer) {
    correctAnswer = parseInt(answer);
}

// -------------------------
// Check user answer
// -------------------------
export function checkAnswer(userAnswer) {
    if (parseInt(userAnswer) === correctAnswer) {
        // Each correct answer gives 5 points (fixed, no difficulty-based)
        score += 5;
        streak++;
        return true;
    } else {
        streak = 0;
        return false;
    }
}

// -------------------------
// Get current streak
// -------------------------
export function getStreak() {
    return streak;
}

// -------------------------
// Get current session score
// -------------------------
export function getScore() {
    return score;
}

// -------------------------
// Reset score and session data
// -------------------------
export function resetScore() {
    score = 0;
    streak = 0;
}

// -------------------------
// Add specific amount to score (used for bonus or adjustments)
// -------------------------
export function addScore(points) {
    score += points;
}