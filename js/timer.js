// timer.js
let timerInterval = null;
let timeLeft = 60;
let onTimeUpCallback = null;

// -------------------------
// Start timer with duration and callback
// -------------------------
export function startTimer(duration, onTimeUp) {
    stopTimer();
    
    timeLeft = duration;
    onTimeUpCallback = onTimeUp;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            stopTimer();
            if (onTimeUpCallback) onTimeUpCallback();
        }
    }, 1000);
}

// -------------------------
// Stop timer
// -------------------------
export function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// -------------------------
// Reset timer to a duration
// -------------------------
export function resetTimer(duration) {
    stopTimer();
    timeLeft = duration;
    updateTimerDisplay();
}

// -------------------------
// Get remaining time
// -------------------------
export function getTimeLeft() {
    return timeLeft;
}

// -------------------------
// Update timer display in UI
// -------------------------
function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    if (timerElement) {
        timerElement.textContent = timeLeft + "s";

        if (timeLeft <= 10) {
            timerElement.classList.add("urgent"); // e.g., red color via CSS
        } else {
            timerElement.classList.remove("urgent");
        }
    }
}