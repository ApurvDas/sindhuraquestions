// ========================================
// 🔑 SUPABASE CONFIGURATION
// ========================================
const SUPABASE_URL = 'https://novyjhbreduracrrueih.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdnlqaGJyZWR1cmFjcnJ1ZWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTY1OTcsImV4cCI6MjA5NDIzMjU5N30.rVU7CUnX_y3DhC9Mv4JIIiLhO_8ZygkZKq-FLUrUQSE';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// 🎯 DOM ELEMENTS
// ========================================
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

// ========================================
// 🏃♀️ NO BUTTON - RUN AWAY FUNCTIONALITY
// ========================================
noBtn.addEventListener('mouseover', moveButton);
noBtn.addEventListener('touchstart', moveButton);
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveButton();
});

function moveButton() {
    const container = document.querySelector('.button-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    
    const maxX = containerRect.width - btnRect.width - 20;
    const maxY = 100;
    
    const randomX = Math.random() * maxX - (maxX / 2);
    const randomY = Math.random() * maxY - (maxY / 2);
    
    noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
    noBtn.style.position = 'relative';
}

// ========================================
// 💕 YES BUTTON - SHOW FORM + CELEBRATION
// ========================================
yesBtn.addEventListener('click', () => {
    // Try to play background music (requires user interaction first on iOS)
    bgMusic.play().catch(e => {
        console.log('Audio autoplay blocked - waiting for user interaction:', e);
    });
    
    // Trigger confetti & monkey animation
    startConfetti();
    monkeyContainer.classList.remove('hidden');
    
    // Hide monkey after 3 seconds
    setTimeout(() => {
        monkeyContainer.classList.add('hidden');
    }, 3000);
    
    // Show form section after animation
    setTimeout(() => {
        messageSection.classList.add('hidden');
        formSection.classList.remove('hidden');
    }, 1500);
});

// ========================================
// 📝 FORM SUBMISSION HANDLER
// ========================================
movieForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        // Get form values
        const dateVal = document.getElementById('movieDate').value;
        const timeVal = document.getElementById('movieTime').value;
        const movieName = document.getElementById('movieName').value;
        const beveragesInput = document.querySelector('input[name="beverages"]:checked');
        
        // Validate required fields
        if (!dateVal || !timeVal) {
            alert('Please select both date and time! 📅⏰');
            return;
        }
        
        if (!beveragesInput) {
            alert('Please select if you have beverages! 🥤☕');
            return;
        }
        
        const beveragesVal = beveragesInput.value;
        
        // Combine date & time into proper Date object
        const combinedDateTime = new Date(`${dateVal}T${timeVal}`);
        
        if (isNaN(combinedDateTime.getTime())) {
            alert('Please select a valid date and time! 📅');
            return;
        }
        
        // Prepare data object
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
        
        // Calculate "be on time" reminder (15 mins before chosen time)
        const earlyDateTime = new Date(combinedDateTime.getTime() - 15 * 60000);
        const earlyTimeString = earlyDateTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        earlyTimeEl.textContent = earlyTimeString;
        
        // Save to Supabase
        await saveToDatabase(formData);
        
        // Transition to countdown section
        formSection.classList.add('hidden');
        countdownSection.classList.remove('hidden');
        
        // Start countdown timer
        movieDateTime = combinedDateTime;
        startCountdown();
        
        // Final celebration!
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

// ========================================
// 🗄️ SAVE TO SUPABASE DATABASE
// ========================================
async function saveToDatabase(data) {
    try {
        const { data: insertedData, error } = await supabase
            .from('movie_requests')
            .insert([
                {
                    movie_name: data.movieName,
                    movie_date: data.movieDate,
                    movie_time: data.movieTime,
                    combined_datetime: data.combinedDateTime,
                    beverages: data.beverages,
                    submitted_at: data.submittedAt,
                    from_name: data.from,
                    to_name: data.to
                }
            ])
            .select();
        
        if (error) throw error;
        
        console.log('✅ Data saved to Supabase:', insertedData);
        return { success: true, data: insertedData };
        
    } catch (error) {
        console.error('❌ Supabase error:', error);
        
        // Fallback: save to localStorage if Supabase fails
        console.log('⚠️ Falling back to localStorage...');
        try {
            const existingData = JSON.parse(localStorage.getItem('movieDates') || '[]');
            existingData.push(data);
            localStorage.setItem('movieDates', JSON.stringify(existingData));
            console.log('✅ Saved to localStorage as fallback');
            return { success: true, fallback: true };
        } catch (localError) {
            console.error('❌ localStorage also failed:', localError);
            throw error; // Re-throw original error
        }
    }
}

// ========================================
// ⏰ COUNTDOWN TIMER
// ========================================
function startCountdown() {
    updateCountdown(); // Run immediately
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if (!movieDateTime) return;
    
    const now = new Date().getTime();
    const distance = movieDateTime.getTime() - now;
    
    // Countdown finished
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }
    
    // Calculate time components
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Update DOM with padded values
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// ========================================
// 🎉 CONFETTI ANIMATION
// ========================================
function startConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    const pieces = [];
    const colors = ['#9370db', '#dda0dd', '#e6e6fa', '#ff69b4', '#87ceeb', '#ffd700'];
    
    // Create confetti pieces
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
            
            // Reset piece when it falls off screen
            if (piece.y > confettiCanvas.height) {
                piece.y = -20;
                piece.x = Math.random() * confettiCanvas.width;
            }
        });
        
        frames++;
        // Stop after ~5 seconds (300 frames at 60fps)
        if (frames < 300) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }
    
    animate();
}

// ========================================
// 📱 RESPONSIVE & iOS UTILITIES
// ========================================

// Update canvas size on window resize
window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
});

// Prevent zoom on double-tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle iOS audio unlock (play silent audio on first touch)
document.addEventListener('touchstart', () => {
    bgMusic.play().then(() => {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }).catch(() => {});
}, { once: true });

// ========================================
// 🚀 INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('💜 Movie date page loaded for Sindhura!');
    console.log('🎬 Ready to plan the perfect movie night!');
});