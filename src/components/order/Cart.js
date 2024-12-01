import React, { useState } from 'react';
import { Button, Typography, Divider, Box, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { useCart } from '../../contexts/CartContext';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateTableNote } from '../../services/tableService'; // Asegúrate de que la ruta sea correcta

// Estilo personalizado para botones
const CustomButton = styled(Button)(({ theme }) => ({
  color: '#DD98AD',
  borderColor: '#9b8c8d',
  backgroundColor:'black',
  '&:hover': {
    borderColor: 'black',
  },
}));

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  color: 'black',
  borderColor: '#3e2d1f',
  '&:hover': {
    backgroundColor: 'white',
    borderColor: 'grey',
  },
}));

const Cart = ({ onClose }) => {
  const { auth } = useAuth(); 
  const { cart, updateItemQuantity, removeItem, sendOrder } = useCart();
  const maxQuantity = 10;
  const navigate = useNavigate(); 

  // Estado para la nota del pedido
  const [note, setNote] = useState('');

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= maxQuantity) {
      updateItemQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeItem(productId);
  };

  const handleSendOrder = async () => {
    try {
      // Actualizar la nota de la mesa
      await updateTableNote(auth.tableId, note); // Asegúrate de que auth.tableId contenga el ID correcto de la mesa

      // Enviar el pedido
      await sendOrder();
      onClose();
    } catch (error) {
      console.error('Error al enviar el pedido:', error);
      alert('Ocurrió un error al enviar tu pedido. Inténtalo de nuevo.');
    }
  };

  const handleGoToMenu = () => {
    onClose();
    navigate('/menu');
  };

  const isSendDisabled = !auth?.tableId || cart.length === 0;

  return (
    <Box sx={{ p: 2 }}>
      {cart.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mt={2}>
          <CustomButton
            variant="outlined"
            onClick={handleGoToMenu}
          >
            ¡Agregá más productos!
          </CustomButton>
        </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="center" mb={2}>
            <Typography variant="h6b">Agregarás lo siguiente:</Typography>
          </Box>
          {cart.map(item => (
            <Box key={item.product.id_producto} mb={2} display="flex" flexDirection="column">
              <Typography variant="body1">{item.product.nombre}</Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                <Typography variant="body1">
                  ${item.product.precio} x {item.cantidad}
                </Typography>
                <Box display="flex" alignItems="center">
                  <CustomIconButton
                    onClick={() => handleUpdateQuantity(item.product.id_producto, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                  >
                    <RemoveIcon />
                  </CustomIconButton>
                  <Typography variant="body1" mx={1}>
                    {item.cantidad}
                  </Typography>
                  <CustomIconButton
                    onClick={() => handleUpdateQuantity(item.product.id_producto, item.cantidad + 1)}
                    disabled={item.cantidad >= maxQuantity}
                  >
                    <AddIcon />
                  </CustomIconButton>
                  <CustomIconButton
                    onClick={() => handleRemoveItem(item.product.id_producto)}
                  >
                    <DeleteIcon />
                  </CustomIconButton>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
          {/* Campo para agregar una nota */}
          <Box mt={2}>
  <TextField
    label="Nota del Pedido"
    variant="outlined"
    fullWidth
    value={note}
    onChange={(e) => setNote(e.target.value)}
    sx={{
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'gray', // Borde gris por defecto
        },
        '&:hover fieldset': {
          borderColor: 'black', // Borde gris al hacer hover
        },
        '&.Mui-focused fieldset': {
          borderColor: 'black', // Borde negro cuando está enfocado
        },
      },
      '& .MuiInputLabel-root': {
        color: 'black', // Color del label por defecto
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: 'black', // Color del label cuando está enfocado
      },
    }}
  />
</Box>

          <Box display="flex" justifyContent="space-between" mt={2}>
            <CustomButton
              variant="outlined"
              onClick={handleGoToMenu}
            >
              Seguir Pidiendo!
            </CustomButton>
            <CustomButton
              variant="outlined"
              onClick={handleSendOrder}
              disabled={isSendDisabled}
            >
              Enviar Pedido
            </CustomButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Cart;
