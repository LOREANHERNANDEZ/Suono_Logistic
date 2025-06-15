const form = document.getElementById('providerForm');
const tableBody = document.querySelector('#providerTable tbody');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const servicio = document.getElementById('servicio').value;
  const contacto = document.getElementById('contacto').value;
  const correo = document.getElementById('correo').value;
  const estado = document.getElementById('estado').value;

  if (!nombre || !servicio || !contacto || !correo || !estado) {
    alert('Todos los campos son obligatorios');
    return;
  }

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${nombre}</td>
    <td>${servicio}</td>
    <td>${contacto}</td>
    <td>${correo}</td>
    <td>${estado}</td>
  `;

  tableBody.appendChild(row);
  form.reset();
});
