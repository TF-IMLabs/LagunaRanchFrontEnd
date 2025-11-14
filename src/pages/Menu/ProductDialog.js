import React, { useState, forwardRef } from 'react';
import {
  Dialog,
  DialogTitle,
  Button,
  Typography,
  Divider,
  Box,
  Slide,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PropTypes from 'prop-types';
import { keyframes, styled, alpha } from '@mui/material/styles';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const formatPrice = (value) => {
  const numericValue = Number.parseInt(`${value}`, 10);
  if (Number.isNaN(numericValue)) {
    return '$0';
  }
  return `$${numericValue.toLocaleString('es-AR')}`;
};

const ProductImage = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: 240,
  objectFit: 'cover',
  borderRadius: 12,
  border: `2px solid ${theme.palette.primary.main}`,
  boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: theme.transitions.create(['transform', 'background-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-1px)',
  },
}));

const fadeSlideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AnimatedDialogContent = styled(DialogContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2.5, 3),
  animation: `${fadeSlideIn} 260ms ${theme.transitions.easing.easeOut}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 2.5),
    gap: theme.spacing(1.8),
  },
}));

const AnimatedDialogActions = styled(DialogActions)(({ theme }) => ({
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  padding: theme.spacing(0, 3, 3),
  justifyContent: 'space-between',
  animation: `${fadeSlideIn} 260ms ${theme.transitions.easing.easeOut}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 2.5, 2.5),
  },
}));

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} timeout={{ enter: 260, exit: 200 }} {...props} />;
});

const ProductDialog = ({ open, onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const { addToCart, openCombinedDialog } = useCart();
  const { canAddToCart, isVenueOpen } = useAuth();
  const addDisabledReason = !isVenueOpen
    ? 'El restaurante esta cerrado por el momento.'
    : !canAddToCart
    ? 'Inicia sesion o escanea tu mesa para sumar productos.'
    : '';

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

  const incrementQuantity = () => setQuantity((prev) => Math.min(prev + 1, 10));
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

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
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
    >
      <DialogTitle
        id="product-dialog-title"
        sx={{
          pr: 7,
          color: '#fff',
          fontWeight: 500,
          letterSpacing: '0.04em',
        }}
      >
        {product?.nombre}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 10,
            p: 1.2,
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.25),
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.35),
            },
          }}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ m: 0 }} />

      <AnimatedDialogContent>
        {product?.imagen && <ProductImage src={product.imagen} alt={product.nombre} />}

        {product?.descripcion && (
          <Typography variant="body1" sx={{ lineHeight: 1.55 }}>
            {product.descripcion}
          </Typography>
        )}

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h5" color="text.primary" sx={{ fontWeight: 600 }}>
            {formatPrice(product?.precio)}
          </Typography>

          <Box display="flex" alignItems="center" aria-live="polite">
            <Tooltip title="Disminuir cantidad">
              <span>
                <QuantityButton onClick={decrementQuantity} disabled={quantity <= 1}>
                  <RemoveIcon fontSize="small" />
                </QuantityButton>
              </span>
            </Tooltip>
            <Typography
              variant="body1"
              component="span"
              sx={{ mx: 1, minWidth: 28, textAlign: 'center', fontWeight: 500 }}
            >
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

        <Divider />
      </AnimatedDialogContent>

      <AnimatedDialogActions>
        <Tooltip title={addDisabledReason || 'Agregar este producto al pedido'}>
          <span style={{ width: '100%' }}>
            <Button
              onClick={handleAddToCart}
              variant="contained"
              disabled={!canAddToCart}
              fullWidth
              sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
            >
              A??adir al pedido
            </Button>
          </span>
        </Tooltip>
      </AnimatedDialogActions>

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

ProductDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.shape({
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    imagen: PropTypes.string,
    precio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
};

export default ProductDialog;
