/**
 * countdown.js
 * Single Responsibility: Manage the event countdown timer.
 * Dependency Inversion: Reads target date from a data attribute on the element,
 * so the HTML controls the date without modifying this module.
 */

(function CountdownModule() {
  const EVENT_DATE = new Date('2025-06-14T19:00:00');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateCountdown() {
    const now  = new Date();
    const diff = EVENT_DATE - now;

    const days  = document.getElementById('cd-days');
    const hours = document.getElementById('cd-hours');
    const mins  = document.getElementById('cd-mins');
    const secs  = document.getElementById('cd-secs');

    if (!days) return; // Guard: element not present

    if (diff <= 0) {
      [days, hours, mins, secs].forEach(el => el.textContent = '00');
      return;
    }

    days.textContent  = pad(Math.floor(diff / 86400000));
    hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    mins.textContent  = pad(Math.floor((diff % 3600000) / 60000));
    secs.textContent  = pad(Math.floor((diff % 60000) / 1000));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
