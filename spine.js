/**
 * Interactive 3D Spine Model for Pétros Biokinetics
 * Anatomically detailed spine visualization with realistic features
 */

class SpineModel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        
        // Interaction state
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.autoRotate = true;
        this.targetRotation = { x: 0, y: 0 };
        this.currentRotation = { x: 0, y: 0 };
        
        // Hover state
        this.hoveredRegion = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Spine regions data - detailed anatomical information
        this.regions = {
            cervical: {
                name: 'Cervical Spine',
                vertebrae: 'C1 (Atlas) – C7 (Vertebra Prominens)',
                count: '7 vertebrae',
                description: 'The most mobile spinal region, supporting the head and enabling a wide range of neck movements including rotation, flexion, and extension.',
                function: 'Head support, neck mobility, houses vertebral arteries',
                nerves: 'C1-C8 nerves control head, neck, shoulders, arms, and diaphragm',
                conditions: 'Whiplash, cervical radiculopathy, neck strain, herniated disc',
                color: 0x8FA07A
            },
            thoracic: {
                name: 'Thoracic Spine', 
                vertebrae: 'T1 – T12',
                count: '12 vertebrae',
                description: 'The longest spinal region, providing structural support for the ribcage and protecting vital organs including the heart and lungs.',
                function: 'Ribcage attachment, organ protection, posture stability',
                nerves: 'T1-T12 nerves control chest muscles, abdominal muscles, and trunk',
                conditions: 'Kyphosis, Scheuermann\'s disease, thoracic outlet syndrome',
                color: 0x7A8B69
            },
            lumbar: {
                name: 'Lumbar Spine',
                vertebrae: 'L1 – L5',
                count: '5 vertebrae',
                description: 'The weight-bearing powerhouse of the spine, featuring the largest vertebrae to support the upper body and enable bending and twisting movements.',
                function: 'Weight bearing, flexibility, power transfer to lower body',
                nerves: 'L1-L5 nerves control hips, legs, feet, and lower body function',
                conditions: 'Lower back pain, sciatica, lumbar stenosis, spondylolisthesis',
                color: 0x6B7C5A
            },
            sacral: {
                name: 'Sacrum & Coccyx',
                vertebrae: 'S1 – S5 (fused) + Co1-Co4',
                count: '5 fused + 4 coccygeal',
                description: 'The foundation of the spine, connecting the vertebral column to the pelvis. The sacrum transmits body weight to the hip bones while the coccyx serves as an attachment point for ligaments and muscles.',
                function: 'Pelvic stability, weight distribution, muscle attachment',
                nerves: 'Sacral plexus controls bowel, bladder, and sexual function',
                conditions: 'Sacroiliac dysfunction, coccydynia, sacral fractures',
                color: 0x5C6D4B
            }
        };
        
        this.regionMeshes = [];
        this.vertebraeMeshes = [];
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupLights();
        this.createDetailedSpine();
        this.setupInteraction();
        this.animate();
        this.setupResize();
    }
    
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        
        // Camera - pulled back for full view
        this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 18;
        this.camera.position.y = 0;
        
        // Renderer with better quality
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        // Spine group for rotation
        this.spineGroup = new THREE.Group();
        this.scene.add(this.spineGroup);
    }
    
    setupLights() {
        // Ambient light - warmer for bone appearance
        const ambient = new THREE.AmbientLight(0xFFF8F0, 0.6);
        this.scene.add(ambient);
        
        // Main key light - warm white
        const keyLight = new THREE.DirectionalLight(0xFFFAF0, 1.0);
        keyLight.position.set(8, 8, 12);
        keyLight.castShadow = true;
        this.scene.add(keyLight);
        
        // Fill light - warm tone for bone depth
        const fillLight = new THREE.DirectionalLight(0xFFE4C4, 0.5);
        fillLight.position.set(-6, 2, 8);
        this.scene.add(fillLight);
        
        // Rim light - green accent for brand consistency
        const rimLight = new THREE.DirectionalLight(0x9AAB8A, 0.4);
        rimLight.position.set(0, -5, -10);
        this.scene.add(rimLight);
        
        // Top light for depth
        const topLight = new THREE.DirectionalLight(0xFFFAF5, 0.4);
        topLight.position.set(0, 15, 0);
        this.scene.add(topLight);
        
        // Bottom fill to reduce harsh shadows
        const bottomLight = new THREE.DirectionalLight(0xE8DED0, 0.2);
        bottomLight.position.set(0, -10, 5);
        this.scene.add(bottomLight);
    }
    
    // Create realistic bone material - warm ivory tones
    createBoneMaterial(isHighlight = false) {
        return new THREE.MeshStandardMaterial({
            color: isHighlight ? 0x8FA07A : 0xD4C8B8, // Warm ivory bone color
            roughness: 0.65,
            metalness: 0.02,
            flatShading: false
        });
    }
    
    // Secondary bone material for details
    createDarkBoneMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0xC4B8A8, // Slightly darker ivory
            roughness: 0.75,
            metalness: 0.01
        });
    }
    
    // Create cartilage/disc material - green tinted
    createDiscMaterial() {
        return new THREE.MeshStandardMaterial({
            color: 0x7A8B69,
            roughness: 0.45,
            metalness: 0.0,
            transparent: true,
            opacity: 0.9
        });
    }
    
    // Create a detailed vertebra with anatomical features
    createDetailedVertebra(config) {
        const { 
            scale = 1, 
            regionKey, 
            isCervical = false, 
            isThoracic = false,
            isLumbar = false,
            curveOffset = 0 
        } = config;
        
        const group = new THREE.Group();
        group.userData.region = regionKey;
        
        const boneMaterial = this.createBoneMaterial();
        const darkBoneMaterial = this.createDarkBoneMaterial();
        
        // === VERTEBRAL BODY (centrum) - main weight-bearing part ===
        // More realistic shape - slightly concave sides
        const bodyRadius = 0.4 * scale;
        const bodyHeight = 0.28 * scale;
        
        // Create vertebral body with lathe for organic shape
        const bodyPoints = [];
        for (let i = 0; i <= 10; i++) {
            const t = i / 10;
            const y = (t - 0.5) * bodyHeight;
            // Concave sides profile
            const r = bodyRadius * (1 - 0.08 * Math.sin(t * Math.PI));
            bodyPoints.push(new THREE.Vector2(r, y));
        }
        const bodyGeometry = new THREE.LatheGeometry(bodyPoints, 24);
        const body = new THREE.Mesh(bodyGeometry, boneMaterial);
        body.rotation.x = Math.PI / 2;
        body.position.z = curveOffset;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // === VERTEBRAL ARCH (neural arch) ===
        // Pedicles - connect body to posterior elements
        const pedicleGeometry = new THREE.CylinderGeometry(0.08 * scale, 0.1 * scale, 0.25 * scale, 8);
        
        const leftPedicle = new THREE.Mesh(pedicleGeometry, boneMaterial);
        leftPedicle.position.set(0.25 * scale, 0, -0.18 * scale + curveOffset);
        leftPedicle.rotation.x = Math.PI / 2;
        leftPedicle.rotation.z = 0.3;
        leftPedicle.castShadow = true;
        group.add(leftPedicle);
        
        const rightPedicle = new THREE.Mesh(pedicleGeometry, boneMaterial);
        rightPedicle.position.set(-0.25 * scale, 0, -0.18 * scale + curveOffset);
        rightPedicle.rotation.x = Math.PI / 2;
        rightPedicle.rotation.z = -0.3;
        rightPedicle.castShadow = true;
        group.add(rightPedicle);
        
        // Laminae - form posterior wall of vertebral foramen
        const laminaShape = new THREE.Shape();
        laminaShape.moveTo(0, 0);
        laminaShape.quadraticCurveTo(0.15 * scale, -0.1 * scale, 0.08 * scale, -0.25 * scale);
        laminaShape.lineTo(-0.08 * scale, -0.25 * scale);
        laminaShape.quadraticCurveTo(-0.15 * scale, -0.1 * scale, 0, 0);
        
        const laminaExtrudeSettings = {
            steps: 1,
            depth: 0.25 * scale,
            bevelEnabled: true,
            bevelThickness: 0.02 * scale,
            bevelSize: 0.02 * scale,
            bevelSegments: 3
        };
        
        const leftLaminaGeometry = new THREE.ExtrudeGeometry(laminaShape, laminaExtrudeSettings);
        const leftLamina = new THREE.Mesh(leftLaminaGeometry, boneMaterial);
        leftLamina.position.set(0.18 * scale, 0.08 * scale, -0.35 * scale + curveOffset);
        leftLamina.rotation.y = 0.4;
        leftLamina.castShadow = true;
        group.add(leftLamina);
        
        const rightLamina = new THREE.Mesh(leftLaminaGeometry, boneMaterial);
        rightLamina.position.set(-0.18 * scale, 0.08 * scale, -0.35 * scale + curveOffset);
        rightLamina.rotation.y = -0.4;
        rightLamina.scale.x = -1;
        rightLamina.castShadow = true;
        group.add(rightLamina);
        
        // === SPINOUS PROCESS (back projection) ===
        const spineLength = isCervical ? 0.35 * scale : (isLumbar ? 0.55 * scale : 0.65 * scale);
        const spineAngle = isThoracic ? 0.6 : 0.3; // Thoracic spinous processes point more downward
        
        // Create spinous process with tapered shape
        const spinePoints = [];
        const spineSegments = 12;
        for (let i = 0; i <= spineSegments; i++) {
            const t = i / spineSegments;
            const width = 0.06 * scale * (1 - t * 0.7);
            spinePoints.push(new THREE.Vector2(width, t * spineLength));
        }
        const spinousGeometry = new THREE.LatheGeometry(spinePoints, 8);
        const spinousProcess = new THREE.Mesh(spinousGeometry, darkBoneMaterial);
        spinousProcess.position.set(0, 0, -0.45 * scale + curveOffset);
        spinousProcess.rotation.x = Math.PI / 2 + spineAngle;
        spinousProcess.castShadow = true;
        group.add(spinousProcess);
        
        // Spinous process tip (bifid for cervical)
        if (isCervical) {
            const tipGeometry = new THREE.SphereGeometry(0.04 * scale, 8, 8);
            const leftTip = new THREE.Mesh(tipGeometry, darkBoneMaterial);
            leftTip.position.set(0.03 * scale, -Math.sin(spineAngle) * spineLength * 0.9, -0.45 * scale - Math.cos(spineAngle) * spineLength * 0.9 + curveOffset);
            group.add(leftTip);
            
            const rightTip = new THREE.Mesh(tipGeometry, darkBoneMaterial);
            rightTip.position.set(-0.03 * scale, -Math.sin(spineAngle) * spineLength * 0.9, -0.45 * scale - Math.cos(spineAngle) * spineLength * 0.9 + curveOffset);
            group.add(rightTip);
        }
        
        // === TRANSVERSE PROCESSES (side wings) ===
        const transverseLength = isCervical ? 0.3 * scale : (isLumbar ? 0.5 * scale : 0.4 * scale);
        
        // Create organic transverse process shape
        const transverseShape = new THREE.Shape();
        transverseShape.moveTo(0, -0.04 * scale);
        transverseShape.quadraticCurveTo(transverseLength * 0.5, -0.06 * scale, transverseLength, -0.02 * scale);
        transverseShape.quadraticCurveTo(transverseLength + 0.05 * scale, 0, transverseLength, 0.02 * scale);
        transverseShape.quadraticCurveTo(transverseLength * 0.5, 0.06 * scale, 0, 0.04 * scale);
        transverseShape.closePath();
        
        const transverseExtrudeSettings = {
            steps: 1,
            depth: 0.1 * scale,
            bevelEnabled: true,
            bevelThickness: 0.015 * scale,
            bevelSize: 0.015 * scale,
            bevelSegments: 2
        };
        
        const transverseGeometry = new THREE.ExtrudeGeometry(transverseShape, transverseExtrudeSettings);
        
        const leftTransverse = new THREE.Mesh(transverseGeometry, boneMaterial);
        leftTransverse.position.set(0.2 * scale, 0, -0.2 * scale + curveOffset);
        leftTransverse.rotation.y = -0.2;
        leftTransverse.rotation.z = 0.1;
        leftTransverse.castShadow = true;
        group.add(leftTransverse);
        
        const rightTransverse = new THREE.Mesh(transverseGeometry, boneMaterial);
        rightTransverse.position.set(-0.2 * scale, 0, -0.2 * scale + curveOffset);
        rightTransverse.rotation.y = Math.PI + 0.2;
        rightTransverse.rotation.z = -0.1;
        rightTransverse.castShadow = true;
        group.add(rightTransverse);
        
        // === ARTICULAR PROCESSES (facet joints) ===
        const facetGeometry = new THREE.SphereGeometry(0.06 * scale, 8, 6);
        facetGeometry.scale(1, 0.6, 1.2);
        
        // Superior articular processes (facing up/back)
        const supLeftFacet = new THREE.Mesh(facetGeometry, darkBoneMaterial);
        supLeftFacet.position.set(0.15 * scale, 0.12 * scale, -0.28 * scale + curveOffset);
        group.add(supLeftFacet);
        
        const supRightFacet = new THREE.Mesh(facetGeometry, darkBoneMaterial);
        supRightFacet.position.set(-0.15 * scale, 0.12 * scale, -0.28 * scale + curveOffset);
        group.add(supRightFacet);
        
        // Inferior articular processes (facing down/forward)
        const infLeftFacet = new THREE.Mesh(facetGeometry, darkBoneMaterial);
        infLeftFacet.position.set(0.15 * scale, -0.12 * scale, -0.32 * scale + curveOffset);
        group.add(infLeftFacet);
        
        const infRightFacet = new THREE.Mesh(facetGeometry, darkBoneMaterial);
        infRightFacet.position.set(-0.15 * scale, -0.12 * scale, -0.32 * scale + curveOffset);
        group.add(infRightFacet);
        
        // === THORACIC COSTAL FACETS (for rib attachment) ===
        if (isThoracic) {
            const costalGeometry = new THREE.CircleGeometry(0.05 * scale, 8);
            const costalMaterial = new THREE.MeshStandardMaterial({
                color: 0xC8C0B4,
                roughness: 0.4,
                metalness: 0.1
            });
            
            const leftCostal = new THREE.Mesh(costalGeometry, costalMaterial);
            leftCostal.position.set(0.38 * scale, 0.05 * scale, 0 + curveOffset);
            leftCostal.rotation.y = Math.PI / 2;
            group.add(leftCostal);
            
            const rightCostal = new THREE.Mesh(costalGeometry, costalMaterial);
            rightCostal.position.set(-0.38 * scale, 0.05 * scale, 0 + curveOffset);
            rightCostal.rotation.y = -Math.PI / 2;
            group.add(rightCostal);
        }
        
        // Store for highlighting
        this.vertebraeMeshes.push(group);
        
        return group;
    }
    
    // Create intervertebral disc
    createDetailedDisc(scale, curveOffset = 0) {
        const group = new THREE.Group();
        
        // Annulus fibrosus (outer ring)
        const annulusGeometry = new THREE.TorusGeometry(0.28 * scale, 0.08 * scale, 8, 24);
        const annulusMaterial = new THREE.MeshStandardMaterial({
            color: 0x7A8B69,
            roughness: 0.6,
            metalness: 0.0,
            transparent: true,
            opacity: 0.9
        });
        const annulus = new THREE.Mesh(annulusGeometry, annulusMaterial);
        annulus.rotation.x = Math.PI / 2;
        annulus.position.z = curveOffset;
        group.add(annulus);
        
        // Nucleus pulposus (inner gel-like center)
        const nucleusGeometry = new THREE.SphereGeometry(0.2 * scale, 16, 12);
        nucleusGeometry.scale(1, 0.4, 1);
        const nucleusMaterial = new THREE.MeshStandardMaterial({
            color: 0x9AAB8A,
            roughness: 0.3,
            metalness: 0.0,
            transparent: true,
            opacity: 0.75
        });
        const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
        nucleus.position.z = curveOffset;
        group.add(nucleus);
        
        return group;
    }
    
    // Create detailed sacrum
    createDetailedSacrum() {
        const group = new THREE.Group();
        group.userData.region = 'sacral';
        
        const boneMaterial = this.createBoneMaterial();
        
        // Main sacral body - triangular wedge shape
        const sacrumPoints = [];
        const sacrumHeight = 1.4;
        const segments = 20;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const y = -t * sacrumHeight;
            // Triangular taper with curved back
            const frontRadius = 0.5 * (1 - t * 0.7);
            sacrumPoints.push(new THREE.Vector2(frontRadius, y));
        }
        
        const sacrumGeometry = new THREE.LatheGeometry(sacrumPoints, 16);
        const sacrum = new THREE.Mesh(sacrumGeometry, boneMaterial);
        sacrum.castShadow = true;
        sacrum.receiveShadow = true;
        group.add(sacrum);
        
        // Sacral foramina (holes for nerves) - 4 pairs
        const foramenMaterial = new THREE.MeshStandardMaterial({
            color: 0x3A3A3A,
            roughness: 0.9
        });
        
        for (let i = 0; i < 4; i++) {
            const y = -0.2 - i * 0.28;
            const x = 0.25 - i * 0.04;
            const foramenGeometry = new THREE.CircleGeometry(0.04, 8);
            
            const leftForamen = new THREE.Mesh(foramenGeometry, foramenMaterial);
            leftForamen.position.set(x, y, 0.01);
            group.add(leftForamen);
            
            const rightForamen = new THREE.Mesh(foramenGeometry, foramenMaterial);
            rightForamen.position.set(-x, y, 0.01);
            group.add(rightForamen);
        }
        
        // Sacral wings (alae)
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.quadraticCurveTo(0.4, 0.1, 0.6, -0.1);
        wingShape.quadraticCurveTo(0.5, -0.2, 0.3, -0.15);
        wingShape.quadraticCurveTo(0.1, -0.1, 0, 0);
        
        const wingExtrudeSettings = {
            steps: 1,
            depth: 0.15,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.02,
            bevelSegments: 2
        };
        
        const wingGeometry = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
        
        const leftWing = new THREE.Mesh(wingGeometry, boneMaterial);
        leftWing.position.set(0.35, -0.1, -0.08);
        leftWing.rotation.x = 0.2;
        leftWing.castShadow = true;
        group.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, boneMaterial);
        rightWing.position.set(-0.35, -0.1, -0.08);
        rightWing.rotation.x = 0.2;
        rightWing.rotation.y = Math.PI;
        rightWing.castShadow = true;
        group.add(rightWing);
        
        // Median sacral crest (bumps down the back)
        for (let i = 0; i < 4; i++) {
            const crestGeometry = new THREE.SphereGeometry(0.05, 8, 6);
            crestGeometry.scale(0.8, 1, 0.6);
            const crest = new THREE.Mesh(crestGeometry, boneMaterial);
            crest.position.set(0, -0.25 - i * 0.25, -0.15 + i * 0.03);
            group.add(crest);
        }
        
        return group;
    }
    
    // Create coccyx (tailbone)
    createDetailedCoccyx() {
        const group = new THREE.Group();
        group.userData.region = 'sacral';
        
        const boneMaterial = this.createBoneMaterial();
        
        // 3-4 fused vertebral segments
        let y = 0;
        for (let i = 0; i < 4; i++) {
            const size = 0.12 - i * 0.025;
            const segmentGeometry = new THREE.SphereGeometry(size, 8, 6);
            segmentGeometry.scale(1.2, 0.6, 0.8);
            const segment = new THREE.Mesh(segmentGeometry, boneMaterial);
            segment.position.y = y;
            segment.castShadow = true;
            group.add(segment);
            y -= size * 1.3;
        }
        
        return group;
    }
    
    createRegionIndicator(yStart, yEnd, regionKey) {
        const region = this.regions[regionKey];
        const height = Math.abs(yEnd - yStart);
        const yCenter = (yStart + yEnd) / 2;
        
        const geometry = new THREE.CylinderGeometry(1.2, 1.2, height, 16);
        const material = new THREE.MeshBasicMaterial({
            color: region.color,
            transparent: true,
            opacity: 0
        });
        const indicator = new THREE.Mesh(geometry, material);
        indicator.position.y = yCenter;
        indicator.userData.region = regionKey;
        indicator.userData.isIndicator = true;
        
        return indicator;
    }
    
    createDetailedSpine() {
        const vertebraSpacing = 0.48;
        let currentY = 4.5;
        
        // Natural spinal curvature offsets (cervical lordosis, thoracic kyphosis, lumbar lordosis)
        const getCurveOffset = (region, index, total) => {
            const t = index / total;
            if (region === 'cervical') {
                return 0.15 * Math.sin(t * Math.PI); // Lordosis (curves forward)
            } else if (region === 'thoracic') {
                return -0.25 * Math.sin(t * Math.PI); // Kyphosis (curves backward)
            } else if (region === 'lumbar') {
                return 0.35 * Math.sin(t * Math.PI); // Lordosis (curves forward)
            }
            return 0;
        };
        
        // === CERVICAL VERTEBRAE (C1-C7) ===
        const cervicalStart = currentY;
        for (let i = 0; i < 7; i++) {
            const scale = 0.75 + (i * 0.035);
            const curveOffset = getCurveOffset('cervical', i, 7);
            
            const vertebra = this.createDetailedVertebra({
                scale,
                regionKey: 'cervical',
                isCervical: true,
                curveOffset
            });
            vertebra.position.y = currentY;
            this.spineGroup.add(vertebra);
            
            if (i < 6) {
                const disc = this.createDetailedDisc(scale * 0.95, curveOffset);
                disc.position.y = currentY - vertebraSpacing / 2;
                this.spineGroup.add(disc);
            }
            currentY -= vertebraSpacing;
        }
        const cervicalEnd = currentY + vertebraSpacing;
        
        // === THORACIC VERTEBRAE (T1-T12) ===
        currentY -= 0.1;
        const thoracicStart = currentY;
        for (let i = 0; i < 12; i++) {
            const scale = 0.95 + (i * 0.02);
            const curveOffset = getCurveOffset('thoracic', i, 12);
            
            const vertebra = this.createDetailedVertebra({
                scale,
                regionKey: 'thoracic',
                isThoracic: true,
                curveOffset
            });
            vertebra.position.y = currentY;
            this.spineGroup.add(vertebra);
            
            if (i < 11) {
                const disc = this.createDetailedDisc(scale * 0.95, curveOffset);
                disc.position.y = currentY - vertebraSpacing / 2;
                this.spineGroup.add(disc);
            }
            currentY -= vertebraSpacing;
        }
        const thoracicEnd = currentY + vertebraSpacing;
        
        // === LUMBAR VERTEBRAE (L1-L5) ===
        currentY -= 0.1;
        const lumbarStart = currentY;
        for (let i = 0; i < 5; i++) {
            const scale = 1.2 + (i * 0.04);
            const curveOffset = getCurveOffset('lumbar', i, 5);
            
            const vertebra = this.createDetailedVertebra({
                scale,
                regionKey: 'lumbar',
                isLumbar: true,
                curveOffset
            });
            vertebra.position.y = currentY;
            this.spineGroup.add(vertebra);
            
            if (i < 4) {
                const disc = this.createDetailedDisc(scale * 0.95, curveOffset);
                disc.position.y = currentY - vertebraSpacing / 2;
                this.spineGroup.add(disc);
            }
            currentY -= vertebraSpacing;
        }
        const lumbarEnd = currentY + vertebraSpacing;
        
        // === SACRUM ===
        currentY -= 0.25;
        const sacralStart = currentY;
        const sacrum = this.createDetailedSacrum();
        sacrum.position.y = currentY;
        this.spineGroup.add(sacrum);
        
        // === COCCYX ===
        const coccyx = this.createDetailedCoccyx();
        coccyx.position.y = currentY - 1.5;
        this.spineGroup.add(coccyx);
        const sacralEnd = currentY - 2.1;
        
        // Add region indicators (invisible hitboxes)
        const cervicalIndicator = this.createRegionIndicator(cervicalStart, cervicalEnd, 'cervical');
        const thoracicIndicator = this.createRegionIndicator(thoracicStart, thoracicEnd, 'thoracic');
        const lumbarIndicator = this.createRegionIndicator(lumbarStart, lumbarEnd, 'lumbar');
        const sacralIndicator = this.createRegionIndicator(sacralStart, sacralEnd, 'sacral');
        
        this.regionMeshes.push(cervicalIndicator, thoracicIndicator, lumbarIndicator, sacralIndicator);
        this.regionMeshes.forEach(m => this.spineGroup.add(m));
        
        // Initial rotation for optimal view
        this.spineGroup.rotation.x = 0.15;
        this.spineGroup.rotation.y = -0.4;
    }
    
    setupInteraction() {
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
        canvas.addEventListener('mousemove', (e) => this.onPointerMove(e));
        canvas.addEventListener('mouseup', () => this.onPointerUp());
        canvas.addEventListener('mouseleave', () => this.onPointerUp());
        
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
        canvas.addEventListener('touchend', () => this.onPointerUp());
        
        canvas.addEventListener('click', (e) => this.onClick(e));
        canvas.style.cursor = 'grab';
    }
    
    onPointerDown(e) {
        this.isDragging = true;
        this.autoRotate = false;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
        this.renderer.domElement.style.cursor = 'grabbing';
    }
    
    onPointerMove(e) {
        this.updateMouse(e);
        this.checkHover();
        
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;
        
        this.targetRotation.y += deltaX * 0.008;
        this.targetRotation.x += deltaY * 0.004;
        this.targetRotation.x = Math.max(-0.6, Math.min(0.6, this.targetRotation.x));
        
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
    
    onPointerUp() {
        this.isDragging = false;
        this.renderer.domElement.style.cursor = 'grab';
        
        setTimeout(() => {
            if (!this.isDragging) this.autoRotate = true;
        }, 3000);
    }
    
    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.autoRotate = false;
            this.previousMousePosition = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
        }
    }
    
    onTouchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.previousMousePosition.x;
        const deltaY = touch.clientY - this.previousMousePosition.y;
        
        this.targetRotation.y += deltaX * 0.008;
        this.targetRotation.x += deltaY * 0.004;
        this.targetRotation.x = Math.max(-0.6, Math.min(0.6, this.targetRotation.x));
        
        this.previousMousePosition = { x: touch.clientX, y: touch.clientY };
    }
    
    updateMouse(e) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    checkHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.regionMeshes);
        
        if (intersects.length > 0) {
            const region = intersects[0].object.userData.region;
            if (this.hoveredRegion !== region) {
                this.hoveredRegion = region;
                this.highlightRegion(region);
                this.showTooltip(region);
                this.renderer.domElement.style.cursor = 'pointer';
            }
        } else {
            if (this.hoveredRegion) {
                this.unhighlightRegion();
                this.hideTooltip();
                this.hoveredRegion = null;
                this.renderer.domElement.style.cursor = this.isDragging ? 'grabbing' : 'grab';
            }
        }
    }
    
    highlightRegion(regionKey) {
        const region = this.regions[regionKey];
        
        this.spineGroup.traverse((child) => {
            if (child.isMesh && child.userData.region === regionKey && !child.userData.isIndicator) {
                if (child.material) {
                    child.userData.originalColor = child.material.color.getHex();
                    child.userData.originalEmissive = child.material.emissive ? child.material.emissive.getHex() : 0;
                    child.material.color.setHex(region.color);
                    if (child.material.emissive) {
                        child.material.emissive.setHex(region.color);
                        child.material.emissiveIntensity = 0.2;
                    }
                }
            }
        });
    }
    
    unhighlightRegion() {
        this.spineGroup.traverse((child) => {
            if (child.isMesh && child.userData.originalColor !== undefined) {
                child.material.color.setHex(child.userData.originalColor);
                if (child.material.emissive) {
                    child.material.emissive.setHex(child.userData.originalEmissive || 0);
                    child.material.emissiveIntensity = 0;
                }
            }
        });
    }
    
    showTooltip(regionKey) {
        const region = this.regions[regionKey];
        let tooltip = document.getElementById('spine-tooltip');
        
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'spine-tooltip';
            tooltip.className = 'spine-tooltip';
            this.container.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <div class="tooltip-title">${region.name}</div>
            <div class="tooltip-vertebrae">${region.count} • ${region.vertebrae}</div>
            <div class="tooltip-desc">${region.description}</div>
            <div class="tooltip-conditions">
                <strong>Common Conditions</strong>
                ${region.conditions}
            </div>
        `;
        tooltip.classList.add('visible');
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('spine-tooltip');
        if (tooltip) tooltip.classList.remove('visible');
    }
    
    onClick(e) {
        this.updateMouse(e);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.regionMeshes);
        
        if (intersects.length > 0) {
            const region = intersects[0].object.userData.region;
            const event = new CustomEvent('spineRegionClick', { 
                detail: { key: region, ...this.regions[region] } 
            });
            this.container.dispatchEvent(event);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.autoRotate) {
            this.targetRotation.y += 0.002;
        }
        
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.06;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.06;
        
        this.spineGroup.rotation.x = 0.15 + this.currentRotation.x;
        this.spineGroup.rotation.y = this.currentRotation.y;
        
        this.renderer.render(this.scene, this.camera);
    }
    
    setupResize() {
        const resizeObserver = new ResizeObserver(() => {
            this.width = this.container.offsetWidth;
            this.height = this.container.offsetHeight;
            
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        });
        
        resizeObserver.observe(this.container);
    }
    
    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const spineContainer = document.getElementById('spine-model');
    if (spineContainer) {
        window.spineModel = new SpineModel('spine-model');
    }
});
