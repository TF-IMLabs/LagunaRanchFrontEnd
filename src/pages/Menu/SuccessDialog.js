import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Slide } from '@mui/material';
import { useCart } from '../../contexts/CartContext'; 
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles'; 


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SuccessDialog = ({ open, onClose }) => {
  const { openCombinedDialog } = useCart(); 
  const theme = useTheme(); 

  
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
      sx={{
        '& .MuiDialog-container': {
          backdropFilter: 'blur(10px)', 
        },
      }}
    >
      <DialogTitle id="success-dialog-title" sx={{ ...theme.components.MuiDialogTitle.styleOverrides.root }}>
        Pedido Enviado
        <IconButton
          onClick={onClose} 
          sx={{ position: 'absolute', right: 8, top: 8 }} 
          aria-label="cerrar"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ ...theme.components.MuiDialogContent.styleOverrides.root }}>
        <Typography variant="body1" paragraph>
          El pedido fue enviado exitosamente.
        </Typography>
        <Typography variant="body1">
          Podrás ver el estado del mismo haciendo clic en "Ver Pedido".
        </Typography>
      </DialogContent>
      <DialogActions sx={{ ...theme.components.MuiDialogActions.styleOverrides.root }}>
        <Button sx={{ ...theme.components.MuiButton.styleOverrides.root }} onClick={onClose} variant="outlined">
          Cerrar
        </Button>
        <Button sx={{ ...theme.components.MuiButton.styleOverrides.root }} onClick={() => { onClose(); openCombinedDialog(); }} variant="outlined">
          Ver Pedido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessDialog;
