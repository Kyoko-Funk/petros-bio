function initDrawIcons() {
    if (typeof lucide === 'undefined') return;

    // 1. Regular Icons
    const containers = document.querySelectorAll('.draw-icon');
    containers.forEach(container => {
        const svg = container.querySelector('svg');
        if (!svg) return;
        animateSVGPaths(svg, container);
    });

    // 2. Hand-Drawn Underlines
    const underlines = document.querySelectorAll('.draw-underline');
    underlines.forEach(container => {
        if (container.querySelector('svg')) return; // Avoid double init

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 200 20");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.classList.add("absolute", "left-0", "-bottom-1", "w-full", "h-3", "pointer-events-none", "z-0");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // A slightly wobbly, hand-drawn like line
        path.setAttribute("d", "M5,15 Q50,12 100,15 T195,14");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("stroke-linecap", "round");

        svg.appendChild(path);
        container.classList.add("relative", "inline-block");
        container.appendChild(svg);

        animateSVGPaths(svg, container);
    });

    // 3. Hand-Drawn Circles
    const circles = document.querySelectorAll('.draw-circle');
    circles.forEach(container => {
        if (container.querySelector('svg')) return;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 40");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.classList.add("absolute", "-left-2", "-top-1", "w-[calc(100%+16px)]", "h-[calc(100%+8px)]", "pointer-events-none", "z-0");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // A hand-drawn circle that doesn't quite close perfectly
        path.setAttribute("d", "M10,20 C10,5 90,5 90,20 C90,35 10,35 12,22");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("stroke-linecap", "round");

        svg.appendChild(path);
        container.classList.add("relative", "inline-block");
        container.appendChild(svg);

        animateSVGPaths(svg, container);
    });
}

function animateSVGPaths(svg, triggerElement) {
    const shapes = svg.querySelectorAll('path, circle, line, polyline, polygon, rect, ellipse');

    shapes.forEach(shape => {
        try {
            const length = shape.getTotalLength();
            gsap.set(shape, {
                strokeDasharray: length,
                strokeDashoffset: length,
                opacity: 0
            });

            gsap.to(shape, {
                strokeDashoffset: 0,
                opacity: 0.6,
                duration: 1.2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: triggerElement,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        } catch (e) { }
    });
}

window.initDrawIcons = initDrawIcons;

// Initialize on load
document.addEventListener('DOMContentLoaded', initDrawIcons);
