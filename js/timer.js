// Timer functions

let timerInterval = null;
let timeLeft = 60;
let onTimeUpCallback = null;

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

export function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

export function resetTimer(duration) {
    stopTimer();
    timeLeft = duration;
    updateTimerDisplay();
}

export function getTimeLeft() {
    return timeLeft;
}

function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    if (timerElement) {
        timerElement.textContent = timeLeft + "s";
        
        if (timeLeft <= 10) {
            timerElement.classList.add("urgent");
        } else {
            timerElement.classList.remove("urgent");
        }
    }
}