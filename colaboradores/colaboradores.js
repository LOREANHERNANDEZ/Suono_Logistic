const form = document.getElementById('collaboratorForm');
const tableBody = document.querySelector('#collaboratorTable tbody');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const documento = document.getElementById('documento').value;
  const telefono = document.getElementById('telefono').value;
  const area = document.getElementById('area').value;
  const disponibilidad = document.getElementById('disponibilidad').value;

  if (!nombre || !documento || !telefono || !area || !disponibilidad) {
    alert('Todos los campos son obligatorios');
    return;
  }

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${nombre}</td>
    <td>${documento}</td>
    <td>${telefono}</td>
    <td>${area}</td>
    <td>${disponibilidad}</td>
  `;

  tableBody.appendChild(row);
  form.reset();
});
