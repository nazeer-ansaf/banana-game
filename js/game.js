// game.js

let score = 0;
let correctAnswer = null;

export function setCorrectAnswer(answer) {
    correctAnswer = answer;
}

export function checkAnswer(userAnswer) {
    if (parseInt(userAnswer) === parseInt(correctAnswer)) {
        score++;
        return true;
    }
    return false;
}

export function getScore() {
    return score;
}
