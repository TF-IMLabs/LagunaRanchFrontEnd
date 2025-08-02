import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';

const ConfirmOrderDialog = ({ open, onClose, onSendOrder, cart, note, isSubmitting }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          color: 'primary.main',           
          backgroundColor: 'background.paper', 
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Confirmar Pedido
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: 'secondary.main'  }}>
        <Box display="flex" flexDirection="column" gap={1}>
          {cart.map(({ product, cantidad }) => (
            <Box key={product.id_producto} display="flex" justifyContent="space-between" width="100%">
              <Typography variant="body1" color="text.primary">
                {product.nombre}
              </Typography>
              <Typography variant="body1" color="text.primary">
                x {cantidad}
              </Typography>
            </Box>
          ))}
        </Box>

        {note && (
          <>
            <Divider sx={{ my: 2, bgcolor: 'text.primary' }} />
            <Typography
              variant="body2"
              color="text.primary"
              fontStyle="italic"
              textAlign="center"
            >
              Nota: {note}
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ backgroundColor: 'background.paper', justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
        >
          Cancelar
        </Button>

        <Button
          onClick={onSendOrder}
          variant="outlined"
          color="primary"
          disabled={isSubmitting}
          sx={{ minWidth: 100 }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="primary" />
          ) : (
            'Pedir'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmOrderDialog;
