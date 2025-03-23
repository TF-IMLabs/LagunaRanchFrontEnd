import React, { useState, forwardRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Divider, Box, Slide } from '@mui/material';
import { styled } from '@mui/system';
import { useCart } from '../../contexts/CartContext'; 
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close'; 


const ProductImage = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: '200px',
  objectFit: 'cover',
  marginBottom: theme.spacing(2),
  borderRadius: '10px',         
  border: '2px solid #3A1300',  
}));

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    backdropFilter: 'blur(10px)', 
  },
  '& .MuiPaper-root': {
    borderRadius: '20px',       
    boxShadow: 'none',          
    backgroundColor: '#9b8c8d', 
  },
  '& .MuiDialogTitle-root': {
    color: '#DD98AD',           
    textAlign: 'center',        
    borderTopLeftRadius: '20px', 
    borderTopRightRadius: '20px', 
    backgroundColor: '#000000',  
    position: 'relative', 
  },
  '& .MuiDialogContent-root': {
    backgroundColor: '#9b8c8d', 
    color: '#3b3b3bfa',          
    textAlign: 'center',        
  },
  '& .MuiDialogActions-root': {
    backgroundColor: '#000000', 
    display: 'flex',
    justifyContent: 'center',   
    gap: '10px',                
  }
}));

const CustomButton = styled(Button)(({ theme }) => ({
  color: '#DD98AD',             
  borderColor: '#9b8c8d',         
  '&:hover': {
    backgroundColor: 'grey',   
    borderColor: 'black',       
  },
}));

const CustomIconButton = styled(Button)(({ theme }) => ({
  minWidth: '30px',
  padding: '6px',
  color: 'black',             
  borderColor: 'white',         
  '&:hover': {
    backgroundColor: 'white',   
    borderColor: 'black',       
  },
}));


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProductDialog = ({ open, onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, openCombinedDialog } = useCart(); 

  const handleAddToCart = () => {
    const quantityNumber = Number(quantity);
    if (quantityNumber > 0 && quantityNumber <= 10) {
      addToCart(product, quantityNumber);
      openCombinedDialog(); 
      onClose(); 
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
      <DialogTitle>
        {product?.nombre}
        
        <CustomIconButton
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            color: '#DD98AD',  
          }}
        >
          <CloseIcon />
        </CustomIconButton>
      </DialogTitle>
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
