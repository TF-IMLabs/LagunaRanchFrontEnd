import React, { useState } from 'react';
import { Button, Typography, Divider, Box, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateTableNote } from '../../services/tableService';
import { Remove as RemoveIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import ConfirmOrderDialog from './ConfirmOrderDialog';


const CustomButton = styled(Button)({
  color: '#DD98AD',
  backgroundColor: 'black',
  borderColor: '#9b8c8d',
  '&:hover': { borderColor: 'black' },
});

const CustomIconButton = styled(IconButton)({
  color: 'black',
  '&:hover': { backgroundColor: 'white', borderColor: 'grey' },
});

const Cart = ({ onClose }) => {
  const { auth } = useAuth();
  const { cart, updateItemQuantity, removeItem, sendOrder } = useCart();
  const [note, setNote] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const navigate = useNavigate();
  const maxQuantity = 10;

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSendOrder = async () => {
    setIsSubmitting(true); 
    try {
      await updateTableNote(auth.tableId, note); 
      await sendOrder();  
      onClose();  
    } catch (error) {
      console.error('Error al enviar el pedido:', error);
      alert('Ocurrió un error al enviar tu pedido. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false); 
    }
  };

  const isSendDisabled = !auth?.tableId || cart.length === 0 || isSubmitting; 

  return (
    <Box sx={{ p: 2 }}>
      {cart.length === 0 ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CustomButton variant="outlined" sx={{ width: 200 }} onClick={() => { onClose(); navigate('/menu'); }}>
            ¡Agregá más productos!
          </CustomButton>
        </Box>
      ) : (
        <>
          <Typography variant="h6" color="black" align="center" mb={2}>
            Agregarás lo siguiente:
          </Typography>
          {cart.map(({ product, cantidad }) => (
            <Box key={product.id_producto} mb={2}>
              <Typography variant="body1">{product.nombre}</Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="body1">${product.precio} x {cantidad}</Typography>
                <Box display="flex" alignItems="center">
                  <CustomIconButton onClick={() => updateItemQuantity(product.id_producto, cantidad - 1)} disabled={cantidad <= 1}>
                    <RemoveIcon />
                  </CustomIconButton>
                  <Typography variant="body1" mx={1}>{cantidad}</Typography>
                  <CustomIconButton onClick={() => updateItemQuantity(product.id_producto, cantidad + 1)} disabled={cantidad >= maxQuantity}>
                    <AddIcon />
                  </CustomIconButton>
                  <CustomIconButton onClick={() => removeItem(product.id_producto)}>
                    <DeleteIcon />
                  </CustomIconButton>
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
                '&:hover fieldset': { borderColor: 'black' },
                '&.Mui-focused fieldset': { borderColor: '#DD98AD' },
              },
              '& .MuiInputLabel-root': { color: 'black' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'black' },
            }}
            margin="normal"
          />

          <Box display="flex" justifyContent="space-between" mt={2}>
            <CustomButton variant="outlined" sx={{ width: 200 }} onClick={() => { onClose(); navigate('/menu'); }}>
              Seguir Pidiendo!
            </CustomButton>

            <CustomButton
              variant="outlined"
              sx={{ width: 200 }}
              onClick={handleOpenDialog}
              disabled={isSendDisabled}
            >
              Enviar Pedido
            </CustomButton>
          </Box>

          
          <ConfirmOrderDialog
            open={openDialog}
            onClose={handleCloseDialog}
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
