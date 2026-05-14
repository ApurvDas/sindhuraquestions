document.addEventListener('DOMContentLoaded', async () => {
    console.log('\uD83D\uDC95 Movie date page loaded for Sindhura!');

    if (typeof window.supabase === 'undefined') {
        console.error('Supabase CDN not loaded. Check index.html has the script tag.');
        return;
    }

    const SUPABASE_URL = 'https://novyjhbreduracrrueih.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdnlqaGJyZWR1cmFjcnJ1ZWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTY1OTcsImV4cCI6MjA5NDIzMjU5N30.rVU7CUnX_y3DhC9Mv4JIIiLhO_8ZygkZKq-FLUrUQSE';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const messageSection = document.getElementById('messageSection');
    const formSection = document.getElementById('formSection');
    const countdownSection = document.getElementById('countdownSection');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const movieForm = document.getElementById('movieForm');
    const stickerContainer = document.getElementById('stickerContainer');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const bgMusic = document.getElementById('bgMusic');
    const earlyTimeEl = document.getElementById('earlyTime');
    const submitBtn = movieForm?.querySelector('.submit-btn');

    if (!yesBtn || !noBtn || !movieForm) {
        console.error('One or more required elements were not found. Check HTML IDs.');
        return;
    }

    let movieDateTime = null;
    let countdownInterval = null;

    function showSticker(duration = 2400) {
        if (!stickerContainer) return;

        stickerContainer.classList.remove('hidden');
        setTimeout(() => {
            stickerContainer.classList.add('hidden');
        }, duration);
    }

    function setSubmitting(isSubmitting) {
        if (!submitBtn) return;

        submitBtn.disabled = isSubmitting;
        submitBtn.textContent = isSubmitting
            ? 'Saving our plan...'
            : submitBtn.dataset.defaultLabel || 'Confirm our date \uD83D\uDC95';
    }

    function moveButton() {
        const container = document.querySelector('.button-container');
        if (!container || !noBtn) return;

        const containerRect = container.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();

        const maxX = Math.max(containerRect.width - btnRect.width - 20, 0);
        const maxY = 70;
        const randomX = (Math.random() * maxX) - (maxX / 2);
        const randomY = (Math.random() * maxY) - (maxY / 2);

        noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
        noBtn.style.position = 'relative';
        noBtn.style.transition = 'transform 0.15s ease-out';
    }

    noBtn.addEventListener('mouseover', moveButton);
    noBtn.addEventListener('mouseenter', moveButton);

    noBtn.addEventListener('touchstart', (event) => {
        event.preventDefault();
        event.stopPropagation();
        moveButton();
    }, { passive: false });

    noBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        moveButton();
    });

    movieForm.querySelectorAll('input[name="beverages"]').forEach((input) => {
        input.addEventListener('change', () => {
            movieForm.querySelectorAll('.radio-label').forEach((label) => {
                label.classList.toggle('is-selected', label.contains(input));
            });
        });
    });

    yesBtn.addEventListener('click', () => {
        if (bgMusic) {
            bgMusic.play().catch((error) => {
                console.log('Audio autoplay blocked until another interaction:', error);
            });
        }

        startConfetti();
        showSticker();

        setTimeout(() => {
            messageSection?.classList.add('hidden');
            formSection?.classList.remove('hidden');
        }, 1200);
    });

    movieForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const dateVal = document.getElementById('movieDate')?.value;
        const timeVal = document.getElementById('movieTime')?.value;
        const movieName = document.getElementById('movieName')?.value.trim();
        const beveragesInput = document.querySelector('input[name="beverages"]:checked');

        if (!movieName) {
            alert('Please enter a movie name.');
            return;
        }

        if (!dateVal || !timeVal) {
            alert('Please select both date and time.');
            return;
        }

        if (!beveragesInput) {
            alert('Please select if you have beverages ready.');
            return;
        }

        const combinedDateTime = new Date(`${dateVal}T${timeVal}`);

        if (Number.isNaN(combinedDateTime.getTime())) {
            alert('Please select a valid date and time.');
            return;
        }

        if (combinedDateTime.getTime() <= Date.now()) {
            alert("Oi! Pick a future date and time. You can't watch a movie in the past, time traveller.");
            return;
        }

        const formData = {
            movieName,
            movieDate: dateVal,
            movieTime: timeVal,
            combinedDateTime: combinedDateTime.toISOString(),
            beverages: beveragesInput.value,
            submittedAt: new Date().toISOString(),
            from: 'Apurv',
            to: 'Sindhura Kashyap'
        };

        setSubmitting(true);

        try {
            if (earlyTimeEl) {
                const earlyDateTime = new Date(combinedDateTime.getTime() - 15 * 60000);
                earlyTimeEl.textContent = earlyDateTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }

            await saveToDatabase(formData, supabase);

            formSection?.classList.add('hidden');
            countdownSection?.classList.remove('hidden');

            movieDateTime = combinedDateTime;
            startCountdown();
            startConfetti();
            showSticker();
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Oops! Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    });

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

            return { success: true };
        } catch (error) {
            console.error('Supabase error:', error);

            try {
                const existing = JSON.parse(localStorage.getItem('movieDates') || '[]');
                existing.push(data);
                localStorage.setItem('movieDates', JSON.stringify(existing));
                return { success: true, fallback: true };
            } catch (localErr) {
                console.error('localStorage fallback failed:', localErr);
                throw error;
            }
        }
    }

    function startCountdown() {
        updateCountdown();
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    function updateCountdown() {
        if (!movieDateTime) return;

        const distance = movieDateTime.getTime() - Date.now();

        if (distance < 0) {
            clearInterval(countdownInterval);
            ['days', 'hours', 'minutes', 'seconds'].forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.textContent = '00';
            });
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        Object.entries({ days, hours, minutes, seconds }).forEach(([key, val]) => {
            const el = document.getElementById(key);
            if (el) el.textContent = String(val).padStart(2, '0');
        });
    }

    function startConfetti() {
        if (!confettiCanvas) return;

        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;

        const colors = ['#6d3fc8', '#e75f9d', '#f7a56b', '#7dbca5', '#fff2df', '#ffd166'];
        const pieces = [];

        for (let i = 0; i < 130; i++) {
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

            pieces.forEach((piece) => {
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

            if (++frames < 260) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            }
        }

        animate();
    }

    window.addEventListener('resize', () => {
        if (confettiCanvas) {
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }
    });

    document.addEventListener('touchstart', () => {
        if (bgMusic) {
            bgMusic.play().then(() => {
                bgMusic.pause();
                bgMusic.currentTime = 0;
            }).catch(() => {});
        }
    }, { once: true });

    console.log('\uD83C\uDFAC App fully loaded.');
});
