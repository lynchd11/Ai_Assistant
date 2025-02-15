import { createClient } from '@supabase/supabase-js';

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

const supabaseUrl = 'https://zcivqzpxniqndgmnqpxr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaXZxenB4bmlxbmRnbW5xcHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1Njk2MjAsImV4cCI6MjA1NTE0NTYyMH0.TCC1V61lSO10ot7zAbTyAlzlfK3nZxPL-6D7l_QVDk0';
const supabase = createClient(supabaseUrl, supabaseKey);

function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return;

    displayMessage(userInput, 'user');
    document.getElementById('user-input').value = '';
    getResponse(userInput);
}

function displayMessage(message, sender) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function getResponse(userInput) {
    await supabase
        .from('messages')
        .insert([{ message: userInput, sender: 'user' }]);

    const { data } = await supabase
        .from('responses')
        .select('message')
        .eq('input', userInput)
        .single();

    const response = data ? data.message : `You said: ${userInput}`;
    displayMessage(response, 'bot');

    const utterance = new SpeechSynthesisUtterance(response);
    speechSynthesis.speak(utterance);
}

// Speech recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

document.getElementById('user-input').addEventListener('dblclick', () => {
    recognition.start();
});

recognition.addEventListener('result', (event) => {
    const userInput = event.results[0][0].transcript;
    document.getElementById('user-input').value = userInput;
    sendMessage();
});

recognition.addEventListener('speechend', () => {
    recognition.stop();
});

recognition.addEventListener('error', (event) => {
    console.error('Speech recognition error', event.error);
});
