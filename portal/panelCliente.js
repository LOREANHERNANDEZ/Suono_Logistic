// ====== NAVEGACIÓN EN EL SIDEBAR ======
const menuItems = document.querySelectorAll('.sidebar li');
const content = document.querySelector('.content');
const nombreClienteSpan = document.getElementById('nombreCliente');
const avatarCliente = document.getElementById('avatarCliente');

let clienteActual = { nombre: 'Cliente', apellido: '', email: '', telefono: '' };

// Caches to keep the last loaded lists visible when navigating away and back
let cotizacionesCache = [];
let reservasCache = [];
let pqrsCache = [];

// sentinel id used to mark the panel state in history
let panelSentinelId = null;

function setPanelSentinel() {
  try {
    // create a small random id
    panelSentinelId = Math.random().toString(36).slice(2, 9);
    // replace current state with sentinel and push one so popstate fires
    // replace current state so forward/back checks can identify the panel
    history.replaceState({ sentinel: panelSentinelId }, '', window.location.href);
    // push a second state ensures a popstate occurs when user clicks Back
    history.pushState({ sentinel: panelSentinelId }, '', window.location.href);
  } catch (e) { /* ignore browsers that block history api */ }
}

// ====== MODAL UTILS ======
function getModalElements() {
  const modal = document.getElementById('customModal');
  const modalMessage = document.getElementById('modalMessage');
  const modalActions = document.getElementById('modalActions');
  return { modal, modalMessage, modalActions };
}

function abrirModal(mensaje, botones = [{ texto: 'OK', accion: cerrarModal }]) {
  const { modal, modalMessage, modalActions } = getModalElements();
  if (!modal || !modalMessage || !modalActions) {
    // Fallback: si el modal no está disponible aún, usar alert
    try { alert(mensaje); } catch (e) { console.log('Modal no disponible:', mensaje); }
    return;
  }
  modalMessage.textContent = mensaje;
  modalActions.innerHTML = '';
  botones.forEach(b => {
    const btn = document.createElement('button');
    btn.textContent = b.texto;
    btn.addEventListener('click', b.accion);
    modalActions.appendChild(btn);
  });
  modal.style.display = 'flex';
}

function cerrarModal() {
  const { modal } = getModalElements();
  if (modal) modal.style.display = 'none';
}

// Cerrar modal al click fuera (usa getter para evitar null si se carga temprano)
window.addEventListener('click', (e) => {
  const { modal } = getModalElements();
  if (modal && e.target === modal) cerrarModal();
});

// ====== CARGAR DATOS DEL CLIENTE ======
async function cargarCliente() {
  try {
    const res = await fetch('/api/cliente/actual', { credentials: 'include' });
    const data = await res.json();
    console.log('cargarCliente response status', res.status, 'body:', data);
    if (data && data.nombre) {
      clienteActual = data;
    } else {
      // No session on server — prevent access to panel: redirect to home/login
      console.warn('No hay sesión activa de cliente. Redirigiendo a inicio.');
      // Clean any local fallback stored
      try { localStorage.removeItem('clienteActual'); } catch (e) {}
      window.location.replace('/');
      return;
    }
    if (clienteActual && clienteActual.nombre) {
      nombreClienteSpan.textContent = `${clienteActual.nombre} ${clienteActual.apellido || ''}`;
      // Render a small person SVG icon as the avatar instead of a letter
      avatarCliente.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="8" r="3.2" fill="#ffffff" opacity="0.95" />
          <path d="M4 20c0-3.3137 4.6863-6 8-6s8 2.6863 8 6" fill="#ffffff" opacity="0.95" />
        </svg>
      `;
    }
  } catch (err) {
    console.error('Error al cargar cliente:', err);
  }
}

// ====== SECCIONES / FORMS ======
const secciones = {
  'Inicio': () => `
    <div class="card">
      <h3>Inicio</h3>
      <p>Bienvenido a tu panel de cliente, <strong>${clienteActual.nombre} ${clienteActual.apellido || ''}</strong>.</p>
    </div>
  `,
  'Actualizar Información': () => `
    <div class="card">
      <h3>Actualizar Información</h3>
      <form id="formInfo">
        <input type="text" value="${clienteActual.nombre}" disabled placeholder="Nombre">
        <input type="text" value="${clienteActual.apellido}" disabled placeholder="Apellido">
        <input type="email" value="${clienteActual.email}" required placeholder="Correo electrónico">
        <input type="text" value="${clienteActual.telefono}" required placeholder="Teléfono">
        <input type="submit" value="Actualizar">
      </form>
    </div>
  `,
  'Cotizar': () => `
    <div class="card">
      <h3>Cotizar Evento</h3>
      <form id="formCotizar">
        <input type="text" placeholder="Nombre del evento" required>
        <input type="text" placeholder="Tipo de evento" required>
        <input type="date" id="cotizarFecha" required>
        <input type="time" placeholder="Hora de inicio" required>
        <input type="time" placeholder="Hora de finalización" required>
        <input type="text" placeholder="Ubicación" required>
        <input type="number" placeholder="Número de personas" required>
        <textarea placeholder="Descripción general" required></textarea>
        <input type="submit" value="Enviar">
      </form>
      <hr>
      <h4>Mis Cotizaciones</h4>
      <div id="misCotizacionesContainer">Cargando...</div>
      <div id="misCotizacionesPager" class="pager"></div>
    </div>
  `,
  'Reservar Evento': () => `
    <div class="card">
      <h3>Reservar Evento</h3>
      <form id="formEvento">
        <input type="text" placeholder="Nombre del evento" required>
        <input type="text" placeholder="Tipo de evento" required>
        <input type="date" id="reservarFecha" required>
        <input type="time" placeholder="Hora de inicio" required>
        <input type="time" placeholder="Hora de finalización" required>
        <input type="text" placeholder="Ubicación" required>
        <textarea placeholder="Descripción general" required></textarea>
        <input type="submit" value="Reservar">
      </form>
      <hr>
      <h4>Mis Reservas</h4>
      <div id="misReservasContainer">Cargando...</div>
      <div id="misReservasPager" class="pager"></div>
    </div>
  `,
  'PQR': () => `
    <div class="card">
      <h3>Peticiones, Quejas y Reclamos</h3>
      <form id="formPQR">
        <input type="text" placeholder="Asunto" required>
        <textarea placeholder="Descripción" required></textarea>
        <input type="submit" value="Enviar">
      </form>
      <hr>
      <h4>Mis PQRs</h4>
      <div id="misPqrsContainer">Cargando...</div>
      <div id="misPqrsPager" class="pager"></div>
    </div>
  `,
  'Mis Cotizaciones': () => `
    <div class="card">
      <h3>Mis Cotizaciones</h3>
      <div id="misCotizacionesContainer">Cargando...</div>
      <div id="misCotizacionesPager" class="pager"></div>
    </div>
  `,
  'Mis Reservas': () => `
    <div class="card">
      <h3>Mis Reservas</h3>
      <div id="misReservasContainer">Cargando...</div>
      <div id="misReservasPager" class="pager"></div>
    </div>
  `,
  'Mis PQRs': () => `
    <div class="card">
      <h3>Mis PQRs</h3>
      <div id="misPqrsContainer">Cargando...</div>
      <div id="misPqrsPager" class="pager"></div>
    </div>
  `,
  'Contactar Asesor': () => `
    <div class="card">
      <h3>Contactar Asesor</h3>
      <form id="formAsesor">
        <input type="text" placeholder="Nombre" required>
        <input type="email" placeholder="Correo" required>
        <textarea placeholder="Mensaje" required></textarea>
        <input type="submit" value="Enviar">
      </form>
    </div>
  `
};

function mostrarSeccion(nombre) {
  content.innerHTML = secciones[nombre] ? secciones[nombre]() : '';
  // reset panel sentinel when showing a section to keep history consistent
  setPanelSentinel();
  const form = content.querySelector('form');
    // set min date for date inputs to today
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = content.querySelectorAll('input[type="date"]');
    dateInputs.forEach(i => i.setAttribute('min', today));
    // render cached lists if present so they remain visible when navigating back
    renderCachedListsInSection();
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let endpoint = '';
    let bodyData = {};

    switch (form.id) {
      case 'formInfo':
        endpoint = '/api/cliente/actualizar';
        bodyData = {
          email: clienteActual.email,
          telefono: form.querySelector('input[placeholder="Teléfono"]').value,
          correo: form.querySelector('input[type="email"]').value
        };
        break;
      case 'formCotizar':
        endpoint = '/api/cliente/cotizar';
        bodyData = {
          nombreEvento: form.querySelector('input[placeholder="Nombre del evento"]').value,
          tipoEvento: form.querySelector('input[placeholder="Tipo de evento"]').value,
          fecha: form.querySelector('input[type="date"]').value,
          horaInicio: form.querySelectorAll('input[type="time"]')[0].value,
          horaFin: form.querySelectorAll('input[type="time"]')[1].value,
          ubicacion: form.querySelector('input[placeholder="Ubicación"]').value,
          numeroPersonas: form.querySelector('input[type="number"]').value,
          descripcion: form.querySelector('textarea').value,
          clienteEmail: clienteActual.email
        };
        break;
      case 'formEvento':
        endpoint = '/api/cliente/reservar';
        bodyData = {
          nombreEvento: form.querySelector('input[placeholder="Nombre del evento"]').value,
          tipoEvento: form.querySelector('input[placeholder="Tipo de evento"]').value,
          fecha: form.querySelector('input[type="date"]').value,
          horaInicio: form.querySelectorAll('input[type="time"]')[0].value,
          horaFin: form.querySelectorAll('input[type="time"]')[1].value,
          ubicacion: form.querySelector('input[placeholder="Ubicación"]').value,
          descripcion: form.querySelector('textarea').value,
          clienteEmail: clienteActual.email
        };
        break;
      case 'formPQR':
        endpoint = '/api/cliente/pqr';
        bodyData = {
          asunto: form.querySelector('input[placeholder="Asunto"]').value,
          descripcion: form.querySelector('textarea').value,
          clienteEmail: clienteActual.email
        };
        break;
      case 'formAsesor':
        endpoint = '/api/cliente/contactar-asesor';
        bodyData = {
          nombre: form.querySelector('input[placeholder="Nombre"]').value,
          correo: form.querySelector('input[placeholder="Correo"]').value,
          mensaje: form.querySelector('textarea').value,
          clienteEmail: clienteActual.email
        };
        break;
      default:
        break;
    }

    if (!endpoint) return;

    try {
      const res = await fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyData) });
      if (res.ok) {
        // parse response to show numero if available
        let data = {};
        try { data = await res.json(); } catch (e) { try { const t = await res.text(); console.log('non-json response', t); data = {}; } catch(_) { data = {}; } }
        console.log('submit response', endpoint, res.status, data);
        const extra = data.numero ? ` Número: ${data.numero}` : '';
    // Build friendly success message depending on form type
    let resourceName = 'Tu formulario';
    if (form.id === 'formCotizar') resourceName = 'Tu cotización';
    if (form.id === 'formEvento') resourceName = 'Tu reserva';
    if (form.id === 'formPQR') resourceName = 'Tu PQR';
    const idLabel = data.identificador || data.numero ? ` Identificador: ${data.identificador || data.numero}` : '';
    const successMsg = `✅ ${resourceName} ha sido registrada.${idLabel}`;
    // show identificador in modal (if available) and copy to clipboard button
    const actions = [{ texto: 'Aceptar', accion: cerrarModal }];
    if (data.identificador || data.numero) {
      actions.unshift({ texto: 'Copiar código', accion: async () => { const code = data.identificador || data.numero; try { await navigator.clipboard.writeText(code); abrirModal('Código copiado al portapapeles.'); } catch(e) { abrirModal('No se pudo copiar automáticamente. Selecciona y copia el código.'); } } });
    }
    abrirModal(successMsg, actions);
        form.reset();
  // Refresh lists in-place if this was a cotizacion/reserva/pqr
  if (form.id === 'formCotizar') { await fetchMisCotizaciones(1); }
  if (form.id === 'formEvento') { await fetchMisReservas(1); }
  if (form.id === 'formPQR') { await fetchMisPqrs(1); }
      } else {
        const text = await res.text();
        console.error('Form submit error', res.status, text);
        let err = {};
        try { err = JSON.parse(text); } catch (e) { err.message = text; }
        abrirModal(`❌ Error: ${err.message || 'No se pudo enviar.'}`, [{ texto: 'Aceptar', accion: cerrarModal }]);
      }
    } catch (err) {
      console.error(err);
      abrirModal('❌ Error al conectarse al servidor.', [{ texto: 'Aceptar', accion: cerrarModal }]);
    }
  });
}

// After inserting a section, if cached lists exist render them immediately so they stay visible
// even after navigating away and back.
function renderCachedListsInSection() {
  // Cotizaciones
  const cotContainer = content.querySelector('#misCotizacionesContainer');
  if (cotContainer) {
    if (cotizacionesCache && cotizacionesCache.length) {
      renderMisCotizaciones(cotizacionesCache);
      renderPager('misCotizacionesPager', cotizacionesState.page, cotizacionesState.totalPages, fetchMisCotizaciones);
    }
  }
  // Reservas
  const resContainer = content.querySelector('#misReservasContainer');
  if (resContainer) {
    if (reservasCache && reservasCache.length) {
      renderMisReservas(reservasCache);
      renderPager('misReservasPager', reservasState.page, reservasState.totalPages, fetchMisReservas);
    }
  }
  // PQRs
  const pqrContainer = content.querySelector('#misPqrsContainer');
  if (pqrContainer) {
    if (pqrsCache && pqrsCache.length) {
      renderMisPqrs(pqrsCache);
      renderPager('misPqrsPager', pqrsState.page, pqrsState.totalPages, fetchMisPqrs);
    }
  }
}

// ====== LISTADOS PAGINADOS (Cliente) ======
const cotizacionesState = { page: 1, limit: 5, totalPages: 1 };
const reservasState = { page: 1, limit: 5, totalPages: 1 };
const pqrsState = { page: 1, limit: 5, totalPages: 1 };

async function fetchMisCotizaciones(page = 1) {
  try {
    console.log('fetchMisCotizaciones page', page);
    const container = document.getElementById('misCotizacionesContainer'); if (container) container.textContent = 'Cargando...';
    let res = await fetch(`/api/cliente/mis-cotizaciones?page=${page}&limit=${cotizacionesState.limit}`, { credentials: 'include' });
    console.log('mis-cotizaciones status', res.status);
    if (res.status === 400 && clienteActual && clienteActual.email) {
      console.log('Retry mis-cotizaciones using email query param', clienteActual.email);
      res = await fetch(`/api/cliente/mis-cotizaciones?page=${page}&limit=${cotizacionesState.limit}&email=${encodeURIComponent(clienteActual.email)}`, { credentials: 'include' });
      console.log('retry status', res.status);
    }
    if (!res.ok) {
      const text = await res.text();
      console.error('Error fetching cotizaciones', res.status, text);
      throw new Error('Error fetching cotizaciones');
    }
    const data = await res.json();
    cotizacionesState.page = data.page || page;
    cotizacionesState.totalPages = data.totalPages || 1;
  cotizacionesCache = data.items || [];
  renderMisCotizaciones(cotizacionesCache);
    renderPager('misCotizacionesPager', cotizacionesState.page, cotizacionesState.totalPages, fetchMisCotizaciones);
  } catch (err) {
    console.error('fetchMisCotizaciones error', err);
    const c = document.getElementById('misCotizacionesContainer'); if (c) c.textContent = 'Error cargando cotizaciones.';
  }
}

function renderMisCotizaciones(items) {
  const container = document.getElementById('misCotizacionesContainer');
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = '<p>No tienes cotizaciones aún.</p>';
    return;
  }
  container.innerHTML = items.map(it => `
    <div class="list-item">
      <strong>#${it.numero || '-'} — ${it.nombreEvento}</strong> — ${new Date(it.fecha).toLocaleDateString()}<br>
      <small>${it.tipoEvento} · ${it.ubicacion} · ${it.numeroPersonas} personas</small>
      <p>${it.descripcion || ''}</p>
    </div>
  `).join('');
}

async function fetchMisReservas(page = 1) {
  try {
    console.log('fetchMisReservas page', page);
    const container = document.getElementById('misReservasContainer'); if (container) container.textContent = 'Cargando...';
    let res = await fetch(`/api/cliente/mis-reservas?page=${page}&limit=${reservasState.limit}`, { credentials: 'include' });
    console.log('mis-reservas status', res.status);
    if (res.status === 400 && clienteActual && clienteActual.email) {
      console.log('Retry mis-reservas using email query param', clienteActual.email);
      res = await fetch(`/api/cliente/mis-reservas?page=${page}&limit=${reservasState.limit}&email=${encodeURIComponent(clienteActual.email)}`, { credentials: 'include' });
      console.log('retry status', res.status);
    }
    if (!res.ok) {
      const text = await res.text();
      console.error('Error fetching reservas', res.status, text);
      throw new Error('Error fetching reservas');
    }
    const data = await res.json();
    reservasState.page = data.page || page;
    reservasState.totalPages = data.totalPages || 1;
  reservasCache = data.items || [];
  renderMisReservas(reservasCache);
    renderPager('misReservasPager', reservasState.page, reservasState.totalPages, fetchMisReservas);
  } catch (err) {
    console.error('fetchMisReservas error', err);
    const c = document.getElementById('misReservasContainer'); if (c) c.textContent = 'Error cargando reservas.';
  }
}

function renderMisReservas(items) {
  const container = document.getElementById('misReservasContainer');
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = '<p>No tienes reservas aún.</p>';
    return;
  }
  container.innerHTML = items.map(it => `
    <div class="list-item">
      <strong>${it.nombreEvento}</strong> — ${new Date(it.fecha).toLocaleDateString()}<br>
      <small>${it.tipoEvento} · ${it.ubicacion}</small>
      <p>${it.descripcion || ''}</p>
    </div>
  `).join('');
}

async function fetchMisPqrs(page = 1) {
  try {
    console.log('fetchMisPqrs page', page);
    const container = document.getElementById('misPqrsContainer'); if (container) container.textContent = 'Cargando...';
    let res = await fetch(`/api/cliente/mis-pqrs?page=${page}&limit=${pqrsState.limit}`, { credentials: 'include' });
    console.log('mis-pqrs status', res.status);
    if (res.status === 400 && clienteActual && clienteActual.email) {
      console.log('Retry mis-pqrs using email query param', clienteActual.email);
      res = await fetch(`/api/cliente/mis-pqrs?page=${page}&limit=${pqrsState.limit}&email=${encodeURIComponent(clienteActual.email)}`, { credentials: 'include' });
      console.log('retry status', res.status);
    }
    // additional fallback: if still 400, try localStorage-stored email (older flow)
    if (res.status === 400) {
      try {
        const saved = localStorage.getItem('clienteActual');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            console.log('Retry mis-pqrs using localStorage email', parsed.email);
            res = await fetch(`/api/cliente/mis-pqrs?page=${page}&limit=${pqrsState.limit}&email=${encodeURIComponent(parsed.email)}`, { credentials: 'include' });
            console.log('localStorage retry status', res.status);
          }
        }
      } catch (e) { /* ignore */ }
    }
    if (!res.ok) {
      const text = await res.text();
      console.error('Error fetching pqrs', res.status, text);
      throw new Error('Error fetching pqrs');
    }
    const data = await res.json();
    pqrsState.page = data.page || page;
    pqrsState.totalPages = data.totalPages || 1;
  pqrsCache = data.items || [];
  renderMisPqrs(pqrsCache);
    renderPager('misPqrsPager', pqrsState.page, pqrsState.totalPages, fetchMisPqrs);
  } catch (err) {
    console.error('fetchMisPqrs error', err);
    const c = document.getElementById('misPqrsContainer'); if (c) c.textContent = 'Error cargando PQRs.';
  }
}

function renderMisPqrs(items) {
  const container = document.getElementById('misPqrsContainer');
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = '<p>No tienes PQRs aún.</p>';
    return;
  }
  container.innerHTML = items.map(it => `
    <div class="list-item">
      <strong>${it.asunto}</strong> — ${new Date(it.createdAt).toLocaleDateString()}<br>
      <p>${it.descripcion || ''}</p>
      ${it.respondida ? `<div class="admin-response"><strong>Respuesta:</strong> ${it.respuestaAdmin}</div>` : ''}
    </div>
  `).join('');
}

function renderPager(containerId, page, totalPages, fetchFn) {
  const pager = document.getElementById(containerId);
  if (!pager) return;
  pager.innerHTML = '';
  const prev = document.createElement('button'); prev.textContent = 'Anterior'; prev.disabled = page <= 1;
  const next = document.createElement('button'); next.textContent = 'Siguiente'; next.disabled = page >= totalPages;
  const label = document.createElement('span'); label.textContent = ` Página ${page} de ${totalPages} `;
  prev.addEventListener('click', () => fetchFn(page - 1));
  next.addEventListener('click', () => fetchFn(page + 1));
  pager.appendChild(prev); pager.appendChild(label); pager.appendChild(next);
}

// ====== SIDEBAR EVENTS ======
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    mostrarSeccion(item.textContent.trim());
    const name = item.textContent.trim();
    if (name === 'Mis Cotizaciones') fetchMisCotizaciones(1);
    if (name === 'Mis Reservas') fetchMisReservas(1);
    if (name === 'Mis PQRs') fetchMisPqrs(1);
  });
});

// ====== LOGOUT ======
const btnLogout = document.querySelector('.btn-logout');
async function doLogout(redirectToHome = true) {
  try {
    const res = await fetch('/logout', { method: 'GET', credentials: 'include' });
    if (res.ok) {
      try { localStorage.removeItem('clienteActual'); } catch(e) {}
      // Mark logged out in localStorage so any cached page knows user logged out
      try { localStorage.setItem('suono_logged_out', '1'); } catch(e) {}
      // Replace history state and navigate with replace to avoid back-button returning to panel
      try { history.replaceState({}, '', '/'); } catch(e) {}
      if (redirectToHome) window.location.replace('/');
      return true;
    } else {
      abrirModal('❌ No se pudo cerrar la sesión.');
      return false;
    }
  } catch (err) {
    console.error('Error logout:', err);
    abrirModal('❌ Error al cerrar sesión.');
    return false;
  }
}

if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    const ok = await doLogout(true);
    if (!ok) console.warn('Logout failed');
  });
}

// ====== ELIMINAR CUENTA (botón ya en HTML) ======
document.addEventListener('DOMContentLoaded', () => {
  const btnEliminar = document.getElementById('btnEliminar');
  if (!btnEliminar) return;
  btnEliminar.addEventListener('click', () => {
    abrirModal('¿Seguro que deseas eliminar tu cuenta? Esta acción es irreversible.', [
      { texto: 'Cancelar', accion: cerrarModal },
      { texto: 'Continuar', accion: mostrarConfirmacionFinal }
    ]);
  });
});

function mostrarConfirmacionFinal() {
  abrirModal('Confirmación final: tu cuenta será eliminada permanentemente.', [
    { texto: 'Cancelar', accion: cerrarModal },
    { texto: 'Eliminar cuenta', accion: eliminarCuenta }
  ]);
}

async function eliminarCuenta() {
  try {
    console.log('Intentando eliminar cuenta para', clienteActual && clienteActual.email);
    const res = await fetch('/api/cliente/eliminar', { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: clienteActual.email }) });
    console.log('Respuesta eliminar cuenta status:', res.status);
    if (res.ok) {
      abrirModal('✅ Tu cuenta fue eliminada. Redirigiendo...');
      setTimeout(() => window.location.href = '/', 1200);
      return;
    }

    // Try to parse JSON error body, but handle non-JSON responses gracefully
    let text = '';
    try { text = await res.text();
      const maybeJson = JSON.parse(text);
      abrirModal(`❌ Error: ${maybeJson.message || JSON.stringify(maybeJson)}`);
    } catch (parseErr) {
      // not JSON
      abrirModal(`❌ Error: ${text || 'No se pudo eliminar la cuenta.'}`);
    }
  } catch (err) {
    console.error('Error eliminar cuenta:', err);
    abrirModal('❌ Error al conectar con el servidor.');
  }
}

// Inicializar
async function initPanel() {
  await cargarCliente();
  mostrarSeccion('Inicio');
  setPanelSentinel();
  // Prefetch first page for lists so they load quickly when user opens them
  fetchMisCotizaciones(1);
  fetchMisReservas(1);
  fetchMisPqrs(1);
}
initPanel();

// ====== HISTORIAL: interceptar "back" para confirmar cierre de sesión ======
// Push a dummy state so we can detect back navigation inside the SPA
function enableBackInterceptor() {
  try {
    // Only add one popstate listener
    window.addEventListener('popstate', async (event) => {
      const state = event.state || {};
      // only react if sentinel matches (prevents accidental intercepts)
      if (!state.sentinel || state.sentinel !== panelSentinelId) return;

      // Confirm server session still exists before prompting. If session already gone, force redirect.
      try {
        const check = await fetch('/api/cliente/actual', { credentials: 'include' });
        if (check.status === 401 || check.status === 403) {
          // session gone - ensure user leaves
          try { history.replaceState({}, '', '/'); } catch(e) {}
          window.location.replace('/');
          return;
        }
      } catch (e) {
        // network error - still show confirmation to be safe
      }

      abrirModal('¿Seguro que quieres cerrar sesión y salir del panel?', [
        { texto: 'Cancelar', accion: () => {
            cerrarModal();
            // restore panel sentinel so user remains in panel
            setPanelSentinel();
            // move forward in history to re-establish position
            try { history.pushState({ sentinel: panelSentinelId }, '', window.location.href); } catch(e) {}
          }
        },
        { texto: 'Sí', accion: async () => {
            cerrarModal();
            try { await doLogout(false); } catch(e) {}
            // clear caches and local state
            cotizacionesCache = [];
            reservasCache = [];
            pqrsCache = [];
            try { localStorage.removeItem('clienteActual'); } catch(e) {}
            // remove panel entries from history and navigate to home using replace so forward does not return to panel
            try { history.replaceState({}, '', '/'); } catch(e) {}
            window.location.replace('/');
          }
        }
      ]);
    }, { once: false });
  } catch (err) {
    console.warn('Historial no soportado o error al interceptar back:', err);
  }
}

// Enable interceptor after panel init
enableBackInterceptor();

// Si la página es restaurada desde el bfcache, validar la sesión y forzar redirección si ya no existe
window.addEventListener('pageshow', (event) => {
  // Siempre validar la sesión cuando la página se muestra (incluye restauración desde bfcache)
  console.log('pageshow: validar sesión (persisted=' + !!event.persisted + ')');
  try {
    // If another tab set logged out marker, redirect immediately
    const loggedOut = localStorage.getItem('suono_logged_out');
    if (loggedOut) {
      console.log('pageshow: detected logged out marker — redirecting');
      try { localStorage.removeItem('suono_logged_out'); } catch(e) {}
      try { window.location.replace('/'); } catch(_) {}
      return;
    }
    cargarCliente();
  } catch (e) {
    try { window.location.replace('/'); } catch (_) {}
  }
});

// Early check on script load (in case page is restored from cache and pageshow not fired yet)
try {
  const marker = localStorage.getItem('suono_logged_out');
  if (marker) {
    try { localStorage.removeItem('suono_logged_out'); } catch(e) {}
    try { window.location.replace('/'); } catch(e) {}
  }
} catch (e) { /* ignore */ }
