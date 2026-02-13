const welcomeMessage = document.querySelector('.welcome-message');
const startButton = document.querySelector('.start-button');
const giftContainer = document.querySelector('.gift-container');
const giftBox = document.querySelector('.gift-box');
const gallery = document.querySelector('.gallery');
const floatingHeartsContainer = document.querySelector('.floating-hearts');
const musicToggle = document.querySelector('.music-toggle');
let isOpen = false;
let isPlaying = false;
let bgMusic = null;

// Lazy-init audio (created on first user gesture to satisfy mobile autoplay restrictions)
function initAudio() {
    if (bgMusic) return;

    // Prefer an inline <audio> element (better compatibility on iOS/Safari)
    const inlineEl = document.getElementById('bg-audio');
    if (inlineEl) {
        bgMusic = inlineEl;
        bgMusic.loop = true;
        bgMusic.preload = 'auto';
        try { bgMusic.setAttribute('playsinline', ''); } catch(e) {}
    } else {
        // fallback to programmatic Audio object
        bgMusic = new Audio('assets/audio/background-music.mp3');
        bgMusic.loop = true;
        bgMusic.preload = 'auto';
        try { bgMusic.playsInline = true; } catch(e) {}
    }

    // keep UI state in sync if playback changes elsewhere
    bgMusic.addEventListener('playing', () => {
        isPlaying = true;
        musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
    });
    bgMusic.addEventListener('pause', () => {
        isPlaying = false;
        musicToggle.innerHTML = '<i class="fas fa-music"></i>';
    });
}

// Event listener for start button
startButton.addEventListener('click', () => {
    // initialize audio on first user gesture (required on many mobile browsers)
    initAudio();

    // try to play — handle promise so we don't get unhandled rejections on mobile
    if (bgMusic) {
        bgMusic.play().then(() => {
            // success — UI updated by 'playing' event listener
        }).catch((err) => {
            // playback may be blocked by browser policies; fail silently but log for debugging
            console.warn('Background music playback prevented:', err);
        });
    }

    // fade out the welcome message then remove it from the layout so it cannot cover the gallery
    welcomeMessage.classList.add('hide');
    setTimeout(() => {
        // remove from flow so underlying elements (gallery) are fully visible
        welcomeMessage.style.display = 'none';
        giftContainer.classList.add('show');
        createHeartBurst();
    }, 500);
});

// --- global one-time gesture listener to maximize chance of enabling audio on mobile ---
function enableAudioOnFirstGesture() {
    try {
        initAudio();
        if (bgMusic) {
            bgMusic.play().catch(err => {
                // often blocked if not a trusted event; log for diagnostics
                console.warn('First-gesture play blocked:', err);
            });
        }
    } catch (e) {
        console.warn('enableAudioOnFirstGesture error', e);
    }
}

// Listen once for common user gestures (include touchstart for better iOS coverage)
['touchstart','touchend', 'click', 'keydown'].forEach(ev => {
    const opts = { once: true, passive: true };
    document.addEventListener(ev, enableAudioOnFirstGesture, opts);
});

// EXTRA: explicit mobile play button (fallback) — helps when the initial play attempt is blocked
const playMusicButton = document.querySelector('.play-music-button');
if (playMusicButton) {
    playMusicButton.addEventListener('click', (e) => {
        e.stopPropagation();
        initAudio();
        if (!bgMusic) return;
        bgMusic.play().then(() => {
            // update UI
            musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
        }).catch((err) => {
            console.warn('Play-button play blocked:', err);
            // show quick guidance if blocked
            alert('If audio is blocked, tap the music icon at the bottom-right to allow playback.');
        });
    });
}


// Event listener for gift box
giftBox.addEventListener('click', () => {
    if (!isOpen) {
        giftBox.classList.add('open');
        
        // Mobile Audio Insurance: Try playing here again just in case
        if (bgMusic && bgMusic.paused) {
            bgMusic.play().catch(() => { /* silent fail */ });
        }

        setTimeout(() => {
            gallery.classList.add('show');
            
            // FIX: Force the gallery to start at the very top of the photos
            gallery.scrollTop = 0; 
            
            createHeartBurst();
            playConfetti();
        }, 1000);
        isOpen = true;
        // Inside the giftBox click listener
    }
});

// Music toggle
musicToggle.addEventListener('click', () => {
    // ensure audio exists (user gesture may be required to create/play on mobile)
    initAudio();

    if (!bgMusic) return;

    if (isPlaying) {
        bgMusic.pause();
        // UI will be updated by 'pause' listener
    } else {
        bgMusic.play().catch(err => {
            console.warn('Play blocked by browser:', err);
        });
        // UI will be updated by 'playing' listener
    }
});

// function to create heart
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    
    // Random position
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = '100vh';
    
    // Random size
    const size = Math.random() * 15 + 10;
    heart.style.width = size + 'px';
    heart.style.height = size + 'px';
    
    // Random animation duration
    const duration = Math.random() * 3 + 2;
    heart.style.animation = `
        heartBeat ${duration}s infinite,
        float ${duration * 2}s linear
    `;
    
    // Random rotation
    heart.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    floatingHeartsContainer.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, duration * 2000);
}

// function for burst effect
function createHeartBurst() {
    for(let i = 0; i < 30; i++) {
        setTimeout(createHeart, i * 100);
    }
}

// Create floating hearts periodicly
setInterval(() => {
    if (Math.random() > 0.7) {
        createHeart();
    }
}, 500);

// Fungsi untuk efek confetti
function playConfetti() {
    const colors = ['#ff69b4', '#ff1493', '#ffffff', '#ff4081'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-20px';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.opacity = Math.random();
        confetti.style.transition = 'all 1s ease';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.style.top = '100vh';
            confetti.style.transform = `rotate(${Math.random() * 360 + 720}deg)`;
        }, 50);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

// Animasi untuk floating
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% {
            transform: rotate(45deg) translateY(0) translateX(0);
            opacity: 1;
        }
        100% {
            transform: rotate(45deg) translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Preload images
const images = document.querySelectorAll('img');
images.forEach(img => {
    const temp = new Image();
    temp.src = img.src;
});

/* Use native scrolling on touch devices — native behavior is more reliable and performant. */

// Add gallery item hover effect
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        createHeartBurst();
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});




const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.querySelector('.modal-title');
const modalDescription = document.querySelector('.modal-description');
const modalQuote = document.querySelector('.modal-quote');
const closeModal = document.querySelector('.close-modal');

const imageContent = {
    'romantic-moment-1': { title: 'Our First Date', description: 'The moment our hearts first danced together.', quote: '"Every love story is beautiful."' },
    'romantic-moment-2': { title: 'Beautiful Sunset', description: 'Watching the sky paint shades of love.', quote: '"The best thing to hold onto is each other."' },
    'romantic-moment-3': { title: 'Perfect Evening', description: 'Under the moonlight, everything is magical.', quote: '"In your arms is where I belong."' },
    'romantic-moment-4': { title: 'Sweet Memories', description: 'Building our beautiful story together.', quote: '"You are my today and all my tomorrows."' },
    'romantic-moment-5': { title: 'Together Forever', description: 'Side by side, heart to heart.', quote: '"I love you more than words."' },
    'romantic-moment-6': { title: 'Crazy Fun', description: 'Life is better when we laugh.', quote: '"You make my heart smile."' },
    'romantic-moment-7': { title: 'Beautiful Night', description: 'Pizza and you, the perfect combo.', quote: '"Home is wherever I am with you."' },
    'romantic-moment-8': { title: 'Always Smiling', description: 'I never want to let go.', quote: '"You are my sunshine."' },
    'romantic-moment-9': { title: 'Adventure', description: 'Exploring the world with my favorite person.', quote: '"Let\'s get lost together."' },
    'romantic-moment-10': { title: 'Video Memory', description: 'A special moment caught on film.', quote: '"Love in motion."' },
    'romantic-moment-11': { title: 'Cool Times', description: 'Just being us.', quote: '"Forever us."' }
};

// Update gallery item click listeners
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const imageId = `romantic-moment-${index + 1}`;
        const content = imageContent[imageId];
        
        // Find EITHER an image or a video
        const media = item.querySelector('img, video');
        if (!media || !content) return; // Guard against missing data

        modalImage.src = media.src;
        modalTitle.textContent = content.title;
        modalDescription.textContent = content.description;
        modalQuote.textContent = content.quote;
        
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('show'), 10);
        }
        
        createHeartBurst();
    });
});

// Close modal events
closeModal.addEventListener('click', closeModalFunction);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalFunction();
    }
});

function closeModalFunction() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Close modal with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModalFunction();
    }
});