import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  List,
  ListItem,
  Divider,
  Box
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { ExpandMore as ExpandMoreIcon, PersonAdd as PersonAddIcon, NotificationsOff as NotificationsOffIcon } from '@mui/icons-material';
import { updateNotifications } from '../../services/waiterService';
import { putProductsAsOld } from '../../services/cartService';
import { updateOrderAndTableStatus } from '../../services/tableService';

// Importamos las funciones de TicketPrinter
import { printNewTicket, printFullOrderTicket } from '../../components/TicketPrinter';

// Función utilitaria para reproducir sonido (sin cambios)
const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play().catch((err) => console.error('Error reproduciendo sonido:', err));
};

const TableCardDetail = ({
  table,
  order = [],
  handleReceiveOrder,
  handleUpdateTableStatus,
  handleOrderInProgress,
  handleOpenDialog,
}) => {
  const [inProgressDisabled, setInProgressDisabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const validOrder = useMemo(() => (Array.isArray(order) ? order : []), [order]);
  const currentProducts = useMemo(() => validOrder.filter(({ nuevo }) => nuevo === 1), [validOrder]);
  const oldProducts = useMemo(() => validOrder.filter(({ nuevo }) => nuevo === 0), [validOrder]);

  const handleOrderInProgressClick = useCallback(() => {
    handleOrderInProgress(table.ultimo_id_pedido, table.n_mesa);
    setInProgressDisabled(true);
  }, [handleOrderInProgress, table]);

  const handleReceiveOrderClick = useCallback(async (status = 'Recibido') => {
    await handleReceiveOrder(table.ultimo_id_pedido, table.n_mesa, status);
    await putProductsAsOld(table.ultimo_id_pedido);
  }, [handleReceiveOrder, table]);

  const handleClearNotifications = useCallback(async () => {
    await updateNotifications(table.n_mesa);
  }, [table.n_mesa]);

  const handleFinalizeOrderClick = useCallback(async () => {
    try {
      await updateOrderAndTableStatus({
        id_pedido: table.ultimo_id_pedido,
        estado: 'Finalizado',
      });
      await handleClearNotifications();
      handleUpdateTableStatus(table.n_mesa);
    } catch (error) {
      console.error('Error al finalizar el pedido y liberar la mesa:', error);
    }
  }, [table, handleClearNotifications, handleUpdateTableStatus]);

  // Uso de las funciones importadas para la impresión
  const handlePrintNewProducts = useCallback(() => {
    printNewTicket(table, currentProducts);
  }, [table, currentProducts]);

  const handlePrintFullOrder = useCallback(() => {
    printFullOrderTicket(table, validOrder);
  }, [table, validOrder]);

  const isReceiveButtonDisabled = currentProducts.length === 0;
  const isActionButtonsDisabled = validOrder.length === 0;
  const isClearNotificationsDisabled = table.callw === 0 && table.bill === 0;

  useEffect(() => {
    if (table.callw === 1 || table.bill === 1 || currentProducts.length > 0) {
      playNotificationSound();
    }
  }, [table.callw, table.bill, currentProducts.length]);

  const handleCollapse = useCallback(() => {
    setExpanded(false);
  }, []);

  return (
    <Card
      sx={{
        m: 1,
        border: (table.callw || table.bill || currentProducts.length)
          ? '2px solid yellow'
          : 'none',
        position: 'relative',
        animation: (table.callw || table.bill || currentProducts.length)
          ? 'borderBlink 2s infinite'
          : 'none',
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

      <Accordion expanded={expanded} onChange={() => setExpanded(prev => !prev)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: table.estado === 'ocupada'
              ? 'rgba(139, 0, 0, 0.8)'
              : 'rgba(34, 139, 34, 0.8)',
            color: '#fff'
          }}
        >
          <Typography variant="h6" align="center">
            Mesa {table.n_mesa}
            {table.callw === 1 && <span style={{ marginLeft: 10, animation: 'textBlink 2s infinite' }}>Mozo!</span>}
            {table.bill === 1 && <span style={{ marginLeft: 10, animation: 'textBlink 2s infinite' }}>Cuenta!</span>}
            {currentProducts.length > 0 && <span style={{ marginLeft: 10, animation: 'textBlink 2s infinite' }}>Nuevo!</span>}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <CardContent sx={{ p: 2 }}>
            {/* Nueva fila superior para información y botones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="body2">
                  Estado de la mesa: <strong>{table.estado}</strong>
                </Typography>
                <Typography variant="body2">
                  Mozo: <strong>{table.nombre_mozo}</strong>
                </Typography>
                {validOrder[0] && (
                  <Typography variant="body2">
                    Fecha y hora: <strong>{new Date(validOrder[0].fecha_pedido).toISOString().slice(0, 19).replace('T', ' ')}</strong>
                  </Typography>
                )}
              </Box>
              <Box>
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
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Pedido Actual:
            </Typography>
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
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Productos Agregados:
                </Typography>
                <List>
                  {currentProducts.map(({ id_producto, nombre, cantidad, precio }) => (
                    <ListItem key={id_producto} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                      <Typography variant="body2" sx={{ flex: 2, textAlign: 'left', color: 'green' }}>{nombre}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', color: 'green' }}>{cantidad}x</Typography>
                      <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', color: 'green' }}>${precio}</Typography>
                      <Typography variant="caption" sx={{ color: 'orange', fontWeight: 'bold', ml: 1 }}>
                        Nuevo!
                      </Typography>
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
                // Imprime solo los productos nuevos
                handlePrintNewProducts();
                handleCollapse();
              }}
              disabled={isReceiveButtonDisabled}
            >
              Confirmar
            </Button>

            <Button
              variant="contained"
              sx={{
                backgroundColor: (validOrder[0]?.estado_pedido === 'En curso' || inProgressDisabled)
                  ? 'grey'
                  : 'orange',
                color: '#fff'
              }}
              onClick={() => {
                handleOrderInProgressClick();
                handleCollapse();
              }}
              disabled={isActionButtonsDisabled || inProgressDisabled || validOrder[0]?.estado_pedido === 'En curso'}
            >
              En Curso
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleFinalizeOrderClick();
                handlePrintFullOrder();
                handleCollapse();
              }}
              disabled={isActionButtonsDisabled}
            >
              Finalizar
            </Button>
          </CardActions>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default memo(TableCardDetail);
