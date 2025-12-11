/**
 * Candidate Assessment JavaScript
 * Handles dynamic question generation and form submission
 */

let token = '';
let candidateID = '';
let timeRemaining = 900; // 15 minutes in seconds
let timerInterval;
let generatedQuestions = [];

// Initialize assessment
document.addEventListener('DOMContentLoaded', async function() {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token');
    
    if (!token) {
        showError('Invalid assessment link');
        return;
    }
    
    // Validate token
    await validateAssessmentToken();
    
    // Generate random questions
    generateRandomQuestions();
    
    // Start timer
    startTimer();
    
    // Handle form submission
    document.getElementById('candidateForm').addEventListener('submit', handleFormSubmit);
});

// Validate assessment token
async function validateAssessmentToken() {
    try {
        const result = await apiCall('validateToken', { token: token });
        
        // Since we're using no-cors, we'll assume success
        // In production, you would check the actual response
        candidateID = 'CANDIDATE_' + Date.now();
        
    } catch (error) {
        console.error('Token validation error:', error);
        showError('Invalid or expired assessment link');
    }
}

// Generate random mathematical questions
function generateRandomQuestions() {
    const questionTypes = [
        'percentage',
        'fraction',
        'conversion',
        'basic_math'
    ];
    
    // Generate 4 random questions
    for (let i = 0; i < 4; i++) {
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const question = generateQuestion(type);
        generatedQuestions.push(question);
        
        // Display question
        document.getElementById(`question${i + 4}Text`).textContent = question.text;
    }
}

// Generate question based on type
function generateQuestion(type) {
    let question = {};
    
    switch(type) {
        case 'percentage':
            const percentage = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100, 120][Math.floor(Math.random() * 13)];
            const number1 = [50, 100, 150, 200, 250, 300, 400, 500][Math.floor(Math.random() * 8)];
            question = {
                type: 'percentage',
                text: `What is ${percentage}% of ${number1}?`,
                answer: (percentage * number1) / 100
            };
            break;
            
        case 'fraction':
            const fractions = [
                { name: 'half', value: 0.5 },
                { name: 'one third', value: 1/3 },
                { name: 'one fourth', value: 0.25 },
                { name: 'three fourths', value: 0.75 },
                { name: 'one fifth', value: 0.2 }
            ];
            const fraction = fractions[Math.floor(Math.random() * fractions.length)];
            const number2 = [100, 120, 150, 200, 240, 300, 360, 400][Math.floor(Math.random() * 8)];
            question = {
                type: 'fraction',
                text: `What is ${fraction.name} of ${number2}?`,
                answer: number2 * fraction.value
            };
            break;
            
        case 'conversion':
            const conversions = [
                { from: 'm', to: 'cm', multiplier: 100, question: 'Convert {num} meters into centimeters' },
                { from: 'km', to: 'm', multiplier: 1000, question: 'Convert {num} kilometers into meters' },
                { from: 'kg', to: 'g', multiplier: 1000, question: 'Convert {num} kilograms into grams' },
                { from: 'hour', to: 'minutes', multiplier: 60, question: 'Convert {num} hours into minutes' },
                { from: 'hour', to: 'seconds', multiplier: 3600, question: 'Convert {num} hours into seconds' }
            ];
            const conversion = conversions[Math.floor(Math.random() * conversions.length)];
            const number3 = [2, 3, 4, 5, 6, 7, 8, 9, 10][Math.floor(Math.random() * 9)];
            question = {
                type: 'conversion',
                text: conversion.question.replace('{num}', number3),
                answer: number3 * conversion.multiplier
            };
            break;
            
        case 'basic_math':
            const operations = [
                { op: 'add', symbol: '+', text: 'What is {a} + {b}?' },
                { op: 'subtract', symbol: '-', text: 'What is {a} - {b}?' },
                { op: 'multiply', symbol: '×', text: 'What is {a} × {b}?' },
                { op: 'divide', symbol: '÷', text: 'What is {a} ÷ {b}?' }
            ];
            const operation = operations[Math.floor(Math.random() * operations.length)];
            let a, b, answer;
            
            switch(operation.op) {
                case 'add':
                    a = Math.floor(Math.random() * 90) + 10;
                    b = Math.floor(Math.random() * 90) + 10;
                    answer = a + b;
                    break;
                case 'subtract':
                    a = Math.floor(Math.random() * 90) + 50;
                    b = Math.floor(Math.random() * (a - 10));
                    answer = a - b;
                    break;
                case 'multiply':
                    a = Math.floor(Math.random() * 20) + 5;
                    b = Math.floor(Math.random() * 15) + 2;
                    answer = a * b;
                    break;
                case 'divide':
                    b = [2, 3, 4, 5, 6, 8, 9, 10][Math.floor(Math.random() * 8)];
                    answer = Math.floor(Math.random() * 20) + 5;
                    a = b * answer;
                    break;
            }
            
            question = {
                type: 'basic_math',
                text: operation.text.replace('{a}', a).replace('{b}', b),
                answer: answer
            };
            break;
    }
    
    return question;
}

// Start countdown timer
function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            autoSubmitForm();
        }
        
        // Warning at 5 minutes
        if (timeRemaining === 300) {
            showToast('Only 5 minutes remaining!', 'warning');
        }
        
        // Warning at 1 minute
        if (timeRemaining === 60) {
            showToast('Only 1 minute remaining!', 'error');
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timeDisplay').textContent = display;
    
    // Change color when time is running out
    const timerElement = document.getElementById('timer');
    if (timeRemaining < 60) {
        timerElement.style.color = 'var(--error-color)';
    } else if (timeRemaining < 300) {
        timerElement.style.color = 'var(--warning-color)';
    }
}

// Auto-submit form when time expires
function autoSubmitForm() {
    showToast('Time expired! Auto-submitting your assessment...', 'warning');
    setTimeout(() => {
        document.getElementById('candidateForm').dispatchEvent(new Event('submit'));
    }, 2000);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Stop timer
    clearInterval(timerInterval);
    
    // Collect form data
    const formData = {
        token: token,
        candidateID: candidateID,
        fullName: document.getElementById('fullName').value.trim(),
        jobPost: document.getElementById('jobPost').value.trim(),
        source: document.getElementById('source').value,
        answers: [
            {
                question: generatedQuestions[0].text,
                answer: document.getElementById('answer4').value.trim(),
                correctAnswer: generatedQuestions[0].answer
            },
            {
                question: generatedQuestions[1].text,
                answer: document.getElementById('answer5').value.trim(),
                correctAnswer: generatedQuestions[1].answer
            },
            {
                question: generatedQuestions[2].text,
                answer: document.getElementById('answer6').value.trim(),
                correctAnswer: generatedQuestions[2].answer
            },
            {
                question: generatedQuestions[3].text,
                answer: document.getElementById('answer7').value.trim(),
                correctAnswer: generatedQuestions[3].answer
            }
        ]
    };
    
    // Validate form
    if (!formData.fullName || !formData.jobPost || !formData.source) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    // Show loading
    showLoadingOverlay('Submitting your assessment...');
    
    try {
        // Submit to backend
        await apiCall('submitCandidateForm', formData);
        
        // Show success screen
        setTimeout(() => {
            hideLoadingOverlay();
            document.getElementById('assessmentForm').style.display = 'none';
            document.getElementById('successScreen').style.display = 'block';
            document.querySelector('.timer').style.display = 'none';
        }, 1500);
        
    } catch (error) {
        console.error('Submission error:', error);
        hideLoadingOverlay();
        showToast('Error submitting assessment. Please try again.', 'error');
        // Restart timer
        startTimer();
    }
}

// Show error and hide form
function showError(message) {
    document.getElementById('assessmentForm').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">❌</div>
            <h3>Error</h3>
            <p>${message}</p>
            <p style="margin-top: 2rem;">
                <a href="#" onclick="window.close()" class="btn btn-secondary">Close Window</a>
            </p>
        </div>
    `;
}

