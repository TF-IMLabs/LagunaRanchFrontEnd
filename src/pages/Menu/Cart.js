import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Button, Typography, Divider, Box, IconButton, TextField
} from '@mui/material';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateTableNote } from '../../services/tableService';
import {
  Remove as RemoveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ConfirmOrderDialog from './ConfirmOrderDialog';

const Cart = ({ onClose }) => {
  const { tableId, clientId } = useAuth();
  const { cart, updateItemQuantity, removeItem, sendOrder } = useCart();
  const [note, setNote] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const isSendDisabled = !tableId || cart.length === 0 || isSubmitting;
  const canShowAddMoreButton = Boolean(tableId && clientId);

  const handleSendOrder = async () => {
    setIsSubmitting(true);
    try {
      await updateTableNote(tableId, note);
      await sendOrder();
      onClose();
    } catch (error) {
      console.error('Error al enviar el pedido:', error);
      alert('Ocurrió un error al enviar tu pedido. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {cart.length === 0 ? (
        canShowAddMoreButton && ( 
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="outlined"
              sx={{ width: 200 }}
              onClick={() => {
                onClose();
                navigate('/menu');
              }}
            >
              ¡Agregá más productos!
            </Button>
          </Box>
        )
      ) : (
        <>

          {cart.map(({ product, cantidad }) => (
            <Box key={product.id_producto} mb={2}>
              <Typography variant="body1">{product.nombre}</Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="body1">
                  ${product.precio} x {cantidad}
                </Typography>
                <Box display="flex" alignItems="center">
                  <IconButton
                    onClick={() => updateItemQuantity(product.id_producto, cantidad - 1)}
                    disabled={cantidad <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="body1" mx={1}>{cantidad}</Typography>
                  <IconButton
                    onClick={() => updateItemQuantity(product.id_producto, cantidad + 1)}
                    disabled={cantidad >= 10}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton onClick={() => removeItem(product.id_producto)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}

          <TextField
            label="Nota del Pedido"
            variant="outlined"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'gray' },
                '&:hover fieldset': { borderColor: theme.palette.primary.main },
                '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
              },
              '& .MuiInputLabel-root': { color: theme.palette.text.primary },
              '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.text.primary },
            }}
            margin="normal"
          />

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="outlined"
              sx={{ width: 200 }}
              onClick={() => {
                onClose();
                navigate('/menu');
              }}
            >
              Seguir Pidiendo!
            </Button>
            <Button
              variant="outlined"
              sx={{ width: 200 }}
              onClick={() => setOpenDialog(true)}
              disabled={isSendDisabled}
            >
              Enviar Pedido
            </Button>
          </Box>

          <ConfirmOrderDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            onSendOrder={handleSendOrder}
            cart={cart}
            note={note}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </Box>
  );
};

export default Cart;
