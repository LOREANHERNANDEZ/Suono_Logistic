// Filtro de búsqueda
const searchInput = document.querySelector('.search-section input');
const tableRows = document.querySelectorAll('tbody tr');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  tableRows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
});

// Función para botón "Modificar"
function modificar() {
  alert("Funcionalidad de modificar aún no implementada.");
}

// Función para botón "Generar Informe"
function generarInforme() {
  alert("Generando informe (simulado).");
}

// Función para botón "Actualizar"
function actualizar() {
  location.reload();
}

// Alertas para enlaces "Ver" y "Editar"
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    alert(`Funcionalidad de "${link.textContent}" no implementada aún.`);
  });
});
