// Windows System
const windows = document.querySelectorAll('.window');
const windowTriggers = document.querySelectorAll('.window-trigger');
const taskbarApps = document.querySelectorAll('.taskbar-app');

let highestZIndex = 100;
let activeWindow = null;

// Open Window
function openWindow(windowId) {
    const winEl = document.getElementById(`window-${windowId}`);
    if (!winEl) return;

    // Close other windows on mobile
    if (window.matchMedia('(max-width: 768px)').matches) {
        windows.forEach(w => {
            if (w.id !== `window-${windowId}`) {
                w.classList.remove('active');
            }
        });
    }

    winEl.classList.add('active');
    winEl.classList.remove('minimized');
    bringToFront(winEl);

    // Update taskbar
    updateTaskbar(windowId);

    // Reveal animations
    setTimeout(() => {
        winEl.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }, 100);
}

// Close Window
function closeWindow(winEl) {
    winEl.classList.remove('active', 'maximized');
    winEl.classList.add('closing');

    setTimeout(() => {
        winEl.classList.remove('closing');
    }, 300);

    // Update taskbar
    const windowId = winEl.dataset.window;
    const taskbarBtn = document.querySelector(`.taskbar-app[data-window="${windowId}"]`);
    if (taskbarBtn) taskbarBtn.classList.remove('active');
}

// Minimize Window
function minimizeWindow(winEl) {
    winEl.classList.remove('active');
    winEl.classList.add('minimized');
}

// Maximize Window
function toggleMaximize(winEl) {
    winEl.classList.toggle('maximized');
    bringToFront(winEl);
}

// Bring Window to Front
function bringToFront(winEl) {
    winEl.style.zIndex = ++highestZIndex;
    activeWindow = winEl;
}

// Update Taskbar
function updateTaskbar(windowId) {
    taskbarApps.forEach(app => {
        if (app.dataset.window === windowId) {
            app.classList.add('active');
        }
    });
}

// Event Listeners for Opening Windows
windowTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const windowId = trigger.dataset.window;
        openWindow(windowId);
    });
});

// Event Listeners for Window Controls
windows.forEach(winEl => {
    const closeBtn = winEl.querySelector('.window-btn.close');
    const minimizeBtn = winEl.querySelector('.window-btn.minimize');
    const maximizeBtn = winEl.querySelector('.window-btn.maximize');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeWindow(winEl));
    }

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => minimizeWindow(winEl));
    }

    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => toggleMaximize(winEl));
    }

    // Bring to front on click
    winEl.addEventListener('mousedown', () => bringToFront(winEl));
});

// Taskbar Apps
taskbarApps.forEach(app => {
    app.addEventListener('click', () => {
        const windowId = app.dataset.window;
        const winEl = document.getElementById(`window-${windowId}`);

        if (winEl.classList.contains('active')) {
            minimizeWindow(winEl);
            app.classList.remove('active');
        } else {
            openWindow(windowId);
        }
    });
});
// ============================================
// DRAG AND DROP WINDOWS (Desktop only)
// ============================================
function makeDraggable(winEl) {
    const header = winEl.querySelector('.window-header');
    if (!header) return;

    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    let xOffset = 0, yOffset = 0;

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    header.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        // Don't drag if maximized or on mobile
        if (winEl.classList.contains('maximized')) return;
        if (window.matchMedia('(max-width: 768px)').matches) return;

        // Don't drag if clicking on buttons
        if (e.target.closest('.window-btn')) return;

        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        isDragging = true;
        bringToFront(winEl);
    }

    function drag(e) {
        if (!isDragging) return;

        e.preventDefault();

        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        winEl.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
    }

    function dragEnd() {
        isDragging = false;
    }
}

// Make all windows draggable
windows.forEach(winEl => makeDraggable(winEl));

// ============================================
// CLOCK
// ============================================
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const clockElement = document.getElementById('current-time');
    if (clockElement) {
        clockElement.textContent = time;
    }
}

updateClock();
setInterval(updateClock, 1000);

// ============================================
// CUSTOM CURSOR
// ============================================
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let dotX = 0, dotY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dotX = mouseX;
    dotY = mouseY;
});

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    if (cursor) {
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
    }

    if (cursorDot) {
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';
    }

    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover effect
const hoverElements = document.querySelectorAll('a, button, [data-magnetic], input, textarea');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursor) cursor.classList.add('hover');
    });

    el.addEventListener('mouseleave', () => {
        if (cursor) cursor.classList.remove('hover');
    });
});

// ============================================
// TYPING ANIMATION
// ============================================
const typingText = document.getElementById('typing-text');
if (typingText) {
    const texts = [
        'مبرمج Python',
        'مبرمج Node.js',
        'مصمم UI/UX',
        'مصمم إعلانات',
        'مطور ألعاب',
        'متعلم أمن سيبراني'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeText() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500;
        }

        setTimeout(typeText, typingSpeed);
    }

    setTimeout(typeText, 1000);
}

// ============================================
// MAGNETIC BUTTONS
// ============================================
const magneticElements = document.querySelectorAll('[data-magnetic]');

magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const moveX = x * 0.15;
        const moveY = y * 0.15;

        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
    });
});

// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>جاري الإرسال...</span> <i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(contactForm);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showMessage('✅ تم إرسال رسالتك بنجاح! سأتواصل معك قريباً.', 'success');
                contactForm.reset();
            } else {
                showMessage('❌ حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.', 'error');
            }
        } catch (error) {
            showMessage('❌ حدث خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.', 'error');
        } finally {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
        }
    });
}

function showMessage(text, type) {
    const message = document.createElement('div');
    const bgColor = type === 'success' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 50, 50, 0.2)';
    const borderColor = type === 'success' ? 'var(--accent-neon)' : '#ff3232';

    message.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        backdrop-filter: blur(10px);
        border: 1px solid ${borderColor};
        padding: 1.5rem 3rem;
        border-radius: 16px;
        color: var(--text-primary);
        font-weight: 600;
        z-index: 10000;
        animation: slideDown 0.5s ease;
        max-width: 90%;
        text-align: center;
    `;
    message.innerHTML = text;

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'slideUp 0.5s ease';
        setTimeout(() => message.remove(), 500);
    }, 5000);
}

// Animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// ============================================
// PERFORMANCE
// ============================================
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('*').forEach(el => {
        el.style.animation = 'none';
        el.style.transition = 'none';
    });
}
