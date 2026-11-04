// Mobile menu toggle functionality
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    const isActive = hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Update aria-expanded for accessibility
    hamburger.setAttribute('aria-expanded', isActive);
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
}));

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navMenu = document.querySelector('.nav-menu');
    if (window.scrollY > 50) {
        navMenu.style.background = 'rgba(0, 0, 0, 0.08)';
        navMenu.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
    } else {
        navMenu.style.background = 'rgba(0, 0, 0, 0.05)';
        navMenu.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
    }
});

// Add floating animation to navbar
let ticking = false;

function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    const scrollY = window.pageYOffset;
    const floatOffset = Math.sin(scrollY * 0.01) * 2;

    navbar.style.transform = `translateY(${floatOffset}px)`;
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// Create floating particles
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    document.body.appendChild(particlesContainer);

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 15 + 's';
        
        // Random size variation
        const size = Math.random() * 3 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 25000);
    }

    // Create initial particles
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createParticle(), i * 1000);
    }

    // Continue creating particles
    setInterval(createParticle, 2000);
}

// Initialize particles when page loads (only on desktop for performance)
document.addEventListener('DOMContentLoaded', () => {
    // Only create particles on desktop for better mobile performance
    if (window.innerWidth > 768) {
        createParticles();
    }
});

// Mobile-specific optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Optimize animations for mobile
    if (window.innerWidth <= 768) {
        // Reduce animation complexity on mobile
        document.body.classList.add('mobile-optimized');
        
        // Disable hover effects on touch devices
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }
    }
    
    // Add smooth scrolling behavior for mobile
    if ('scrollBehavior' in document.documentElement.style) {
        document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    // Optimize video loading on mobile
    const video = document.querySelector('.intro-video');
    if (video && window.innerWidth <= 768) {
        video.preload = 'metadata'; // Reduce data usage on mobile
    }
});

// Contact form handling with PHP
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            // Get form data
            const formData = new FormData(this);
            
            // Basic validation
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            if (!name || !email || !subject || !message) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#6c757d';
            
            // Submit to PHP script
            fetch('contact.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage(data.message, 'success');
                    this.reset();
                    
                    // Success feedback
                    submitBtn.textContent = 'Sent!';
                    submitBtn.style.backgroundColor = '#28a745';
                    
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.style.backgroundColor = '#ff6c2c';
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    showMessage(data.message, 'error');
                    
                    // Reset button
                    submitBtn.textContent = originalText;
                    submitBtn.style.backgroundColor = '#ff6c2c';
                    submitBtn.disabled = false;
                }
            })
            .catch(error => {
                console.error('Form submission error:', error);
                showMessage('Failed to send message. Please try again or email us directly.', 'error');
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.style.backgroundColor = '#ff6c2c';
                submitBtn.disabled = false;
            });
        });
    }
});

// Show message function
function showMessage(text, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = text;
    
    // Insert message before the form
    const form = document.querySelector('.contact-form');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}