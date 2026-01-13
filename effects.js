/**
 * Pétros Biokinetics - Code-Based Visual Effects
 */

function initEffects() {
    // 1. Mouse-following Glow for Cards
    const cards = document.querySelectorAll('.pricing-card, .method-step, .spotlight-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 2. Organic Background Floating
    const blobs = document.querySelectorAll('.animate-blob');
    blobs.forEach((blob, i) => {
        gsap.to(blob, {
            x: 'random(-40, 40)',
            y: 'random(-40, 40)',
            duration: 'random(5, 8)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.5
        });
    });

    // 3. Navbar Shrink on Scroll
    const nav = document.querySelector('.glass-morphism');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                gsap.to(nav, {
                    py: 3,
                    scale: 0.98,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(nav, {
                    py: 4,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initEffects);
