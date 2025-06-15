document.getElementById('reservaForm').addEventListener('submit', function(event) {
  event.preventDefault();

  alert("¡Reserva confirmada con éxito!");
  this.reset();
});

function cancelar() {
  if (confirm("¿Estás seguro de que deseas cancelar?")) {
    document.getElementById('reservaForm').reset();
  }
}
