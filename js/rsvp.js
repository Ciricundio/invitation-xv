/**
 * rsvp.js
 * Single Responsibility: Handle all RSVP confirmation logic using Supabase backend.
 * Dependency Inversion: Storage is abstracted — uses RSVPStorage internally,
 * so the storage mechanism can be swapped without changing business logic.
 *
 * Public API:
 *   RSVPModule.submitInlineRSVP()   — handles the inline card form submit
 *   RSVPModule.openRSVP()           — opens the section-4 RSVP choices
 *   RSVPModule.confirmRSVP(bool)    — confirms attendance for section-4 (visual only)
 *   RSVPModule.launchConfetti()     — confetti animation
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
    
    // Propagate name to the hidden RSVP form
    const rsvpNameInput = document.getElementById('inline-rsvp-name');
    if (rsvpNameInput) {
      rsvpNameInput.value = name;
    }
    
    // Hide gate & unlock body scroll
    gateError.style.display = 'none';
    gateObj.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ── Inline RSVP (inside the details card, Section 2) ─────────────────
  let selectedAttendance = null; // 'yes' | 'no'

  function selectAttendance(choice) {
    selectedAttendance = choice;
    const btnYes = document.getElementById('inline-rsvp-yes');
    const btnNo  = document.getElementById('inline-rsvp-no');
    if (!btnYes || !btnNo) return;

    if (choice === 'yes') {
      btnYes.classList.add('selected');
      btnNo.classList.remove('selected');
    } else {
      btnNo.classList.add('selected');
      btnYes.classList.remove('selected');
    }
  }

  async function submitInlineRSVP() {
    const nameInput = document.getElementById('inline-rsvp-name');
    const errorEl   = document.getElementById('inline-rsvp-error');
    const formEl    = document.getElementById('inline-rsvp-form');
    const doneEl    = document.getElementById('inline-rsvp-done');
    const doneMsg   = document.getElementById('inline-rsvp-done-msg');
    const submitBtn = document.querySelector('.inline-rsvp-submit');

    if (!nameInput) return;

    const name = nameInput.value.trim();

    const companionsInput = document.getElementById('inline-rsvp-companions');
    const numCompanions = companionsInput ? parseInt(companionsInput.value, 10) || 0 : 0;

    // Validation
    if (!name) {
      errorEl.textContent = 'Por favor escribe tu nombre.';
      errorEl.style.display = 'block';
      nameInput.focus();
      return;
    }
    if (!selectedAttendance) {
      errorEl.textContent = 'Por favor selecciona si asistirás o no.';
      errorEl.style.display = 'block';
      return;
    }
    errorEl.style.display = 'none';

    try {
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';

      // Save confirmation to Supabase
      await RSVPStorage.save({
        name,
        companions: numCompanions,
        attending: selectedAttendance === 'yes',
        timestamp: new Date().toISOString()
      });

      // Show confirmation message
      const attending = selectedAttendance === 'yes';
      doneMsg.innerHTML = attending
        ? `¡Gracias, <strong>${name}</strong>! Te esperamos con mucho amor. 💜`
        : `Gracias, <strong>${name}</strong>. ¡Te echaremos de menos! 🌸`;

      formEl.style.transition = 'opacity 0.4s ease';
      formEl.style.opacity = '0';
      setTimeout(() => {
        formEl.style.display = 'none';
        doneEl.style.display = 'block';
        doneEl.classList.add('rsvp-done-visible');
      }, 380);

    } catch (error) {
      console.error(error);
      errorEl.textContent = 'Hubo un error de conexión intentando guardar tu registro. Por favor intenta de nuevo.';
      errorEl.style.display = 'block';
      submitBtn.textContent = '✦ Confirmar asistencia ✦';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }

  // ── Section-4 RSVP (existing full-card flow - VISUAL ONLY) ────────────
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

  function confirmRSVP(attending) {
    const choices    = document.getElementById('rsvp-choices');
    const confirmed  = document.getElementById('rsvp-confirmed');
    const icon       = document.getElementById('confirm-icon');
    const title      = document.getElementById('confirm-title');
    const msg        = document.getElementById('confirm-msg');
    const heartIcon  = document.getElementById('heart-icon');
    
    if (!choices || !confirmed) return;

    // Small animation before hiding
    if (attending && heartIcon) {
      heartIcon.style.transform = 'scale(1.4)';
    }

    setTimeout(() => {
      choices.style.transition = 'opacity 0.3s ease';
      choices.style.opacity = '0';

      setTimeout(() => {
        choices.style.display = 'none';

        if (attending) {
          icon.textContent  = '🎉';
          title.className   = 'rsvp-confirm-title yes';
          title.textContent = '¡Qué alegría!';
          msg.innerHTML     = 'Te esperamos con los brazos abiertos.<br>¡Será una noche <em style="color:var(--gold-light)">inolvidable</em> juntos!';
          launchConfetti();
        } else {
          icon.textContent  = '💌';
          title.className   = 'rsvp-confirm-title no';
          title.textContent = 'Gracias por avisarnos';
          msg.innerHTML     = '¡Te echaremos de menos!<br>Gracias por tomarte el tiempo de responder. 💜';
        }

        confirmed.classList.add('show');
      }, 280);
    }, attending ? 300 : 0);
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

  return { unlockInvitation, selectAttendance, submitInlineRSVP, openRSVP, confirmRSVP, launchConfetti };
})();
