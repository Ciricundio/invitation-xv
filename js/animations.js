/**
 * animations.js
 * Single Responsibility: Handle all visual animations and scroll effects.
 * - IntersectionObserver for fade-in elements
 * - Parallax on scroll
 * - Itinerary stagger delays
 * - Heart hover effect
 */

(function AnimationsModule() {

  // ── IntersectionObserver ──────────────────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.detail-item, .itinerary-item, #gallery-photo').forEach(el => {
    observer.observe(el);
  });

  // ── Itinerary stagger delays ──────────────────────────────────────────
  document.querySelectorAll('.itinerary-item').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
  });

  // ── Parallax on scroll ────────────────────────────────────────────────
  const floralTop = document.querySelector('#cover .floral-top');
  if (floralTop) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      floralTop.style.transform = `translateX(-50%) translateY(${scrollY * 0.08}px)`;
    }, { passive: true });
  }

  // ── Heart hover on RSVP yes button ───────────────────────────────────
  const rsvpYes = document.querySelector('.rsvp-yes');
  const heartIcon = document.getElementById('heart-icon');
  if (rsvpYes && heartIcon) {
    rsvpYes.addEventListener('mouseenter', () => { heartIcon.textContent = '💜'; });
    rsvpYes.addEventListener('mouseleave', () => { heartIcon.textContent = '🤍'; });
  }

})();
