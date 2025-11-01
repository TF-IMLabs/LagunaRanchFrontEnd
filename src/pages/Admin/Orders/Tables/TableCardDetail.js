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
  Box,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Print as PrintIcon,
  ExpandMore as ExpandMoreIcon,
  PersonAdd as PersonAddIcon,
  NotificationsOff as NotificationsOffIcon
} from '@mui/icons-material';
import {
  updateNotifications
} from '../../../../services/waiterService';
import {
  putProductsAsOld
} from '../../../../services/cartService';
import {
  updateOrderAndTableStatus
} from '../../../../services/tableService';
import {
  printNewTicket,
  printFullOrderTicket
} from '../../../../utils/TicketPrinter';

const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play().catch(err => console.error('Error reproduciendo sonido:', err));
};

const TableCardDetail = ({
  table,
  order = [],
  orderInfo = {},
  handleReceiveOrder,
  handleUpdateTableStatus,
  handleOrderInProgress,
  handleOpenDialog,
}) => {
  const [inProgressDisabled, setInProgressDisabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const validOrder = useMemo(() => (Array.isArray(order) ? order : []), [order]);
  const currentProducts = useMemo(() => validOrder.filter(({ nuevo }) => nuevo === 1), [validOrder]);
  const oldProducts = useMemo(() => validOrder.filter(({ nuevo }) => nuevo === 0), [validOrder]);

  const handleOrderInProgressClick = useCallback(async () => {
    try {
      await handleOrderInProgress(table.ultimo_id_pedido, table.n_mesa);
      setInProgressDisabled(true);
      setFeedback({ severity: 'info', message: `Pedido de la mesa ${table.n_mesa} marcado en curso.` });
    } catch (error) {
      console.error('Error al marcar el pedido en curso:', error);
      setFeedback({ severity: 'error', message: 'No se pudo actualizar el estado a "En curso".' });
    }
  }, [handleOrderInProgress, table]);

  const handleReceiveOrderClick = useCallback(async () => {
    try {
      await handleReceiveOrder(table.ultimo_id_pedido, table.n_mesa, 'Recibido');
      await putProductsAsOld(table.ultimo_id_pedido);
      setFeedback({ severity: 'success', message: `Productos confirmados para la mesa ${table.n_mesa}.` });
    } catch (error) {
      console.error('Error al confirmar los productos nuevos:', error);
      setFeedback({ severity: 'error', message: 'No se pudo confirmar los productos nuevos.' });
    }
  }, [handleReceiveOrder, table]);

  const handleClearNotifications = useCallback(async () => {
    try {
      await updateNotifications(table.n_mesa);
      setFeedback({ severity: 'success', message: `Notificaciones limpiadas para la mesa ${table.n_mesa}.` });
    } catch (error) {
      console.error('Error al limpiar notificaciones:', error);
      setFeedback({ severity: 'error', message: 'No se pudieron limpiar las notificaciones.' });
    }
  }, [table.n_mesa]);

  const handleFinalizeOrderClick = useCallback(async () => {
    try {
      await updateOrderAndTableStatus({
        id_pedido: table.ultimo_id_pedido,
        estado: 'Finalizado',
      });
      await handleClearNotifications();
      handleUpdateTableStatus(table.n_mesa);
      setFeedback({ severity: 'success', message: `Mesa ${table.n_mesa} finalizada y liberada.` });
    } catch (error) {
      console.error('Error al finalizar el pedido y liberar la mesa:', error);
      setFeedback({ severity: 'error', message: 'No se pudo finalizar el pedido.' });
    }
  }, [table, handleClearNotifications, handleUpdateTableStatus]);

  const handlePrintNewProducts = useCallback(() => {
    const result = printNewTicket(table, currentProducts);
    if (result?.success) {
      setFeedback({ severity: 'success', message: `Ticket de nuevos productos enviado a impresión (mesa ${table.n_mesa}).` });
    } else if (result) {
      setFeedback({ severity: 'info', message: result.message });
    }
  }, [table, currentProducts]);

  const handlePrintFullOrder = useCallback(() => {
    const result = printFullOrderTicket(table, validOrder);
    if (result?.success) {
      setFeedback({ severity: 'success', message: `Ticket completo de la mesa ${table.n_mesa} enviado a impresión.` });
    } else if (result) {
      setFeedback({ severity: 'info', message: result.message });
    }
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

  const handleCloseFeedback = (_event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback(null);
  };

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

      <Accordion expanded={expanded} onChange={() => setExpanded(prev => !prev)}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: table.estado === 'ocupada' ? 'rgba(139, 0, 0, 0.8)' : 'rgba(34, 139, 34, 0.8)',
            color: 'white',
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
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="body2">
                  Estado de la mesa: <strong>{table.estado}</strong>
                </Typography>
                <Typography variant="body2">
                  Mozo: <strong>{table.nombre_mozo}</strong>
                </Typography>
                {orderInfo.fecha_pedido && (
                  <Typography variant="body2">
                    Fecha y hora: <strong>{new Date(orderInfo.fecha_pedido).toLocaleString()}</strong>
                  </Typography>
                )}
              </Box>
              <Box>
                <Tooltip title="Imprimir ticket completo">
                  <IconButton onClick={handlePrintFullOrder} color="inherit" aria-label={`Imprimir ticket completo de la mesa ${table.n_mesa}`}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Limpiar notificaciones">
                  <span>
                    <IconButton
                      onClick={handleClearNotifications}
                      disabled={isClearNotificationsDisabled}
                      aria-label={`Limpiar notificaciones de la mesa ${table.n_mesa}`}
                      sx={{ color: isClearNotificationsDisabled ? 'grey' : 'red' }}
                    >
                      <NotificationsOffIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Asignar mozo">
                  <IconButton
                    onClick={() => handleOpenDialog(table)}
                    color="inherit"
                    aria-label={`Asignar mozo a la mesa ${table.n_mesa}`}
                  >
                    <PersonAddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" fontWeight="bold" mb={1}>
              Pedido Actual:
            </Typography>

            <List>
              {oldProducts.map(({ id_producto, nombre, cantidad, precio }) => (
                <ListItem key={id_producto} sx={{ justifyContent: 'space-between', px: 1 }}>
                  <Typography variant="body2" sx={{ flex: 2 }}>{nombre}</Typography>
                  <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>{cantidad}x</Typography>
                  <Typography variant="body2" sx={{ flex: 1, textAlign: 'right' }}>${precio}</Typography>
                </ListItem>
              ))}
              <Divider />
            </List>

            {currentProducts.length > 0 && (
              <>
                <Typography variant="body2" fontWeight="bold" mb={1}>
                  Productos Agregados:
                </Typography>
                <List>
                  {currentProducts.map(({ id_producto, nombre, cantidad, precio }) => (
                    <ListItem key={id_producto} sx={{ justifyContent: 'space-between', px: 1 }}>
                      <Typography variant="body2" sx={{ flex: 2, color: 'green' }}>{nombre}</Typography>
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
            <Tooltip title="Confirmar productos nuevos">
              <span>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    handleReceiveOrderClick();
                    handlePrintNewProducts();
                    handleCollapse();
                  }}
                  disabled={isReceiveButtonDisabled}
                >
                  Confirmar
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Marcar pedido en curso">
              <span>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: (validOrder[0]?.estado_pedido === 'En curso' || inProgressDisabled) ? 'grey' : 'orange',
                    color: '#fff'
                  }}
                  onClick={() => {
                    handleOrderInProgressClick();
                    handleCollapse();
                  }}
                  disabled={isActionButtonsDisabled || inProgressDisabled || orderInfo.estado_pedido === 'En curso'}
                >
                  En curso
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Finalizar pedido">
              <span>
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
              </span>
            </Tooltip>
          </CardActions>
        </AccordionDetails>
      </Accordion>
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={5000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseFeedback} severity={feedback?.severity ?? 'info'} variant="filled">
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default memo(TableCardDetail);
