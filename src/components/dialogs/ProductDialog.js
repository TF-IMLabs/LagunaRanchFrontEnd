import React, { useState, forwardRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Divider, Box, Slide } from '@mui/material';
import { styled } from '@mui/system';
import { useCart } from '../../contexts/CartContext'; // Usar el contexto de carrito
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

// Estilos personalizados
const ProductImage = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: '200px',
  objectFit: 'cover',
  marginBottom: theme.spacing(2),
  borderRadius: '10px',         // Bordes redondeados para la imagen
  border: '2px solid #3A1300',  // Borde oscuro para enmarcar la imagen
}));

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    backdropFilter: 'blur(10px)', // Añadir desenfoque de fondo
  },
  '& .MuiPaper-root': {
    borderRadius: '20px',       // Bordes redondeados
    boxShadow: 'none',          // Eliminar sombra para evitar borde visible
    backgroundColor: '#9b8c8d', // Fondo gris para todo el diálogo
  },
  '& .MuiDialogTitle-root': {
    color: '#DD98AD',           // Color de texto rosa
    textAlign: 'center',        // Centrar el texto del título
    borderTopLeftRadius: '20px', // Bordes redondeados
    borderTopRightRadius: '20px', // Bordes redondeados
    backgroundColor: '#000000',  // Fondo negro en el título
  },
  '& .MuiDialogContent-root': {
    backgroundColor: '#9b8c8d', // Fondo gris para el contenido
    color: 'black',           // Color de texto rosa
    textAlign: 'center',        // Centrar el texto del contenido
  },
  '& .MuiDialogActions-root': {
    backgroundColor: '#000000', // Fondo negro para las acciones
  }
}));

const CustomButton = styled(Button)(({ theme }) => ({
  color: '#DD98AD',             // Color de texto rosa
  borderColor: '#9b8c8d',         // Color de borde negro
  '&:hover': {
    backgroundColor: 'grey',   // Fondo negro en estado hover
    borderColor: 'black',       // Borde negro en estado hover
  },
}));

const CustomIconButton = styled(Button)(({ theme }) => ({
  minWidth: '30px',
  padding: '6px',
  color: 'black',             // Color de icono rosa
  borderColor: 'black',         // Color de borde negro
  '&:hover': {
    backgroundColor: 'white',   // Fondo negro en estado hover
    borderColor: 'black',       // Borde negro en estado hover
  },
}));

// Transición para el diálogo
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProductDialog = ({ open, onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, openCombinedDialog } = useCart(); // Usamos openOrderDialog para abrir el CombinedDialog

  const handleAddToCart = () => {
    const quantityNumber = Number(quantity);
    if (quantityNumber > 0 && quantityNumber <= 10) {
      addToCart(product, quantityNumber);
      openCombinedDialog(); // Abrimos el CombinedDialog después de añadir al carrito
      onClose(); // Cerramos el diálogo después de añadir al carrito
    } else {
      alert('La cantidad debe ser entre 1 y 10.');
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  return (
    <CustomDialog open={open} onClose={onClose} TransitionComponent={Transition}>
      <DialogTitle>{product?.nombre}</DialogTitle>
      <DialogContent>
        {product?.imagen && (
          <ProductImage src={product.imagen} alt={product.nombre} />
        )}
        <Typography variant="body1" paragraph>
          {product?.descripcion}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" color="textPrimary">
            ${product?.precio}
          </Typography>
          <Box display="flex" alignItems="center">
            <CustomIconButton onClick={decrementQuantity} disabled={quantity <= 1}>
              <RemoveIcon />
            </CustomIconButton>
            <Typography variant="body1" mx={1}>
              {quantity}
            </Typography>
            <CustomIconButton onClick={incrementQuantity} disabled={quantity >= 10}>
              <AddIcon />
            </CustomIconButton>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
      </DialogContent>
      <DialogActions>
        <CustomButton onClick={onClose} variant="outlined">
          Cancelar
        </CustomButton>
        <CustomButton onClick={handleAddToCart} variant="outlined">
          Añadir al Pedido
        </CustomButton>
        <CustomButton onClick={() => { openCombinedDialog(); onClose(); }} variant="outlined">
          Ver Pedido
        </CustomButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default ProductDialog;
