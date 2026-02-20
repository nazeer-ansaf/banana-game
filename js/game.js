// Game logic

let score = 0;
let correctAnswer = null;
let currentLevel = 1;
let streak = 0;
let currentDifficulty = "easy";

export function setCorrectAnswer(answer, difficulty = "easy") {
    correctAnswer = answer;
    currentDifficulty = difficulty;
}

export function checkAnswer(userAnswer) {
    if (userAnswer.toString() === correctAnswer.toString()) {
        let points = currentDifficulty === "easy" ? 10 : 
                     currentDifficulty === "medium" ? 15 : 20;
        score += points;
        streak++;
        
        if (streak >= 3 && currentDifficulty !== "hard") {
            advanceDifficulty();
            streak = 0;
        }
        
        return true;
    } else {
        streak = 0;
        return false;
    }
}

export function advanceDifficulty() {
    if (currentDifficulty === "easy") currentDifficulty = "medium";
    else if (currentDifficulty === "medium") currentDifficulty = "hard";
}

export function getDifficulty() {
    return currentDifficulty;
}

export function getScore() {
    return score;
}

export function resetScore() {
    score = 0;
    currentLevel = 1;
    streak = 0;
    currentDifficulty = "easy";
}

export function getLevel() {
    return Math.floor(score / 50) + 1;
}