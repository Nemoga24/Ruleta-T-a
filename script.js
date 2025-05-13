const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spin-button');
const segments = document.querySelectorAll('.segment'); // Get all segment divs dynamically

// Get Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const taskModal = document.getElementById('task-modal');
const modalTaskInstruction = document.getElementById('modal-task-instruction');
const modalTaskPrompt = document.getElementById('modal-task-prompt');
const closeModalButton = document.getElementById('close-modal-button');
const spinAgainButton = document.getElementById('spin-again-button');

// --- Sound Effect ---
// ***** VERIFICA ESTE NOMBRE Y QUE EL ARCHIVO ESTÉ EN LA MISMA CARPETA *****
const soundFileName = 'spin-sound.mp3'; // <--- CAMBIA ESTO SI TU ARCHIVO SE LLAMA DIFERENTE
let spinSound;
try {
    spinSound = new Audio(soundFileName);
    spinSound.preload = 'auto'; // Hint to browser to load the file
    spinSound.loop = true;      // Repeat the sound during spin
    spinSound.volume = 0.6;     // Adjust volume (0.0 to 1.0)
    console.log(`Audio object created successfully for: ${soundFileName}`); // Log success
} catch (error) {
    console.error(`Error creating Audio object for ${soundFileName}:`, error);
    // Create a dummy object so the rest of the code doesn't break if sound fails
    spinSound = {
        play: () => { console.error("Dummy sound object: cannot play."); return Promise.reject("Dummy object"); },
        pause: () => { console.error("Dummy sound object: cannot pause."); },
        currentTime: 0
    };
}
// --- End Sound Effect ---

const numSegments = segments.length; // Automatically detect number of segments (should be 9)
const segmentAngle = 360 / numSegments;
let currentRotation = 0;
let isSpinning = false;

// --- Task Data ---
// Includes the full list of tasks (ensure you have this part from previous responses)
const tasks = {
    to_be_pres_positive: [
        { instruction: "Make a positive sentence (Present 'to be'):", prompt: "John / a doctor" },
        { instruction: "Make a positive sentence (Present 'to be'):", prompt: "The children / happy" },
        { instruction: "Make a positive sentence (Present 'to be'):", prompt: "Maria / tired" },
        { instruction: "Make a positive sentence (Present 'to be'):", prompt: "The weather / nice today" },
        { instruction: "Make a positive sentence (Present 'to be'):", prompt: "My cat / black and white" },
        { instruction: "Make a positive sentence (Present 'to be'):", prompt: "These books / interesting" },
        { instruction: "Make a positive sentence (Present 'to be'):", prompt: "The restaurant / open" },
        { instruction: "Make a positive sentence (Present 'to be'):", prompt: "My computer / new" },
    ],
    to_be_pres_negative: [
        { instruction: "Make this sentence negative (Present 'to be'):", prompt: "Sarah is hungry." },
        { instruction: "Make this sentence negative (Present 'to be'):", prompt: "David and Lisa are students." },
        { instruction: "Make this sentence negative (Present 'to be'):", prompt: "The weather is cold outside." },
        { instruction: "Make this sentence negative (Present 'to be'):", prompt: "My brother is tall." },
        { instruction: "Make this sentence negative (Present 'to be'):", prompt: "The shops are open." },
        { instruction: "Make this sentence negative (Present 'to be'):", prompt: "This exercise is difficult." },
        { instruction: "Make this sentence negative (Present 'to be'):", prompt: "His parents are teachers." },
    ],
    to_be_pres_question: [
        { instruction: "Ask a question (Present 'to be'):", prompt: "Carlos / from Spain?" },
        { instruction: "Ask a question (Present 'to be'):", prompt: "The team / ready?" },
        { instruction: "Ask a question (Present 'to be'):", prompt: "This book / expensive?" },
        { instruction: "Ask a question (Present 'to be'):", prompt: "Why / the girl / sad?" },
        { instruction: "Ask a question (Present 'to be'):", prompt: "Where / the keys?" },
        { instruction: "Ask a question (Present 'to be'):", prompt: "The museum / open on Sundays?" },
        { instruction: "Ask a question (Present 'to be'):", prompt: "What time / the meeting?" },
    ],
    pres_simple_positive: [
        { instruction: "Make a positive sentence (Present Simple Routine):", prompt: "Anna / play / tennis on Saturdays" },
        { instruction: "Make a positive sentence (Present Simple Routine):", prompt: "My father / drink / coffee every morning" },
        { instruction: "Make a positive sentence (Present Simple Routine):", prompt: "My friends / live / in London" },
        { instruction: "Make a positive sentence (Present Simple Routine):", prompt: "The man / work / hard" },
        { instruction: "Make a positive sentence (Present Simple Routine):", prompt: "The sun / rise / in the east" },
        { instruction: "Make a positive sentence (Present Simple Routine):", prompt: "Birds / sing / in the morning" },
        { instruction: "Make a positive sentence (Present Simple Routine):", prompt: "My sister / study / French at university" },
        { instruction: "Make a positive sentence (Present Simple Routine):", prompt: "The train / leave / at 8 AM" },
    ],
    pres_simple_negative: [
        { instruction: "Make this sentence negative (Present Simple):", prompt: "Peter likes fish." },
        { instruction: "Make this sentence negative (Present Simple):", prompt: "The students go to the cinema often." },
        { instruction: "Make this sentence negative (Present Simple):", prompt: "My aunt speaks French." },
        { instruction: "Make this sentence negative (Present Simple):", prompt: "The boy understands the question." },
        { instruction: "Make this sentence negative (Present Simple):", prompt: "This shop sells newspapers." },
        { instruction: "Make this sentence negative (Present Simple):", prompt: "My parents watch TV in the evening." },
        { instruction: "Make this sentence negative (Present Simple):", prompt: "The dog barks at strangers." },
    ],
     pres_simple_wh: [
        { instruction: "Ask a WH-question (Present Simple):", prompt: "David lives in ______? (Where)" },
        { instruction: "Ask a WH-question (Present Simple):", prompt: "The baby gets up at ______? (What time)" },
        { instruction: "Ask a WH-question (Present Simple):", prompt: "The pupils study English ______? (Why)" },
        { instruction: "Ask a WH-question (Present Simple):", prompt: "Your brother plays ______ on weekends? (What)" },
        { instruction: "Ask a WH-question (Present Simple):", prompt: "Mr. Jones teaches ______? (What subject)" },
        { instruction: "Ask a WH-question (Present Simple):", prompt: "The shop closes at ______? (What time)" },
        { instruction: "Ask a WH-question (Present Simple):", prompt: "How often / your friend / visit?" },
    ],
    pres_cont_positive: [
        { instruction: "Make a positive sentence (Present Continuous - Now):", prompt: "Tom / watch / TV (now)" },
        { instruction: "Make a positive sentence (Present Continuous - Now):", prompt: "The boys / play / football (at the moment)" },
        { instruction: "Make a positive sentence (Present Continuous - Now):", prompt: "My mother / read / a book" },
        { instruction: "Make a positive sentence (Present Continuous - Now):", prompt: "The phone / ring" },
        { instruction: "Make a positive sentence (Present Continuous - Now):", prompt: "Rain / fall / outside" },
        { instruction: "Make a positive sentence (Present Continuous - Now):", prompt: "Someone / knock / at the door" },
        { instruction: "Make a positive sentence (Present Continuous - Now):", prompt: "The chef / cook / dinner" },
    ],
    pres_cont_negative: [
        { instruction: "Make this sentence negative (Present Continuous):", prompt: "The cat is sleeping." },
        { instruction: "Make this sentence negative (Present Continuous):", prompt: "The family is eating lunch." },
        { instruction: "Make this sentence negative (Present Continuous):", prompt: "Mr. Smith is working today." },
        { instruction: "Make this sentence negative (Present Continuous):", prompt: "Sarah is listening to music." },
        { instruction: "Make this sentence negative (Present Continuous):", prompt: "The children are shouting." },
        { instruction: "Make this sentence negative (Present Continuous):", prompt: "My sister is using the computer." },
        { instruction: "Make this sentence negative (Present Continuous):", prompt: "The water is boiling." },
    ],
    pres_cont_question: [
        { instruction: "Ask a question (Present Continuous):", prompt: "What / your friend / doing?" },
        { instruction: "Ask a question (Present Continuous):", prompt: "Why / the man / laughing?" },
        { instruction: "Ask a question (Present Continuous):", prompt: "Where / the tourists / going?" },
        { instruction: "Ask a question (Present Continuous):", prompt: "the baby / crying?" },
        { instruction: "Ask a question (Present Continuous):", prompt: "What / the dog / eating?" },
        { instruction: "Ask a question (Present Continuous):", prompt: "Who / playing / the piano?" },
        { instruction: "Ask a question (Present Continuous):", prompt: "your father / working / now?" },
    ],
    to_be_past_positive: [
        { instruction: "Make a positive sentence (Past 'to be'):", prompt: "They / at the party last night" },
        { instruction: "Make a positive sentence (Past 'to be'):", prompt: "I / tired yesterday" },
        { instruction: "Make a positive sentence (Past 'to be'):", prompt: "The weather / cold last week" },
        { instruction: "Make a positive sentence (Past 'to be'):", prompt: "My friends / in London in 2020" },
        { instruction: "Make a positive sentence (Past 'to be'):", prompt: "The restaurant / open on Sunday" },
        { instruction: "Make a positive sentence (Past 'to be'):", prompt: "She / happy with her results" },
        { instruction: "Make a positive sentence (Past 'to be'):", prompt: "The books / on the table" },
    ],
    to_be_past_negative: [
        { instruction: "Make this sentence negative (Past 'to be'):", prompt: "He was at home." },
        { instruction: "Make this sentence negative (Past 'to be'):", prompt: "They were tired." },
        { instruction: "Make this sentence negative (Past 'to be'):", prompt: "The shops were open." },
        { instruction: "Make this sentence negative (Past 'to be'):", prompt: "The weather was nice." },
        { instruction: "Make this sentence negative (Past 'to be'):", prompt: "My parents were teachers." },
        { instruction: "Make this sentence negative (Past 'to be'):", prompt: "The cat was hungry." },
    ],
    to_be_past_question: [
        { instruction: "Ask a question (Past 'to be'):", prompt: "you / at the meeting yesterday?" },
        { instruction: "Ask a question (Past 'to be'):", prompt: "the children / at school last Monday?" },
        { instruction: "Ask a question (Past 'to be'):", prompt: "Where / your parents / last night?" },
        { instruction: "Ask a question (Past 'to be'):", prompt: "Why / she / sad yesterday?" },
        { instruction: "Ask a question (Past 'to be'):", prompt: "Who / absent / last class?" },
    ],
    past_cont_positive: [
        { instruction: "Make a positive sentence (Past Continuous):", prompt: "They / play / football (yesterday at 5pm)" },
        { instruction: "Make a positive sentence (Past Continuous):", prompt: "I / read / a book (last night)" },
        { instruction: "Make a positive sentence (Past Continuous):", prompt: "She / cook / dinner (when I arrived)" },
        { instruction: "Make a positive sentence (Past Continuous):", prompt: "The children / watch / TV (all evening)" },
        { instruction: "Make a positive sentence (Past Continuous):", prompt: "It / rain / when we left" },
    ],
    past_cont_negative: [
        { instruction: "Make this sentence negative (Past Continuous):", prompt: "He was sleeping." },
        { instruction: "Make this sentence negative (Past Continuous):", prompt: "They were playing outside." },
        { instruction: "Make this sentence negative (Past Continuous):", prompt: "She was working." },
        { instruction: "Make this sentence negative (Past Continuous):", prompt: "The dog was barking." },
        { instruction: "Make this sentence negative (Past Continuous):", prompt: "We were studying." },
    ],
    past_cont_question: [
        { instruction: "Ask a question (Past Continuous):", prompt: "What / you / do / at 8pm last night?" },
        { instruction: "Ask a question (Past Continuous):", prompt: "Who / she / talk to / when you saw her?" },
        { instruction: "Ask a question (Past Continuous):", prompt: "Where / they / go / when it started to rain?" },
        { instruction: "Ask a question (Past Continuous):", prompt: "the baby / sleep / when you arrived?" },
    ],
    future_cont_positive: [
        { instruction: "Make a positive sentence (Future Continuous):", prompt: "I / travel / to Paris (this time next week)" },
        { instruction: "Make a positive sentence (Future Continuous):", prompt: "She / work / at 10am tomorrow" },
        { instruction: "Make a positive sentence (Future Continuous):", prompt: "They / study / for the exam (all night)" },
        { instruction: "Make a positive sentence (Future Continuous):", prompt: "We / have / dinner (at 8pm)" },
    ],
    future_cont_negative: [
        { instruction: "Make this sentence negative (Future Continuous):", prompt: "He will be sleeping." },
        { instruction: "Make this sentence negative (Future Continuous):", prompt: "They will be working." },
        { instruction: "Make this sentence negative (Future Continuous):", prompt: "She will be driving." },
        { instruction: "Make this sentence negative (Future Continuous):", prompt: "We will be studying." },
    ],
    future_cont_question: [
        { instruction: "Ask a question (Future Continuous):", prompt: "What / you / do / at 7pm tomorrow?" },
        { instruction: "Ask a question (Future Continuous):", prompt: "Who / she / meet / at the party?" },
        { instruction: "Ask a question (Future Continuous):", prompt: "Where / they / stay / during the trip?" },
        { instruction: "Ask a question (Future Continuous):", prompt: "you / use / the car / tonight?" },
    ],
};


// --- Function to Show Modal ---
function showModal() {
    modalOverlay.classList.add('visible');
    taskModal.classList.add('visible');
    // Optional: Disable main spin button while modal is visible
    spinButton.disabled = true;
}

// --- Function to Hide Modal ---
function hideModal() {
    modalOverlay.classList.remove('visible');
    taskModal.classList.remove('visible');
    // Re-enable main spin button if it's not currently spinning
    if (!isSpinning) {
         spinButton.disabled = false;
    }
}

// --- Event Listener for Spin Button ---
spinButton.addEventListener('click', () => {
    // Don't spin if already spinning OR if the sound object failed to initialize
    if (isSpinning || !spinSound) return;

    isSpinning = true;
    spinButton.disabled = true; // Disable while spinning

    // --- Play Sound ---
    console.log("Attempting to play sound..."); // Log attempt
    const playPromise = spinSound.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log("Sound playback started successfully."); // Log success
        }).catch(error => {
            console.error("Error playing sound:", error); // Log specific error
            // Optionally alert the user if sound fails to play
            // alert("Could not play sound effect. Please check browser permissions or file path.");
        });
    }
    // ------------------

    // Clear previous task in modal just in case
    modalTaskInstruction.textContent = "";
    modalTaskPrompt.textContent = "";

    // Calculate random rotation
    const randomDegrees = Math.floor(Math.random() * 360);
    // More spins for better effect with sound
    const totalRotation = currentRotation + (8 * 360) + randomDegrees;
    currentRotation = totalRotation;

    wheel.style.transform = `rotate(${totalRotation}deg)`;

    // Wait for the animation to finish (should match CSS transition duration)
    const spinDuration = 3000; // Duration in milliseconds (must match CSS)
    setTimeout(() => {
        isSpinning = false;

        // --- Stop Sound ---
        console.log("Attempting to pause sound..."); // Log attempt
        spinSound.pause();
        spinSound.currentTime = 0; // Reset sound for next play
        console.log("Sound paused and reset."); // Log success
        // ------------------

        // Determine the winning segment
        const finalAngle = totalRotation % 360;
        // Adjust for the pointer being at the top (0 degrees / 12 o'clock position)
        // Add half a segment angle to avoid landing exactly on the line
        const adjustedAngle = (360 - finalAngle + (segmentAngle / 2)) % 360;
        const winningSegmentIndex = Math.floor(adjustedAngle / segmentAngle);

        // Ensure index is safe (in case of calculation glitches)
        const safeIndex = winningSegmentIndex % numSegments;
        const winningSegment = segments[safeIndex];

        if (winningSegment) {
             const taskType = winningSegment.getAttribute('data-task-type');
             displayTaskInModal(taskType); // Display task in modal
             showModal(); // Show the modal
        } else {
             // Handle error if segment calculation fails
             alert("Error determining wheel segment. Please spin again.");
             console.error(`Could not find segment at calculated index: ${safeIndex}`);
             spinButton.disabled = false; // Re-enable button on error
             // Ensure sound stops even on error
             spinSound.pause();
             spinSound.currentTime = 0;
        }

    }, spinDuration); // Match the CSS transition duration
});

// --- Function to Display Task in Modal ---
function displayTaskInModal(taskType) {
    // Mapeo de segmentos a múltiples categorías
    const taskTypeMap = {
        to_be_pres_positive: ["to_be_pres_positive", "to_be_past_positive"],
        to_be_pres_negative: ["to_be_pres_negative", "to_be_past_negative"],
        to_be_pres_question: ["to_be_pres_question", "to_be_past_question"],
        pres_simple_positive: ["pres_simple_positive"],
        pres_simple_negative: ["pres_simple_negative"],
        pres_simple_wh: ["pres_simple_wh"],
        pres_cont_positive: ["pres_cont_positive", "past_cont_positive", "future_cont_positive"],
        pres_cont_negative: ["pres_cont_negative", "past_cont_negative", "future_cont_negative"],
        pres_cont_question: ["pres_cont_question", "past_cont_question", "future_cont_question"],
    };
    // Obtener todas las tareas posibles para el segmento
    let allTasks = [];
    if (taskTypeMap[taskType]) {
        taskTypeMap[taskType].forEach(type => {
            if (tasks[type]) allTasks = allTasks.concat(tasks[type]);
        });
    }
    if (allTasks.length > 0) {
        const randomIndex = Math.floor(Math.random() * allTasks.length);
        const selectedTask = allTasks[randomIndex];
        modalTaskInstruction.textContent = selectedTask.instruction;
        modalTaskPrompt.textContent = selectedTask.prompt;
    } else {
        // Fallback if task type not found or empty
        modalTaskInstruction.textContent = "Oops!";
        modalTaskPrompt.textContent = `No tasks defined for type: ${taskType}.`;
        console.error(`Task type "${taskType}" not found or has no tasks defined.`);
    }
}

// --- Event Listeners for Modal Buttons ---
closeModalButton.addEventListener('click', hideModal);
spinAgainButton.addEventListener('click', () => {
    hideModal();
    // Use a short delay to allow modal to hide visually before starting next spin
    setTimeout(() => {
        spinButton.click(); // Trigger the main spin button programmatically
    }, 150); // Adjust delay if needed
});

// --- Close modal if overlay is clicked ---
modalOverlay.addEventListener('click', hideModal);

// --- Initial State ---
// No initial text display needed as it's handled by the modal now.
console.log("Spin & Speak game initialized."); // Log initialization