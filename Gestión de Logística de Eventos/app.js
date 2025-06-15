const form = document.getElementById('eventForm');
const tableBody = document.querySelector('#eventTable tbody');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const fecha = document.getElementById('fecha').value;
  const lugar = document.getElementById('lugar').value;
  const responsable = document.getElementById('responsable').value;
  const recursos = document.getElementById('recursos').value;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${nombre}</td>
    <td>${fecha}</td>
    <td>${lugar}</td>
    <td>${responsable}</td>
    <td>${recursos}</td>
  `;

  tableBody.appendChild(row);
  form.reset();
});
