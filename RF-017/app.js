function cerrarSesion() {
  alert("Sesión cerrada.");
}

function regresar() {
  alert("Regresando a la pantalla anterior...");
}

// Búsqueda en la tabla por cualquier palabra
document.getElementById('busqueda').addEventListener('input', function () {
  const filtro = this.value.toLowerCase();
  const filas = document.querySelectorAll('#tablaReservas tbody tr');

  filas.forEach(fila => {
    const textoFila = fila.innerText.toLowerCase();
    if (textoFila.includes(filtro)) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  });
});
