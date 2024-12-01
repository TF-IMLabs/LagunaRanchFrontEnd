import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Slide } from '@mui/material';
import { styled } from '@mui/system';
import { useCart } from '../../contexts/CartContext'; 
import CloseIcon from '@mui/icons-material/Close'; 

// Transición personalizada
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
    boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)', // Sombra sutil
    backgroundColor: '#9b8c8d', // Color de fondo blanco
  },
}));

const CenteredDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'black', // Mantén el estilo de fondo
  color: '#DD98AD',           // Mantén el color del texto
  fontWeight: 'bold',         // Mantén el peso de la fuente
  height: '60px',             // Establece una altura para que quede visualmente más centrado
  borderTopLeftRadius: '20px', // Bordes redondeados en la parte superior izquierda
  borderTopRightRadius: '20px', // Bordes redondeados en la parte superior derecha
}));

const CustomButton = styled(Button)(({ theme }) => ({
  color: '#DD98AD',
  backgroundColor:'black',
  borderColor: '#3e2d1f',
  '&:hover': {
    backgroundColor: 'grey',
    borderColor: '#3e2d1f',
  },
}));

const SuccessDialog = ({ open, onClose }) => {
  const { openCombinedDialog } = useCart(); // Usar el contexto para abrir el CombinedDialog

  // Efecto para manejar el foco al abrir el diálogo
  useEffect(() => {
    if (open) {
      const dialogElement = document.querySelector('[role="dialog"]');
      if (dialogElement) {
        dialogElement.focus();
      }
    }
  }, [open]);

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="success-dialog-title" // Etiqueta aria para accesibilidad
      TransitionComponent={Transition} // Añadir la transición
    >
      <CenteredDialogTitle id="success-dialog-title">
        Pedido Enviado
        <IconButton
          onClick={onClose} // Cierra el diálogo
          sx={{ position: 'absolute', right: 8, top: 8 }} // Posiciona la "X" en la esquina superior derecha
          aria-label="cerrar"
        >
          <CloseIcon />
        </IconButton>
      </CenteredDialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          El pedido fue enviado exitosamente.
        </Typography>
        <Typography variant="body1">
          Podrás ver el estado del mismo haciendo clic en "Ver Pedido".
        </Typography>
      </DialogContent>
      <DialogActions>
        <CustomButton onClick={onClose} variant="outlined">
          Cerrar
        </CustomButton>
        <CustomButton onClick={() => {
          onClose(); // Cerrar el diálogo de éxito
          openCombinedDialog(); // Abrir el CombinedDialog
        }} variant="outlined">
          Ver Pedido
        </CustomButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default SuccessDialog;