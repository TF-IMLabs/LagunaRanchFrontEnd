// ConfirmDeleteDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';

const ConfirmDeleteDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          color: 'primary.main',
          bgcolor: 'background.default',
          textAlign: 'center',
        }}
      >
        ¿Estás seguro de que deseas eliminar este pedido?
      </DialogTitle>

      <DialogContent sx={{ bgcolor: 'primary.light' }}>
        <Typography variant="body1" color="text.primary">
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ bgcolor: 'background.default', justifyContent: 'center' }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="outlined" color="error">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
