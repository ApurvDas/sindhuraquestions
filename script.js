// ========================================
// 🚀 SAFE INITIALIZATION - WAIT FOR DOM & SUPABASE
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('💜 Movie date page loaded for Sindhura!');
    
    // Wait for Supabase CDN to load
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase CDN not loaded! Check index.html has the script tag.');
        return;
    }
    
    // ========================================
    // 🔑 SUPABASE CONFIGURATION
    // ========================================
    const SUPABASE_URL = 'https://novyjhbreduracrrueih.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdnlqaGJyZWR1cmFjcnJ1ZWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTY1OTcsImV4cCI6MjA5NDIzMjU5N30.rVU7CUnX_y3DhC9Mv4JIIiLhO_8ZygkZKq-FLUrUQSE';
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');

    // ========================================
    // 🎯 DOM ELEMENTS (Now safe - DOM is ready)
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

    // Verify critical elements exist
    if (!yesBtn || !noBtn || !movieForm) {
        console.error('❌ One or more required elements not found! Check HTML IDs.');
        return;
    }
    console.log('✅ All DOM elements found');

    // State variables
    let movieDateTime = null;
    let countdownInterval = null;

    // ========================================
    // 🏃♀️ NO BUTTON - RUN AWAY FUNCTIONALITY
    // ========================================
    function moveButton() {
        const container = document.querySelector('.button-container');
        if (!container || !noBtn) return;
        
        const containerRect = container.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();
        
        const maxX = containerRect.width - btnRect.width - 20;
        const maxY = 80; // Limited vertical movement
        
        const randomX = (Math.random() * maxX) - (maxX / 2);
        const randomY = (Math.random() * maxY) - (maxY / 2);
        
        noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
        noBtn.style.position = 'relative';
        noBtn.style.transition = 'transform 0.15s ease-out';
    }

    // Multiple event listeners for maximum compatibility
    noBtn.addEventListener('mouseover', moveButton);
    noBtn.addEventListener('mouseenter', moveButton);
    
    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveButton();
    }, { passive: false });
    
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveButton();
        return false;
    });

    // ========================================
    // 💕 YES BUTTON - SHOW FORM + CELEBRATION
    // ========================================
    yesBtn.addEventListener('click', () => {
        console.log('✅ Yes button clicked!');
        
        // Play music (iOS requires user interaction first)
        if (bgMusic) {
            bgMusic.play().catch(e => {
                console.log('🔇 Audio autoplay blocked - will play on next interaction:', e);
            });
        }
        
        // Trigger celebrations
        startConfetti();
        
        if (monkeyContainer) {
            monkeyContainer.classList.remove('hidden');
            setTimeout(() => {
                monkeyContainer.classList.add('hidden');
            }, 3000);
        }
        
        // Show form after animation
        setTimeout(() => {
            if (messageSection) messageSection.classList.add('hidden');
            if (formSection) formSection.classList.remove('hidden');
        }, 1500);
    });

    // ========================================
    // 📝 FORM SUBMISSION HANDLER
    // ========================================
    if (movieForm) {
        movieForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('📝 Form submitted');
            
            try {
                const dateVal = document.getElementById('movieDate')?.value;
                const timeVal = document.getElementById('movieTime')?.value;
                const movieName = document.getElementById('movieName')?.value;
                const beveragesInput = document.querySelector('input[name="beverages"]:checked');
                
                // Validate
                if (!dateVal || !timeVal) {
                    alert('Please select both date and time! 📅⏰');
                    return;
                }
                if (!beveragesInput) {
                    alert('Please select if you have beverages! 🥤☕');
                    return;
                }
                
                const beveragesVal = beveragesInput.value;
                const combinedDateTime = new Date(`${dateVal}T${timeVal}`);
                
                if (isNaN(combinedDateTime.getTime())) {
                    alert('Please select a valid date and time! 📅');
                    return;
                }
                
                const formData = {
                    movieName,
                    movieDate: dateVal,
                    movieTime: timeVal,
                    combinedDateTime: combinedDateTime.toISOString(),
                    beverages: beveragesVal,
                    submittedAt: new Date().toISOString(),
                    from: 'Apurv',
                    to: 'Sindhura Kashyap'
                };
                
                // Calculate early time reminder
                if (earlyTimeEl) {
                    const earlyDateTime = new Date(combinedDateTime.getTime() - 15 * 60000);
                    const earlyTimeString = earlyDateTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                    earlyTimeEl.textContent = earlyTimeString;
                }
                
                // Save to database
                await saveToDatabase(formData, supabase);
                
                // Show countdown section
                if (formSection) formSection.classList.add('hidden');
                if (countdownSection) countdownSection.classList.remove('hidden');
                
                // Start countdown
                movieDateTime = combinedDateTime;
                startCountdown();
                
                // Final celebration
                startConfetti();
                if (monkeyContainer) {
                    monkeyContainer.classList.remove('hidden');
                    setTimeout(() => monkeyContainer.classList.add('hidden'), 3000);
                }
                
            } catch (error) {
                console.error('❌ Form submission error:', error);
                alert('Oops! Something went wrong. Please try again! 💜');
            }
        });
    }

    // ========================================
    // 🗄️ SAVE TO SUPABASE DATABASE
    // ========================================
    async function saveToDatabase(data, client) {
        try {
            const { error } = await client
                .from('movie_requests')
                .insert([{
                    movie_name: data.movieName,
                    movie_date: data.movieDate,
                    movie_time: data.movieTime,
                    combined_datetime: data.combinedDateTime,
                    beverages: data.beverages,
                    submitted_at: data.submittedAt,
                    from_name: data.from,
                    to_name: data.to
                }]);
            
            if (error) throw error;
            
            console.log('✅ Data saved to Supabase');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Supabase error:', error);
            
            // Fallback to localStorage
            console.log('⚠️ Falling back to localStorage...');
            try {
                const existing = JSON.parse(localStorage.getItem('movieDates') || '[]');
                existing.push(data);
                localStorage.setItem('movieDates', JSON.stringify(existing));
                console.log('✅ Saved to localStorage');
                return { success: true, fallback: true };
            } catch (localErr) {
                console.error('❌ localStorage also failed:', localErr);
                throw error;
            }
        }
    }

    // ========================================
    // ⏰ COUNTDOWN TIMER
    // ========================================
    function startCountdown() {
        updateCountdown();
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    function updateCountdown() {
        if (!movieDateTime) return;
        
        const now = Date.now();
        const distance = movieDateTime.getTime() - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            ['days','hours','minutes','seconds'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '00';
            });
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const ids = { days, hours, minutes, seconds };
        Object.entries(ids).forEach(([key, val]) => {
            const el = document.getElementById(key);
            if (el) el.textContent = String(val).padStart(2, '0');
        });
    }

    // ========================================
    // 🎉 CONFETTI ANIMATION
    // ========================================
    function startConfetti() {
        if (!confettiCanvas) return;
        
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        
        const colors = ['#9370db', '#dda0dd', '#e6e6fa', '#ff69b4', '#87ceeb', '#ffd700'];
        const pieces = [];
        
        for (let i = 0; i < 150; i++) {
            pieces.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height - confettiCanvas.height,
                w: Math.random() * 8 + 4,
                h: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * 360,
                spin: Math.random() * 0.2 - 0.1
            });
        }
        
        let frames = 0;
        function animate() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            
            pieces.forEach(p => {
                ctx.save();
                ctx.translate(p.x + p.w/2, p.y + p.h/2);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
                ctx.restore();
                
                p.y += p.speed;
                p.angle += p.spin;
                if (p.y > confettiCanvas.height) {
                    p.y = -20;
                    p.x = Math.random() * confettiCanvas.width;
                }
            });
            
            if (++frames < 300) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            }
        }
        animate();
    }

    // ========================================
    // 📱 iOS & RESPONSIVE UTILITIES
    // ========================================
    
    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        if (confettiCanvas) {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }
    });
    
    // Prevent zoom on double-tap (iOS)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
    }, { passive: false });
    
    // Unlock audio on first touch (iOS)
    document.addEventListener('touchstart', () => {
        if (bgMusic) {
            bgMusic.play().then(() => {
                bgMusic.pause();
                bgMusic.currentTime = 0;
            }).catch(() => {});
        }
    }, { once: true });

    // ========================================
    // ✅ ALL READY
    // ========================================
    console.log('🎬 App fully loaded! Buttons active, Supabase ready.');
});