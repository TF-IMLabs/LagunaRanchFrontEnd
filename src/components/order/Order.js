import React, { useEffect, useState } from 'react';
import { Typography, Divider, Box, Button, Snackbar, useMediaQuery } from '@mui/material';
import { GetOrderByTable } from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';
import { callWaiter, requestBill } from '../../services/waiterService';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const Order = ({ onClose }) => {
  const { auth } = useAuth();
  const { tableId } = auth || {};
  const [order, setOrder] = useState(null);
  const [waiterName, setWaiterName] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadOrder = async () => {
      if (tableId) {
        try {
          const existingOrder = await GetOrderByTable(tableId);
          if (existingOrder && existingOrder.result.length > 0) {
            const firstResult = existingOrder.result[0];
            if (firstResult.mensaje === "La mesa no está ocupada.") {
              setOrder([]);
              setWaiterName('');
              setOrderStatus('');
            } else {
              setOrder(existingOrder.result);
              setWaiterName(firstResult.nombre_mozo);
              setOrderStatus(firstResult.estado_pedido);
            }
          } else {
            setOrder([]);
            setWaiterName('');
            setOrderStatus('');
          }
        } catch (error) {
          console.error('Error al cargar la orden:', error);
        }
      }
    };

    loadOrder();
    const interval = setInterval(loadOrder, 5000);
    return () => clearInterval(interval);
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

  const calculateTotal = () => {
    if (!order || order.length === 0) return 0;
    return order.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  const totalAmount = calculateTotal();

  const handleCallWaiter = async () => {
    try {
      const { message } = await callWaiter(tableId); // Obtener el mensaje de éxito
      setNotification({ open: true, message }); // Mostrar la notificación con el mensaje
    } catch (error) {
      console.error('Error al llamar al mozo:', error);
      setNotification({ open: true, message: 'Error al llamar al mozo. Intenta nuevamente. ❌' }); // Mensaje de error
    }
  };

  const handleRequestBill = async () => {
    try {
      const { message } = await requestBill(tableId); // Obtener el mensaje de éxito
      setNotification({ open: true, message }); // Mostrar la notificación con el mensaje
    } catch (error) {
      console.error('Error al solicitar la cuenta:', error);
      setNotification({ open: true, message: 'Error al solicitar la cuenta. Intenta nuevamente. ❌' }); // Mensaje de error
    }
  };

  const handleCloseSnackbar = () => {
    setNotification({ ...notification, open: false });
  };

  const getStatusMessage = () => {
    switch (orderStatus) {
      case 'Actualizado':
        return 'Agregaste algo nuevo al pedido!';
      case 'iniciado':
        return 'El pedido se encuentra pendiente de confirmación';
      case 'Recibido':
        return 'El pedido fue confirmado';
      case 'En curso':
        return 'Estamos preparando tu pedido!';
      default:
        return '';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <Typography variant="h6b" sx={{ flexGrow: 1, textAlign: 'center' }}>
          Estás pidiendo en la mesa {tableId}
        </Typography>
      </Box>
    
      {order === null ? (
        <Typography variant="body1" color="textSecondary">
          Cargando el pedido...
        </Typography>
      ) : order.length === 0 ? (
        <Box textAlign="center">
          <Typography variant="body1" color="textSecondary">
            Aún no pediste nada, ¡hacé tu pedido utilizando el carrito!
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleCallWaiter}
            sx={{ 
              marginTop: 2, 
              backgroundColor: 'black', 
              color: '#DD98AD', 
              '&:hover': { backgroundColor: 'black' } 
            }}
          >
            Llamar al Mozo
          </Button>
        </Box>
      ) : (
        <>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="body1" color="textPrimary" sx={{ marginRight: 2 }}>
              <strong>Mozo:</strong> {waiterName}
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleCallWaiter}
              sx={{ 
                width: '150px', 
                height: '50px', 
                backgroundColor: 'black', 
                color: '#DD98AD', 
                '&:hover': { backgroundColor: 'black' } 
              }}
            >
              Llamar al Mozo
            </Button>
          </Box>
    
          <Typography variant="body1" color="textPrimary" mb={2}>
            <strong>Estado:</strong> {getStatusMessage()}
          </Typography>
    
          {/* Timeline responsiva (siempre horizontal) */}
          <Timeline
    sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
    }}
>
    {/* Timeline Items */}
    <TimelineItem
        sx={{
            display: 'flex',
            justifyContent: 'center',
            width: 'auto',
            paddingX: isMobile ? '2px' : '4px', // Ajuste de espaciado horizontal
        }}
    >
        <TimelineSeparator>
            <TimelineDot
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    opacity: 1, // Mantener la opacidad siempre
                    boxShadow: orderStatus === 'iniciado' || orderStatus === 'Actualizado' ? '0 0 20px black' : 'none',
                    transition: 'all 0.3s ease-in-out',
                }}
            >
                <ArrowRightAltIcon
                    sx={{
                        color: orderStatus === 'iniciado' || orderStatus === 'Actualizado' ? 'black' : 'grey.500', // Cambiar color del ícono
                    }}
                />
            </TimelineDot>
        </TimelineSeparator>
    </TimelineItem>

    <TimelineItem
        sx={{
            display: 'flex',
            justifyContent: 'center',
            width: 'auto',
            paddingX: isMobile ? '2px' : '4px',
        }}
    >
        <TimelineSeparator>
            <TimelineDot
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    opacity: 1, // Mantener la opacidad siempre
                    boxShadow: orderStatus === 'Recibido' ? '0 0 20px black' : 'none',
                    transition: 'all 0.3s ease-in-out',
                }}
            >
                <CheckCircleIcon
                    sx={{
                        color: orderStatus === 'Recibido' ? 'black' : 'grey.500', // Cambiar color del ícono
                    }}
                />
            </TimelineDot>
        </TimelineSeparator>
    </TimelineItem>

    <TimelineItem
        sx={{
            display: 'flex',
            justifyContent: 'center',
            width: 'auto',
            paddingX: isMobile ? '2px' : '4px',
        }}
    >
        <TimelineSeparator>
            <TimelineDot
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    opacity: 1, // Mantener la opacidad siempre
                    boxShadow: orderStatus === 'En curso' ? '0 0 20px black' : 'none',
                    transition: 'all 0.3s ease-in-out',
                }}
            >
                <RestaurantIcon
                    sx={{
                        color: orderStatus === 'En curso' ? 'black' : 'grey.500', // Cambiar color del ícono
                    }}
                />
            </TimelineDot>
        </TimelineSeparator>
    </TimelineItem>
</Timeline>



          <Divider sx={{ my: 2 }} />
          {order.map(item => (
            <Box key={`${item.id_producto}-${item.cantidad}`} mb={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                {item.nombre}
              </Typography>
              <Typography variant="body1">
                ${item.precio} x {item.cantidad}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Typography variant="h6b">
              <strong>Total: ${totalAmount.toFixed(2)}</strong>
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="center" mt={2}>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleRequestBill}
              sx={{ 
                margin: 1, 
                backgroundColor: 'black', 
                color: '#DD98AD', 
                '&:hover': { backgroundColor: 'black' } 
              }}
            >
              Pedir La Cuenta
            </Button>
          </Box>
        </>
      )}

      {/* Snackbar para notificaciones. */}
      <Snackbar
       open={notification.open}
       onClose={handleCloseSnackbar}
       autoHideDuration={6000}
       message={notification.message}
       anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
       ContentProps={{
         sx: { color: 'black', backgroundColor: 'white'} 
       }}
      />
    </Box>
  );
};

export default Order;
