/**
 * Pétros Biokinetics - 3D Particle Mesh Effects
 * Each page has a unique particle configuration matching its theme
 */

class ParticleMesh {
    constructor(canvasId, config = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas || typeof THREE === 'undefined') return;

        // Default configuration
        this.config = {
            particleCount: config.particleCount || 1200,
            particleSize: config.particleSize || 0.03,
            particleOpacity: config.particleOpacity || 0.6,
            lineOpacity: config.lineOpacity || 0.15,
            connectionDistance: config.connectionDistance || 1.5,
            primaryColor: config.primaryColor || '#7A8B69',
            secondaryColor: config.secondaryColor || '#ffffff',
            colorMixRatio: config.colorMixRatio || 0.5,
            waveSpeed: config.waveSpeed || 0.002,
            waveAmplitude: config.waveAmplitude || 0.3,
            rotationSpeed: config.rotationSpeed || 0.001,
            spreadX: config.spreadX || 20,
            spreadY: config.spreadY || 10,
            spreadZ: config.spreadZ || 10,
            pattern: config.pattern || 'wave', // wave, spiral, sphere, grid
            mouseInfluence: config.mouseInfluence || 0.1,
            ...config
        };

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.createParticles();
        this.createLines();
        this.setupMouseTracking();
        this.setupResizeHandler();
        this.setupVisibilityObserver();
        
        this.camera.position.z = 5;
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isVisible = true;

        this.animate();
    }

    createParticles() {
        const { particleCount, spreadX, spreadY, spreadZ, pattern, primaryColor, secondaryColor, colorMixRatio } = this.config;
        
        this.positions = new Float32Array(particleCount * 3);
        this.originalPositions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const color1 = new THREE.Color(primaryColor);
        const color2 = new THREE.Color(secondaryColor);
        
        for (let i = 0; i < particleCount; i++) {
            let x, y, z;
            
            switch (pattern) {
                case 'spiral':
                    const angle = (i / particleCount) * Math.PI * 8;
                    const radius = (i / particleCount) * 8;
                    x = Math.cos(angle) * radius;
                    y = (Math.random() - 0.5) * spreadY;
                    z = Math.sin(angle) * radius - 5;
                    break;
                    
                case 'sphere':
                    const phi = Math.acos(-1 + (2 * i) / particleCount);
                    const theta = Math.sqrt(particleCount * Math.PI) * phi;
                    x = Math.cos(theta) * Math.sin(phi) * 5;
                    y = Math.sin(theta) * Math.sin(phi) * 5;
                    z = Math.cos(phi) * 5;
                    break;
                    
                case 'grid':
                    const cols = Math.ceil(Math.sqrt(particleCount));
                    x = ((i % cols) / cols - 0.5) * spreadX;
                    y = (Math.floor(i / cols) / cols - 0.5) * spreadY;
                    z = (Math.random() - 0.5) * 2;
                    break;
                    
                case 'flow':
                    x = (Math.random() - 0.5) * spreadX;
                    y = (Math.random() - 0.5) * spreadY * 0.5;
                    z = (Math.random() - 0.5) * spreadZ * 0.5;
                    break;
                    
                case 'converge':
                    const dist = Math.random() * 10;
                    const ang = Math.random() * Math.PI * 2;
                    x = Math.cos(ang) * dist;
                    y = Math.sin(ang) * dist * 0.5;
                    z = (Math.random() - 0.5) * 5;
                    break;
                
                case 'layers':
                    // Clean horizontal layers - structured and clinical
                    const layerCount = 5;
                    const layer = Math.floor(Math.random() * layerCount);
                    x = (Math.random() - 0.5) * spreadX;
                    y = (layer / layerCount - 0.5) * spreadY + (Math.random() - 0.5) * 0.5;
                    z = (Math.random() - 0.5) * spreadZ * 0.3;
                    break;
                
                case 'drops':
                    // Raindrop-like distribution - spread wide, falling effect
                    x = (Math.random() - 0.5) * spreadX;
                    y = (Math.random() - 0.5) * spreadY;
                    z = (Math.random() - 0.5) * spreadZ * 0.4;
                    break;
                
                case 'rise':
                    // Rising particles - spread wide, gentle upward motion
                    x = (Math.random() - 0.5) * spreadX;
                    y = (Math.random() - 0.5) * spreadY;
                    z = (Math.random() - 0.5) * spreadZ * 0.3;
                    break;
                    
                default: // wave
                    x = (Math.random() - 0.5) * spreadX;
                    y = (Math.random() - 0.5) * spreadY;
                    z = (Math.random() - 0.5) * spreadZ;
            }
            
            this.positions[i * 3] = x;
            this.positions[i * 3 + 1] = y;
            this.positions[i * 3 + 2] = z;
            
            this.originalPositions[i * 3] = x;
            this.originalPositions[i * 3 + 1] = y;
            this.originalPositions[i * 3 + 2] = z;
            
            // Mix colors
            const mixRatio = Math.random() * colorMixRatio;
            const mixedColor = color1.clone().lerp(color2, mixRatio);
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: this.config.particleSize,
            vertexColors: true,
            transparent: true,
            opacity: this.config.particleOpacity,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createLines() {
        const { particleCount, connectionDistance, primaryColor, lineOpacity } = this.config;
        
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = [];
        const lineColors = [];
        const lineColor = new THREE.Color(primaryColor);
        
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < Math.min(i + 5, particleCount); j++) {
                const x1 = this.positions[i * 3];
                const y1 = this.positions[i * 3 + 1];
                const z1 = this.positions[i * 3 + 2];
                const x2 = this.positions[j * 3];
                const y2 = this.positions[j * 3 + 1];
                const z2 = this.positions[j * 3 + 2];
                
                const dist = Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2);
                
                if (dist < connectionDistance) {
                    linePositions.push(x1, y1, z1, x2, y2, z2);
                    lineColors.push(lineColor.r, lineColor.g, lineColor.b);
                    lineColors.push(lineColor.r, lineColor.g, lineColor.b);
                }
            }
        }

        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: lineOpacity,
            blending: THREE.AdditiveBlending
        });

        this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.lines);
    }

    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupVisibilityObserver() {
        const header = document.querySelector('header');
        if (!header) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                this.canvas.style.opacity = entry.isIntersecting ? '1' : '0';
            });
        }, { threshold: 0.1 });

        observer.observe(header);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.isVisible) return;

        this.time += this.config.waveSpeed;
        const { pattern, waveAmplitude, rotationSpeed, mouseInfluence } = this.config;

        // Animate particles based on pattern
        const pos = this.particles.geometry.attributes.position.array;
        
        for (let i = 0; i < this.config.particleCount; i++) {
            const origX = this.originalPositions[i * 3];
            const origY = this.originalPositions[i * 3 + 1];
            
            switch (pattern) {
                case 'spiral':
                    pos[i * 3 + 1] = origY + Math.sin(this.time * 2 + i * 0.05) * waveAmplitude;
                    break;
                    
                case 'sphere':
                    const scale = 1 + Math.sin(this.time + i * 0.01) * 0.1;
                    pos[i * 3] = this.originalPositions[i * 3] * scale;
                    pos[i * 3 + 1] = this.originalPositions[i * 3 + 1] * scale;
                    pos[i * 3 + 2] = this.originalPositions[i * 3 + 2] * scale;
                    break;
                    
                case 'grid':
                    pos[i * 3 + 2] = Math.sin(this.time + origX * 0.5 + origY * 0.5) * waveAmplitude * 2;
                    break;
                    
                case 'flow':
                    pos[i * 3] = origX + Math.sin(this.time + origY) * waveAmplitude;
                    pos[i * 3 + 1] = origY + Math.cos(this.time + origX * 0.5) * waveAmplitude * 0.5;
                    break;
                    
                case 'converge':
                    const pulse = Math.sin(this.time) * 0.3;
                    pos[i * 3] = origX * (1 - pulse * 0.1);
                    pos[i * 3 + 1] = origY * (1 - pulse * 0.1);
                    break;
                
                case 'layers':
                    // Gentle horizontal drift with subtle vertical wave
                    pos[i * 3] = origX + Math.sin(this.time * 0.5 + origY * 0.3) * waveAmplitude * 0.5;
                    pos[i * 3 + 1] = origY + Math.sin(this.time + origX * 0.2) * waveAmplitude * 0.3;
                    break;
                
                case 'drops':
                    // Falling raindrop effect - particles drift down and reset
                    const fallSpeed = 0.02;
                    const dropOffset = (this.time * fallSpeed + i * 0.01) % 1;
                    const yRange = this.config.spreadY || 15;
                    
                    // Smooth falling motion with slight horizontal sway
                    pos[i * 3] = origX + Math.sin(this.time * 0.5 + i * 0.1) * waveAmplitude * 0.3;
                    pos[i * 3 + 1] = (yRange / 2) - (dropOffset * yRange) + Math.sin(i) * 2;
                    
                    // Fade effect at bottom (handled by position)
                    break;
                
                case 'rise':
                    // Gentle rising effect - particles float upward
                    const riseSpeed = 0.015;
                    const riseOffset = (this.time * riseSpeed + i * 0.008) % 1;
                    const yRangeRise = this.config.spreadY || 12;
                    
                    // Smooth rising motion with gentle horizontal sway
                    pos[i * 3] = origX + Math.sin(this.time * 0.3 + i * 0.05) * waveAmplitude * 0.4;
                    pos[i * 3 + 1] = (-yRangeRise / 2) + (riseOffset * yRangeRise) + Math.sin(i * 0.5) * 1.5;
                    pos[i * 3 + 2] = this.originalPositions[i * 3 + 2] + Math.cos(this.time * 0.2 + i * 0.03) * 0.2;
                    break;
                    
                default: // wave
                    pos[i * 3 + 1] = origY + Math.sin(this.time + origX * 0.5) * waveAmplitude;
            }
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;

        // Mouse interaction
        this.particles.rotation.y += (this.mouseX * mouseInfluence - this.particles.rotation.y) * 0.02;
        this.particles.rotation.x += (this.mouseY * mouseInfluence * 0.5 - this.particles.rotation.x) * 0.02;
        this.lines.rotation.y = this.particles.rotation.y;
        this.lines.rotation.x = this.particles.rotation.x;

        // Continuous rotation
        this.particles.rotation.y += rotationSpeed;
        this.lines.rotation.y += rotationSpeed;

        this.renderer.render(this.scene, this.camera);
    }
}

// Page-specific configurations
const particleConfigs = {
    // Homepage - Flowing wave (clinical excellence)
    home: {
        particleCount: 1500,
        pattern: 'wave',
        waveAmplitude: 0.3,
        primaryColor: '#7A8B69',
        secondaryColor: '#ffffff',
        colorMixRatio: 0.5
    },
    
    // Method page - Clean horizontal layers (structured methodology)
    method: {
        particleCount: 1000,
        pattern: 'layers',
        waveAmplitude: 0.2,
        primaryColor: '#7A8B69',
        secondaryColor: '#2F3E30',
        colorMixRatio: 0.3,
        rotationSpeed: 0.0008,
        spreadX: 25,
        spreadY: 12,
        lineOpacity: 0.1
    },
    
    // Services page - Expanding sphere (multiple services)
    services: {
        particleCount: 1000,
        pattern: 'sphere',
        primaryColor: '#7A8B69',
        secondaryColor: '#ffffff',
        colorMixRatio: 0.4,
        rotationSpeed: 0.0015
    },
    
    // Pricing page - Gentle rising particles (value/growth)
    pricing: {
        particleCount: 900,
        pattern: 'rise',
        waveAmplitude: 0.3,
        primaryColor: '#7A8B69',
        secondaryColor: '#ffffff',
        colorMixRatio: 0.5,
        spreadX: 25,
        spreadY: 12,
        lineOpacity: 0.1,
        waveSpeed: 0.002
    },
    
    // FAQ page - Gentle flow (answers flowing)
    faq: {
        particleCount: 1000,
        pattern: 'flow',
        waveAmplitude: 0.25,
        primaryColor: '#7A8B69',
        secondaryColor: '#ffffff',
        colorMixRatio: 0.5,
        waveSpeed: 0.0015
    },
    
    // Contact page - Falling drops (reaching out)
    contact: {
        particleCount: 800,
        pattern: 'drops',
        waveAmplitude: 0.4,
        primaryColor: '#7A8B69',
        secondaryColor: '#ffffff',
        colorMixRatio: 0.6,
        waveSpeed: 0.003,
        spreadX: 30,
        spreadY: 15,
        lineOpacity: 0.08
    },
    
    // About page - Organic wave (personal)
    about: {
        particleCount: 1000,
        pattern: 'wave',
        waveAmplitude: 0.35,
        primaryColor: '#7A8B69',
        secondaryColor: '#2F3E30',
        colorMixRatio: 0.4,
        spreadY: 8
    },
    
    // Book Now page - Flow towards action
    booking: {
        particleCount: 1100,
        pattern: 'flow',
        waveAmplitude: 0.3,
        primaryColor: '#7A8B69',
        secondaryColor: '#ffffff',
        colorMixRatio: 0.5,
        waveSpeed: 0.0025
    }
};

// Initialize on page load
function initParticles(pageType) {
    const config = particleConfigs[pageType] || particleConfigs.home;
    new ParticleMesh('particle-canvas', config);
}
