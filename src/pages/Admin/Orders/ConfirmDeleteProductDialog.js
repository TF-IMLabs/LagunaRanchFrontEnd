import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

const ConfirmDeleteProductDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: (theme) => theme.palette.background.paper,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        ¿Estás seguro de que deseas eliminar este producto?
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: (theme) => theme.palette.background.default,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{
            borderColor: 'text.secondary',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.primary',
              color: 'text.primary',
            },
          }}
        >
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteProductDialog;
