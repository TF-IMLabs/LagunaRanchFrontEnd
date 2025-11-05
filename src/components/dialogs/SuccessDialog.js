import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Slide,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useCart } from '../../contexts/CartContext';
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SuccessDialog = ({ open, onClose }) => {
  const { openCombinedDialog } = useCart();

  useEffect(() => {
    if (open) {
      const dialogElement = document.querySelector('[role="dialog"]');
      if (dialogElement) {
        dialogElement.focus();
      }
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="success-dialog-title"
      TransitionComponent={Transition}
      sx={{ '& .MuiDialog-container': { backdropFilter: 'blur(10px)' } }}
    >
      <DialogTitle id="success-dialog-title" sx={{ position: 'relative', textAlign: 'center' }}>
        Pedido enviado
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }} aria-label="cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body1">El pedido se envió correctamente.</Typography>
        <Typography variant="body1">Podés seguir su estado desde la opción "Ver pedido".</Typography>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: 'center', gap: 2, pb: 3, flexWrap: 'wrap', px: { xs: 2, sm: 3 } }}
      >
        <Button variant="outlined" onClick={onClose} fullWidth sx={{ maxWidth: 220 }}>
          Cerrar
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            openCombinedDialog();
          }}
          fullWidth
          sx={{ maxWidth: 220 }}
        >
          Ver pedido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SuccessDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SuccessDialog;
