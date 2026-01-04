/**
 * Lenis Smooth Scroll + Text Reveal Animations
 * Premium scrolling experience for Pétros Biokinetics
 */

// Initialize Lenis Smooth Scroll
class SmoothScroll {
    constructor() {
        this.lenis = null;
        this.init();
    }

    init() {
        // Create Lenis instance
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Connect Lenis to GSAP ScrollTrigger
        this.lenis.on('scroll', ScrollTrigger.update);

        // Add Lenis's requestAnimationFrame to GSAP's ticker
        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });

        // Disable lag smoothing for better performance
        gsap.ticker.lagSmoothing(0);

        // Handle anchor links smoothly
        this.setupAnchorLinks();
    }

    setupAnchorLinks() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        this.lenis.scrollTo(target, {
                            offset: -100,
                            duration: 1.5
                        });
                    }
                }
            });
        });
    }

    // Method to temporarily stop scroll (useful for modals)
    stop() {
        this.lenis.stop();
    }

    // Method to resume scroll
    start() {
        this.lenis.start();
    }
}

// Text Reveal Animations
class TextReveal {
    constructor() {
        this.init();
    }

    init() {
        // Register ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Initialize all reveal animations
        this.setupWordReveal();
        this.setupLineReveal();
        this.setupCharReveal();
        this.setupFadeUp();
        this.setupStaggerFade();
        this.setupParallaxElements();
    }

    // Split text into words and animate
    setupWordReveal() {
        const elements = document.querySelectorAll('.reveal-words');
        
        elements.forEach(element => {
            // Store original text
            const text = element.textContent;
            element.innerHTML = '';
            
            // Split into words
            const words = text.split(' ');
            words.forEach((word, i) => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'reveal-word';
                wordSpan.style.cssText = 'display: inline-block; overflow: hidden;';
                
                const innerSpan = document.createElement('span');
                innerSpan.className = 'reveal-word-inner';
                innerSpan.style.cssText = 'display: inline-block; transform: translateY(100%);';
                innerSpan.textContent = word;
                
                wordSpan.appendChild(innerSpan);
                element.appendChild(wordSpan);
                
                // Add space between words
                if (i < words.length - 1) {
                    element.appendChild(document.createTextNode(' '));
                }
            });

            // Animate
            gsap.to(element.querySelectorAll('.reveal-word-inner'), {
                y: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Line by line reveal (for paragraphs)
    setupLineReveal() {
        const elements = document.querySelectorAll('.reveal-lines');
        
        elements.forEach(element => {
            // Wrap element content
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'overflow: hidden;';
            wrapper.innerHTML = element.innerHTML;
            element.innerHTML = '';
            element.appendChild(wrapper);

            gsap.from(wrapper, {
                y: '100%',
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Character by character reveal (for titles)
    setupCharReveal() {
        const elements = document.querySelectorAll('.reveal-chars');
        
        elements.forEach(element => {
            const text = element.textContent;
            element.innerHTML = '';
            element.style.cssText = 'display: inline-block;';
            
            // Split into characters
            [...text].forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.className = 'reveal-char';
                charSpan.style.cssText = 'display: inline-block; opacity: 0; transform: translateY(50px) rotate(10deg);';
                charSpan.textContent = char === ' ' ? '\u00A0' : char;
                element.appendChild(charSpan);
            });

            gsap.to(element.querySelectorAll('.reveal-char'), {
                opacity: 1,
                y: 0,
                rotation: 0,
                duration: 0.6,
                stagger: 0.02,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Simple fade up animation
    setupFadeUp() {
        const elements = document.querySelectorAll('.reveal-fade');
        
        elements.forEach(element => {
            gsap.from(element, {
                y: 60,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
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
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: group,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // Parallax effect for background elements
    setupParallaxElements() {
        const elements = document.querySelectorAll('.parallax-element');
        
        elements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            
            gsap.to(element, {
                y: () => -100 * speed,
                ease: 'none',
                scrollTrigger: {
                    trigger: element.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });
    }
}

// Image reveal animation
class ImageReveal {
    constructor() {
        this.init();
    }

    init() {
        const images = document.querySelectorAll('.reveal-image');
        
        images.forEach(img => {
            // Create wrapper if not exists
            let wrapper = img.parentElement;
            if (!wrapper.classList.contains('image-reveal-wrapper')) {
                wrapper = document.createElement('div');
                wrapper.className = 'image-reveal-wrapper';
                wrapper.style.cssText = 'overflow: hidden; position: relative;';
                img.parentNode.insertBefore(wrapper, img);
                wrapper.appendChild(img);
            }

            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'image-reveal-overlay';
            overlay.style.cssText = 'position: absolute; inset: 0; background: #7A8B69; transform-origin: left; z-index: 2;';
            wrapper.appendChild(overlay);

            // Animation timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapper,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });

            tl.from(img, {
                scale: 1.3,
                duration: 1.4,
                ease: 'power3.out'
            })
            .to(overlay, {
                scaleX: 0,
                duration: 1,
                ease: 'power3.inOut'
            }, 0);
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if Lenis is loaded
    if (typeof Lenis !== 'undefined') {
        window.smoothScroll = new SmoothScroll();
    }
    
    // Check if GSAP and ScrollTrigger are loaded
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        window.textReveal = new TextReveal();
        window.imageReveal = new ImageReveal();
    }
});

// Refresh ScrollTrigger on page load (for images)
window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
});
