/*
 * Home hero: a softly moving wave mesh of points, drawn on a 2D canvas.
 * Same look as the three.js particles but about 3 KB, so the home page stays light on mobile data.
 * Pauses off screen, follows the pointer a little, and stays still for reduced motion.
 */
(function () {
  'use strict';

  function init() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, cols = 0, rows = 0, t = 0;
    var visible = true, running = false;
    var tiltX = 0, tiltY = 0, targetX = 0, targetY = 0;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var small = W < 768;
      cols = small ? 22 : 40;
      rows = small ? 12 : 18;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var f = 1.6, spanX = 2.6, spanZ = 1.6;
      var ang = t * 0.05 + tiltX * 0.25;
      var cos = Math.cos(ang), sin = Math.sin(ang);
      var pts = new Array(cols * rows);
      for (var j = 0; j < rows; j++) {
        for (var i = 0; i < cols; i++) {
          var u = i / (cols - 1) - 0.5, v = j / (rows - 1) - 0.5;
          var x = u * spanX * 2, z = v * spanZ * 2;
          var y = Math.sin(x * 1.6 + t * 0.9) * 0.16 + Math.cos(z * 2.1 + t * 0.7) * 0.14;
          // rotate around the vertical axis, tilt with the pointer
          var rx = x * cos - z * sin, rz = x * sin + z * cos + 2.6;
          var ry = y + 0.55 + tiltY * 0.15 - rz * 0.08;
          var s = f / rz;
          pts[j * cols + i] = { x: W / 2 + rx * s * W * 0.32, y: H * 0.62 + ry * s * H * 0.55, d: Math.max(0, Math.min(1, 1.6 - rz * 0.38)) };
        }
      }
      ctx.lineWidth = 1;
      for (var k = 0; k < pts.length; k++) {
        var p = pts[k], c = k % cols;
        var a = 0.05 + p.d * 0.12;
        ctx.strokeStyle = 'rgba(201, 211, 222,' + a + ')';
        ctx.beginPath();
        if (c < cols - 1) { var q = pts[k + 1]; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
        if (k + cols < pts.length) { var w = pts[k + cols]; ctx.moveTo(p.x, p.y); ctx.lineTo(w.x, w.y); }
        ctx.stroke();
      }
      for (var m = 0; m < pts.length; m++) {
        var pt = pts[m];
        ctx.fillStyle = m % 3 ? 'rgba(255,255,255,' + (0.25 + pt.d * 0.5) + ')' : 'rgba(201,211,166,' + (0.3 + pt.d * 0.5) + ')';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 0.6 + pt.d * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function frame() {
      if (!visible) { running = false; return; }
      t += 0.012;
      tiltX += (targetX - tiltX) * 0.04;
      tiltY += (targetY - tiltY) * 0.04;
      draw();
      requestAnimationFrame(frame);
    }
    function play() { if (!running && !reduced) { running = true; requestAnimationFrame(frame); } }

    resize();
    draw();
    canvas.classList.add('is-live');
    window.addEventListener('resize', function () { resize(); draw(); }, { passive: true });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) play(); }).observe(canvas);
    }
    play();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
