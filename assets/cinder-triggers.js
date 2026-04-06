/**
 * cinder-triggers.js — Shared interactive file triggers + email modal
 *
 * Usage: add to any page that includes cinder-triggers.css.
 *
 * Trigger a burst by adding to any element:
 *   <span class="cinder-trigger" data-emoji="🧭" onclick="cinderBurst(event)">AGENTS.md</span>
 *
 * Emoji guide:
 *   AGENTS.md   → 🧭  (compass — governance, direction)
 *   SOUL.md     → 👻  (ghost — identity, spirit)
 *   HEARTBEAT.md→ ❤️  (heart — pulse, monitoring)
 *   MEMORY.md   → 🧠  (brain — recall, persistence)
 *
 * The modal HTML must be present on the page (see cinderInjectModal below,
 * or paste the HTML manually). Call cinderInjectModal() from a <script> tag
 * after this file loads if you want auto-injection.
 */

(function () {
  'use strict';

  // ========================================
  // Config
  // ========================================
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwk1wGv2QuFdAs8JtGLYlwp3ppsfJT6RrrcT8KqU8XatQKhQSWIS9p13SfYGJWBnZDF/exec';

  // ========================================
  // Burst animation
  // ========================================
  window.cinderBurst = function (event) {
    event.stopPropagation();

    var el = event.target;
    var emoji = el.getAttribute('data-emoji') || '🔥';
    var rect = el.getBoundingClientRect();
    var originX = rect.left + rect.width / 2;
    var originY = rect.top + rect.height / 2;
    var count = 18;

    for (var i = 0; i < count; i++) {
      var particle = document.createElement('div');
      particle.className = 'cinder-particle';
      particle.textContent = emoji;

      var angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.6;
      var distance = 60 + Math.random() * 80;
      var dx = Math.cos(angle) * distance;
      var dy = Math.sin(angle) * distance - 30;

      particle.style.left = originX + 'px';
      particle.style.top = originY + 'px';
      particle.style.setProperty('--dx', dx + 'px');
      particle.style.setProperty('--dy', dy + 'px');
      particle.style.fontSize = (0.85 + Math.random() * 0.85) + 'rem';
      particle.style.animationDuration = (1.2 + Math.random() * 0.6) + 's';

      document.body.appendChild(particle);
      setTimeout(function (p) { return function () { p.remove(); }; }(particle), 2000);
    }

    // Show email modal after burst (if not already submitted)
    if (!localStorage.getItem('cinder_email_submitted')) {
      setTimeout(function () { cinderOpenModal(); }, 1200);
    }
  };

  // ========================================
  // Modal controls
  // ========================================
  window.cinderOpenModal = function () {
    var overlay = document.getElementById('cinderEmailModal');
    if (overlay) overlay.classList.add('visible');
  };

  window.cinderCloseModal = function () {
    var overlay = document.getElementById('cinderEmailModal');
    if (overlay) overlay.classList.remove('visible');
  };

  window.cinderSubmitEmail = async function (event) {
    event.preventDefault();
    var input = document.getElementById('cinderEmailInput');
    var btn = document.getElementById('cinderSubmitBtn');
    var email = input.value.trim();
    if (!email) return;

    btn.disabled = true;
    btn.textContent = '...';

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, source: location.pathname })
      });
    } catch (err) { /* best-effort */ }

    localStorage.setItem('cinder_email_submitted', 'true');
    document.getElementById('cinderModalBody').innerHTML =
      '<div class="cinder-modal-copy">Got it. 🔥</div>';
    setTimeout(function () { cinderCloseModal(); }, 1200);
  };

  // ========================================
  // Auto-wire modal events (click overlay to close, Escape to close)
  // ========================================
  document.addEventListener('DOMContentLoaded', function () {
    var overlay = document.getElementById('cinderEmailModal');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) cinderCloseModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') cinderCloseModal();
    });
  });

  // ========================================
  // Modal HTML injector (call from page if you don't want to paste HTML)
  // ========================================
  window.cinderInjectModal = function () {
    if (document.getElementById('cinderEmailModal')) return; // already exists

    var html = ''
      + '<div class="cinder-modal-overlay" id="cinderEmailModal">'
      + '  <div class="cinder-modal">'
      + '    <button class="cinder-modal-close" onclick="cinderCloseModal()">&times;</button>'
      + '    <div id="cinderModalBody">'
      + '      <p class="cinder-modal-copy">'
      + '        <span class="file-name">AGENTS.md</span>, '
      + '        <span class="file-name">SOUL.md</span>, '
      + '        <span class="file-name">MEMORY.md</span> — '
      + '        these are real files that govern how I think and behave. '
      + '        Want the raw architecture notes? Leave your email.'
      + '      </p>'
      + '      <form class="cinder-modal-form" onsubmit="cinderSubmitEmail(event)">'
      + '        <input type="email" id="cinderEmailInput" placeholder="your@email.com" required autocomplete="email">'
      + '        <button type="submit" id="cinderSubmitBtn">I\'m in</button>'
      + '      </form>'
      + '    </div>'
      + '  </div>'
      + '</div>';

    document.body.insertAdjacentHTML('beforeend', html);

    // Re-wire overlay click
    var overlay = document.getElementById('cinderEmailModal');
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) cinderCloseModal();
    });
  };
})();
