// DOM Elements
const messageSection = document.getElementById('messageSection');
const formSection = document.getElementById('formSection');
const countdownSection = document.getElementById('countdownSection');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const movieForm = document.getElementById('movieForm');
const monkeyContainer = document.getElementById('monkeyContainer');
const confettiCanvas = document.getElementById('confettiCanvas');
const bgMusic = document.getElementById('bgMusic');
const earlyTimeEl = document.getElementById('earlyTime');

let movieDateTime = null;
let countdownInterval = null;

// No button - Run away functionality
noBtn.addEventListener('mouseover', moveButton);
noBtn.addEventListener('touchstart', moveButton);
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveButton();
});

function moveButton() {
    const container = document.querySelector('.button-container');
    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    
    const maxX = containerRect.width - btnRect.width - 20;
    const maxY = 100;
    
    const randomX = Math.random() * maxX - (maxX / 2);
    const randomY = Math.random() * maxY - (maxY / 2);
    
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
    noBtn.style.position = 'relative';
}

// Yes button - Show form with confetti and monkey
yesBtn.addEventListener('click', () => {
    bgMusic.play().catch(e => console.log('Audio play failed:', e));
    
    startConfetti();
    
    monkeyContainer.classList.remove('hidden');
    
    setTimeout(() => {
        monkeyContainer.classList.add('hidden');
    }, 3000);
    
    setTimeout(() => {
        messageSection.classList.add('hidden');
        formSection.classList.remove('hidden');
    }, 1500);
});

// Form submission
movieForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const dateVal = document.getElementById('movieDate').value;
        const timeVal = document.getElementById('movieTime').value;
        const movieName = document.getElementById('movieName').value;
        const beveragesInput = document.querySelector('input[name="beverages"]:checked');
        
        // Validate inputs
        if (!dateVal || !timeVal) {
            alert('Please select both date and time! 📅⏰');
            return;
        }
        
        if (!beveragesInput) {
            alert('Please select if you have beverages! 🥤☕');
            return;
        }
        
        const beveragesVal = beveragesInput.value;
        
        // Combine date & time
        const combinedDateTime = new Date(`${dateVal}T${timeVal}`);
        
        if (isNaN(combinedDateTime.getTime())) {
            alert('Please select a valid date and time! 📅');
            return;
        }
        
        const formData = {
            movieName: movieName,
            movieDate: dateVal,
            movieTime: timeVal,
            combinedDateTime: combinedDateTime.toISOString(),
            beverages: beveragesVal,
            submittedAt: new Date().toISOString(),
            from: 'Apurv',
            to: 'Sindhura Kashyap'
        };
        
        // Calculate early time (15 minutes before)
        const earlyDateTime = new Date(combinedDateTime.getTime() - 15 * 60000);
        const earlyTimeString = earlyDateTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        earlyTimeEl.textContent = earlyTimeString;
        
        // Save to database
        await saveToDatabase(formData);
        
        // Show countdown section
        formSection.classList.add('hidden');
        countdownSection.classList.remove('hidden');
        
        // Start countdown
        movieDateTime = combinedDateTime;
        startCountdown();
        
        // Confetti & Monkey
        startConfetti();
        monkeyContainer.classList.remove('hidden');
        setTimeout(() => {
            monkeyContainer.classList.add('hidden');
        }, 3000);
        
    } catch (error) {
        console.error('Form submission error:', error);
        alert('Oops! Something went wrong. Please try again! 💜');
    }
});

// Database save function
async function saveToDatabase(data) {
    try {
        // Using localStorage - safer implementation
        const existingData = JSON.parse(localStorage.getItem('movieDates') || '[]');
        existingData.push(data);
        localStorage.setItem('movieDates', JSON.stringify(existingData));
        
        console.log('✅ Data saved successfully:', data);
        return { success: true };
        
    } catch (error) {
        console.error('❌ localStorage error:', error);
        // If localStorage fails, just log it but don't throw error
        // This way the form still works even if storage fails
        console.log('Data (not saved):', data);
        return { success: false, error: error };
    }
}

// Countdown timer
function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if (!movieDateTime) return;
    
    const now = new Date().getTime();
    const distance = movieDateTime.getTime() - now;
    
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Confetti Animation
function startConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    const pieces = [];
    const colors = ['#9370db', '#dda0dd', '#e6e6fa', '#ff69b4', '#87ceeb', '#ffd700'];
    
    for (let i = 0; i < 150; i++) {
        pieces.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360,
            spin: Math.random() * 0.2 - 0.1
        });
    }
    
    let animationId;
    let frames = 0;
    
    function animate() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        pieces.forEach(piece => {
            ctx.save();
            ctx.translate(piece.x + piece.w / 2, piece.y + piece.h / 2);
            ctx.rotate(piece.angle);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
            ctx.restore();
            
            piece.y += piece.speed;
            piece.angle += piece.spin;
            
            if (piece.y > confettiCanvas.height) {
                piece.y = -20;
                piece.x = Math.random() * confettiCanvas.width;
            }
        });
        
        frames++;
        if (frames < 300) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }
    
    animate();
}

// Handle window resize
window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
});

// Prevent zoom on double tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Movie date page loaded for Sindhura! 💜');
});