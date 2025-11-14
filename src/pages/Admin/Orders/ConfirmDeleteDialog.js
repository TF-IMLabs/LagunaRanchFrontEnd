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
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: (theme) => theme.palette.background.paper,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DialogTitle sx={{ color: 'primary.main', fontWeight: 600, textAlign: 'center' }}>
        ¿Estás seguro de que deseas eliminar este pedido?
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 1.5, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
