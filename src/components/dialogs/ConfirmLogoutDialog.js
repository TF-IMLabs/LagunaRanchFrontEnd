import PropTypes from 'prop-types';
import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const ConfirmLogoutDialog = ({ open, onClose, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="confirm-logout-title"
    aria-describedby="confirm-logout-description"
    PaperProps={{
      sx: {
        bgcolor: (theme) => theme.palette.background.paper,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      },
    }}
  >
    <DialogTitle
      id="confirm-logout-title"
      sx={{ color: 'primary.main', fontWeight: 600, textAlign: 'center' }}
    >
      Confirmar salida
    </DialogTitle>
    <DialogContent sx={{ textAlign: 'center' }}>
      <DialogContentText id="confirm-logout-description" color="text.secondary">
        ¿Estás seguro de que quieres cerrar sesión?
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', gap: 1.5, pb: 3 }}>
      <Button onClick={onClose} color="inherit" variant="outlined">
        Cancelar
      </Button>
      <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
        Aceptar
      </Button>
    </DialogActions>
  </Dialog>
);

ConfirmLogoutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ConfirmLogoutDialog;
