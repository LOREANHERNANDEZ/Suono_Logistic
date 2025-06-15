const form = document.getElementById('cotizadorForm');
const tabla = document.querySelector('#cotizacionTabla tbody');
const totalSpan = document.getElementById('totalCotizacion');

let total = 0;

const preciosServicios = {
  "Sonido": 500.00,
  "Iluminación": 400.00,
  "Catering": 800.00,
  "Logística": 600.00,
  "Transporte": 300.00
};

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const servicio = document.getElementById('servicio').value;
  const cantidad = parseInt(document.getElementById('cantidad').value);

  if (!servicio || !cantidad || cantidad < 1) {
    alert('Completa todos los campos correctamente');
    return;
  }

  const precioUnitario = preciosServicios[servicio];
  const subtotal = precioUnitario * cantidad;
  total += subtotal;

  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td>${servicio}</td>
    <td>${cantidad}</td>
    <td>$${precioUnitario.toFixed(2)}</td>
    <td>$${subtotal.toFixed(2)}</td>
  `;
  tabla.appendChild(fila);
  totalSpan.textContent = total.toFixed(2);

  form.reset();
});
