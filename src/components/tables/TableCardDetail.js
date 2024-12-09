import React, { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Button, Card,
  CardContent, CardActions, IconButton, List, ListItem, Divider
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, PersonAdd as PersonAddIcon, NotificationsOff as NotificationsOffIcon } from '@mui/icons-material';
import { updateNotifications } from '../../services/waiterService';
import { putProductsAsOld } from '../../services/cartService';
import { updateOrderAndTableStatus } from '../../services/tableService';

const TableCardDetail = ({
  table, order = [], handleReceiveOrder, handleUpdateTableStatus, handleOrderInProgress, handleOpenDialog,
}) => {
  const [inProgressDisabled, setInProgressDisabled] = useState(false);
  const validOrder = Array.isArray(order) ? order : [];
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

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
            {validOrder[0] && <Typography variant="body2" sx={{ mb: 1 }}>Fecha y hora: <strong>{formatDate(validOrder[0].fecha_pedido)}</strong></Typography>}
            <Divider sx={{ my: 2 }} />

            {table.nota && <Typography variant="body2" sx={{ mb: 1, color: 'black' }}>Nota: <strong>{table.nota}</strong></Typography>}

            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Pedido Actual:</Typography>
            <List>
              {oldProducts.map(({ id_producto, nombre, cantidad, precio }) => (
                <ListItem key={id_producto} sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="body2">{nombre} - Cantidad: {cantidad} - Precio: ${precio}</Typography>
                </ListItem>
              ))}
              <Divider />
            </List>

            {currentProducts.length > 0 && (
              <>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Productos Agregados:</Typography>
                <List>
                  {currentProducts.map(({ id_producto, nombre, cantidad, precio }) => (
                    <ListItem key={id_producto} sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="green">
                        {nombre} - Cantidad: {cantidad} - Precio: ${precio} <span style={{ color: 'orange', marginLeft: 10 }}>Nuevo!</span>
                      </Typography>
                    </ListItem>
                  ))}
                  <Divider />
                </List>
              </>
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleReceiveOrderClick()}
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
              onClick={handleFinalizeOrderClick}
              disabled={isActionButtonsDisabled}
            >
              Finalizar Pedido
            </Button>
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
