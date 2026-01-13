/**
 * Pétros Biokinetics - Magnetic Button Effect
 * Adds subtle magnetic cursor-following effect to buttons
 */

class MagneticButton {
    constructor(selector, options = {}) {
        this.buttons = document.querySelectorAll(selector);
        if (this.buttons.length === 0) return;

        // Configuration
        this.config = {
            strength: options.strength || 0.3,        // Magnetic strength (0-1)
            distance: options.distance || 50,         // Maximum distance in pixels
            maxMove: options.maxMove || 8,           // Maximum movement in pixels
            easing: options.easing || 'power2.out',   // GSAP easing
            duration: options.duration || 0.3,        // Animation duration
            ...options
        };

        // Check for mobile - disable magnetic effect on touch devices
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        || window.innerWidth < 768
                        || 'ontouchstart' in window;

        if (this.isMobile) {
            return; // Don't initialize on mobile
        }

        // Ensure GSAP is available
        if (typeof gsap === 'undefined') {
            console.warn('GSAP is required for magnetic button effect');
            return;
        }

        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            // Store original transform
            button.style.transformOrigin = 'center';
            button.style.willChange = 'transform';

            // Get button bounds
            const rect = button.getBoundingClientRect();
            
            // Mouse enter handler
            const handleMouseEnter = () => {
                button.addEventListener('mousemove', handleMouseMove);
            };

            // Mouse move handler
            const handleMouseMove = (e) => {
                const rect = button.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Calculate distance from cursor to button center
                const deltaX = e.clientX - centerX;
                const deltaY = e.clientY - centerY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                // Only apply effect if cursor is within distance threshold
                if (distance < this.config.distance) {
                    // Calculate magnetic pull using inverse square law for natural feel
                    const pull = 1 - (distance / this.config.distance);
                    const strength = this.config.strength * pull;

                    // Calculate movement (limited to maxMove)
                    const moveX = Math.min(Math.max(deltaX * strength, -this.config.maxMove), this.config.maxMove);
                    const moveY = Math.min(Math.max(deltaY * strength, -this.config.maxMove), this.config.maxMove);

                    // Apply transform with GSAP for smooth animation
                    gsap.to(button, {
                        x: moveX,
                        y: moveY,
                        duration: this.config.duration,
                        ease: this.config.easing
                    });
                } else {
                    // Reset if cursor is too far
                    gsap.to(button, {
                        x: 0,
                        y: 0,
                        duration: this.config.duration,
                        ease: this.config.easing
                    });
                }
            };

            // Mouse leave handler - reset position
            const handleMouseLeave = () => {
                button.removeEventListener('mousemove', handleMouseMove);
                gsap.to(button, {
                    x: 0,
                    y: 0,
                    duration: this.config.duration,
                    ease: this.config.easing
                });
            };

            // Attach event listeners
            button.addEventListener('mouseenter', handleMouseEnter);
            button.addEventListener('mouseleave', handleMouseLeave);
        });
    }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize on buttons with data-magnetic attribute or specific classes
        new MagneticButton('[data-magnetic], .magnetic-btn');
    });
} else {
    // DOM already loaded
    new MagneticButton('[data-magnetic], .magnetic-btn');
}
