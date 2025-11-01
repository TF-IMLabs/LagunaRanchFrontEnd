import React, { useEffect, useState } from 'react';
import {
  Typography,
  Divider,
  Box,
  Button,
  Snackbar,
  useMediaQuery
} from '@mui/material';
import { getOrderByTable } from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';
import { callWaiter, requestBill } from '../../services/waiterService';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot
} from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const Order = ({ onClose }) => {
  const { tableId } = useAuth();
  const [order, setOrder] = useState([]);
  const [waiterName, setWaiterName] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!tableId) return;
    let mounted = true;
    const loadOrder = async () => {
      try {
        const { result } = await getOrderByTable(tableId);
        if (!mounted) return;
        if (result.length && result[0].mensaje === 'La mesa no estÃ¡ ocupada.') {
          setOrder([]);
          setWaiterName('');
          setOrderStatus('');
        } else {
          setOrder(result);
          setWaiterName(result[0].nombre_mozo);
          setOrderStatus(result[0].estado_pedido);
        }
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
  }, [tableId]);

  if (!tableId) {
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <Typography variant="body1" color="error">
          No hay mesas asignadas, no se puede realizar un pedido.
        </Typography>
      </Box>
    );
  }

  const totalAmount = order.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const handleAction = async (actionFn) => {
    try {
      const { message } = await actionFn(tableId);
      setNotification({ open: true, message });
    } catch {
      setNotification({ open: true, message: 'Error. Intenta nuevamente. âŒ' });
    }
  };

  const statusMap = {
    Actualizado: 'Actualizado',
    Iniciado: 'Pendiente',
    Recibido: 'Confirmado',
    'En curso': 'En preparaciÃ³n',
  };
  const statusMessage = statusMap[orderStatus] || '';

  return (
    <Box>
      <Typography variant="h6" textAlign="center" mb={2}>
        EstÃ¡s pidiendo en la Mesa {tableId}
      </Typography>

      {order.length === 0 ? (
        <Box textAlign="center">
          <Typography variant="body1" color="textSecondary">
            {order.length === 0 && waiterName === ''
              ? 'AÃºn no pediste nada, Â¡hacÃ© tu pedido utilizando el carrito!'
              : 'Cargando el pedido...'}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => handleAction(callWaiter)}
          
          >
            Llamar al Mozo
          </Button>
        </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography>
              <strong>Mozo:</strong> {waiterName}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => handleAction(callWaiter)}
           
            >
              Llamar al Mozo
            </Button>
          </Box>

          <Typography variant="body1" mb={2}>
            <strong>Estado:</strong> {statusMessage}
          </Typography>

          <Timeline
            sx={{
              display: 'flex',
              flexDirection: 'row',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {[
              { icon: ArrowRightAltIcon, key: 'iniciado' },
              { icon: CheckCircleIcon, key: 'Recibido' },
              { icon: RestaurantIcon, key: 'En curso' },
            ].map(({ icon: Icon, key }) => (
              <TimelineItem key={key} sx={{ px: isMobile ? '2px' : '4px' }}>
                <TimelineSeparator>
                  <TimelineDot
                    sx={{
                      backgroundColor: 'white',
                      boxShadow: orderStatus === key ? '0 0 20px black' : 'none',
                      transition: 'all 0.3s',
                    }}
                  >
                    <Icon
                      sx={{ color: orderStatus === key ? 'black' : 'grey.500' }}
                    />
                  </TimelineDot>
                </TimelineSeparator>
              </TimelineItem>
            ))}
          </Timeline>

          <Divider sx={{ my: 2 }} />
          {order.map(item => (
            <Box key={item.id_producto} display="flex" justifyContent="space-between" mb={1}>
              <Typography>{item.nombre}</Typography>
              <Typography>
                ${item.precio} x {item.cantidad}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" textAlign="center">
            <strong>Total: ${totalAmount.toFixed(2)}</strong>
          </Typography>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="outlined"
              onClick={() => handleAction(requestBill)}
              
            >
              Pedir La Cuenta
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(n => ({ ...n, open: false }))}
        message={notification.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        ContentProps={{ sx: { color: 'black', backgroundColor: 'white' } }}
      />
    </Box>
  );
};

export default Order;
