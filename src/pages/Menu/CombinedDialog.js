import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Divider,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme
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
  const { combinedDialogOpen, closeCombinedDialog } = useCart();
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

      <DialogContent>
        <Box mb={2}>
          <Order onClose={closeCombinedDialog} />
        </Box>
        <Divider />
        <Box>
          <Cart onClose={closeCombinedDialog} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CombinedDialog;
