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

// Estilos personalizados
const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    backdropFilter: 'blur(10px)', // Añadir desenfoque de fondo
  },
  '& .MuiPaper-root': {
    borderRadius: '20px', // Bordes redondeados
    boxShadow: 'none', // Eliminar sombra para evitar el borde visible
    //backgroundColor: 'rgba(58, 19, 0, 0.7)', // Fondo uniforme para todo el diálogo
  },
  '& .MuiDialogTitle-root': {
    backgroundColor: 'black',
    color: '#DD98AD', // Cambiar color de fuente a blanco
    textAlign: 'center', // Centrar el texto del título
    borderTopLeftRadius: '20px', // Bordes redondeados
    borderTopRightRadius: '20px', // Bordes redondeados
  },
}));

const CenteredDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#ffffff',           // Color de texto blanco
  fontWeight: 'bold',         // Negrita para el título
  height: '60px',             // Altura para centrar visualmente
  borderTopLeftRadius: '20px', // Bordes redondeados en la parte superior izquierda
  borderTopRightRadius: '20px', // Bordes redondeados en la parte superior derecha
}));

const CustomDialogContent = styled(DialogContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#9b8c8d', // Color de fondo del contenido
  color: 'black',           // Color de texto blanco
  padding: theme.spacing(2),
  maxHeight: 'calc(100vh - 100px)', // Limitar altura máxima del diálogo
  overflowY: 'auto', // Permitir desplazamiento vertical solo si es necesario
}));

const CombinedDialog = () => {
  const { combinedDialogOpen, closeCombinedDialog } = useCart(); // Usamos el estado y el cierre del contexto
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Determina si es un dispositivo móvil

  // Efecto para manejar el foco al abrir el diálogo
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
      fullScreen={isMobile} // Fullscreen en móvil
      aria-labelledby="combined-dialog-title" // Añadimos etiqueta aria para accesibilidad
      TransitionComponent={Transition} // Añadimos la transición
    >
      <CenteredDialogTitle id="combined-dialog-title">
        Tu Pedido Actual
        <IconButton
  onClick={closeCombinedDialog} // Cierra el diálogo
  sx={{ 
    position: 'absolute', 
    right: 8, 
    top: 8, 
    color: '#DD98AD' // Rosa
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
