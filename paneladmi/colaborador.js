// colaborador.js

document.addEventListener('DOMContentLoaded', () => {
  // Mostrar nombre del colaborador si está en localStorage
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (usuario && usuario.nombre) {
    document.querySelector('h3').textContent = `Bienvenido, ${usuario.nombre}`;
  }

  // Navegación simple
  document.getElementById('ver-eventos').onclick = () => mostrarVista('eventos');
  document.getElementById('ver-inventario').onclick = () => mostrarVista('inventario');
  document.getElementById('ver-perfil').onclick = () => mostrarVista('perfil');
  document.getElementById('logout').onclick = () => {
    localStorage.removeItem('usuario');
    window.location.href = '/portal/loginCliente.html';
  };

  function mostrarVista(vista) {
    document.getElementById('vista-eventos').style.display = vista === 'eventos' ? '' : 'none';
    document.getElementById('vista-inventario').style.display = vista === 'inventario' ? '' : 'none';
    document.getElementById('vista-perfil').style.display = vista === 'perfil' ? '' : 'none';
    // Aquí puedes cargar datos específicos según la vista
  }

  // Por defecto mostrar eventos
  mostrarVista('eventos');
});
