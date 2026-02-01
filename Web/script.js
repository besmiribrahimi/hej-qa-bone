// ============================================
// DISCORD WEBHOOK CONFIGURATION
// ============================================
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1467566032938860615/N3CpHUAP_d59bPlvZ6j4-lk1Tqld5GzRgEHKA_FZVx-Q1dZVV7lNCUYffXwD3gTCbgAf';

// Function to send message to Discord
async function sendToDiscord(embed) {
    if (DISCORD_WEBHOOK_URL === 'YOUR_DISCORD_WEBHOOK_URL_HERE') {
        console.warn('Discord webhook not configured! Please add your webhook URL.');
        return false;
    }
    
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'BotMaker Orders',
                avatar_url: 'https://i.imgur.com/AfFp7pu.png',
                embeds: [embed]
            })
        });
        
        if (response.ok) {
            return true;
        } else {
            console.error('Discord webhook error:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Failed to send to Discord:', error);
        return false;
    }
}

// Function to create contact form embed
function createContactEmbed(name, email, message) {
    return {
        title: '📬 New Contact Form Submission',
        color: 0x00d4ff,
        fields: [
            {
                name: '👤 Name',
                value: name,
                inline: true
            },
            {
                name: '📧 Email',
                value: email,
                inline: true
            },
            {
                name: '💬 Message',
                value: message,
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'BotMaker Contact Form • dx_nzaaa will contact you'
        }
    };
}

// ============================================
// ANTI-SPAM PROTECTION
// ============================================
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN = 60000; // 60 seconds between submissions
let submitCount = 0;
const MAX_SUBMITS_PER_SESSION = 3;
const formLoadTime = Date.now();
const MIN_FILL_TIME = 3000; // Minimum 3 seconds to fill form (bots are instant)

function isSpamSubmission() {
    const now = Date.now();
    
    // Check honeypot field
    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value) {
        console.log('Spam detected: honeypot filled');
        return { isSpam: true, reason: 'Bot detected' };
    }
    
    // Check if form was filled too quickly (bot behavior)
    if (now - formLoadTime < MIN_FILL_TIME) {
        console.log('Spam detected: form filled too quickly');
        return { isSpam: true, reason: 'Please take your time filling the form' };
    }
    
    // Check submission cooldown
    if (lastSubmitTime && (now - lastSubmitTime) < SUBMIT_COOLDOWN) {
        const remainingTime = Math.ceil((SUBMIT_COOLDOWN - (now - lastSubmitTime)) / 1000);
        return { isSpam: true, reason: `Please wait ${remainingTime} seconds before sending another message` };
    }
    
    // Check max submissions per session
    if (submitCount >= MAX_SUBMITS_PER_SESSION) {
        return { isSpam: true, reason: 'Maximum messages reached. Please try again later.' };
    }
    
    return { isSpam: false };
}

// ============================================
// Form submission handler
// ============================================
const contactForm = document.getElementById('contact-form');

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error on input
function showInputError(input, message) {
    input.classList.add('input-error');
    let errorEl = input.parentElement.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
}

// Clear error on input
function clearInputError(input) {
    input.classList.remove('input-error');
    const errorEl = input.parentElement.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
}

if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    
    // Real-time email validation
    emailInput.addEventListener('input', function() {
        if (this.value && !isValidEmail(this.value)) {
            showInputError(this, 'Please enter a valid email address');
        } else {
            clearInputError(this);
        }
    });
    
    // Clear errors on focus
    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('focus', () => clearInputError(input));
    });
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        
        let isValid = true;
        
        // Validate name
        if (!name || name.length < 2) {
            showInputError(nameInput, 'Please enter a valid name (at least 2 characters)');
            isValid = false;
        } else {
            clearInputError(nameInput);
        }
        
        // Validate email
        if (!email) {
            showInputError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showInputError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearInputError(emailInput);
        }
        
        // Validate message
        if (!message || message.length < 10) {
            showInputError(messageInput, 'Please enter a message (at least 10 characters)');
            isValid = false;
        } else {
            clearInputError(messageInput);
        }
        
        if (isValid) {
            // Anti-spam check
            const spamCheck = isSpamSubmission();
            if (spamCheck.isSpam) {
                alert('⚠️ ' + spamCheck.reason);
                return;
            }
            
            // Disable button during submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sending...</span>';
            
            // Create and send Discord embed
            const embed = createContactEmbed(name, email, message);
            const success = await sendToDiscord(embed);
            
            // Update spam tracking
            lastSubmitTime = Date.now();
            submitCount++;
            
            if (success) {
                alert('✅ Message sent! We will get back to you soon.');
            } else {
                alert('Thank you for your message! We will get back to you soon.');
            }
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            this.reset();
        }
    });
}

// ============================================
// Scroll Animations
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    fadeInObserver.observe(el);
});

// ============================================
// Navbar scroll effect
// ============================================
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ============================================
// Smooth scroll for all anchor links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
