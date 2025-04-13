
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';

const CustomButton = styled(Button)({
  color: '#DD98AD',
  backgroundColor: 'black',
  borderColor: '#9b8c8d',
  '&:hover': { borderColor: '#DD98AD' },
});

const StyledDialogTitle = styled(DialogTitle)({
  color: '#DD98AD',
  backgroundColor: 'black',
  textAlign: 'center',
});

const StyledDialogActions = styled(DialogActions)({
  backgroundColor: 'black',
  justifyContent: 'center',
});

const ConfirmDeleteProductDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <StyledDialogTitle>¿Estás seguro de que deseas eliminar este producto?</StyledDialogTitle>
      <DialogContent sx={{ backgroundColor: '#9b8c8d' }}>
        <Typography variant="body1" color="black">
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <StyledDialogActions>
        <CustomButton onClick={onClose} variant="outlined">
          Cancelar
        </CustomButton>
        <CustomButton onClick={onConfirm} variant="outlined" color="error">
          Eliminar
        </CustomButton>
      </StyledDialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteProductDialog;
