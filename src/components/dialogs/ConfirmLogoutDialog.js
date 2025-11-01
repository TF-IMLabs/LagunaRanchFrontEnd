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
  >
    <DialogTitle id="confirm-logout-title">Confirmar salida</DialogTitle>
    <DialogContent>
      <DialogContentText id="confirm-logout-description">
        ¿Estás seguro de que querés cerrar sesión?
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
      <Button onClick={onClose} color="primary" variant="outlined">
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
