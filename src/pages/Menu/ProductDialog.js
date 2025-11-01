import React, { useState, forwardRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
  Slide,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const ProductImage = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: '200px',
  objectFit: 'cover',
  marginBottom: theme.spacing(2),
  borderRadius: 10,
  border: `2px solid ${theme.palette.primary.main}`,
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  margin: theme.spacing(0, 0.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProductDialog = ({ open, onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const { addToCart, openCombinedDialog } = useCart();
  const { user } = useAuth();

  const handleAddToCart = () => {
    const quantityNumber = Number(quantity);
    if (quantityNumber > 0 && quantityNumber <= 10) {
      addToCart(product, quantityNumber);
      openCombinedDialog();
      onClose();
    } else {
      setFeedback({ severity: 'warning', message: 'La cantidad debe ser entre 1 y 10.' });
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleCloseFeedback = (_event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
      aria-labelledby="product-dialog-title"
    >
      <DialogTitle id="product-dialog-title">
        {product?.nombre}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 10, right: 10 }}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {product?.imagen && (
          <ProductImage src={product.imagen} alt={product.nombre} />
        )}
        <Typography variant="body1" paragraph>
          {product?.descripcion}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" color="text.primary">
            ${product?.precio}
          </Typography>
          <Box display="flex" alignItems="center" aria-live="polite">
            <Tooltip title="Disminuir cantidad">
              <span>
                <QuantityButton onClick={decrementQuantity} disabled={quantity <= 1}>
                  <RemoveIcon fontSize="small" />
                </QuantityButton>
              </span>
            </Tooltip>
            <Typography variant="body1" mx={1} component="span">
              {quantity}
            </Typography>
            <Tooltip title="Aumentar cantidad">
              <span>
                <QuantityButton onClick={incrementQuantity} disabled={quantity >= 10}>
                  <AddIcon fontSize="small" />
                </QuantityButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            openCombinedDialog();
            onClose();
          }}
          variant="outlined"
        >
          Ver pedido
        </Button>
        <Button
          onClick={handleAddToCart}
          variant="contained"
          disabled={!user}
        >
          Añadir al pedido
        </Button>
      </DialogActions>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseFeedback} severity={feedback?.severity ?? 'info'} variant="filled">
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ProductDialog;
