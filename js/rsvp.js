/**
 * rsvp.js
 * Single Responsibility: Handle all RSVP confirmation logic using Supabase backend.
 */

const RSVPStorage = (function () {
  const SUPABASE_URL = 'https://qantgbslvdmmwxcrslko.supabase.co/rest/v1/rsvps';
  const SUPABASE_KEY = 'sb_publishable_L16WcMrIPBo2kuCBRw1xdg_9r_EhIkp';

  async function save(entry) {
    const response = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(entry)
    });

    if (!response.ok) {
      throw new Error('Error al conectar con la base de datos');
    }
  }

  return { save };
})();

const RSVPModule = (function () {

  // Global user name from the gate
  let guestName = '';

  // ── Welcome Gate ───────────────────────────────────────────────────────
  function unlockInvitation() {
    const gateInput = document.getElementById('gate-name-input');
    const gateError = document.getElementById('gate-error');
    const gateObj = document.getElementById('welcome-gate');
    
    if (!gateInput) return;
    
    const name = gateInput.value.trim();
    if (!name) {
      gateError.style.display = 'block';
      gateInput.focus();
      return;
    }
    
    guestName = name;
    
    // Propagate name to the hidden RSVP form
    const rsvpNameDisplay = document.getElementById('final-rsvp-name-display');
    if (rsvpNameDisplay) {
      rsvpNameDisplay.textContent = name;
    }
    
    // Hide gate & unlock body scroll
    gateError.style.display = 'none';
    gateObj.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ── Section-4 RSVP (The real flow now) ────────────
  function openRSVP() {
    const init    = document.getElementById('rsvp-init');
    const choices = document.getElementById('rsvp-choices');
    if (!init || !choices) return;

    init.style.transition = 'all 0.4s ease';
    init.style.opacity = '0';
    init.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      init.style.display = 'none';
      choices.classList.add('open');
    }, 380);
  }

  async function confirmRSVP(attending) {
    const choices    = document.getElementById('rsvp-choices');
    const confirmed  = document.getElementById('rsvp-confirmed');
    const icon       = document.getElementById('confirm-icon');
    const title      = document.getElementById('confirm-title');
    const msg        = document.getElementById('confirm-msg');
    
    if (attending) {
      // Transition to companions form instead of finalizing directly
      const rsvpForm = document.getElementById('rsvp-companions-form');
      choices.style.display = 'none';
      rsvpForm.style.display = 'block';
      setTimeout(() => rsvpForm.style.opacity = '1', 50);
      return;
    }

    // NO ATTENDING FLOW
    try {
      choices.style.pointerEvents = 'none';
      choices.style.opacity = '0.5';

      await RSVPStorage.save({
        name: guestName,
        companions: 0,
        attending: false,
        timestamp: new Date().toISOString()
      });

      choices.style.display = 'none';
      
      icon.textContent  = '💌';
      title.className   = 'rsvp-confirm-title no';
      title.textContent = 'Gracias por avisarnos';
      msg.innerHTML     = '¡Te echaremos de menos!<br>Gracias por tomarte el tiempo de responder. 💜';
      
      confirmed.classList.add('show');
    } catch (e) {
      alert("Hubo un error de conexión intentando registrar tu respuesta. Intenta nuevamente.");
      choices.style.pointerEvents = 'auto';
      choices.style.opacity = '1';
    }
  }

  async function submitCompanions() {
    const input = document.getElementById('final-rsvp-companions');
    const btn = document.getElementById('final-rsvp-submit-btn');
    const form = document.getElementById('rsvp-companions-form');
    const confirmed  = document.getElementById('rsvp-confirmed');
    
    const icon       = document.getElementById('confirm-icon');
    const title      = document.getElementById('confirm-title');
    const msg        = document.getElementById('confirm-msg');

    const numCompanions = input ? parseInt(input.value, 10) || 0 : 0;

    try {
      btn.textContent = 'Guardando...';
      btn.disabled = true;

      await RSVPStorage.save({
        name: guestName,
        companions: numCompanions,
        attending: true,
        timestamp: new Date().toISOString()
      });

      form.style.display = 'none';

      icon.textContent  = '🎉';
      title.className   = 'rsvp-confirm-title yes';
      title.textContent = '¡Asistencia Confirmada!';
      msg.innerHTML     = '¡Qué alegría! Te esperamos con los brazos abiertos para celebrar una gran noche.';
      
      confirmed.classList.add('show');
      launchConfetti();
    } catch (e) {
      alert("Hubo un error de conexión intentando registrar tu asistencia. Intenta nuevamente.");
      btn.textContent = 'Confirmar mi asistencia';
      btn.disabled = false;
    }
  }

  function launchConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    const colors = ['#C9B8E8','#E8DFF6','#C4A882','#9B7EC8','#F5C6E8','#FAF7F0'];
    const shapes = ['50%', '0%', '2px'];

    for (let i = 0; i < 28; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left            = Math.random() * 100 + '%';
      piece.style.top             = '-10px';
      piece.style.background      = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius    = shapes[Math.floor(Math.random() * shapes.length)];
      piece.style.width           = (Math.random() * 8 + 5) + 'px';
      piece.style.height          = (Math.random() * 8 + 5) + 'px';
      piece.style.animationDelay  = (Math.random() * 0.8) + 's';
      piece.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
      container.appendChild(piece);
    }
    setTimeout(() => container.innerHTML = '', 4000);
  }

  return { unlockInvitation, openRSVP, confirmRSVP, submitCompanions, launchConfetti };
})();
