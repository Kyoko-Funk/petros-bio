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
        this.setupLineReveal();
        this.setupSlideIn();
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
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.02,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Slide in from left or right
    setupSlideIn() {
        const leftElements = document.querySelectorAll('.reveal-left');
        const rightElements = document.querySelectorAll('.reveal-right');
        
        leftElements.forEach(element => {
            gsap.from(element, {
                x: -60,
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

        rightElements.forEach(element => {
            gsap.from(element, {
                x: 60,
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
