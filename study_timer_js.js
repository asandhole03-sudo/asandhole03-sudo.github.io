// Timer state variables
let timerInterval = null;
let timeRemaining = 1500; // 25 minutes in seconds
let isRunning = false;

// Session durations in seconds
const SESSION_DURATIONS = {
    study: 1500,   // 25 minutes
    short: 300,    // 5 minutes
    long: 900      // 15 minutes
};

// Array to store completed sessions
let completedSessions = [];


// DOM ELEMENT REFERENCES


const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const taskInput = document.getElementById('taskInput');
const sessionRadios = document.querySelectorAll('input[name="session"]');
const logContainer = document.getElementById('logContainer');
const sessionCountDisplay = document.getElementById('sessionCount');
const totalTimeDisplay = document.getElementById('totalTime');
const clearLogBtn = document.getElementById('clearLogBtn');


// FUNCTION: FORMAT TIME


/**
 * Converts seconds into MM:SS format
 * @param {number} seconds - Total seconds to convert
 * @returns {string} Formatted time string (MM:SS)
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}


// FUNCTION: GET SELECTED SESSION TYPE 


/**
 * Gets the currently selected session type from radio buttons
 * @returns {string} The selected session type ('study', 'short', or 'long')
 */
function getSelectedSessionType() {
    let selectedType = 'study'; // default
    sessionRadios.forEach(radio => {
        if (radio.checked) {
            selectedType = radio.value;
        }
    });
    return selectedType;
}


// FUNCTION: UPDATE TIMER DISPLAY 


/**
 * Updates the timer display on the page
 * Uses conditional logic to change color based on time remaining
 */
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeRemaining);
    
    // Conditional: Change color when time is running low
    if (timeRemaining <= 60 && timeRemaining > 0) {
        timerDisplay.style.color = '#ff5f56'; // Red for last minute
    } else if (timeRemaining === 0) {
        timerDisplay.style.color = '#ffc107'; // Yellow when done
    } else {
        timerDisplay.style.color = 'white'; // Normal color
    }
}


// FUNCTION: START TIMER 


/**
 * Starts or resumes the countdown timer
 */
function startTimer() {
    if (isRunning) return; // Prevent multiple intervals
    
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    // Disable session type selection while running
    sessionRadios.forEach(radio => {
        radio.disabled = true;
    });
    
    // Timer interval - decrements every second
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        // Conditional: Check if timer reached zero
        if (timeRemaining <= 0) {
            completeSession();
        }
    }, 1000);
}


// FUNCTION: PAUSE TIMER 


/**
 * Pauses the running timer
 */
function pauseTimer() {
    if (!isRunning) return;
    
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}


// FUNCTION: RESET TIMER 


/**
 * Resets the timer to the selected session duration
 */
function resetTimer() {
    pauseTimer();
    
    const sessionType = getSelectedSessionType();
    timeRemaining = SESSION_DURATIONS[sessionType];
    updateTimerDisplay();
    
    // Re-enable session selection
    sessionRadios.forEach(radio => {
        radio.disabled = false;
    });
}


// FUNCTION: COMPLETE SESSION 


/**
 * Handles session completion - plays alert, logs session, resets
 */
function completeSession() {
    pauseTimer();
    alert('Session Complete! Great work!');
    
    // Create session object to store in array
    const sessionType = getSelectedSessionType();
    const task = taskInput.value.trim() || 'No task specified';
    const currentTime = new Date();
    
    const sessionData = {
        type: sessionType,
        task: task,
        time: currentTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        }),
        duration: SESSION_DURATIONS[sessionType] / 60 // in minutes
    };
    
    // Add to sessions array
    completedSessions.push(sessionData);
    
    // Update displays
    addSessionToLog(sessionData);
    updateStatistics();
    
    // Reset for next session
    resetTimer();
    taskInput.value = '';
}


// FUNCTION: ADD SESSION TO LOG (NO RETURN VALUE)


/**
 * Adds a completed session to the visual log
 * DOM Manipulation: Creates and adds new elements
 * @param {object} session - Session data object
 */
function addSessionToLog(session) {
    // Remove empty message if it exists
    const emptyMessage = logContainer.querySelector('.empty-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Create log entry elements
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const icon = document.createElement('div');
    icon.className = `log-icon ${session.type}`;
    
    const content = document.createElement('div');
    content.className = 'log-content';
    
    const typeSpan = document.createElement('span');
    typeSpan.className = 'log-type';
    
    // Conditional: Set display text based on session type
    if (session.type === 'study') {
        typeSpan.textContent = 'Study Session';
    } else if (session.type === 'short') {
        typeSpan.textContent = 'Short Break';
    } else {
        typeSpan.textContent = 'Long Break';
    }
    
    const taskSpan = document.createElement('span');
    taskSpan.className = 'log-task';
    taskSpan.textContent = ` - ${session.task}`;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = session.time;
    
    // Assemble the elements
    content.appendChild(typeSpan);
    content.appendChild(taskSpan);
    logEntry.appendChild(icon);
    logEntry.appendChild(content);
    logEntry.appendChild(timeSpan);
    
    // Add to container at the top
    logContainer.insertBefore(logEntry, logContainer.firstChild);
}


// FUNCTION: UPDATE STATISTICS (NO RETURN VALUE)


/**
 * Updates the statistics display
 * Uses array methods to calculate totals
 */
function updateStatistics() {
    // Total session count
    sessionCountDisplay.textContent = completedSessions.length;
    
    // Calculate total focus time (only study sessions)
    // Using array filter and reduce methods
    const totalMinutes = completedSessions
        .filter(session => session.type === 'study')
        .reduce((total, session) => total + session.duration, 0);
    
    totalTimeDisplay.textContent = `${totalMinutes} min`;
}


// FUNCTION: CLEAR ALL SESSIONS


/**
 * Clears all completed sessions after confirmation
 */
function clearAllSessions() {
    // Conditional: Confirm before clearing
    if (completedSessions.length === 0) {
        alert('No sessions to clear!');
        return;
    }
    
    const confirmed = confirm('Are you sure you want to clear all sessions?');
    if (confirmed) {
        completedSessions = []; // Reset array
        logContainer.innerHTML = '<p class="empty-message">No sessions completed yet. Start your first session!</p>';
        updateStatistics();
    }
}


// FUNCTION: HANDLE SESSION TYPE CHANGE


/**
 * Updates timer when user changes session type
 */
function handleSessionTypeChange() {
    if (!isRunning) {
        const sessionType = getSelectedSessionType();
        timeRemaining = SESSION_DURATIONS[sessionType];
        updateTimerDisplay();
    }
}


// EVENT LISTENERS 

// Button click events
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
clearLogBtn.addEventListener('click', clearAllSessions);

// Radio button change events
sessionRadios.forEach(radio => {
    radio.addEventListener('change', handleSessionTypeChange);
});

// Text input event
taskInput.addEventListener('input', function() {
    // Optional: Could add character counter or validation here
});



// Set initial timer display on page load
updateTimerDisplay();