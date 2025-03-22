import React, { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Button, Card,
  CardContent, CardActions, IconButton, List, ListItem, Divider
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { ExpandMore as ExpandMoreIcon, PersonAdd as PersonAddIcon, NotificationsOff as NotificationsOffIcon } from '@mui/icons-material';
import { updateNotifications } from '../../services/waiterService';
import { putProductsAsOld } from '../../services/cartService';
import { updateOrderAndTableStatus } from '../../services/tableService';

// Función para formatear la fecha sin convertirla a la zona horaria local (usando UTC)
const formatDate = (dateString) => {
  const date = new Date(dateString); // Convertimos la fecha ISO a un objeto Date
  return date.toISOString().slice(0, 19).replace('T', ' '); // Formato: 2024-12-09 16:20:09
};

const TableCardDetail = ({
  table, order = [], handleReceiveOrder, handleUpdateTableStatus, handleOrderInProgress, handleOpenDialog,
}) => {
  const [inProgressDisabled, setInProgressDisabled] = useState(false);
  const validOrder = Array.isArray(order) ? order : [];

  const handleOrderInProgressClick = () => {
    handleOrderInProgress(table.ultimo_id_pedido, table.n_mesa);
    setInProgressDisabled(true);
  };

  const handleReceiveOrderClick = async (status = 'Recibido') => {
    await handleReceiveOrder(table.ultimo_id_pedido, table.n_mesa, status);
    await putProductsAsOld(table.ultimo_id_pedido);
  };

  const handleClearNotifications = async () => await updateNotifications(table.n_mesa);

  const handleFinalizeOrderClick = async () => {
    try {
      await updateOrderAndTableStatus({
        id_pedido: table.ultimo_id_pedido,
        estado: 'Finalizado',
      });
      handleClearNotifications();
      handleUpdateTableStatus(table.n_mesa);
    } catch (error) {
      console.error('Error al finalizar el pedido y liberar la mesa:', error);
    }
  };
  const handlePrintNewProducts = () => {
    const newProducts = validOrder.filter(({ nuevo }) => nuevo === 1);
  
    if (newProducts.length === 0) {
      alert("No hay productos nuevos para imprimir.");
      return;
    }
  
    const now = new Date();
    const formattedDate = now.toLocaleDateString();
    const formattedTime = now.toLocaleTimeString();
  
    const printContent = `
      <html>
        <head>
          <style>
            @media print {
              body {
                font-family: 'Courier New', monospace;
                font-size: 14px;
                size: auto;  
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
              .price {
                white-space: nowrap;
                text-align: right;
              }
            }
          </style>
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
              `).join("")}
            </ul>
            <div class="line"></div>
            ${table.nota ? `<p style="font-weight: bold;">Nota: ${table.nota}</p>` : ""}
            <div class="dashed-line"></div>
          </div>
        </body>
      </html>
    `;
  
   
    const printWindow = window.open("", "PRINT");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
  
    
    printWindow.print();
  
    
    printWindow.close();
  };
  
  
  const handlePrintFullOrder = () => {
    if (validOrder.length === 0) {
      alert("No hay productos en el pedido para imprimir.");
      return;
    }
  
    const formattedDate = formatDate(validOrder[0].fecha_pedido); 
  
    const printContent = `
      <html>
        <head>
          <style>
            @media print {
              body {
                font-family: 'Courier New', monospace;
                font-size: 14px;
                size: auto; 
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
                width: 100%;
                align-items: center;
              }
              .name {
                white-space: nowrap;
                text-align: left;
              }
              .dots {
                flex-grow: 1;
                text-align: center;
                border-bottom: 1px dotted black;
                margin: 0 5px;
              }
              .quantity-price {
                white-space: nowrap;
                text-align: right;
              }
            }
          </style>
        </head>
        <body>
          <div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>${formattedDate.split(" ")[0]}</span>
              <span>${formattedDate.split(" ")[1]}</span>
            </div>
            <h2>Mesa ${table.n_mesa}</h2>
            <p style="font-weight: bold;">Mozo: ${table.nombre_mozo}</p>
            
            <div class="line"></div>
            <ul style="list-style-type: none; padding: 0;">
              ${validOrder.map(p => `
                <li class="order-item">
                  <span class="name">${p.nombre}</span>
                  <span class="dots"></span>
                  <span class="quantity-price">${p.cantidad}x $${Number(p.precio)}</span>
                </li>
              `).join("")}
            </ul>
            <div class="line"></div>
            ${table.nota ? `<div class="dashed-line"></div><p style="font-weight: bold;">Nota: ${table.nota}</p>` : ""}
            <div class="dashed-line"></div>
            <p style="font-weight: bold;">Total: $${validOrder.reduce((acc, p) => acc + (Number(p.cantidad) * Number(p.precio)), 0)}</p>
            <div class="dashed-line"></div>
            <p style="font-size: 12px; font-weight: bold;">Ticket no válido como factura</p>
          </div>
        </body>
      </html>
    `;
  
    
    const printWindow = window.open("", "PRINT");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
  
    
    printWindow.print();
  
   
    printWindow.close();
  };
  

  const currentProducts = validOrder.filter(({ nuevo }) => nuevo === 1);
  const oldProducts = validOrder.filter(({ nuevo }) => nuevo === 0);
  const isReceiveButtonDisabled = currentProducts.length === 0;
  const isActionButtonsDisabled = validOrder.length === 0;
  const isClearNotificationsDisabled = table.callw === 0 && table.bill === 0;

  return (
    <Card
      sx={{
        m: 1,
        border: (table.callw || table.bill || currentProducts.length) ? '2px solid yellow' : 'none',
        position: 'relative',
        animation: (table.callw || table.bill || currentProducts.length) ? 'borderBlink 2s infinite' : 'none',
      }}
    >
      <style>{`
        @keyframes borderBlink {
          0%, 100% { box-shadow: 0 0 10px yellow; }
          50% { box-shadow: 0 0 20px yellow; }
        }
        @keyframes textBlink {
          0%, 100% { color: yellow; text-shadow: 0 0 10px yellow, 0 0 20px yellow; }
          50% { color: transparent; text-shadow: none; }
        }
      `}</style>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: table.estado === 'ocupada' ? 'rgba(139, 0, 0, 0.8)' : 'rgba(34, 139, 34, 0.8)', color: '#fff' }}>
          <Typography variant="h6" align="center">
            Mesa {table.n_mesa}
            {table.callw === 1 && <span style={{ marginLeft: 10, animation: 'textBlink 2s infinite' }}>Mozo!</span>}
            {table.bill === 1 && <span style={{ marginLeft: 10, animation: 'textBlink 2s infinite' }}>Cuenta!</span>}
            {currentProducts.length > 0 && <span style={{ marginLeft: 10, animation: 'textBlink 2s infinite' }}>Nuevo!</span>}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Estado de la mesa: <strong>{table.estado}</strong></Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>Mozo: <strong>{table.nombre_mozo}</strong></Typography>
            {validOrder[0] && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                Fecha y hora: <strong>{formatDate(validOrder[0].fecha_pedido)}</strong>
              </Typography>
            )}
            <Divider sx={{ my: 2 }} />

            {table.nota && <Typography variant="body2" sx={{ mb: 1, color: 'black' }}>Nota: <strong>{table.nota}</strong></Typography>}

            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Pedido Actual:</Typography>
            <List>
              {oldProducts.map(({ id_producto, nombre, cantidad, precio }) => (
               <ListItem key={id_producto} sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
               <Typography variant="body2" sx={{ flex: 2, textAlign: 'left' }}>{nombre}</Typography>
               <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>{cantidad}x</Typography>
               <Typography variant="body2" sx={{ flex: 1, textAlign: 'right' }}>${precio}</Typography>
             </ListItem>
              ))}
              <Divider />
            </List>

            {currentProducts.length > 0 && (
              <>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Productos Agregados:</Typography>
                <List>
                  {currentProducts.map(({ id_producto, nombre, cantidad, precio }) => (
                  <ListItem key={id_producto} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                  <Typography variant="body2" sx={{ flex: 2, textAlign: 'left', color: 'green' }}>{nombre}</Typography>
                  <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', color: 'green' }}>{cantidad}x</Typography>
                  <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', color: 'green' }}>${precio}</Typography>
                  <Typography variant="caption" sx={{ color: 'orange', fontWeight: 'bold', ml: 1 }}>Nuevo!</Typography>
                </ListItem>
                
                  ))}
                  <Divider />
                </List>
              </>
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: 'space-between', px: 1 }}>
  <Button
    variant="contained"
    color="success"
    onClick={() => {
      handleReceiveOrderClick();
      handlePrintNewProducts();
    }}
    disabled={isReceiveButtonDisabled}
  >
    Confirmar
  </Button>

  <Button
    variant="contained"
    sx={{
      backgroundColor: (order[0]?.estado_pedido === 'En curso' || inProgressDisabled) ? 'grey' : 'orange',
      color: '#fff'
    }}
    onClick={handleOrderInProgressClick}
    disabled={isActionButtonsDisabled || inProgressDisabled || order[0]?.estado_pedido === 'En curso'}
  >
    En Curso
  </Button>

  <Button
  variant="contained"
  color="error"
  onClick={() => {
    handleFinalizeOrderClick(); 
    handlePrintFullOrder(); 
  }}
  disabled={isActionButtonsDisabled}
>
  Finalizar
</Button>

  <IconButton onClick={handlePrintFullOrder} sx={{ color: 'black' }}>
    <PrintIcon />
  </IconButton>

  <IconButton
    onClick={handleClearNotifications}
    disabled={isClearNotificationsDisabled}
    sx={{ color: isClearNotificationsDisabled ? 'grey' : 'red' }}
  >
    <NotificationsOffIcon />
  </IconButton>

  <IconButton onClick={() => handleOpenDialog(table)}>
    <PersonAddIcon />
  </IconButton>
</CardActions>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default TableCardDetail;
