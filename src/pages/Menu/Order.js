import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Divider,
  Box,
  Button,
  Snackbar,
  useMediaQuery,
  Chip,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { getOrderByTable } from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';
import { callWaiter, requestBill } from '../../services/waiterService';

const UNASSIGNED_TABLE_MESSAGE =
  '';
const EMPTY_ORDER_MESSAGE =
  'Aún no pediste nada, hace tu pedido utilizando el carrito!';
const LOADING_ORDER_MESSAGE = 'Cargando el pedido...';
const AUTH_REQUIRED_MESSAGE =
  'Necesitas iniciar sesión para usar este servicio.';

const STATUS_LABELS = {
  Actualizado: 'Actualizado',
  Iniciado: 'Pendiente',
  Recibido: 'Confirmado',
  'En curso': 'En preparación',
};

const Order = ({ onClose }) => {
  const {
    tableId,
    token,
    loginGuest,
    tableValidation,
    isVenueOpen,
    isAuthenticated,
  } = useAuth();
  const [order, setOrder] = useState([]);
  const [waiterName, setWaiterName] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [callRequested, setCallRequested] = useState(false);
  const [billRequested, setBillRequested] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

useEffect(() => {
  if (!tableId || !token) {
    setOrder([]);
    setWaiterName('');
    setOrderStatus('');
    setCallRequested(false);
    setBillRequested(false);
    return;
  }

    let mounted = true;

    const loadOrder = async () => {
      try {
        const response = await getOrderByTable(tableId);
        if (!mounted) return;

        const resultArray = Array.isArray(response?.result)
          ? response.result
          : Array.isArray(response)
          ? response
          : [];

        if (
          resultArray.length > 0 &&
          typeof resultArray[0]?.mensaje === 'string' &&
          /no esta ocupada/i.test(resultArray[0].mensaje)
        ) {
          setOrder([]);
          setWaiterName('');
          setOrderStatus('');
          return;
        }

        if (resultArray.length > 0) {
          setOrder(resultArray);
          setWaiterName(resultArray[0]?.nombre_mozo ?? '');
          setOrderStatus(resultArray[0]?.estado_pedido ?? '');
          return;
        }

        setOrder([]);
        setWaiterName('');
        setOrderStatus('');
      } catch (error) {
        console.error('Error al cargar la orden:', error);
      }
    };

    loadOrder();
    const interval = setInterval(loadOrder, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [tableId, token]);

  const totalAmount = order.reduce((sum, item) => {
    const price = Number(item?.precio ?? 0);
    const quantity = Number(item?.cantidad ?? 0);
    return sum + price * quantity;
  }, 0);

  const aggregatedItems = useMemo(() => {
    const map = new Map();
    order.forEach((item = {}) => {
      const key = item.id_producto ?? item.nombre;
      if (!key) return;
      const existing = map.get(key) ?? {
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: Number(item.precio ?? 0),
        cantidad: 0,
      };
      existing.cantidad += Number(item.cantidad ?? 0);
      map.set(key, existing);
    });
    return Array.from(map.values());
  }, [order]);

  const tableState = tableValidation?.state ?? 'missing';
  useEffect(() => {
    if (!order.length) {
      setCallRequested(false);
      setBillRequested(false);
    }
  }, [order.length]);

  if (!tableId) {
    if (!isAuthenticated) {
      return (
        <Box display="flex" justifyContent="center" mt={2}>
          <Typography variant="body1" color="error">
            {UNASSIGNED_TABLE_MESSAGE}
          </Typography>
        </Box>
      );
    }
    return null;
  }

  const handleAction = async (actionFn) => {
    if (!isVenueOpen) {
      setNotification({
        open: true,
        message: 'El restaurante esta cerrado. Intentalo cuando este abierto.',
      });
      return;
    }

    if (tableState !== 'valid') {
      setNotification({
        open: true,
        message: 'La mesa ya no esta habilitada. Pide ayuda al mozo.',
      });
      return;
    }

    if (!token) {
      if (!tableId) {
        setNotification({ open: true, message: AUTH_REQUIRED_MESSAGE });
        return;
      }

      try {
        await loginGuest(tableId);
      } catch (error) {
        console.error('Error al iniciar sesión como invitado antes de la acción:', error);
        setNotification({ open: true, message: AUTH_REQUIRED_MESSAGE });
        return;
      }
    }

    try {
      const response = await actionFn(Number(tableId));
      if (actionFn === callWaiter) {
        setCallRequested(true);
      } else if (actionFn === requestBill) {
        setBillRequested(true);
      }
      setNotification({
        open: true,
        message:
          response?.message ??
          (actionFn === callWaiter
            ? 'Avisamos al mozo. Ya va en camino.'
            : actionFn === requestBill
            ? 'Solicitud de cuenta enviada.'
            : 'Acción realizada correctamente.'),
      });
    } catch (error) {
      console.error('Error al ejecutar la accion de mesa:', error);
      setNotification({
        open: true,
        message: error?.message ?? 'Error. Intenta nuevamente.',
      });
    }
  };

  const statusMessage = STATUS_LABELS[orderStatus] ?? '';
  const isStepActive = (stepKey) =>
    stepKey === 'Iniciado'
      ? ['Iniciado', 'Actualizado'].includes(orderStatus)
      : orderStatus === stepKey;

  const statusSteps = [
    {
      key: 'Iniciado',
      label: 'Pedido enviado',
      description: 'Estamos revisando tu orden.',
      Icon: ArrowRightAltIcon,
    },
    {
      key: 'Recibido',
      label: 'Confirmado',
      description: 'Vimos tu pedido, ya lo estamos gestionando.',
      Icon: CheckCircleIcon,
    },
    {
      key: 'En curso',
      label: 'En preparacion',
      description: 'Tu comida esta en curso.',
      Icon: RestaurantIcon,
    },
  ];

  return (
    <Box>
      <Typography
        variant='h5'
        textAlign='center'
        mb={2}
        sx={{ fontWeight: 700, letterSpacing: 0.5 }}
      >
        Estás pidiendo en la Mesa {tableId}
      </Typography>

      {order.length === 0 ? (
        <Box textAlign='center' display="flex" flexDirection="column" gap={2}>
          <Typography variant='body1' color='text.secondary'>
            {waiterName
              ? LOADING_ORDER_MESSAGE
              : EMPTY_ORDER_MESSAGE}
          </Typography>
          <Button
            variant='outlined'
            onClick={() => handleAction(callWaiter)}
            fullWidth={isMobile}
            sx={{ alignSelf: 'center', maxWidth: isMobile ? '100%' : 260 }}
          >
            Llamar al Mozo
          </Button>
        </Box>
      ) : (
        <>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={2}
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={1.5}
          >
            <Typography>
              <strong>Mozo:</strong> {waiterName}
            </Typography>
            <Button
              variant='outlined'
              onClick={() => handleAction(callWaiter)}
              fullWidth={isMobile}
              sx={{ maxWidth: isMobile ? '100%' : 220 }}
            >
              Llamar al Mozo
            </Button>
          </Box>

          <Typography variant='body1' mb={2} sx={{ textAlign: 'center' }}>
            <strong>Estado:</strong> {statusMessage}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent='center'
            alignItems='stretch'
            sx={{ mb: 2 }}
          >
            {statusSteps.map(({ key, label, description, Icon }) => {
              const active = isStepActive(key);
              return (
                <Box
                  key={key}
                  sx={{
                    flex: 1,
                    minWidth: 160,
                    borderRadius: 2,
                    border: (theme) =>
                      `1px solid ${
                        active ? theme.palette.warning.main : theme.palette.divider
                      }`,
                    backgroundColor: (theme) =>
                      active
                        ? theme.palette.action.selected
                        : theme.palette.background.paper,
                    p: 1.5,
                    textAlign: 'center',
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 28,
                      color: active ? 'warning.main' : 'text.secondary',
                    }}
                  />
                  <Typography sx={{ fontWeight: 600, mt: 1 }}>{label}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {description}
                  </Typography>
                </Box>
              );
            })}
          </Stack>

          <Stack direction='row' spacing={1} justifyContent='center' mb={2}>
            {callRequested && (
              <Chip label='Llamado enviado' size='small' color='warning' />
            )}
            {billRequested && (
              <Chip label='Cuenta solicitada' size='small' color='info' />
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            Resumen del pedido
          </Typography>

          <Stack spacing={1}>
            {aggregatedItems.map((item) => (
              <Box
                key={`${item.nombre}-${item.precio}`}
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 2,
                  px: 1.25,
                  py: 1,
                }}
              >
                <Box>
                  <Typography fontWeight={600}>{item.nombre}</Typography>
                  {item.descripcion && (
                    <Typography variant='caption' color='text.secondary'>
                      {item.descripcion}
                    </Typography>
                  )}
                </Box>
                <Typography fontWeight={600}>
                  ${(item.precio * item.cantidad).toFixed(2)}{' '}
                  <Typography
                    component='span'
                    variant='caption'
                    color='text.secondary'
                  >
                    ({item.cantidad}x)
                  </Typography>
                </Typography>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Typography variant='h6' textAlign='center'>
            <strong>Total: ${totalAmount.toFixed(2)}</strong>
          </Typography>

          <Box display='flex' justifyContent='center' mt={2}>
            <Button
              variant='outlined'
              onClick={() => handleAction(requestBill)}
              fullWidth={isMobile}
              sx={{ maxWidth: isMobile ? '100%' : 220 }}
            >
              Pedir la Cuenta
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((state) => ({ ...state, open: false }))}
        message={notification.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        ContentProps={{ sx: { color: 'black', backgroundColor: 'white' } }}
      />
    </Box>
  );
};

export default Order;
Order.propTypes = {
  onClose: PropTypes.func.isRequired,
};
