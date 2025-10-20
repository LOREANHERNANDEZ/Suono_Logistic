document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".sidebar li");
  const title = document.querySelector(".header h1");
  const content = document.querySelector(".content");

  const originalTitle = title.textContent;
  const originalContent = content.innerHTML;



  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      const section = item.textContent.trim();

      if (section === "Panel") {
        title.textContent = originalTitle;
        content.innerHTML = originalContent;
        renderQuotes();
      } else {
        loadSection(section);
      }
    });
  });

  const quotes = [
    { cliente: "Cliente A", id: "#00842", estado: "Aceptada" },
    { cliente: "Cliente B", id: "#00841", estado: "Pendiente" },
    { cliente: "Cliente C", id: "#00840", estado: "Aceptada" },
    { cliente: "Cliente D", id: "#00839", estado: "Rechazada" }
  ];

  function renderQuotes(filter = "Todas") {
    const card = document.querySelectorAll(".card")[3];
    if (!card) return;

    card.innerHTML = `<h3>Cotizaciones Recientes</h3>`;
    const filtered = filter === "Todas" ? quotes : quotes.filter(q => q.estado === filter);

    filtered.forEach(q => {
      const p = document.createElement("p");
      p.textContent = `${q.cliente} - ${q.id} - ${q.estado}`;
      card.appendChild(p);
    });

    if (!card.querySelector(".filter-buttons")) {
      const filters = ["Todas", "Aceptada", "Pendiente", "Rechazada"];
      const buttonGroup = document.createElement("div");
      buttonGroup.classList.add("filter-buttons");

      filters.forEach(status => {
        const btn = document.createElement("button");
        btn.textContent = status;
        btn.style.margin = "5px";
        btn.style.padding = "5px 10px";
        btn.style.cursor = "pointer";
        btn.style.border = "none";
        btn.style.borderRadius = "6px";
        btn.style.background = "#3842b5";
        btn.style.color = "#fff";
        btn.addEventListener("click", () => renderQuotes(status));
        btn.addEventListener("mouseover", () => btn.style.background = "#594fbb");
        btn.addEventListener("mouseout", () => btn.style.background = "#3842b5");
        buttonGroup.appendChild(btn);
      });

      card.appendChild(buttonGroup);
    }
  }

  renderQuotes();

  const searchInput = document.querySelector(".search-box input");
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll("table tr").forEach((row, index) => {
      if (index === 0) return;
      const cells = row.querySelectorAll("td");
      const match = Array.from(cells).some(cell =>
        cell.textContent.toLowerCase().includes(query)
      );
      row.style.display = match ? "" : "none";
    });
  });

  function loadSection(sectionName) {
    title.textContent = sectionName;

    if (sectionName === "Clientes") {
      content.innerHTML = `
        <div class="card wide">
          <h3>Clientes</h3>
          <table>
            <tr><th>Nombre</th><th>Correo</th></tr>
            <tr><td>Cliente A</td><td>cliente.a@example.com</td></tr>
            <tr><td>Cliente B</td><td>cliente.b@example.com</td></tr>
            <tr><td>Cliente C</td><td>cliente.c@example.com</td></tr>
          </table>
        </div>
      `;
    } else if (sectionName === "Eventos") {
      content.innerHTML = `
        <div class="card wide">
          <h3>Eventos</h3>
          <div class="event">Evento Alpha - 12/06/2024 · Medellín / Empresa X</div>
          <div class="event">Evento Beta - 15/06/2024 · Bogotá / Empresa Y</div>
          <div class="event">Evento Gamma - 20/06/2024 · Cali / Empresa Z</div>
        </div>
      `;
    } else if (sectionName === "Proveedores") {
      content.innerHTML = `
        <div class="card wide">
          <h3>Proveedores</h3>
          <table>
            <tr><th>Nombre</th><th>Teléfono</th><th>Producto</th></tr>
            <tr><td>Proveedor X</td><td>3001234567</td><td>Sonido</td></tr>
            <tr><td>Proveedor Y</td><td>3017654321</td><td>Luces</td></tr>
            <tr><td>Proveedor Z</td><td>3029876543</td><td>Computadores</td></tr>
          </table>
        </div>
      `;
    } else {
      content.innerHTML = `
        <div class="card wide">
          <h3>${sectionName}</h3>
          <p>Esta sección está en construcción. Próximamente más funciones.</p>
        </div>
      `;
    }
  }
});
