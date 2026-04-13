/**
 * admin.js
 * Single Responsibility: Read RSVP data from localStorage and render the admin panel.
 * Interface Segregation: Only exposes functions needed by admin.html.
 *
 * Public API:
 *   AdminModule.render()       — renders the confirmations table
 *   AdminModule.exportCSV()    — downloads confirmations as CSV
 *   AdminModule.clearAll()     — clears all confirmations after confirmation
 */

const AdminModule = (function () {
  const STORAGE_KEY = 'rsvp_confirmations';

  // ── Storage read ──────────────────────────────────────────────────────
  function getConfirmations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
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
  function render() {
    const list = getConfirmations();

    // Summary counters
    const total     = list.length;
    const attending = list.filter(r => r.attending).length;
    const notAttend = total - attending;

    document.getElementById('admin-total').textContent    = total;
    document.getElementById('admin-attending').textContent = attending;
    document.getElementById('admin-absent').textContent   = notAttend;

    // Table body
    const tbody = document.getElementById('admin-tbody');
    if (!tbody) return;

    if (total === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="admin-empty">
            <span>🌸</span><br>
            Aún no hay confirmaciones registradas.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = list
      .slice()
      .reverse() // most recent first
      .map((r, i) => `
        <tr class="admin-row ${r.attending ? 'row-yes' : 'row-no'}">
          <td class="admin-td admin-td-num">${total - i}</td>
          <td class="admin-td admin-td-name">${escapeHtml(r.name)}</td>
          <td class="admin-td admin-td-status">
            <span class="admin-badge ${r.attending ? 'badge-yes' : 'badge-no'}">
              ${r.attending ? '✅ Asistiré' : '❌ No podré'}
            </span>
          </td>
          <td class="admin-td admin-td-date">${formatDate(r.timestamp)}</td>
        </tr>`)
      .join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Export CSV ────────────────────────────────────────────────────────
  function exportCSV() {
    const list = getConfirmations();
    if (list.length === 0) {
      alert('No hay confirmaciones para exportar.');
      return;
    }

    const header = ['#', 'Nombre', 'Asistencia', 'Fecha y Hora'];
    const rows = list.map((r, i) => [
      i + 1,
      `"${r.name.replace(/"/g, '""')}"`,
      r.attending ? 'Sí' : 'No',
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
  function clearAll() {
    const confirmDialog = document.getElementById('admin-confirm-dialog');
    confirmDialog.style.display = 'flex';
  }

  function confirmClear() {
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('admin-confirm-dialog').style.display = 'none';
    render();
  }

  function cancelClear() {
    document.getElementById('admin-confirm-dialog').style.display = 'none';
  }

  return { render, exportCSV, clearAll, confirmClear, cancelClear };
})();

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AdminModule.render();
});
