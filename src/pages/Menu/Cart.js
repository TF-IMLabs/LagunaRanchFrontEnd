import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import {
  Button,
  Typography,
  Divider,
  Box,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
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
  const [feedback, setFeedback] = useState(null);
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
      setFeedback({
        severity: 'error',
        message: 'Ocurrió un error al enviar tu pedido. Intentá nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseFeedback = (_event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback(null);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {cart.length === 0 ? (
        canShowAddMoreButton && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="outlined"
              onClick={() => {
                onClose();
                navigate('/menu');
              }}
              fullWidth
              sx={{ maxWidth: 320 }}
            >
              Sumá productos
            </Button>
          </Box>
        )
      ) : (
        <>
          {cart.map(({ product, cantidad }) => (
            <Box
              key={product.id_producto}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                boxShadow: '0 6px 16px rgba(0,0,0,0.28)',
              }}
            >
              <Typography variant="h6" component="h3" translate="no">
                {product.nombre}
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
                mt={1.5}
              >
                <Typography variant="body1">
                  ${product.precio} × {cantidad}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Tooltip title={`Disminuir cantidad de ${product.nombre}`}>
                    <span>
                      <IconButton
                        onClick={() => updateItemQuantity(product.id_producto, cantidad - 1)}
                        disabled={cantidad <= 1}
                        aria-label={`Disminuir cantidad de ${product.nombre}`}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Typography variant="body1" component="span" aria-live="polite">
                    {cantidad}
                  </Typography>
                  <Tooltip title={`Aumentar cantidad de ${product.nombre}`}>
                    <span>
                      <IconButton
                        onClick={() => updateItemQuantity(product.id_producto, cantidad + 1)}
                        disabled={cantidad >= 10}
                        aria-label={`Aumentar cantidad de ${product.nombre}`}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={`Quitar ${product.nombre}`}>
                    <IconButton
                      onClick={() => removeItem(product.id_producto)}
                      aria-label={`Quitar ${product.nombre} del pedido`}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}

          <TextField
            label="Nota del pedido"
            variant="outlined"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            margin="normal"
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: theme.palette.primary.main },
                '&:hover fieldset': { borderColor: theme.palette.primary.light },
                '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: theme.palette.text.primary,
              },
            }}
          />

          <Box
            mt={2}
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={2}
            justifyContent="space-between"
          >
            <Button
              variant="outlined"
              onClick={() => {
                onClose();
                navigate('/menu');
              }}
              fullWidth
            >
              Seguir pidiendo
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenDialog(true)}
              disabled={isSendDisabled}
              fullWidth
            >
              Enviar pedido
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

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback?.severity ?? 'info'}
          variant="filled"
          elevation={6}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

Cart.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Cart;
