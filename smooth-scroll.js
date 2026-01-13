/**
 * Text Reveal Animations
 * Lightweight scroll animations for Pétros Biokinetics
 * Uses GSAP + ScrollTrigger (no Lenis - for better performance)
 */

// Text Reveal Animations
class TextReveal {
    constructor() {
        // Mobile detection for performance optimization
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.innerWidth < 768;
        this.init();
    }

    init() {
        // Register ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Use simpler animations on mobile for smoother scrolling
        if (this.isMobile) {
            // Simpler, faster animations for mobile
            ScrollTrigger.config({ limitCallbacks: true });
        }

        // Initialize all reveal animations
        this.setupFadeUp();
        this.setupStaggerFade();
        this.setupImageReveal();
        // Skip word-by-word line reveal on mobile (too heavy)
        if (!this.isMobile) {
            this.setupLineReveal();
        }
        this.setupSlideIn();
    }

    // Simple fade up animation
    setupFadeUp() {
        const elements = document.querySelectorAll('.reveal-fade');
        const duration = this.isMobile ? 0.5 : 0.9;
        const yOffset = this.isMobile ? 30 : 50;

        elements.forEach(element => {
            gsap.from(element, {
                y: yOffset,
                opacity: 0,
                duration: duration,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 92%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Stagger fade for groups (cards, lists, etc.)
    setupStaggerFade() {
        const groups = document.querySelectorAll('.reveal-stagger');
        const duration = this.isMobile ? 0.4 : 0.7;
        const staggerDelay = this.isMobile ? 0.08 : 0.12;

        groups.forEach(group => {
            const children = group.children;

            gsap.from(children, {
                y: this.isMobile ? 20 : 30,
                opacity: 0,
                duration: duration,
                stagger: staggerDelay,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: group,
                    start: 'top 90%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Image reveal with scale effect
    setupImageReveal() {
        const images = document.querySelectorAll('.reveal-image');
        const duration = this.isMobile ? 0.6 : 1;

        images.forEach(img => {
            gsap.from(img, {
                scale: this.isMobile ? 1.05 : 1.1,
                opacity: 0,
                duration: duration,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: img,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Line-by-line reveal for paragraphs (splits into lines)
    setupLineReveal() {
        const elements = document.querySelectorAll('.reveal-lines');

        elements.forEach(element => {
            // Get computed styles for proper line splitting
            const text = element.textContent;
            const words = text.split(' ');

            // Clear and rebuild with word spans
            element.innerHTML = '';
            element.style.opacity = '1';

            words.forEach((word, i) => {
                const span = document.createElement('span');
                span.className = 'inline-block';
                span.textContent = word;
                element.appendChild(span);
                if (i < words.length - 1) {
                    element.appendChild(document.createTextNode(' '));
                }
            });

            const wordSpans = element.querySelectorAll('span');

            gsap.from(wordSpans, {
                y: 15,
                opacity: 0,
                duration: 0.35,
                stagger: 0.008,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 92%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Slide in from left or right
    setupSlideIn() {
        const leftElements = document.querySelectorAll('.reveal-left');
        const rightElements = document.querySelectorAll('.reveal-right');
        const duration = this.isMobile ? 0.5 : 0.9;
        const xOffset = this.isMobile ? 30 : 60;

        leftElements.forEach(element => {
            gsap.from(element, {
                x: -xOffset,
                opacity: 0,
                duration: duration,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 92%',
                    toggleActions: 'play none none none'
                }
            });
        });

        rightElements.forEach(element => {
            gsap.from(element, {
                x: xOffset,
                opacity: 0,
                duration: duration,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 92%',
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
