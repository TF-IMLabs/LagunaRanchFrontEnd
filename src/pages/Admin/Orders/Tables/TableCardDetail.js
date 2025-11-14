import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import {
  Typography,
  Button,
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  List,
  ListItem,
  Divider,
  Box,
  Snackbar,
  Alert,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Print as PrintIcon,
  PersonAdd as PersonAddIcon,
  NotificationsOff as NotificationsOffIcon,
  Person as PersonIcon,
  ReceiptLong as ReceiptLongIcon,
  LocalDining as LocalDiningIcon,
  Close as CloseIcon,
  FiberManualRecord as FiberManualRecordIcon,
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
  const [feedback, setFeedback] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const validOrder = useMemo(() => (Array.isArray(order) ? order : []), [order]);
  const currentProducts = useMemo(() => validOrder.filter(({ nuevo }) => nuevo === 1), [validOrder]);
  const oldProducts = useMemo(() => validOrder.filter(({ nuevo }) => nuevo === 0), [validOrder]);
  const tableState = (table.estado || '').toLowerCase();
  const isAttentionState = table.callw === 1 || table.bill === 1 || currentProducts.length > 0;
  const isFreeState = tableState === 'libre';
  const displayState = isAttentionState ? 'Atención' : (isFreeState ? 'Libre' : 'Ocupada');
  const statePaletteKey = isAttentionState ? 'warning' : isFreeState ? 'success' : 'error';
  const stateColorMap = {
    success: '#43A047',
    error: '#E53935',
    warning: '#FBC02D',
  };
  const stateColorHex = stateColorMap[statePaletteKey] || '#90CAF9';
  const [isStatePulsing, setIsStatePulsing] = useState(false);
  const previousDisplayStateRef = useRef(displayState);
  const waiterName = table.nombre_mozo || 'Sin asignar';
  const statusIndicators = useMemo(() => [
    {
      key: 'waiter',
      active: table.callw === 1,
      label: 'Llamado al mozo',
      color: 'warning.main',
      Icon: PersonIcon,
    },
    {
      key: 'bill',
      active: table.bill === 1,
      label: 'Solicitó la cuenta',
      color: 'info.main',
      Icon: ReceiptLongIcon,
    },
    {
      key: 'new',
      active: currentProducts.length > 0,
      label: 'Nuevos productos en la orden',
      color: 'success.light',
      Icon: LocalDiningIcon,
    },
  ], [table.callw, table.bill, currentProducts.length]);
  const activeIndicators = statusIndicators.filter(({ active }) => active);
  const hasTableAlerts = activeIndicators.length > 0;
  const tableNote =
    table?.nota ??
    table?.notas ??
    table?.note ??
    orderInfo?.nota ??
    orderInfo?.notas ??
    '';

  useEffect(() => {
    if (previousDisplayStateRef.current !== displayState) {
      setIsStatePulsing(true);
      const timeout = setTimeout(() => setIsStatePulsing(false), 1600);
      previousDisplayStateRef.current = displayState;
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [displayState]);

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

  const handleOpenDetail = () => setDetailOpen(true);
  const handleCloseDetail = () => setDetailOpen(false);

  const handleAssignWaiter = () => {
    handleCloseDetail();
    handleOpenDialog(table);
  };

  const handleConfirmAndClose = useCallback(async () => {
    await handleReceiveOrderClick();
    handlePrintNewProducts();
    handleCloseDetail();
  }, [handleReceiveOrderClick, handlePrintNewProducts]);

  const handleInProgressAndClose = useCallback(async () => {
    await handleOrderInProgressClick();
    handleCloseDetail();
  }, [handleOrderInProgressClick]);

  const handleFinalizeAndClose = useCallback(async () => {
    await handleFinalizeOrderClick();
    handlePrintFullOrder();
    handleCloseDetail();
  }, [handleFinalizeOrderClick, handlePrintFullOrder]);

  const handleCloseFeedback = (_event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback(null);
  };

  return (
    <Card
      sx={{
        m: 0.5,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderLeftWidth: 4,
        borderLeftColor: (theme) => theme.palette[statePaletteKey].main,
        position: 'relative',
        backgroundColor: (theme) => theme.palette.background.paper,
        backgroundImage: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette[statePaletteKey].main, 0.08)}, ${alpha(
            theme.palette.background.paper,
            0.95
          )})`,
        boxShadow: (theme) =>
          hasTableAlerts || isStatePulsing
            ? `0 0 20px ${alpha(theme.palette[statePaletteKey].main, 0.35)}`
            : `0 0 12px ${alpha(theme.palette[statePaletteKey].main, 0.2)}`,
        animation: isStatePulsing ? 'statePulse 1.5s ease-out' : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: (theme) => `0 0 24px ${alpha(theme.palette[statePaletteKey].main, 0.4)}`,
        },
      }}
    >
      <style>{`
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(255, 213, 79, 0.15); }
          50% { box-shadow: 0 0 18px rgba(255, 213, 79, 0.45); }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes statePulse {
          0% { box-shadow: 0 0 0 rgba(0, 0, 0, 0); }
          60% { box-shadow: 0 0 24px rgba(255, 255, 255, 0.25); }
          100% { box-shadow: 0 0 12px rgba(0, 0, 0, 0.15); }
        }
      `}</style>

      <CardActionArea
        onClick={handleOpenDetail}
        sx={{
          borderRadius: 2,
          alignItems: 'stretch',
          display: 'block',
          height: '100%',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Mesa {table.n_mesa}
            </Typography>
            <Stack direction="row" spacing={0.75}>
              {activeIndicators.length ? (
                activeIndicators.map(({ key, Icon, label, color }) => (
                  <Tooltip title={label} key={key}>
                    <Box
                      component={Icon}
                      sx={{
                        color,
                        fontSize: '1.4rem',
                        animation: 'iconPulse 2.4s ease-in-out infinite',
                      }}
                    />
                  </Tooltip>
                ))
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Sin alertas
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack spacing={0.5}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <FiberManualRecordIcon sx={{ fontSize: 14, color: stateColorHex }} />
              <Typography
                variant="body2"
                sx={{
                  color: stateColorHex,
                  fontWeight: 600,
                }}
              >
                {displayState}
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              sx={{ color: (theme) => alpha(theme.palette.text.secondary, 0.8) }}
            >
              Mozo: <strong>{waiterName}</strong>
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>

      <Dialog
        open={detailOpen}
        onClose={handleCloseDetail}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: (theme) => theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            pb: 1,
            backgroundColor: (theme) => alpha(theme.palette[statePaletteKey].main, 0.15),
            borderBottom: (theme) => `1px solid ${alpha(theme.palette[statePaletteKey].main, 0.3)}`,
          }}
        >
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              Mesa {table.n_mesa}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estado actual: <strong>{displayState}</strong>
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: (theme) => theme.palette[statePaletteKey].main,
                boxShadow: (theme) => `0 0 10px ${alpha(theme.palette[statePaletteKey].main, 0.7)}`,
              }}
            />
            {activeIndicators.length ? (
              activeIndicators.map(({ key, Icon, label, color }) => (
                <Tooltip title={label} key={`dialog-${key}`}>
                  <Box
                    component={Icon}
                    sx={{
                      color,
                      fontSize: '1.5rem',
                      animation: 'iconPulse 2.4s ease-in-out infinite',
                    }}
                  />
                </Tooltip>
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                Sin alertas
              </Typography>
            )}
            <IconButton onClick={handleCloseDetail} aria-label="Cerrar detalle de mesa">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              <Typography variant="body2">
                Mozo asignado: <strong>{table.nombre_mozo || 'Sin asignar'}</strong>
              </Typography>
              {orderInfo.fecha_pedido && (
                <Typography variant="body2">
                  Fecha y hora: <strong>{new Date(orderInfo.fecha_pedido).toLocaleString()}</strong>
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Imprimir ticket completo">
                <IconButton onClick={handlePrintFullOrder} color="inherit">
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Limpiar notificaciones">
                <span>
                  <IconButton
                    onClick={handleClearNotifications}
                    disabled={isClearNotificationsDisabled}
                    sx={{ color: isClearNotificationsDisabled ? 'action.disabled' : 'warning.main' }}
                  >
                    <NotificationsOffIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Asignar mozo">
                <IconButton onClick={handleAssignWaiter} color="inherit">
                  <PersonAddIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Divider />

          {tableNote && (
            <>
              <Typography variant="subtitle2" color="warning.main">
                Nota del pedido
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: (theme) => `1px dashed ${theme.palette.warning.main}`,
                  backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.08),
                }}
              >
                <Typography variant="body2">{tableNote}</Typography>
              </Box>

              <Divider />
            </>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.6, mb: 1 }}>
              Pedido actual
            </Typography>
            <Box sx={{ maxHeight: 260, overflowY: 'auto', pr: 1 }}>
              <List dense disablePadding>
                {oldProducts.map(({ id_producto, nombre, cantidad, precio }) => (
                  <ListItem key={id_producto} sx={{ justifyContent: 'space-between', px: 0.5, py: 0.5 }}>
                    <Typography variant="body2" sx={{ flex: 2 }}>{nombre}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>{cantidad}x</Typography>
                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'right' }}>${precio}</Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>

          {currentProducts.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.6, mb: 1 }}>
                  Productos agregados
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 1 }}>
                  <List dense disablePadding>
                    {currentProducts.map(({ id_producto, nombre, cantidad, precio }) => (
                      <ListItem key={id_producto} sx={{ justifyContent: 'space-between', px: 0.5, py: 0.5 }}>
                        <Typography variant="body2" sx={{ flex: 2, color: 'success.light' }}>{nombre}</Typography>
                        <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', color: 'success.light' }}>{cantidad}x</Typography>
                        <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', color: 'success.light' }}>${precio}</Typography>
                        <Chip label="Nuevo" size="small" color="success" variant="outlined" sx={{ ml: 1 }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            width="100%"
            alignItems="stretch"
          >
            <Tooltip title="Confirmar productos nuevos">
              <span style={{ width: '100%' }}>
                <Button
                  variant="contained"
                  onClick={handleConfirmAndClose}
                  disabled={isReceiveButtonDisabled}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: '#43A047',
                    color: 'common.white',
                    borderRadius: 1.5,
                    '&:hover': { backgroundColor: '#388E3C' },
                    '&:disabled': {
                      backgroundColor: 'action.disabledBackground',
                      color: 'action.disabled',
                    },
                  }}
                >
                  Confirmar
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Marcar pedido en curso">
              <span style={{ width: '100%' }}>
                <Button
                  variant="contained"
                  onClick={handleInProgressAndClose}
                  disabled={isActionButtonsDisabled || inProgressDisabled || orderInfo.estado_pedido === 'En curso'}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#1f1f1f',
                    backgroundColor: (validOrder[0]?.estado_pedido === 'En curso' || inProgressDisabled)
                      ? '#616161'
                      : '#FFA726',
                    borderRadius: 1.5,
                    '&:hover': {
                      backgroundColor: (validOrder[0]?.estado_pedido === 'En curso' || inProgressDisabled)
                        ? '#545454'
                        : '#FB8C00',
                    },
                    '&:disabled': {
                      backgroundColor: 'action.disabledBackground',
                      color: 'action.disabled',
                    },
                  }}
                >
                  En curso
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Finalizar pedido y liberar mesa">
              <span style={{ width: '100%' }}>
                <Button
                  variant="contained"
                  onClick={handleFinalizeAndClose}
                  disabled={isActionButtonsDisabled}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: '#E53935',
                    color: 'common.white',
                    borderRadius: 1.5,
                    '&:hover': { backgroundColor: '#C62828' },
                    '&:disabled': {
                      backgroundColor: 'action.disabledBackground',
                      color: 'action.disabled',
                    },
                  }}
                >
                  Finalizar
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </DialogActions>
      </Dialog>

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
