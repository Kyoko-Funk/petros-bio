/**
 * Pétros Biokinetics - 3D Card Tilt Effect
 * Adds subtle depth and tilt to cards on hover
 */

class CardTilt {
    constructor(selector, options = {}) {
        this.cards = document.querySelectorAll(selector);
        if (this.cards.length === 0) return;

        // Configuration
        this.config = {
            maxTilt: options.maxTilt || 8,           // Maximum tilt angle in degrees
            perspective: options.perspective || 1000, // Perspective depth
            scale: options.scale || 1.02,            // Scale on hover
            speed: options.speed || 400,             // Transition speed in ms
            glare: options.glare !== false,          // Enable glare effect
            glareOpacity: options.glareOpacity || 0.15,
            ...options
        };

        // Check for mobile - disable tilt on touch devices for better UX
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        || window.innerWidth < 768
                        || 'ontouchstart' in window;

        if (this.isMobile) {
            // On mobile, just add a subtle scale effect instead
            this.initMobile();
        } else {
            this.init();
        }
    }

    init() {
        this.cards.forEach(card => {
            // Set up the card styles
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = `transform ${this.config.speed}ms ease-out`;

            // Create glare element if enabled
            if (this.config.glare) {
                const glare = document.createElement('div');
                glare.className = 'tilt-glare';
                glare.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    background: linear-gradient(
                        135deg,
                        rgba(255,255,255,${this.config.glareOpacity}) 0%,
                        rgba(255,255,255,0) 50%
                    );
                    opacity: 0;
                    transition: opacity ${this.config.speed}ms ease-out;
                    border-radius: inherit;
                    z-index: 10;
                `;
                
                // Ensure card has relative positioning
                if (getComputedStyle(card).position === 'static') {
                    card.style.position = 'relative';
                }
                card.style.overflow = 'hidden';
                card.appendChild(glare);
            }

            // Event listeners
            card.addEventListener('mouseenter', () => this.onEnter(card));
            card.addEventListener('mousemove', (e) => this.onMove(e, card));
            card.addEventListener('mouseleave', () => this.onLeave(card));
        });
    }

    initMobile() {
        // Simple touch feedback for mobile
        this.cards.forEach(card => {
            card.style.transition = 'transform 200ms ease-out';
            
            card.addEventListener('touchstart', () => {
                card.style.transform = `scale(${this.config.scale - 0.01})`;
            }, { passive: true });
            
            card.addEventListener('touchend', () => {
                card.style.transform = 'scale(1)';
            }, { passive: true });
        });
    }

    onEnter(card) {
        card.style.transition = `transform ${this.config.speed}ms ease-out`;
        
        const glare = card.querySelector('.tilt-glare');
        if (glare) {
            glare.style.opacity = '1';
        }
    }

    onMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate tilt angles
        const tiltX = ((y - centerY) / centerY) * -this.config.maxTilt;
        const tiltY = ((x - centerX) / centerX) * this.config.maxTilt;

        // Apply transform
        card.style.transform = `
            perspective(${this.config.perspective}px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            scale3d(${this.config.scale}, ${this.config.scale}, ${this.config.scale})
        `;

        // Update glare position
        const glare = card.querySelector('.tilt-glare');
        if (glare) {
            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;
            glare.style.background = `
                radial-gradient(
                    circle at ${glareX}% ${glareY}%,
                    rgba(255,255,255,${this.config.glareOpacity}) 0%,
                    rgba(255,255,255,0) 60%
                )
            `;
        }
    }

    onLeave(card) {
        // Reset transform
        card.style.transform = `
            perspective(${this.config.perspective}px)
            rotateX(0deg)
            rotateY(0deg)
            scale3d(1, 1, 1)
        `;

        const glare = card.querySelector('.tilt-glare');
        if (glare) {
            glare.style.opacity = '0';
        }
    }
}

// Initialize tilt effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Services page - service cards
    new CardTilt('.gradient-card', {
        maxTilt: 6,
        scale: 1.02,
        glareOpacity: 0.12
    });

    // Pricing page - pricing cards
    new CardTilt('.pricing-card', {
        maxTilt: 5,
        scale: 1.015,
        glareOpacity: 0.1
    });

    // Homepage - spotlight cards
    new CardTilt('.spotlight-card', {
        maxTilt: 8,
        scale: 1.03,
        glareOpacity: 0.15
    });

    // Method page - method step cards
    new CardTilt('.method-step .rounded-3xl', {
        maxTilt: 6,
        scale: 1.02,
        glareOpacity: 0.12
    });

    // About page - any feature cards
    new CardTilt('.feature-card', {
        maxTilt: 5,
        scale: 1.02,
        glareOpacity: 0.1
    });
});
