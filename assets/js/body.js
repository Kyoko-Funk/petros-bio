/**
 * "Where does it hurt?" whole-body figure for the Method page.
 * A calm, stylised figure built from simple shapes with the three.js already loaded for the spine,
 * so there is nothing extra to download. Tap an area (or use the buttons) to read about it and book
 * with that area ticked on the booking form. Nothing tapped here is saved or sent anywhere.
 */
(function () {
    'use strict';

    // Plain-language area details. "book" holds the matching value(s) of the booking form's body-area checkboxes.
    var AREAS = {
        neck: {
            name: 'Neck', book: ['Neck'],
            often: 'Stiffness from desk work, whiplash, headaches that start in the neck, pain spreading to the shoulder or arm.',
            help: 'Posture work, neck and upper-back strengthening, and gentle mobility so you can turn and look around with less pain.'
        },
        shoulder: {
            name: 'Shoulder', book: ['Left shoulder', 'Right shoulder'],
            often: 'Rotator cuff problems, a frozen or stiff shoulder, pain when reaching overhead, recovery after a dislocation or surgery.',
            help: 'Getting movement back, strengthening the muscles that steady the joint, and a gradual return to lifting and reaching.'
        },
        upperBack: {
            name: 'Upper back', book: ['Upper back'],
            often: 'Stiffness from sitting, a rounded upper back, pain between the shoulder blades.',
            help: 'Mobility and posture exercises, and strengthening for the shoulder blades and upper back.'
        },
        lowerBack: {
            name: 'Lower back', book: ['Lower back'],
            often: 'Lower back pain, pain down the leg (sciatica), disc problems, recovery after back surgery.',
            help: 'Core and hip strengthening, movement retraining, and a gradual return to bending, lifting and activity.'
        },
        elbow: {
            name: 'Elbow or arm', book: ['Left elbow or arm', 'Right elbow or arm'],
            often: "Tennis or golfer's elbow, overuse from work or sport, recovery after a fracture.",
            help: 'Gradual loading of the forearm and arm, strength work, and getting back to gripping, carrying and lifting.'
        },
        wrist: {
            name: 'Wrist or hand', book: ['Left wrist or hand', 'Right wrist or hand'],
            often: 'Stiffness or weakness after a fracture or surgery, a weak grip, pain with repeated hand movements.',
            help: 'Mobility, grip and strength work, so everyday tasks feel easier again.'
        },
        hip: {
            name: 'Hip', book: ['Left hip', 'Right hip'],
            often: 'Hip arthritis, pain on the side of the hip, stiffness, preparing for or recovering from a hip replacement.',
            help: 'Strength and mobility for the hip, walking and balance work, before and after surgery.'
        },
        knee: {
            name: 'Knee', book: ['Left knee', 'Right knee'],
            often: 'Ligament (ACL) and meniscus injuries, knee arthritis, pain at the front of the knee, recovery after knee surgery or a replacement.',
            help: 'Strength, control and balance, with a gradual return to stairs, walking and sport.'
        },
        ankle: {
            name: 'Ankle or foot', book: ['Left ankle or foot', 'Right ankle or foot'],
            often: 'Ankle sprains, Achilles problems, heel pain (plantar fasciitis), recovery after a fracture.',
            help: 'Balance and strength work, and a gradual return to walking, running and jumping.'
        }
    };

    function supported() {
        if (typeof THREE === 'undefined') return false;
        try {
            var c = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
        } catch (e) { return false; }
    }

    function BodyFigure(container, onPick) {
        this.container = container;
        this.onPick = onPick;
        this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.parts = [];          // meshes that can be tapped
        this.materials = {};      // one material per area and side, e.g. "knee:L"
        this.glow = {};
        this.selected = null;     // { key, side }
        this.hovered = null;
        this.rotation = { target: 0, current: 0 };
        this.autoRotate = !this.reducedMotion;
        this.visible = true;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.base = new THREE.Color(0xD3CCBF);
        this.accent = new THREE.Color(0x304C7C);
        this.tint = new THREE.Color();

        var w = container.clientWidth, h = container.clientHeight;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
        this.camera.position.set(0, 4.1, 17);
        this.camera.lookAt(0, 3.9, 0);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(w, h);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.95;
        container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.HemisphereLight(0xffffff, 0xC9C1B2, 0.55));
        var key = new THREE.DirectionalLight(0xffffff, 0.75); key.position.set(4, 9, 8); this.scene.add(key);
        var rim = new THREE.DirectionalLight(0xC9D3A6, 0.45); rim.position.set(-6, 5, -6); this.scene.add(rim);
        var fill = new THREE.DirectionalLight(0xffffff, 0.3); fill.position.set(-5, 2, 6); this.scene.add(fill);

        this.figure = new THREE.Group();
        this.scene.add(this.figure);
        this.build();
        this.bind();
        this.resize();
        var self = this;
        if ('ResizeObserver' in window) new ResizeObserver(function () { self.resize(); }).observe(container);
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (e) { self.visible = e[0].isIntersecting; }).observe(container);
        }
        this.loop();
    }

    BodyFigure.prototype.material = function (id) {
        if (!this.materials[id]) {
            this.materials[id] = new THREE.MeshPhysicalMaterial({
                color: this.base.clone(), roughness: 0.55, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.5,
                emissive: new THREE.Color(0x000000), emissiveIntensity: 0
            });
            this.glow[id] = 0;
        }
        return this.materials[id];
    };

    // A rounded, tapered limb from point a to point b
    BodyFigure.prototype.limb = function (a, b, r0, r1, id) {
        var len = a.distanceTo(b), pts = [], i, t;
        for (i = 0; i <= 8; i++) { t = -Math.PI / 2 + (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.max(r0 * Math.cos(t), 0.0001), r0 * Math.sin(t))); }
        for (i = 0; i <= 8; i++) { t = (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.max(r1 * Math.cos(t), 0.0001), len + r1 * Math.sin(t))); }
        var mesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), this.material(id));
        mesh.position.copy(a);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        mesh.userData.radial = true; // grows in thickness only, so it stays attached at the joints
        return this.add(mesh, id);
    };

    BodyFigure.prototype.blob = function (pos, scale, id) {
        var mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), this.material(id));
        mesh.position.copy(pos);
        mesh.scale.set(scale[0], scale[1], scale[2]);
        return this.add(mesh, id);
    };

    BodyFigure.prototype.add = function (mesh, id) {
        mesh.userData.id = id;
        mesh.userData.baseScale = mesh.scale.clone();
        if (id !== 'none') this.parts.push(mesh);
        this.figure.add(mesh);
        return mesh;
    };

    BodyFigure.prototype.build = function () {
        var V = function (x, y, z) { return new THREE.Vector3(x, y, z || 0); };
        var self = this;

        // Torso: two lathed halves (lower back below, upper back above), flattened front to back
        var lower = [[0, 3.35], [0.55, 3.4], [0.82, 3.6], [0.86, 3.85], [0.8, 4.2], [0.72, 4.6], [0.74, 5.0], [0, 5.0]];
        var upper = [[0, 5.0], [0.74, 5.0], [0.8, 5.3], [0.9, 5.7], [0.95, 6.05], [0.88, 6.35], [0.6, 6.55], [0.25, 6.66], [0, 6.68]];
        function torso(profile, id) {
            var g = new THREE.LatheGeometry(profile.map(function (p) { return new THREE.Vector2(Math.max(p[0], 0.0001), p[1]); }), 48);
            var m = new THREE.Mesh(g, self.material(id));
            m.scale.z = 0.6;
            m.userData.radial = true;
            self.add(m, id);
        }
        torso(lower, 'lowerBack');
        torso(upper, 'upperBack');

        // Head (not an area) and neck
        this.blob(V(0, 7.45), [0.42, 0.52, 0.46], 'none');
        this.limb(V(0, 6.45), V(0, 7.0), 0.2, 0.17, 'neck');

        // Paired areas. The figure starts with its back to the viewer, so the patient's left is on the viewer's left (-x),
        // matching the back view of the booking form's body map. The front of the body faces -z.
        [['L', -1], ['R', 1]].forEach(function (s) {
            var side = s[0], x = s[1];
            self.blob(V(0.98 * x, 6.25), [0.31, 0.31, 0.31], 'shoulder:' + side);
            self.limb(V(1.08 * x, 6.1), V(1.3 * x, 4.75), 0.2, 0.15, 'elbow:' + side);
            self.blob(V(1.3 * x, 4.72), [0.155, 0.155, 0.155], 'elbow:' + side);
            self.limb(V(1.3 * x, 4.72), V(1.42 * x, 3.52), 0.14, 0.1, 'elbow:' + side);
            self.blob(V(1.42 * x, 3.48), [0.105, 0.105, 0.105], 'wrist:' + side);
            self.blob(V(1.45 * x, 3.17, -0.02), [0.11, 0.27, 0.17], 'wrist:' + side);
            // Each leg is split so the knee area sits around the joint: upper thigh = hip, lower thigh to upper shin = knee,
            // lower shin and foot = ankle or foot
            self.limb(V(0.46 * x, 3.7), V(0.48 * x, 2.9), 0.37, 0.31, 'hip:' + side);
            self.limb(V(0.48 * x, 2.9), V(0.5 * x, 2.15), 0.31, 0.25, 'knee:' + side);
            self.blob(V(0.5 * x, 2.08), [0.255, 0.255, 0.255], 'knee:' + side);
            self.limb(V(0.5 * x, 2.05), V(0.5 * x, 1.3), 0.22, 0.175, 'knee:' + side);
            self.limb(V(0.5 * x, 1.3), V(0.5 * x, 0.48), 0.175, 0.13, 'ankle:' + side);
            self.blob(V(0.5 * x, 0.42), [0.14, 0.14, 0.14], 'ankle:' + side);
            self.blob(V(0.51 * x, 0.15, -0.2), [0.17, 0.13, 0.4], 'ankle:' + side);
        });

        // A quiet line of dots down the back, a nod to the spine above (decoration only)
        var dotMat = new THREE.MeshStandardMaterial({ color: 0x7E8DA4, roughness: 0.4, transparent: true, opacity: 0.55 });
        var radius = function (y) {
            var prof = lower.concat(upper).filter(function (p) { return p[0] > 0; });
            for (var i = 0; i < prof.length - 1; i++) {
                if (y >= prof[i][1] && y <= prof[i + 1][1]) {
                    var t = (y - prof[i][1]) / (prof[i + 1][1] - prof[i][1] || 1);
                    return prof[i][0] + t * (prof[i + 1][0] - prof[i][0]);
                }
            }
            return 0.7;
        };
        for (var y = 3.75; y <= 6.45; y += 0.16) {
            var dot = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 8), dotMat);
            dot.position.set(0, y, radius(y) * 0.6 * 0.86);
            this.figure.add(dot);
        }

        // Soft shadow under the feet
        var shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = shadowCanvas.height = 128;
        var ctx = shadowCanvas.getContext('2d');
        var grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
        grad.addColorStop(0, 'rgba(54,64,77,0.28)'); grad.addColorStop(1, 'rgba(54,64,77,0)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
        var shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.01;
        this.scene.add(shadow);
    };

    BodyFigure.prototype.bind = function () {
        var self = this, canvas = this.renderer.domElement, dragging = false, moved = 0, lastX = 0;
        canvas.style.cursor = 'grab';
        function down(x) { dragging = true; moved = 0; lastX = x; self.autoRotate = false; self.container.dispatchEvent(new CustomEvent('bodyInteract')); }
        function move(x) {
            if (!dragging) return;
            moved += Math.abs(x - lastX);
            self.rotation.target += (x - lastX) * 0.01;
            lastX = x;
        }
        function up() {
            dragging = false;
            canvas.style.cursor = 'grab';
            setTimeout(function () { if (!dragging && !self.reducedMotion && !self.selected) self.autoRotate = true; }, 4000);
        }
        canvas.addEventListener('mousedown', function (e) { down(e.clientX); canvas.style.cursor = 'grabbing'; });
        window.addEventListener('mousemove', function (e) { move(e.clientX); });
        window.addEventListener('mouseup', function () { if (dragging) up(); });
        canvas.addEventListener('mousemove', function (e) {
            if (dragging) return;
            var hit = self.hit(e);
            self.hovered = hit;
            canvas.style.cursor = hit ? 'pointer' : 'grab';
        });
        canvas.addEventListener('mouseleave', function () { self.hovered = null; });
        canvas.addEventListener('touchstart', function (e) { if (e.touches.length === 1) down(e.touches[0].clientX); }, { passive: true });
        canvas.addEventListener('touchmove', function (e) { if (e.touches.length === 1) move(e.touches[0].clientX); }, { passive: true });
        canvas.addEventListener('touchend', up);
        canvas.addEventListener('click', function (e) {
            if (moved > 6) return; // a drag, not a tap
            var hit = self.hit(e);
            if (hit) {
                var p = hit.split(':');
                self.onPick(p[0], p[1] || null);
            }
        });
    };

    BodyFigure.prototype.hit = function (e) {
        var rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        var hits = this.raycaster.intersectObjects(this.parts);
        return hits.length ? hits[0].object.userData.id : null;
    };

    // Highlight an area. Without a side (picked from the buttons), both sides light up.
    BodyFigure.prototype.select = function (key, side) {
        this.selected = key ? { key: key, side: side } : null;
        if (key) this.autoRotate = false;
        // Turn the back towards the viewer for back areas
        if (key === 'upperBack' || key === 'lowerBack') {
            var turn = Math.PI * 2;
            this.rotation.target = Math.round(this.rotation.current / turn) * turn;
        }
    };

    BodyFigure.prototype.isLit = function (id, sel) {
        if (!sel) return false;
        var p = id.split(':');
        return p[0] === sel.key && (!sel.side || !p[1] || p[1] === sel.side);
    };

    BodyFigure.prototype.loop = function () {
        var self = this;
        requestAnimationFrame(function () { self.loop(); });
        if (!this.visible) return;
        if (this.autoRotate) this.rotation.target += 0.0035;
        this.rotation.current += (this.rotation.target - this.rotation.current) * 0.07;
        this.figure.rotation.y = this.rotation.current;

        var hoverSel = this.hovered ? { key: this.hovered.split(':')[0], side: this.hovered.split(':')[1] || null } : null;
        var pulse = this.reducedMotion ? 1 : 0.85 + 0.15 * Math.sin(performance.now() / 450);
        for (var id in this.materials) {
            var target = this.isLit(id, this.selected) ? 1 : (this.isLit(id, hoverSel) ? 0.45 : 0);
            this.glow[id] += (target - this.glow[id]) * 0.12;
            var g = this.glow[id], mat = this.materials[id];
            mat.color.copy(this.base).lerp(this.accent, g);
            mat.emissive.copy(this.accent).multiplyScalar(g);
            mat.emissiveIntensity = g * 0.25 * pulse;
        }
        // The highlighted area also swells slightly, so it stands out on small screens
        for (var i = 0; i < this.parts.length; i++) {
            var m = this.parts[i], base = m.userData.baseScale, grow = 1 + 0.08 * this.glow[m.userData.id];
            m.scale.set(base.x * grow, m.userData.radial ? base.y : base.y * grow, base.z * grow);
        }
        this.renderer.render(this.scene, this.camera);
    };

    BodyFigure.prototype.resize = function () {
        var w = this.container.clientWidth, h = this.container.clientHeight;
        if (!w || !h) return;
        this.camera.aspect = w / h;
        // Keep the whole figure in view on narrow screens
        this.camera.position.z = w / h < 0.62 ? 17 * (0.62 / (w / h)) * 0.92 : 17;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    };

    function init() {
        var section = document.querySelector('[data-body]');
        if (!section) return;
        var stage = document.getElementById('body-model');
        var panel = section.querySelector('[data-body-panel]');
        var buttons = section.querySelectorAll('[data-body-area]');
        var hint = section.querySelector('[data-body-hint]');
        var figure = null;
        var current = null;

        function pick(key, side) {
            if (current && key === current.key && side === current.side) key = null; // tap again to clear
            current = key ? { key: key, side: side } : null;
            if (figure) figure.select(key, side);
            buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(!!current && b.dataset.bodyArea === key)); });
            show();
        }

        function show() {
            var intro = panel.querySelector('[data-body-intro]');
            var detail = panel.querySelector('[data-body-detail]');
            if (!current) { intro.hidden = false; detail.hidden = true; return; }
            var a = AREAS[current.key];
            var sideWord = current.side === 'L' ? 'Left ' : current.side === 'R' ? 'Right ' : '';
            panel.querySelector('[data-body-name]').textContent = sideWord ? sideWord + a.name.toLowerCase() : a.name;
            panel.querySelector('[data-body-often]').textContent = a.often;
            panel.querySelector('[data-body-help]').textContent = a.help;
            // Booking links: the tapped side first, or both sides when chosen from the buttons
            var links = panel.querySelector('[data-body-book]');
            links.innerHTML = '';
            var values = a.book.slice();
            if (current.side === 'R') values.reverse();
            if (current.side && values.length > 1) values = values.slice(0, 1);
            values.forEach(function (v, i) {
                var link = document.createElement('a');
                link.href = '/book-now.html?area=' + encodeURIComponent(v);
                link.className = i === 0 ? 'btn-primary' : 'btn-outline';
                link.textContent = values.length > 1 ? v : 'Book about my ' + v.toLowerCase();
                links.appendChild(link);
            });
            intro.hidden = true;
            detail.hidden = false;
        }

        buttons.forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.bodyArea, null); }); });

        if (!supported() || !stage) { section.classList.add('body-unsupported'); return; }

        // Build the figure only when the section comes near the screen
        function start() {
            if (figure) return;
            try { figure = new BodyFigure(stage, pick); } catch (e) { section.classList.add('body-unsupported'); return; }
            section.classList.add('body-ready');
            if (current) figure.select(current.key, current.side);
            stage.addEventListener('bodyInteract', function () { if (hint) hint.classList.add('is-hidden'); }, { once: true });
        }
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) { io.disconnect(); start(); }
            }, { rootMargin: '300px 0px' });
            io.observe(stage);
        } else {
            start();
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
