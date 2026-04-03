let score = 0;
let correctAnswer = null;
let streak = 0;
let longestStreak = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let basePoints = 5;
let scoreMultiplier = 1;

export function setCorrectAnswer(answer) {
    correctAnswer = parseInt(answer, 10);
}

export function setScoringProfile({ points = 5, multiplier = 1 } = {}) {
    basePoints = points;
    scoreMultiplier = multiplier;
}

export function checkAnswer(userAnswer) {
    if (parseInt(userAnswer, 10) === correctAnswer) {
        const pointsAwarded = Math.round(basePoints * scoreMultiplier);
        score += pointsAwarded;
        streak += 1;
        correctAnswers += 1;
        longestStreak = Math.max(longestStreak, streak);
        return true;
    }

    streak = 0;
    wrongAnswers += 1;
    return false;
}

export function getScore() {
    return score;
}

export function getCurrentStreak() {
    return streak;
}

export function getRunStats() {
    return {
        score,
        correctAnswers,
        wrongAnswers,
        longestStreak
    };
}

export function resetScore() {
    score = 0;
    streak = 0;
    longestStreak = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    basePoints = 5;
    scoreMultiplier = 1;
}
