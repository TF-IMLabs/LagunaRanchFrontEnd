import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Divider, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';

// Botón personalizado
const CustomButton = styled(Button)({
  color: '#DD98AD',
  backgroundColor: 'black',
  borderColor: '#9b8c8d',
  '&:hover': { borderColor: '#DD98AD' },
});

// Título centrado
const StyledDialogTitle = styled(DialogTitle)({
  color: '#DD98AD',
  backgroundColor: 'black',
  textAlign: 'center',
});

// Acciones centradas
const StyledDialogActions = styled(DialogActions)({
  backgroundColor: 'black',
  justifyContent: 'center',
});

const ConfirmOrderDialog = ({ open, onClose, onSendOrder, cart, note, isSubmitting }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <StyledDialogTitle>Confirmar Pedido</StyledDialogTitle>
      <DialogContent sx={{ backgroundColor: '#9b8c8d' }}>
        {cart.map(({ product, cantidad }) => (
          <Box key={product.id_producto} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body1" color="black">
              {product.nombre} x {cantidad}
            </Typography>
          </Box>
        ))}
        {note && (
          <>
            <Divider sx={{ my: 2, backgroundColor: 'black' }} />
            <Typography variant="body2" color="black" fontStyle="italic">
              Nota: {note}
            </Typography>
          </>
        )}
      </DialogContent>
      <StyledDialogActions>
        <CustomButton onClick={onClose} variant="outlined">
          Cancelar
        </CustomButton>
        <CustomButton 
          onClick={onSendOrder} 
          variant="outlined" 
          disabled={isSubmitting} // Deshabilitar el botón mientras está enviando
        >
          {isSubmitting ? (
            <CircularProgress size={24} sx={{ color: '#DD98AD' }} />
          ) : (
            'Pedir'
          )}
        </CustomButton>
      </StyledDialogActions>
    </Dialog>
  );
};

export default ConfirmOrderDialog;
