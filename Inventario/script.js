const equipos = [
  {
    nombre: "Altavoces",
    id: "004",
    descripcion: "Altavoces 500w",
    cantidad: 10,
    fecha: "2023-05-15"
  },
  {
    nombre: "Proyector",
    id: "004",
    descripcion: "Proyector 4K",
    cantidad: 10,
    fecha: "2022-11-20"
  },
  {
    nombre: "Microfonos",
    id: "003",
    descripcion: "Microfonos mini",
    cantidad: 15,
    fecha: "2023-08-10"
  }
];

const tbody = document.getElementById("tabla-equipos");

equipos.forEach(equipo => {
  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td>${equipo.nombre}</td>
    <td>${equipo.id}</td>
    <td>${equipo.descripcion}</td>
    <td>${equipo.cantidad}</td>
    <td>${equipo.fecha}</td>
  `;
  tbody.appendChild(fila);
});