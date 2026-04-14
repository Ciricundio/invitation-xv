/**
 * admin.js
 * Single Responsibility: Read RSVP data from Supabase and render the admin panel.
 * Interface Segregation: Only exposes functions needed by admin.html.
 *
 * Public API:
 *   AdminModule.render()       — renders the confirmations table
 *   AdminModule.exportCSV()    — downloads confirmations as CSV
 *   AdminModule.clearAll()     — clears all confirmations (disabled logic for DB)
 */

const AdminModule = (function () {
  const SUPABASE_URL = 'https://qantgbslvdmmwxcrslko.supabase.co/rest/v1/rsvps?order=timestamp.desc';
  const SUPABASE_KEY = 'sb_publishable_L16WcMrIPBo2kuCBRw1xdg_9r_EhIkp';

  let currentConfirmations = [];

  // ── Storage read ──────────────────────────────────────────────────────
  async function fetchConfirmations() {
    try {
      const response = await fetch(SUPABASE_URL, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        }
      });
      if (!response.ok) {
        throw new Error('Error al leer de la base de datos');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  function formatDate(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-CO', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────
  async function render() {
    const tbody = document.getElementById('admin-tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="admin-empty" style="padding:4rem 0;">
            <div style="opacity: 0.6; animation: pulse 1.5s infinite">Cargando base de datos global...</div>
          </td>
        </tr>`;
    }

    const list = await fetchConfirmations();
    currentConfirmations = list;

    // Summary counters
    const total     = list.length;
    const attending = list.filter(r => r.attending).length;
    const notAttend = total - attending;

    document.getElementById('admin-total').textContent    = total;
    document.getElementById('admin-attending').textContent = attending;
    document.getElementById('admin-absent').textContent   = notAttend;

    // Table body
    if (!tbody) return;

    if (total === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="admin-empty">
            <span>🌸</span><br>
            Aún no hay confirmaciones registradas en línea.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = list
      .map((r, i) => `
        <tr class="admin-row ${r.attending ? 'row-yes' : 'row-no'}">
          <td class="admin-td admin-td-num">${total - i}</td>
          <td class="admin-td admin-td-name">${escapeHtml(r.name)}</td>
          <td class="admin-td admin-td-status">
            <span class="admin-badge ${r.attending ? 'badge-yes' : 'badge-no'}">
              ${r.attending ? '✅ Asistiré' : '❌ No podré'}
            </span>
          </td>
          <td class="admin-td" style="color:var(--text-soft); font-weight:500;">+${r.companions || 0}</td>
          <td class="admin-td admin-td-date">${formatDate(r.timestamp)}</td>
        </tr>`)
      .join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Export CSV ────────────────────────────────────────────────────────
  function exportCSV() {
    const list = currentConfirmations;
    if (list.length === 0) {
      alert('No hay confirmaciones para exportar.');
      return;
    }

    const header = ['#', 'Nombre', 'Asistencia', 'Acompañantes', 'Fecha y Hora'];
    const rows = list.map((r, i) => [
      i + 1,
      `"${r.name.replace(/"/g, '""')}"`,
      r.attending ? 'Sí' : 'No',
      r.companions || 0,
      `"${formatDate(r.timestamp)}"`
    ]);

    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'confirmaciones-quinceanera.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── Clear all ─────────────────────────────────────────────────────────
  // Note: Para bases de datos en la nube, es peligroso borrar
  // todo desde un panel sin autenticación. Por ahora, redirigimos
  // al usuario para que elimine los registros directamente en Supabase.
  function clearAll() {
    const confirmDialog = document.getElementById('admin-confirm-dialog');
    
    // Changing the content dynamically to adapt to Supabase rule
    const dialogTitle = document.getElementById('admin-dialog-title') || document.querySelector('.admin-dialog-title');
    const dialogMsg = document.getElementById('admin-dialog-msg') || document.querySelector('.admin-dialog-msg');
    const btnYes = document.querySelector('.admin-btn-confirm-yes');

    if (dialogTitle) dialogTitle.textContent = "Aviso de Seguridad";
    if (dialogMsg) dialogMsg.innerHTML = "Por tu propia seguridad, las confirmaciones guardadas en la base de datos (Supabase) solo se pueden eliminar manualmente desde la consola de Supabase.com.<br><br>Esto previene que borres accidentalmente la información de tus invitados.";
    
    if (btnYes) {
        btnYes.textContent = "Entendido";
        btnYes.onclick = cancelClear; // Rebind to simply dismiss
    }

    confirmDialog.style.display = 'flex';
  }

  function cancelClear() {
    const confirmDialog = document.getElementById('admin-confirm-dialog');
    if (confirmDialog) confirmDialog.style.display = 'none';
  }

  return { render, exportCSV, clearAll, confirmClear: cancelClear, cancelClear };
})();

// Add simple CSS animation for the loading text dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
`;
document.head.appendChild(style);

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AdminModule.render();
});
