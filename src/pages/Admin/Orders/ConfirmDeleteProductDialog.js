import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

const ConfirmDeleteProductDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>¿Estás seguro de que deseas eliminar este producto?</DialogTitle>
      <DialogContent sx={{ backgroundColor: (theme) => theme.palette.accent.main }}>
        <Typography variant="body1" color="text.primary">
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="outlined" color="error">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteProductDialog;
