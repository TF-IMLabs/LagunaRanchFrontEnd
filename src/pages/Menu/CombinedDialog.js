import React, { useEffect } from 'react';
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Slide,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/system';
import Cart from './Cart';
import Order from './Order';
import { useCart } from '../../contexts/CartContext';
import CloseIcon from '@mui/icons-material/Close';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});



const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  color: theme.palette.secondary.contrastText,
}));


const CombinedDialog = () => {
  const { combinedDialogOpen, closeCombinedDialog, cart, venueIsOpen } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (combinedDialogOpen) {
      const dialogElement = document.querySelector('[role="dialog"]');
      if (dialogElement) {
        dialogElement.focus();
      }
    }
  }, [combinedDialogOpen]);

  return (
    <Dialog
      open={combinedDialogOpen}
      onClose={closeCombinedDialog}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      aria-labelledby="combined-dialog-title"
      TransitionComponent={Transition}
    >
      <DialogTitle id="combined-dialog-title">
        Tu Pedido Actual
        <StyledCloseButton onClick={closeCombinedDialog} aria-label="cerrar">
          <CloseIcon />
        </StyledCloseButton>
      </DialogTitle>

      <DialogContent
        sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: { xs: 2, sm: 3 },
      }}
    >
        {!venueIsOpen && (
          <Alert severity="warning">
            El restaurante esta cerrado. Podes explorar el menu pero no realizar pedidos.
          </Alert>
        )}
        <Box>
          <Order onClose={closeCombinedDialog} />
        </Box>
        <Divider />
        <Box>
          {cart?.length ? (
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Productos sin enviar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ajusta cantidades o agrega notas antes de enviar los nuevos pedidos.
              </Typography>
            </Box>
          ) : null}
          <Cart onClose={closeCombinedDialog} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CombinedDialog;
