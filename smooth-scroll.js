/**
 * Text Reveal Animations
 * Lightweight scroll animations for Pétros Biokinetics
 * Uses GSAP + ScrollTrigger (no Lenis - for better performance)
 */

// Text Reveal Animations
class TextReveal {
    constructor() {
        this.init();
    }

    init() {
        // Register ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Initialize all reveal animations
        this.setupFadeUp();
        this.setupStaggerFade();
        this.setupImageReveal();
    }

    // Simple fade up animation
    setupFadeUp() {
        const elements = document.querySelectorAll('.reveal-fade');
        
        elements.forEach(element => {
            gsap.from(element, {
                y: 50,
                opacity: 0,
                duration: 0.9,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Stagger fade for groups (cards, lists, etc.)
    setupStaggerFade() {
        const groups = document.querySelectorAll('.reveal-stagger');
        
        groups.forEach(group => {
            const children = group.children;
            
            gsap.from(children, {
                y: 30,
                opacity: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: group,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Image reveal with scale effect
    setupImageReveal() {
        const images = document.querySelectorAll('.reveal-image');
        
        images.forEach(img => {
            gsap.from(img, {
                scale: 1.1,
                opacity: 0,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: img,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP and ScrollTrigger are loaded
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        window.textReveal = new TextReveal();
    }
});

// Refresh ScrollTrigger on page load (for images)
window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
});
