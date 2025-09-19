document.addEventListener('DOMContentLoaded', () => {
  // --- CONTROL DE ACCESO POR ROL ---
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario || !usuario.rol) {
    window.location.href = '/login';
    return;
  }
  // Mostrar nombre y rol en el panel lateral
  const nombreUsuario = document.getElementById('nombre-usuario');
  if (nombreUsuario) {
    let rolTexto = usuario.rol === 'admin' ? 'Administrador' : 'Colaborador';
    nombreUsuario.textContent = `${usuario.nombre} (${rolTexto})`;
  }
  if (usuario.rol === 'colaborador') {
    // Ocultar secciones solo para admin
    const adminSections = [
      'seccion-clientes',
      'proveedores',
      'reportes',
      'pqr',
    ];
    adminSections.forEach(id => {
      // Ocultar menú
      const menu = document.querySelector(`.nav-link[data-section="${id}"]`);
      if (menu) menu.style.display = 'none';
      // Ocultar sección
      const section = document.getElementById(id);
      if (section) section.style.display = 'none';
    });
    // Opcional: ocultar botones de acciones generales
    document.querySelectorAll('.actions button, .actions a.btn-back').forEach(btn => btn.style.display = 'none');
    // Cambiar título
    const header = document.querySelector('.header h1');
    if (header) header.textContent = 'Panel Colaborador';
  }
  // ----------------------------
  // RESERVAS
  // ----------------------------
  const formReservas = document.getElementById('form-reservas');
  formReservas?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cliente = document.getElementById('reservas-campo1').value.trim();
    const fecha = document.getElementById('reservas-campo2').value.trim();
    const servicio = document.getElementById('reservas-campo3').value.trim();
    // Validación: nombre del cliente (solo letras y espacios)
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nombreRegex.test(cliente)) {
      mostrarModalMensaje('El nombre del cliente solo debe contener letras y espacios.');
      return;
    }
    // Validación: fecha (formato válido)
    if (!fecha || isNaN(Date.parse(fecha))) {
      mostrarModalMensaje('Por favor ingresa una fecha válida.');
      return;
    }
    // Validación: servicio reservado (letras, números y espacios)
    const servicioRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/;
    if (!servicioRegex.test(servicio)) {
      mostrarModalMensaje('El servicio reservado solo debe contener letras, números y espacios.');
      return;
    }
    if (!cliente || !fecha || !servicio) {
      mostrarModalMensaje('Por favor completa todos los campos de la reserva.');
      return;
    }
    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente, fecha, servicio })
      });
      if (res.ok) {
        formReservas.reset();
        mostrarModalMensaje('✅ Reserva registrada exitosamente');
        cargarReservas();
      } else {
        const data = await res.json();
        mostrarModalMensaje('❌ Error: ' + (data.error || 'No se pudo registrar la reserva'));
      }
    } catch (error) {
      console.error(error);
      mostrarModalMensaje('❌ Error al registrar reserva');
    }
  });

  async function cargarReservas() {
    try {
      const res = await fetch('/api/reservas');
      const reservas = await res.json();
      const tbody = document.querySelector('#tabla-reservas tbody');
      tbody.innerHTML = '';
      reservas.forEach(reserva => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${reserva.cliente}</td>
          <td>${reserva.fecha ? reserva.fecha.substring(0,10) : ''}</td>
          <td>${reserva.servicio}</td>
          <td>
            <button class="btn-editar-reserva" data-id="${reserva._id}">Editar</button>
            <button class="btn-eliminar-reserva" data-id="${reserva._id}">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      // Editar reserva
      tbody.querySelectorAll('.btn-editar-reserva').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const res = await fetch(`/api/reservas/${id}`);
          if (!res.ok) {
            mostrarModalMensaje('No se pudo obtener la reserva');
            return;
          }
          const reserva = await res.json();
          const modal = document.createElement('div');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.background = 'rgba(0,0,0,0.3)';
          modal.style.zIndex = '9999';
          modal.style.display = 'flex';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';
          modal.innerHTML = `
            <div class="card modal-panel" style="max-width:350px;text-align:center;">
              <h3 style="color:#b089ff;">Editar Reserva</h3>
              <form id="form-editar-reserva">
                <label style="color:#b089ff;">Cliente:</label>
                <input type="text" id="editar-cliente-reserva" value="${reserva.cliente}" required style="margin-bottom:10px;"/><br />
                <label style="color:#b089ff;">Fecha:</label>
                <input type="date" id="editar-fecha-reserva" value="${reserva.fecha ? reserva.fecha.substring(0,10) : ''}" required style="margin-bottom:10px;"/><br />
                <label style="color:#b089ff;">Servicio:</label>
                <input type="text" id="editar-servicio-reserva" value="${reserva.servicio}" required style="margin-bottom:10px;"/><br />
                <button type="submit" class="btn-guardar">Guardar</button>
                <button type="button" id="cerrar-modal-editar-reserva" class="btn-cancelar">Cancelar</button>
              </form>
            </div>
          `;
          document.body.appendChild(modal);
          document.getElementById('cerrar-modal-editar-reserva').onclick = () => {
            modal.remove();
          };
          document.getElementById('form-editar-reserva').onsubmit = async function(e) {
            e.preventDefault();
            const cliente = document.getElementById('editar-cliente-reserva').value.trim();
            const fecha = document.getElementById('editar-fecha-reserva').value.trim();
            const servicio = document.getElementById('editar-servicio-reserva').value.trim();
            try {
              const res = await fetch(`/api/reservas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cliente, fecha, servicio })
              });
              if (res.ok) {
                cargarReservas();
                modal.remove();
              } else {
                mostrarModalMensaje('Error al actualizar reserva');
              }
            } catch (error) {
              mostrarModalMensaje('Error al actualizar reserva');
            }
          };
        });
      });
      // Eliminar reserva
      tbody.querySelectorAll('.btn-eliminar-reserva').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const modalMensaje = document.getElementById('modal-mensaje');
          if (modalMensaje) modalMensaje.style.display = 'none';
          const modal = document.createElement('div');
          modal.setAttribute('id', 'modal-confirmar-eliminar-reserva');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.background = 'rgba(0,0,0,0.3)';
          modal.style.zIndex = '10000';
          modal.style.display = 'flex';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';
          modal.innerHTML = `
            <div class="card" style="max-width:350px;text-align:center;box-shadow:0 2px 10px #0002;background:rgba(15,15,30,0.95);color:#fff;">
              <h3 style="margin-bottom:1rem;color:#b089ff;">¿Seguro que deseas eliminar esta reserva?</h3>
              <button id="confirmar-eliminar-reserva" style="margin-right:10px;background:linear-gradient(90deg,#dc3545,#b30000);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Eliminar</button>
              <button id="cancelar-eliminar-reserva" style="background:linear-gradient(90deg,#6c3ef5,#9d5cff);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Cancelar</button>
            </div>
          `;
          document.body.appendChild(modal);
          document.getElementById('cancelar-eliminar-reserva').onclick = () => {
            modal.remove();
          };
          document.getElementById('confirmar-eliminar-reserva').onclick = async () => {
            try {
              const res = await fetch(`/api/reservas/${id}`, { method: 'DELETE' });
              if (res.ok) {
                cargarReservas();
              } else {
                mostrarModalMensaje('Error al eliminar reserva');
              }
            } catch (error) {
              mostrarModalMensaje('Error al eliminar reserva');
            }
            modal.remove();
          };
        });
      });
    } catch (error) {
      console.error(error);
      mostrarModalMensaje('❌ Error al cargar reservas');
    }
  }

  // Inicializar reservas al cargar la página
  cargarReservas();
  // Mostrar nombre de usuario en el panel
  fetch('/api/usuario-actual')
    .then(res => res.json())
    .then(data => {
      const nombre = data?.nombre?.trim();
      const email = data?.email?.trim();
      if (nombre) {
        document.getElementById('nombre-usuario').textContent = nombre;
      } else if (email) {
        document.getElementById('nombre-usuario').textContent = email;
      } else {
        document.getElementById('nombre-usuario').textContent = 'Usuario';
      }
    })
    .catch(() => {
      document.getElementById('nombre-usuario').textContent = 'Usuario';
    });
  // Cerrar sesión
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  btnCerrarSesion?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/logout', { method: 'GET', credentials: 'include' });
      if (res.redirected) {
        try { history.replaceState({}, '', '/'); } catch(e) {}
        window.location.replace(res.url);
      } else if (res.ok) {
        try { localStorage.setItem('suono_logged_out', '1'); } catch(e) {}
        try { history.replaceState({}, '', '/'); } catch(e) {}
        window.location.replace('/portal/inicio.html');
      } else {
        alert('No se pudo cerrar sesión correctamente.');
      }
    } catch (error) {
      alert('Error al cerrar sesión.');
    }
  });
  const content = document.querySelector('.content').children;

  // ----------------------------
  // CLIENTES
  // ----------------------------

  // Mostrar lista de clientes automáticamente al cargar el panel
  cargarClientes();
   const formCliente = document.getElementById('form-cliente');
  formCliente?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();

    // Validación: nombre solo letras y espacios
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nombreRegex.test(nombre)) {
      mostrarModalMensaje('El nombre solo debe contener letras y espacios.');
      return;
    }
    // Validación: correo formato email
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      mostrarModalMensaje('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!nombre || !email) {
      mostrarModalMensaje('Por favor completa todos los campos.');
      return;
    }

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email })
      });

      if (res.ok) {
        formCliente.reset();
        mostrarModalMensaje('✅ Cliente registrado exitosamente');
        cargarClientes();
      } else {
        const data = await res.json();
        mostrarModalMensaje('❌ Error: ' + (data.error || 'No se pudo registrar el cliente'));
      }
    } catch (error) {
      console.error(error);
      mostrarModalMensaje('❌ Error al registrar cliente');
    }
  });

  async function cargarClientes() {
    try {
      const res = await fetch('/api/clientes');
      const clientes = await res.json();
      const tbody = document.getElementById('clientes-body');
      tbody.innerHTML = '';
      clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${cliente.nombre}</td>
          <td>${cliente.email}</td>
          <td>
            <div style="display:flex;gap:8px;">
              <button class="btn-editar" data-id="${cliente._id}">Editar</button>
              <button class="btn-eliminar" data-id="${cliente._id}">Eliminar</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
      // Asignar eventos a los botones
      tbody.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          // Obtener datos del cliente
          const res = await fetch(`/api/clientes/${id}`);
          if (!res.ok) {
            mostrarModalMensaje('No se pudo obtener el cliente');
            return;
          }
          const cliente = await res.json();
          // Crear modal
          const modal = document.createElement('div');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.background = 'rgba(0,0,0,0.3)';
          modal.style.zIndex = '9999';
          modal.style.display = 'flex';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';
          modal.innerHTML = `
            <div class="card modal-panel" style="max-width:350px;text-align:center;">
              <h3 style="color:#b089ff;">Editar Cliente</h3>
              <form id="form-editar-cliente">
                <label style="color:#b089ff;">Nombre:</label>
                <input type="text" id="editar-nombre" value="${cliente.nombre}" required style="margin-bottom:10px;"/><br />
                <label style="color:#b089ff;">Email:</label>
                <input type="email" id="editar-email" value="${cliente.email}" required style="margin-bottom:10px;"/><br />
                <button type="submit" class="btn-guardar">Guardar</button>
                <button type="button" id="cerrar-modal-editar" class="btn-cancelar">Cancelar</button>
              </form>
            </div>
          `;
          document.body.appendChild(modal);
          document.getElementById('cerrar-modal-editar').onclick = () => {
            modal.remove();
          };
          document.getElementById('form-editar-cliente').onsubmit = async function(e) {
            e.preventDefault();
            const nombre = document.getElementById('editar-nombre').value.trim();
            const email = document.getElementById('editar-email').value.trim();
            try {
              const res = await fetch(`/api/clientes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email })
              });
              if (res.ok) {
                // Solo refrescar la tabla y cerrar el modal, sin mostrar modal de mensaje innecesario
                cargarClientes();
                modal.remove();
              } else {
                mostrarModalMensaje('Error al actualizar cliente');
              }
            } catch (error) {
              mostrarModalMensaje('Error al actualizar cliente');
            }
          };
        });
      });
      tbody.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          // Cerrar cualquier modal de mensaje antes de mostrar el de confirmación
          const modalMensaje = document.getElementById('modal-mensaje');
          if (modalMensaje) modalMensaje.style.display = 'none';
          // Crear modal de confirmación personalizado
          const modal = document.createElement('div');
          modal.setAttribute('id', 'modal-confirmar-eliminar');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.background = 'rgba(0,0,0,0.3)';
          modal.style.zIndex = '10000';
          modal.style.display = 'flex';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';
          modal.innerHTML = `
            <div class="card" style="max-width:350px;text-align:center;box-shadow:0 2px 10px #0002;background:rgba(15,15,30,0.95);color:#fff;">
              <h3 style="margin-bottom:1rem;color:#b089ff;">¿Seguro que deseas eliminar este cliente?</h3>
              <button id="confirmar-eliminar" style="margin-right:10px;background:linear-gradient(90deg,#dc3545,#b30000);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Eliminar</button>
              <button id="cancelar-eliminar" style="background:linear-gradient(90deg,#6c3ef5,#9d5cff);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Cancelar</button>
            </div>
          `;
          document.body.appendChild(modal);
          document.getElementById('cancelar-eliminar').onclick = () => {
            modal.remove();
          };
          document.getElementById('confirmar-eliminar').onclick = async () => {
            try {
              const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
              if (res.ok) {
                // Solo refrescar la tabla y cerrar el modal, sin mostrar modal de mensaje innecesario
                cargarClientes();
              } else {
                mostrarModalMensaje('Error al eliminar cliente');
              }
            } catch (error) {
              mostrarModalMensaje('Error al eliminar cliente');
            }
            modal.remove();
          };
        });
      });
    } catch (error) {
      console.error(error);
      mostrarModalMensaje('❌ Error al cargar clientes');
    }
  }


// ----------------------------
// EVENTOS
// ----------------------------
const formEvento = document.getElementById('form-evento');
formEvento?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre-evento').value.trim();
  const fecha = document.getElementById('fecha-evento').value.trim();
  const ubicacion = document.getElementById('ubicacion-evento').value.trim();
  const descripcion = document.getElementById('descripcion-evento')?.value.trim() || "";

  // Validación: nombre solo letras
  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  if (!nombreRegex.test(nombre)) {
    mostrarModalMensaje('El nombre del evento solo debe contener letras.');
    return;
  }
  // Validación: descripción letras y números
  const descripcionRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,-]+$/;
  if (!descripcionRegex.test(descripcion)) {
    mostrarModalMensaje('La descripción solo debe contener letras y números.');
    return;
  }
  if (!nombre || !fecha || !ubicacion) {
    mostrarModalMensaje('Por favor completa todos los campos del evento.');
    return;
  }

  try {
    const res = await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        fecha,
        lugar: ubicacion, // El modelo espera "lugar"
        descripcion
      })
    });

    if (res.ok) {
      formEvento.reset();
      mostrarModalMensaje('✅ Evento registrado exitosamente');
      cargarEventos();
    } else {
      const data = await res.json();
      mostrarModalMensaje('❌ Error: ' + (data.error || 'No se pudo registrar el evento'));
    }
  } catch (error) {
    console.error(error);
    mostrarModalMensaje('❌ Error al registrar evento');
  }
});

// (Opcional) Función para cargar eventos desde la base de datos y mostrarlos en la tabla
async function cargarEventos() {
  try {
    const res = await fetch('/api/eventos');
    const eventos = await res.json();
    const tbody = document.getElementById('eventos-body');
    tbody.innerHTML = '';
    eventos.forEach(evento => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${evento.nombre}</td>
        <td>${evento.fecha ? evento.fecha.substring(0,10) : ''}</td>
        <td>${evento.lugar}</td>
        <td>${evento.descripcion || ''}</td>
        <td>
          <div style="display:flex;gap:8px;">
            <button class="btn-editar-evento" data-id="${evento._id}">Editar</button>
            <button class="btn-eliminar-evento" data-id="${evento._id}">Eliminar</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    // Editar evento
    tbody.querySelectorAll('.btn-editar-evento').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const res = await fetch(`/api/eventos/${id}`);
        if (!res.ok) {
          mostrarModalMensaje('No se pudo obtener el evento');
          return;
        }
        const evento = await res.json();
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.3)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
          <div class="card modal-panel" style="max-width:350px;text-align:center;">
            <h3 style="color:#b089ff;">Editar Evento</h3>
            <form id="form-editar-evento">
              <label style="color:#b089ff;">Nombre:</label>
              <input type="text" id="editar-nombre-evento" value="${evento.nombre}" required style="margin-bottom:10px;"/><br />
              <label style="color:#b089ff;">Fecha:</label>
              <input type="date" id="editar-fecha-evento" value="${evento.fecha ? evento.fecha.substring(0,10) : ''}" required style="margin-bottom:10px;"/><br />
              <label style="color:#b089ff;">Lugar:</label>
              <input type="text" id="editar-lugar-evento" value="${evento.lugar}" required style="margin-bottom:10px;"/><br />
              <label style="color:#b089ff;">Descripción:</label>
              <input type="text" id="editar-descripcion-evento" value="${evento.descripcion || ''}" style="margin-bottom:10px;"/><br />
              <button type="submit" class="btn-guardar">Guardar</button>
              <button type="button" id="cerrar-modal-editar-evento" class="btn-cancelar">Cancelar</button>
            </form>
          </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('cerrar-modal-editar-evento').onclick = () => {
          modal.remove();
        };
        document.getElementById('form-editar-evento').onsubmit = async function(e) {
          e.preventDefault();
          const nombre = document.getElementById('editar-nombre-evento').value.trim();
          const fecha = document.getElementById('editar-fecha-evento').value.trim();
          const lugar = document.getElementById('editar-lugar-evento').value.trim();
          const descripcion = document.getElementById('editar-descripcion-evento').value.trim();
          try {
            const res = await fetch(`/api/eventos/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nombre, fecha, lugar, descripcion })
            });
            if (res.ok) {
              cargarEventos();
              modal.remove();
            } else {
              mostrarModalMensaje('Error al actualizar evento');
            }
          } catch (error) {
            mostrarModalMensaje('Error al actualizar evento');
          }
        };
      });
    });
    // Eliminar evento
    tbody.querySelectorAll('.btn-eliminar-evento').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const modalMensaje = document.getElementById('modal-mensaje');
        if (modalMensaje) modalMensaje.style.display = 'none';
        const modal = document.createElement('div');
        modal.setAttribute('id', 'modal-confirmar-eliminar-evento');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.3)';
        modal.style.zIndex = '10000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
          <div class="card" style="max-width:350px;text-align:center;box-shadow:0 2px 10px #0002;background:rgba(15,15,30,0.95);color:#fff;">
            <h3 style="margin-bottom:1rem;color:#b089ff;">¿Seguro que deseas eliminar este evento?</h3>
            <button id="confirmar-eliminar-evento" style="margin-right:10px;background:linear-gradient(90deg,#dc3545,#b30000);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Eliminar</button>
            <button id="cancelar-eliminar-evento" style="background:linear-gradient(90deg,#6c3ef5,#9d5cff);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Cancelar</button>
          </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('cancelar-eliminar-evento').onclick = () => {
          modal.remove();
        };
        document.getElementById('confirmar-eliminar-evento').onclick = async () => {
          try {
            const res = await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
            if (res.ok) {
              cargarEventos();
            } else {
              mostrarModalMensaje('Error al eliminar evento');
            }
          } catch (error) {
            mostrarModalMensaje('Error al eliminar evento');
          }
          modal.remove();
        };
      });
    });
  } catch (error) {
    console.error(error);
    mostrarModalMensaje('❌ Error al cargar eventos');
  }
}

  // ----------------------------
  // INVENTARIO
  // ----------------------------

const formInventario = document.getElementById('form-inventario');
formInventario?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('equipo').value.trim();
  const cantidad = document.getElementById('cantidad').value.trim();
  const descripcion = document.getElementById('descripcion-inventario')?.value.trim() || "";
  const ubicacion = document.getElementById('ubicacion-inventario')?.value.trim() || "";

  // Validación: nombre del equipo (letras, números y espacios)
  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/;
  if (!nombreRegex.test(nombre)) {
    mostrarModalMensaje('El nombre del equipo solo debe contener letras, números y espacios.');
    return;
  }
  // Validación: cantidad (solo números, mayor a 0)
  const cantidadRegex = /^\d+$/;
  if (!cantidadRegex.test(cantidad) || parseInt(cantidad) <= 0) {
    mostrarModalMensaje('La cantidad debe ser un número mayor a 0.');
    return;
  }
  // Validación: descripción y ubicación (letras, números y símbolos)
  const descUbiRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,;:!@#\$%&\(\)\-_/]+$/;
  if (descripcion && !descUbiRegex.test(descripcion)) {
    mostrarModalMensaje('La descripción solo debe contener letras, números y símbolos.');
    return;
  }
  if (ubicacion && !descUbiRegex.test(ubicacion)) {
    mostrarModalMensaje('La ubicación solo debe contener letras, números y símbolos.');
    return;
  }
  if (!nombre || !cantidad) {
    mostrarModalMensaje('Por favor completa los campos obligatorios del inventario.');
    return;
  }

  try {
    const res = await fetch('/api/inventario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, cantidad, descripcion, ubicacion })
    });

    if (res.ok) {
      formInventario.reset();
      mostrarModalMensaje('✅ Producto registrado exitosamente');
      cargarInventario();
    } else {
      const data = await res.json();
      mostrarModalMensaje('❌ Error: ' + (data.error || 'No se pudo registrar el producto'));
    }
  } catch (error) {
    console.error(error);
    mostrarModalMensaje('❌ Error al registrar producto');
  }
});

async function cargarInventario() {
  try {
    const res = await fetch('/api/inventario');
    const inventario = await res.json();
    const tbody = document.querySelector('#tabla-inventario tbody');
    tbody.innerHTML = '';
    inventario.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>${item.descripcion || ''}</td>
        <td>${item.ubicacion || ''}</td>
        <td>
          <div style="display:flex;gap:8px;">
            <button class="btn-editar-inventario" data-id="${item._id}">Editar</button>
            <button class="btn-eliminar-inventario" data-id="${item._id}">Eliminar</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
    // Eventos editar
    tbody.querySelectorAll('.btn-editar-inventario').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const res = await fetch(`/api/inventario/${id}`);
        if (!res.ok) {
          mostrarModalMensaje('No se pudo obtener el producto');
          return;
        }
        const item = await res.json();
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.3)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
          <div class="card modal-panel" style="max-width:350px;text-align:center;">
            <h3 style="color:#b089ff;">Editar Producto</h3>
            <form id="form-editar-inventario">
              <label style="color:#b089ff;">Nombre:</label>
              <input type="text" id="editar-nombre-inventario" value="${item.nombre}" required style="margin-bottom:10px;"/><br />
              <label style="color:#b089ff;">Cantidad:</label>
              <input type="number" id="editar-cantidad-inventario" value="${item.cantidad}" required style="margin-bottom:10px;"/><br />
              <label style="color:#b089ff;">Descripción:</label>
              <input type="text" id="editar-descripcion-inventario" value="${item.descripcion || ''}" style="margin-bottom:10px;"/><br />
              <label style="color:#b089ff;">Ubicación:</label>
              <input type="text" id="editar-ubicacion-inventario" value="${item.ubicacion || ''}" style="margin-bottom:10px;"/><br />
              <button type="submit" class="btn-guardar">Guardar</button>
              <button type="button" id="cerrar-modal-editar-inventario" class="btn-cancelar">Cancelar</button>
            </form>
          </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('cerrar-modal-editar-inventario').onclick = () => {
          modal.remove();
        };
        document.getElementById('form-editar-inventario').onsubmit = async function(e) {
          e.preventDefault();
          const nombre = document.getElementById('editar-nombre-inventario').value.trim();
          const cantidad = document.getElementById('editar-cantidad-inventario').value.trim();
          const descripcion = document.getElementById('editar-descripcion-inventario').value.trim();
          const ubicacion = document.getElementById('editar-ubicacion-inventario').value.trim();
          try {
            const res = await fetch(`/api/inventario/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nombre, cantidad, descripcion, ubicacion })
            });
            if (res.ok) {
              cargarInventario();
              modal.remove();
            } else {
              mostrarModalMensaje('Error al actualizar producto');
            }
          } catch (error) {
            mostrarModalMensaje('Error al actualizar producto');
          }
        };
      });
    });
    // Eventos eliminar
    tbody.querySelectorAll('.btn-eliminar-inventario').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const modalMensaje = document.getElementById('modal-mensaje');
        if (modalMensaje) modalMensaje.style.display = 'none';
        const modal = document.createElement('div');
        modal.setAttribute('id', 'modal-confirmar-eliminar-inventario');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.3)';
        modal.style.zIndex = '10000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.innerHTML = `
          <div class="card" style="max-width:350px;text-align:center;box-shadow:0 2px 10px #0002;background:rgba(15,15,30,0.95);color:#fff;">
            <h3 style="margin-bottom:1rem;color:#b089ff;">¿Seguro que deseas eliminar este producto?</h3>
            <button id="confirmar-eliminar-inventario" style="margin-right:10px;background:linear-gradient(90deg,#dc3545,#b30000);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Eliminar</button>
            <button id="cancelar-eliminar-inventario" style="background:linear-gradient(90deg,#6c3ef5,#9d5cff);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Cancelar</button>
          </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('cancelar-eliminar-inventario').onclick = () => {
          modal.remove();
        };
        document.getElementById('confirmar-eliminar-inventario').onclick = async () => {
          try {
            const res = await fetch(`/api/inventario/${id}`, { method: 'DELETE' });
            if (res.ok) {
              cargarInventario();
            } else {
              mostrarModalMensaje('Error al eliminar producto');
            }
          } catch (error) {
            mostrarModalMensaje('Error al eliminar producto');
          }
          modal.remove();
        };
      });
    });
  } catch (error) {
    console.error(error);
    alert('❌ Error al cargar inventario');
  }
}
  // ----------------------------
  // COLABORADORES
  // ----------------------------

  const formColaboradores = document.getElementById('form-colaboradores');
  formColaboradores?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('colaboradores-campo1').value.trim();
    const rol = document.getElementById('colaboradores-campo2').value.trim();
    const contacto = document.getElementById('colaboradores-campo3').value.trim();
    // Validación: nombre y rol solo letras y espacios
    const letrasEspaciosRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!letrasEspaciosRegex.test(nombre)) {
      mostrarModalMensaje('El nombre solo debe contener letras y espacios.');
      return;
    }
    if (!letrasEspaciosRegex.test(rol)) {
      mostrarModalMensaje('El rol solo debe contener letras y espacios.');
      return;
    }
    // Validación: contacto solo teléfono de 10 dígitos
    const telefono10Regex = /^\d{10}$/;
    if (!telefono10Regex.test(contacto)) {
      mostrarModalMensaje('El contacto debe ser un número de teléfono de exactamente 10 dígitos.');
      return;
    }
    if (!nombre || !rol || !contacto) {
      mostrarModalMensaje('Completa todos los campos de colaboradores.');
      return;
    }
    try {
      const res = await fetch('/api/colaboradores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, rol, contacto })
      });
      if (res.ok) {
        formColaboradores.reset();
        mostrarModalMensaje('✅ Colaborador registrado exitosamente');
        cargarColaboradores();
      } else {
        const data = await res.json();
        mostrarModalMensaje('❌ Error: ' + (data.error || 'No se pudo registrar el colaborador'));
      }
    } catch (error) {
      console.error(error);
      mostrarModalMensaje('❌ Error al registrar colaborador');
    }
  });

  async function cargarColaboradores() {
    try {
      const res = await fetch('/api/colaboradores');
      const colaboradores = await res.json();
      const tbody = document.querySelector('#tabla-colaboradores tbody');
      tbody.innerHTML = '';
      colaboradores.forEach(colaborador => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${colaborador.nombre}</td>
          <td>${colaborador.rol}</td>
          <td>${colaborador.contacto}</td>
          <td>
            <button class="btn-editar-colaborador" data-id="${colaborador._id}">Editar</button>
            <button class="btn-eliminar-colaborador" data-id="${colaborador._id}">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      // Editar colaborador
      tbody.querySelectorAll('.btn-editar-colaborador').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const res = await fetch(`/api/colaboradores/${id}`);
          if (!res.ok) {
            mostrarModalMensaje('No se pudo obtener el colaborador');
            return;
          }
          const colaborador = await res.json();
          const modal = document.createElement('div');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.background = 'rgba(0,0,0,0.3)';
          modal.style.zIndex = '9999';
          modal.style.display = 'flex';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';
          modal.innerHTML = `
            <div class="card modal-panel" style="max-width:350px;text-align:center;">
              <h3 style="color:#b089ff;">Editar Colaborador</h3>
              <form id="form-editar-colaborador">
                <label style="color:#b089ff;">Nombre:</label>
                <input type="text" id="editar-nombre-colaborador" value="${colaborador.nombre}" required style="margin-bottom:10px;"/><br />
                <label style="color:#b089ff;">Rol:</label>
                <input type="text" id="editar-rol-colaborador" value="${colaborador.rol}" required style="margin-bottom:10px;"/><br />
                <label style="color:#b089ff;">Contacto:</label>
                <input type="text" id="editar-contacto-colaborador" value="${colaborador.contacto}" required style="margin-bottom:10px;"/><br />
                <button type="submit" class="btn-guardar">Guardar</button>
                <button type="button" id="cerrar-modal-editar-colaborador" class="btn-cancelar">Cancelar</button>
              </form>
            </div>
          `;
          document.body.appendChild(modal);
          document.getElementById('cerrar-modal-editar-colaborador').onclick = () => {
            modal.remove();
          };
          document.getElementById('form-editar-colaborador').onsubmit = async function(e) {
            e.preventDefault();
            const nombre = document.getElementById('editar-nombre-colaborador').value.trim();
            const rol = document.getElementById('editar-rol-colaborador').value.trim();
            const contacto = document.getElementById('editar-contacto-colaborador').value.trim();
            try {
              const res = await fetch(`/api/colaboradores/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, rol, contacto })
              });
              if (res.ok) {
                cargarColaboradores();
                modal.remove();
              } else {
                mostrarModalMensaje('Error al actualizar colaborador');
              }
            } catch (error) {
              mostrarModalMensaje('Error al actualizar colaborador');
            }
          };
        });
      });
      // Eliminar colaborador
      tbody.querySelectorAll('.btn-eliminar-colaborador').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const modalMensaje = document.getElementById('modal-mensaje');
          if (modalMensaje) modalMensaje.style.display = 'none';
          const modal = document.createElement('div');
          modal.setAttribute('id', 'modal-confirmar-eliminar-colaborador');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.background = 'rgba(0,0,0,0.3)';
          modal.style.zIndex = '10000';
          modal.style.display = 'flex';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';
          modal.innerHTML = `
            <div class="card" style="max-width:350px;text-align:center;box-shadow:0 2px 10px #0002;background:rgba(15,15,30,0.95);color:#fff;">
              <h3 style="margin-bottom:1rem;color:#b089ff;">¿Seguro que deseas eliminar este colaborador?</h3>
              <button id="confirmar-eliminar-colaborador" style="margin-right:10px;background:linear-gradient(90deg,#dc3545,#b30000);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Eliminar</button>
              <button id="cancelar-eliminar-colaborador" style="background:linear-gradient(90deg,#6c3ef5,#9d5cff);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Cancelar</button>
            </div>
          `;
          document.body.appendChild(modal);
          document.getElementById('cancelar-eliminar-colaborador').onclick = () => {
            modal.remove();
          };
          document.getElementById('confirmar-eliminar-colaborador').onclick = async () => {
            try {
              const res = await fetch(`/api/colaboradores/${id}`, { method: 'DELETE' });
              if (res.ok) {
                cargarColaboradores();
              } else {
                mostrarModalMensaje('Error al eliminar colaborador');
              }
            } catch (error) {
              mostrarModalMensaje('Error al eliminar colaborador');
            }
            modal.remove();
          };
        });
      });
    } catch (error) {
      console.error(error);
      mostrarModalMensaje('❌ Error al cargar colaboradores');
    }
  }

// ----------------------------
// PROVEEDORES 
// ----------------------------
 const formProveedores = document.getElementById('form-proveedores');
    formProveedores?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('proveedores-nombre').value.trim();
      const email = document.getElementById('proveedores-email').value.trim();
      const telefono = document.getElementById('proveedores-telefono').value.trim();
      // Validación: nombre solo letras y espacios
      const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
      if (!nombreRegex.test(nombre)) {
        mostrarModalMensaje('El nombre de la empresa solo debe contener letras y espacios.');
        return;
      }
      // Validación de email
      const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(email)) {
        mostrarModalMensaje('Por favor ingresa un correo electrónico válido.');
        return;
      }
      // Validación de teléfono: solo números y máximo 10 dígitos
      const telefonoRegex = /^\d{1,10}$/;
      if (!telefonoRegex.test(telefono)) {
        mostrarModalMensaje('El teléfono debe contener solo números y máximo 10 dígitos.');
        return;
      }
      if (!nombre || !email || !telefono) {
        mostrarModalMensaje('Completa todos los campos de proveedores.');
        return;
      }
      try {
        const res = await fetch('/api/proveedores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, email, telefono })
        });
        if (res.ok) {
          formProveedores.reset();
          mostrarModalMensaje('✅ Proveedor registrado exitosamente');
          cargarProveedores();
        } else {
          const data = await res.json();
          mostrarModalMensaje('❌ Error: ' + (data.error || 'No se pudo registrar el proveedor'));
        }
      } catch (error) {
        mostrarModalMensaje('❌ Error al registrar proveedor');
      }
    });

    async function cargarProveedores() {
      try {
        const res = await fetch('/api/proveedores');
        const proveedores = await res.json();
        const tbody = document.getElementById('proveedores-body');
        tbody.innerHTML = '';
        proveedores.forEach(proveedor => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${proveedor.nombre}</td>
            <td>${proveedor.email}</td>
            <td>${proveedor.telefono || ''}</td>
            <td>
              <div style="display:flex;gap:8px;">
                <button class="btn-editar-proveedor" data-id="${proveedor._id}">Editar</button>
                <button class="btn-eliminar-proveedor" data-id="${proveedor._id}">Eliminar</button>
              </div>
            </td>
          `;
          tbody.appendChild(tr);
        });
        // Editar proveedor
        tbody.querySelectorAll('.btn-editar-proveedor').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const res = await fetch(`/api/proveedores/${id}`);
            if (!res.ok) {
              mostrarModalMensaje('No se pudo obtener el proveedor');
              return;
            }
            const proveedor = await res.json();
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.3)';
            modal.style.zIndex = '9999';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.innerHTML = `
              <div class="card modal-panel" style="max-width:350px;text-align:center;">
                <h3 style="color:#b089ff;">Editar Proveedor</h3>
                <form id="form-editar-proveedor-modal">
                  <label style="color:#b089ff;">Nombre:</label>
                  <input type="text" id="editar-nombre-proveedor" value="${proveedor.nombre}" required style="margin-bottom:10px;"/><br />
                  <label style="color:#b089ff;">Email:</label>
                  <input type="email" id="editar-email-proveedor" value="${proveedor.email}" required style="margin-bottom:10px;"/><br />
                  <label style="color:#b089ff;">Teléfono:</label>
                  <input type="text" id="editar-telefono-proveedor" value="${proveedor.telefono || ''}" required style="margin-bottom:10px;"/><br />
                  <button type="submit" class="btn-guardar">Guardar</button>
                  <button type="button" id="cerrar-modal-editar-proveedor" class="btn-cancelar">Cancelar</button>
                </form>
              </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('cerrar-modal-editar-proveedor').onclick = () => {
              modal.remove();
            };
            document.getElementById('form-editar-proveedor-modal').onsubmit = async function(e) {
              e.preventDefault();
              const nombre = document.getElementById('editar-nombre-proveedor').value.trim();
              const email = document.getElementById('editar-email-proveedor').value.trim();
              const telefono = document.getElementById('editar-telefono-proveedor').value.trim();
              try {
                const res = await fetch(`/api/proveedores/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ nombre, email, telefono })
                });
                if (res.ok) {
                  cargarProveedores();
                  modal.remove();
                } else {
                  mostrarModalMensaje('Error al actualizar proveedor');
                }
              } catch (error) {
                mostrarModalMensaje('Error al actualizar proveedor');
              }
            };
          });
        });
        // Eliminar proveedor
        tbody.querySelectorAll('.btn-eliminar-proveedor').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const modalMensaje = document.getElementById('modal-mensaje');
            if (modalMensaje) modalMensaje.style.display = 'none';
            const modal = document.createElement('div');
            modal.setAttribute('id', 'modal-confirmar-eliminar-proveedor');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.background = 'rgba(0,0,0,0.3)';
            modal.style.zIndex = '10000';
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.innerHTML = `
              <div class="card" style="max-width:350px;text-align:center;box-shadow:0 2px 10px #0002;background:rgba(15,15,30,0.95);color:#fff;">
                <h3 style="margin-bottom:1rem;color:#b089ff;">¿Seguro que deseas eliminar este proveedor?</h3>
                <button id="confirmar-eliminar-proveedor" style="margin-right:10px;background:linear-gradient(90deg,#dc3545,#b30000);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Eliminar</button>
                <button id="cancelar-eliminar-proveedor" style="background:linear-gradient(90deg,#6c3ef5,#9d5cff);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Cancelar</button>
              </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('cancelar-eliminar-proveedor').onclick = () => {
              modal.remove();
            };
            document.getElementById('confirmar-eliminar-proveedor').onclick = async () => {
              try {
                const res = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
                if (res.ok) {
                  cargarProveedores();
                } else {
                  mostrarModalMensaje('Error al eliminar proveedor');
                }
              } catch (error) {
                mostrarModalMensaje('Error al eliminar proveedor');
              }
              modal.remove();
            };
          });
        });
      } catch (error) {
        mostrarModalMensaje('❌ Error al cargar proveedores');
      }
    }

    // Inicializar proveedores al cargar la página
    cargarProveedores();
  // ----------------------------
  // PQR
  // ----------------------------

  const formPQR = document.getElementById('form-pqr');
  formPQR?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('pqr-campo1').value.trim();
    const tipo = document.getElementById('pqr-campo2').value;
    const descripcion = document.getElementById('pqr-campo3').value.trim();

    // Validación: nombre de usuario (solo letras y espacios)
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!nombreRegex.test(usuario)) {
      alert('El nombre de usuario solo debe contener letras y espacios.');
      return;
    }
    // Validación: tipo de PQR (no vacío)
    if (!tipo) {
      alert('Selecciona el tipo de PQR.');
      return;
    }
    // Validación: descripción (letras, números y símbolos)
    const descripcionRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,;:!@#\$%&\(\)\-_/]+$/;
    if (!descripcionRegex.test(descripcion)) {
      alert('La descripción solo debe contener letras, números y símbolos.');
      return;
    }
    if (!usuario || !tipo || !descripcion) {
      alert('Completa todos los campos del PQR.');
      return;
    }

    try {
      const res = await fetch('/api/pqr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, tipo, descripcion })
      });

      if (res.ok) {
        formPQR.reset();
        alert('✅ PQR registrado exitosamente');
        cargarPQR();
      } else {
        const data = await res.json();
        alert('❌ Error: ' + (data.error || 'No se pudo registrar el PQR'));
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error al registrar PQR');
    }
  });

  async function cargarPQR() {
    try {
      const res = await fetch('/api/pqr');
      const pqrList = await res.json();
      const tbody = document.querySelector('#tabla-pqr tbody');
      tbody.innerHTML = '';
      pqrList.forEach(pqr => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${pqr.usuario}</td>
          <td>${pqr.tipo}</td>
          <td>${pqr.descripcion}</td>
          <td><button onclick=\"this.closest('tr').remove()\">❌</button></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error(error);
      alert('❌ Error al cargar PQR');
    }
  }

  // ----------------------------
  // REPORTES
  // ----------------------------
  const formReporte = document.getElementById('form-reportes');
  formReporte?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('reportes-campo1').value.trim();
    const descripcion = document.getElementById('reportes-campo2').value.trim();
    const fecha = document.getElementById('reportes-campo3').value.trim();
    // Validación: título (letras, números y espacios)
    const tituloRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/;
    if (!tituloRegex.test(titulo)) {
      mostrarModalMensaje('El título solo debe contener letras, números y espacios.');
      return;
    }
    // Validación: descripción (letras, números y símbolos)
    const descripcionRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,;:!@#\$%&\(\)\-_/]+$/;
    if (!descripcionRegex.test(descripcion)) {
      mostrarModalMensaje('La descripción solo debe contener letras, números y símbolos.');
      return;
    }
    // Validación: fecha (formato válido)
    if (!fecha || isNaN(Date.parse(fecha))) {
      mostrarModalMensaje('Por favor ingresa una fecha válida.');
      return;
    }
    if (!titulo || !descripcion || !fecha) {
      mostrarModalMensaje('Por favor completa todos los campos del reporte.');
      return;
    }
    try {
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion, fecha })
      });
      if (res.ok) {
        formReporte.reset();
        mostrarModalMensaje('✅ Reporte registrado exitosamente');
        cargarReportes();
      } else {
        const data = await res.json();
        mostrarModalMensaje('❌ Error: ' + (data.error || 'No se pudo registrar el reporte'));
      }
    } catch (error) {
      mostrarModalMensaje('❌ Error al registrar reporte');
    }
  });

  async function cargarReportes() {
    try {
      const res = await fetch('/api/reportes');
      const reportes = await res.json();
    const tbody = document.querySelector('#tabla-reportes tbody');
      tbody.innerHTML = '';
      reportes.forEach(reporte => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${reporte.titulo}</td>
          <td>${reporte.descripcion}</td>
          <td>${reporte.fecha}</td>
          <td>
            <button class="btn-editar-reporte" data-id="${reporte._id}">Editar</button>
            <button class="btn-eliminar-reporte" data-id="${reporte._id}">Eliminar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      // Editar reporte
      tbody.querySelectorAll('.btn-editar-reporte').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const res = await fetch(`/api/reportes/${id}`);
          if (!res.ok) {
            mostrarModalMensaje('No se pudo obtener el reporte');
            return;
          }
          const reporte = await res.json();
          const modal = document.createElement('div');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.background = 'rgba(0,0,0,0.3)';
          modal.style.zIndex = '9999';
          modal.style.display = 'flex';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';
          modal.innerHTML = `
            <div class="card modal-panel" style="max-width:350px;text-align:center;">
              <h3 style="color:#b089ff;">Editar Reporte</h3>
              <form id="form-editar-reporte">
                <label style="color:#b089ff;">Título:</label>
                <input type="text" id="editar-titulo-reporte" value="${reporte.titulo}" required style="margin-bottom:10px;"/><br />
                <label style="color:#b089ff;">Descripción:</label>
                <input type="text" id="editar-descripcion-reporte" value="${reporte.descripcion}" required style="margin-bottom:10px;"/><br />
                <label style="color:#b089ff;">Fecha:</label>
                <input type="date" id="editar-fecha-reporte" value="${reporte.fecha}" required style="margin-bottom:10px;"/><br />
                <button type="submit" class="btn-guardar">Guardar</button>
                <button type="button" id="cerrar-modal-editar-reporte" class="btn-cancelar">Cancelar</button>
              </form>
            </div>
          `;
          document.body.appendChild(modal);
          document.getElementById('cerrar-modal-editar-reporte').onclick = () => {
            modal.remove();
          };
          document.getElementById('form-editar-reporte').onsubmit = async function(e) {
            e.preventDefault();
            const titulo = document.getElementById('editar-titulo-reporte').value.trim();
            const descripcion = document.getElementById('editar-descripcion-reporte').value.trim();
            const fecha = document.getElementById('editar-fecha-reporte').value.trim();
            try {
              const res = await fetch(`/api/reportes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, descripcion, fecha })
              });
              if (res.ok) {
                cargarReportes();
                modal.remove();
              } else {
                mostrarModalMensaje('Error al actualizar reporte');
              }
            } catch (error) {
              mostrarModalMensaje('Error al actualizar reporte');
            }
          };
        });
      });
      // Eliminar reporte
      tbody.querySelectorAll('.btn-eliminar-reporte').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const modalMensaje = document.getElementById('modal-mensaje');
          if (modalMensaje) modalMensaje.style.display = 'none';
          const modal = document.createElement('div');
          modal.setAttribute('id', 'modal-confirmar-eliminar-reporte');
          modal.style.position = 'fixed';
          modal.style.top = '0';
          modal.style.left = '0';
          modal.style.width = '100vw';
          modal.style.height = '100vh';
          modal.style.background = 'rgba(0,0,0,0.3)';
          modal.style.zIndex = '10000';
          modal.style.display = 'flex';
          modal.style.alignItems = 'center';
          modal.style.justifyContent = 'center';
          modal.innerHTML = `
            <div class="card" style="max-width:350px;text-align:center;box-shadow:0 2px 10px #0002;background:rgba(15,15,30,0.95);color:#fff;">
              <h3 style="margin-bottom:1rem;color:#b089ff;">¿Seguro que deseas eliminar este reporte?</h3>
              <button id="confirmar-eliminar-reporte" style="margin-right:10px;background:linear-gradient(90deg,#dc3545,#b30000);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Eliminar</button>
              <button id="cancelar-eliminar-reporte" style="background:linear-gradient(90deg,#6c3ef5,#9d5cff);color:#fff;padding:10px 18px;border:none;border-radius:8px;font-weight:bold;">Cancelar</button>
            </div>
          `;
          document.body.appendChild(modal);
          document.getElementById('cancelar-eliminar-reporte').onclick = () => {
            modal.remove();
          };
          document.getElementById('confirmar-eliminar-reporte').onclick = async () => {
            try {
              const res = await fetch(`/api/reportes/${id}`, { method: 'DELETE' });
              if (res.ok) {
                cargarReportes();
              } else {
                mostrarModalMensaje('Error al eliminar reporte');
              }
            } catch (error) {
              mostrarModalMensaje('Error al eliminar reporte');
            }
            modal.remove();
          };
        });
      });
    } catch (error) {
      mostrarModalMensaje('❌ Error al cargar reportes');
    }
  }

  // Inicializar reportes al cargar la página
  cargarReportes();
});

// ===== Buscador global para panel administrativo =====
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search-box input');
  if (!searchInput) return;

  function ensureNoResultsRow(tbody) {
    let tr = tbody.querySelector('.no-results');
    if (!tr) {
      tr = document.createElement('tr');
      tr.className = 'no-results';
      tr.innerHTML = '<td colspan="100%" style="text-align:center;color:#888;padding:12px;">No se encontraron resultados</td>';
      tbody.appendChild(tr);
    }
    return tr;
  }

  function filterVisibleSection() {
    const q = searchInput.value.trim().toLowerCase();
    // Encontrar la sección visible
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => {
      if (getComputedStyle(sec).display !== 'none') {
        const table = sec.querySelector('table');
        if (!table) return;
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        let matched = false;
        Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
          if (tr.classList.contains('no-results')) return; // ignorar fila de 'no results'
          const text = tr.textContent.toLowerCase();
          const show = q === '' || text.indexOf(q) !== -1;
          tr.style.display = show ? '' : 'none';
          if (show) matched = true;
        });

        const noRes = ensureNoResultsRow(tbody);
        noRes.style.display = matched ? 'none' : '';
      }
    });
  }

  // Filtrar mientras escribe
  searchInput.addEventListener('input', filterVisibleSection);

  // Tecla Escape limpia la búsqueda
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      filterVisibleSection();
    }
  });

  // Limpiar búsqueda al cambiar de sección
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      searchInput.value = '';
      filterVisibleSection();
    });
  });
});

