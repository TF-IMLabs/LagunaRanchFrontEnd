const getPrintStyles = () => `
  <style>
    @media print {
      body {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        margin: 0;
        padding: 5px;
        width: 80mm;
      }
      h2, p {
        margin: 5px 0;
        text-align: center;
      }
      .line {
        border-top: 2px solid black;
        margin: 5px 0;
      }
      .dashed-line {
        border-top: 1px dashed black;
        margin: 5px 0;
      }
      .order-item {
        display: flex;
        justify-content: space-between;
        width: 100%;
      }
      .name {
        flex-grow: 1;
        text-align: left;
      }
      .price, .quantity-price {
        white-space: nowrap;
        text-align: right;
      }
      .dots {
        flex-grow: 1;
        text-align: center;
        border-bottom: 1px dotted black;
        margin: 0 5px;
      }
    }
  </style>
`;

const printWindowContent = (content) => {
  const printWindow = window.open('', 'PRINT');
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

const generateNewProductsPrintContent = (table, newProducts) => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString();
  const formattedTime = now.toLocaleTimeString();

  return `
    <html>
      <head>
        ${getPrintStyles()}
      </head>
      <body>
        <div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>${formattedDate}</span>
            <span>${formattedTime}</span>
          </div>
          <h2>Mesa ${table.n_mesa}</h2>
          <p style="font-weight: bold;">Mozo: ${table.nombre_mozo}</p>
          <div class="line"></div>
          <ul style="list-style-type: none; padding: 0;">
            ${newProducts.map(p => `
              <li class="order-item">
                <span class="name">${p.nombre}</span>
                <span class="price">${p.cantidad}x</span>
              </li>
            `).join('')}
          </ul>
          <div class="line"></div>
          ${table.nota ? `<p style="font-weight: bold;">Nota: ${table.nota}</p>` : ''}
          <div class="dashed-line"></div>
        </div>
      </body>
    </html>
  `;
};


const generateFullOrderPrintContent = (table, order) => {
  const { pedidoInfo = [], productos = [] } = order;
  if (productos.length === 0) return '';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };

  const formattedDate = formatDate(pedidoInfo[0]?.fecha_pedido || new Date());
  const [date, time] = formattedDate.split(' ');

  return `
    <html>
      <head>
        ${getPrintStyles()}
      </head>
      <body>
        <div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>${date}</span>
            <span>${time}</span>
          </div>
          <h2>Mesa ${table.n_mesa}</h2>
          <p style="font-weight: bold;">Mozo: ${table.nombre_mozo}</p>
          <div class="line"></div>
          <ul style="list-style-type: none; padding: 0;">
            ${productos.map(p => `
              <li class="order-item">
                <span class="name">${p.nombre}</span>
                <span class="dots"></span>
                <span class="quantity-price">${p.cantidad}x $${Number(p.precio)}</span>
              </li>
            `).join('')}
          </ul>
          <div class="line"></div>
          ${table.nota ? `<p style="font-weight: bold;">Nota: ${table.nota}</p>` : ''}
          <div class="dashed-line"></div>
          <p style="font-weight: bold;">Total: $${productos.reduce((acc, p) => acc + (Number(p.cantidad) * Number(p.precio)), 0)}</p>
          <div class="dashed-line"></div>
          <p style="font-size: 12px; font-weight: bold;">Ticket no válido como factura</p>
        </div>
      </body>
    </html>
  `;
};

export const printNewTicket = (table, newProducts) => {
  if (newProducts.length === 0) {
    alert("No hay productos nuevos para imprimir.");
    return;
  }
  const content = generateNewProductsPrintContent(table, newProducts);
  printWindowContent(content);
};


export const printFullOrderTicket = (table, order) => {
  const content = generateFullOrderPrintContent(table, order);
  if (!content) {
    alert("No hay productos en el pedido para imprimir.");
    return;
  }
  printWindowContent(content);
};
