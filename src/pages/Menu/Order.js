import React, { useEffect, useState } from 'react';
import {
  Typography,
  Divider,
  Box,
  Button,
  Snackbar,
  useMediaQuery,
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { getOrderByTable } from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';
import { callWaiter, requestBill } from '../../services/waiterService';

const UNASSIGNED_TABLE_MESSAGE =
  'No hay mesas asignadas, no se puede realizar un pedido.';
const EMPTY_ORDER_MESSAGE =
  'Aun no pediste nada, hace tu pedido utilizando el carrito!';
const LOADING_ORDER_MESSAGE = 'Cargando el pedido...';
const AUTH_REQUIRED_MESSAGE =
  'Necesitas iniciar sesion para usar este servicio.';

const STATUS_LABELS = {
  Actualizado: 'Actualizado',
  Iniciado: 'Pendiente',
  Recibido: 'Confirmado',
  'En curso': 'En preparacion',
};

const Order = ({ onClose }) => {
  const { tableId, token, loginGuest } = useAuth();
  const [order, setOrder] = useState([]);
  const [waiterName, setWaiterName] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!tableId || !token) {
      setOrder([]);
      setWaiterName('');
      setOrderStatus('');
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

  if (!tableId) {
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <Typography variant="body1" color="error">
          {UNASSIGNED_TABLE_MESSAGE}
        </Typography>
      </Box>
    );
  }

  const totalAmount = order.reduce((sum, item) => {
    const price = Number(item?.precio ?? 0);
    const quantity = Number(item?.cantidad ?? 0);
    return sum + price * quantity;
  }, 0);

  const handleAction = async (actionFn) => {
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
      const { message } = await actionFn(Number(tableId));
      setNotification({
        open: true,
        message: message ?? 'Accion realizada correctamente.',
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

  return (
    <Box>
      <Typography variant='h6' textAlign='center' mb={2}>
        Estas pidiendo en la Mesa {tableId}
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

          <Timeline
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              mx: 'auto',
            }}
          >
            {[
              { icon: ArrowRightAltIcon, key: 'Iniciado' },
              { icon: CheckCircleIcon, key: 'Recibido' },
              { icon: RestaurantIcon, key: 'En curso' },
            ].map(({ icon: Icon, key }) => (
              <TimelineItem
                key={key}
                sx={{
                  px: isMobile ? '2px' : '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <TimelineSeparator>
                  <TimelineDot
                    sx={{
                      backgroundColor: 'white',
                      boxShadow: isStepActive(key) ? '0 0 20px black' : 'none',
                      transition: 'all 0.3s',
                    }}
                  >
                    <Icon
                      sx={{ color: isStepActive(key) ? 'black' : 'grey.500' }}
                    />
                  </TimelineDot>
                </TimelineSeparator>
              </TimelineItem>
            ))}
          </Timeline>

          <Divider sx={{ my: 2 }} />

          {order.map((item) => (
            <Box
              key={item.id_producto}
              display='flex'
              justifyContent='space-between'
              mb={1}
            >
              <Typography>{item.nombre}</Typography>
              <Typography>
                ${Number(item.precio ?? 0)} x {Number(item.cantidad ?? 0)}
              </Typography>
            </Box>
          ))}

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
