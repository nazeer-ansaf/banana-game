import { fetchPuzzle } from './api.js';
import { setCorrectAnswer, checkAnswer, getScore } from './game.js';

const puzzleImage = document.getElementById("puzzle-image");
const submitBtn = document.getElementById("submit-btn");
const answerInput = document.getElementById("answer-input");
const scoreDisplay = document.getElementById("score");
const resultDisplay = document.getElementById("result");

async function loadPuzzle() {
    const data = await fetchPuzzle();

    if (data) {
        puzzleImage.src = data.question;
        setCorrectAnswer(data.solution);
    }
}

submitBtn.addEventListener("click", async () => {
    const userAnswer = answerInput.value;

    if (checkAnswer(userAnswer)) {
        resultDisplay.innerText = "Correct!";
        scoreDisplay.innerText = getScore();
        await loadPuzzle(); // Load new puzzle
    } else {
        resultDisplay.innerText = "Wrong! Try again.";
    }

    answerInput.value = "";
});

loadPuzzle();
