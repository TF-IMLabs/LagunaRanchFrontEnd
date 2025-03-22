import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Divider, IconButton, Slide, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import Cart from '../order/Cart'; 
import Order from '../order/Order'; 
import { useCart } from '../../contexts/CartContext'; 
import CloseIcon from '@mui/icons-material/Close'; 

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    backdropFilter: 'blur(10px)', 
  },
  '& .MuiPaper-root': {
    borderRadius: '20px', 
    boxShadow: 'none', 
  },
  '& .MuiDialogTitle-root': {
    backgroundColor: 'black',
    color: '#DD98AD', 
    textAlign: 'center', 
    borderTopLeftRadius: '20px', 
    borderTopRightRadius: '20px', 
  },
}));

const CenteredDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#ffffff',           
  fontWeight: 'bold',         
  height: '60px',             
  borderTopLeftRadius: '20px', 
  borderTopRightRadius: '20px', 
}));

const CustomDialogContent = styled(DialogContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#9b8c8d', 
  color: 'black',           
  padding: theme.spacing(2),
  maxHeight: 'calc(100vh - 100px)', 
  overflowY: 'auto', 
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
    <CustomDialog
      open={combinedDialogOpen}
      onClose={closeCombinedDialog}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile} 
      aria-labelledby="combined-dialog-title" 
      TransitionComponent={Transition} 
    >
      <CenteredDialogTitle id="combined-dialog-title">
        Tu Pedido Actual
        <IconButton
  onClick={closeCombinedDialog} 
  sx={{ 
    position: 'absolute', 
    right: 8, 
    top: 8, 
    color: '#DD98AD' 
  }} 
  aria-label="cerrar"
>
  <CloseIcon />
</IconButton>
      </CenteredDialogTitle>
      <CustomDialogContent>
        <Box display="flex" flexDirection="column">
          <Box mb={2}>
            <Order onClose={closeCombinedDialog} />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Cart onClose={closeCombinedDialog} />
          </Box>
        </Box>
      </CustomDialogContent>
    </CustomDialog>
  );
};

export default CombinedDialog;
