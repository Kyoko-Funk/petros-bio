/*
 * Hydrotherapy page scripts.
 *
 * 1. Hero: a calm, warm water surface drawn with plain WebGL (no library). a calm, warm water surface drawn with plain WebGL (no library).
 * Sunlight caustics drift slowly; moving or tapping over the hero sends out a ripple.
 * Pauses when off screen, draws a single still frame for reduced motion, and leaves the
 * CSS gradient behind it in place if WebGL is unavailable.
 */
(function () {
  'use strict';

  var VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform vec3 uRipples[8];', // x, y (0..1, y up), start time
    '',
    'float surface(vec2 p, float t) {',
    '  float h = sin(p.x * 3.1 + t * 0.45) * 0.50;',
    '  h += sin(p.y * 2.6 - t * 0.35) * 0.45;',
    '  h += sin((p.x + p.y) * 2.1 + t * 0.55) * 0.35;',
    '  h += sin(length(p - vec2(1.4, 1.9)) * 6.5 - t * 0.8) * 0.22;',
    '  h += sin(length(p - vec2(-0.6, 0.3)) * 5.0 - t * 0.6) * 0.18;',
    '  return h;',
    '}',
    '',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / uRes;',
    '  float aspect = uRes.x / uRes.y;',
    '  vec2 p = vec2(uv.x * aspect, uv.y) * 3.2;',
    '  float h = surface(p, uTime);',
    '  for (int i = 0; i < 8; i++) {',
    '    vec3 r = uRipples[i];',
    '    float age = uTime - r.z;',
    '    if (r.z > 0.0 && age > 0.0 && age < 4.0) {',
    '      float d = distance(vec2(uv.x * aspect, uv.y), vec2(r.x * aspect, r.y));',
    '      float front = age * 0.32;',
    '      float band = exp(-pow((d - front) * 9.0, 2.0));',
    '      h += sin(d * 55.0 - age * 9.0) * band * exp(-age * 0.9) * 1.4;',
    '    }',
    '  }',
    '  // Caustic light: two drifting wave fields cross into a soft net of sunlight',
    '  float h2 = surface(p * 1.35 + vec2(3.1, 1.7), uTime * 0.8 + 4.0) + (h - surface(p, uTime));',
    '  float c1 = pow(1.0 - abs(sin(h * 2.6)), 5.0);',
    '  float c2 = pow(1.0 - abs(sin(h2 * 2.6)), 5.0);',
    '  float caustic = c1 * c2 * 1.6 + (c1 + c2) * 0.12;',
    '  vec3 deep = vec3(0.290, 0.345, 0.408);',  // warm slate
    '  vec3 mid = vec3(0.553, 0.604, 0.674);',   // soft blue-grey
    '  vec3 sand = vec3(0.89, 0.82, 0.70);',
    '  vec3 col = mix(deep, mid, smoothstep(0.0, 1.0, uv.y));',
    '  col = mix(col, sand, smoothstep(0.45, 1.3, uv.y + uv.x * 0.3) * 0.5);', // warm light from the top right
    '  vec3 glow = vec3(0.98, 0.90, 0.76);',
    '  col += glow * caustic * 0.30;',
    '  float sun = exp(-distance(uv, vec2(0.88, 1.08)) * 2.0);',
    '  col += vec3(1.0, 0.84, 0.58) * sun * 0.30;',
    '  col *= 0.88 + 0.12 * smoothstep(1.3, 0.25, distance(uv, vec2(0.5, 0.55)));', // vignette
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function init() {
    var canvas = document.getElementById('water-canvas');
    if (!canvas) return;
    var host = canvas.closest('[data-water]') || canvas.parentElement;
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return; // CSS gradient stays visible

    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) {
      return;
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'uRes');
    var uTime = gl.getUniformLocation(prog, 'uTime');
    var uRipples = gl.getUniformLocation(prog, 'uRipples');
    var ripples = new Float32Array(24);
    var next = 0;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.75; // soft water needs few pixels
    var start = performance.now();
    var visible = true;
    var running = false;

    function now() { return (performance.now() - start) / 1000 + 1.0; }

    function resize() {
      var w = Math.max(1, Math.round(canvas.clientWidth * scale));
      var h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function draw(t) {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform3fv(uRipples, ripples);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame() {
      if (!visible) { running = false; return; }
      draw(now());
      requestAnimationFrame(frame);
    }
    function play() { if (!running && !reduced) { running = true; requestAnimationFrame(frame); } }

    function addRipple(clientX, clientY) {
      if (reduced) return;
      var r = canvas.getBoundingClientRect();
      var x = (clientX - r.left) / r.width;
      var y = 1 - (clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      ripples[next * 3] = x;
      ripples[next * 3 + 1] = y;
      ripples[next * 3 + 2] = now();
      next = (next + 1) % 8;
    }

    var last = 0;
    host.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var t = performance.now();
      if (t - last < 280) return;
      last = t;
      addRipple(e.clientX, e.clientY);
    }, { passive: true });
    host.addEventListener('pointerdown', function (e) { addRipple(e.clientX, e.clientY); }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) play();
      }).observe(canvas);
    }
    window.addEventListener('resize', function () { if (reduced) draw(2.0); }, { passive: true });

    canvas.classList.add('is-live');
    if (reduced) draw(2.0); else play();
  }

  /*
   * 2. Buoyancy explorer: move the water level and see roughly how much body weight
   *    your legs and joints still carry. Works with the slider, the buttons or the keyboard.
   */
  function initBuoyancy() {
    var root = document.querySelector('[data-buoyancy]');
    if (!root) return;
    var range = root.querySelector('input[type="range"]');
    var water = root.querySelector('.water');
    var stops = root.querySelectorAll('[data-level]');
    var out = { depth: root.querySelector('[data-out="depth"]'), pct: root.querySelector('[data-out="pct"]'), note: root.querySelector('[data-out="note"]'), bar: root.querySelector('[data-out="bar"]') };
    var levels = JSON.parse(root.getAttribute('data-buoyancy'));

    function set(i) {
      var l = levels[i];
      range.value = i;
      range.setAttribute('aria-valuetext', l.depth + ': about ' + l.pct + '% of body weight');
      water.style.transform = 'translateY(' + l.y + 'px)';
      out.depth.textContent = l.depth;
      out.pct.textContent = l.pct;
      out.note.textContent = l.note;
      out.bar.style.width = l.pct + '%';
      stops.forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-level') === i)); });
    }
    range.addEventListener('input', function () { set(+range.value); });
    stops.forEach(function (b) { b.addEventListener('click', function () { set(+b.getAttribute('data-level')); }); });
    set(+range.value);
  }

  function ready() { init(); initBuoyancy(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
