// timer.js – Countdown timer for each puzzle

let timerDuration = 60; // seconds per puzzle
let timeLeft = timerDuration;
let timerInterval = null;

// DOM Element
const timerDisplay = document.getElementById("timer");

// -------------------------
// Start the timer
// -------------------------
export function startTimer(duration = timerDuration, onTimeUp = null) {
    stopTimer(); // ensure any existing timer is cleared

    timeLeft = duration;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            stopTimer();
            if (onTimeUp) onTimeUp(); // callback when time is up
        }
    }, 1000);
}

// -------------------------
// Stop the timer
// -------------------------
export function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// -------------------------
// Reset the timer
// -------------------------
export function resetTimer(duration = timerDuration) {
    stopTimer();
    timeLeft = duration;
    updateTimerDisplay();
}

// -------------------------
// Update timer UI
// -------------------------
function updateTimerDisplay() {
    if (timerDisplay) {
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 10) {
            timerDisplay.style.color = "#e63946"; // red warning
        } else {
            timerDisplay.style.color = "#2a9d8f"; // normal color
        }
    }
}

// -------------------------
// Get remaining time
// -------------------------
export function getTimeLeft() {
    return timeLeft;
}
