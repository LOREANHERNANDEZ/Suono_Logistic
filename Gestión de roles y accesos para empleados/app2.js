const form = document.getElementById('employeeForm');
const tableBody = document.querySelector('#employeeTable tbody');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;
  const cargo = document.getElementById('cargo').value;
  const rol = document.getElementById('rol').value;

  if (!nombre || !correo || !cargo || !rol) {
    alert('Todos los campos son obligatorios');
    return;
  }

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${nombre}</td>
    <td>${correo}</td>
    <td>${cargo}</td>
    <td>${rol}</td>
  `;

  tableBody.appendChild(row);
  form.reset();
});
