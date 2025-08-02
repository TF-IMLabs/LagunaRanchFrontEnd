import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { createWaiter } from '../../../../services/waiterService';

const CreateWaiterDialog = ({ open, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [turno, setTurno] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (!turno) {
      setError(true);
      return;
    }

    try {
      const { message } = await createWaiter(nombre, turno);
      setSnackbarMessage(message);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onClose();
      setNombre('');
      setTurno('');
      setError(false);
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          Crear Nuevo Mozo
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            variant="outlined"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <FormControl fullWidth margin="dense" variant="outlined" error={error}>
            <InputLabel id="turno-select-label">Turno</InputLabel>
            <Select
              labelId="turno-select-label"
              value={turno}
              onChange={(e) => {
                setTurno(e.target.value);
                setError(false);
              }}
            >
              <MenuItem value="Mañana">Mañana</MenuItem>
              <MenuItem value="Tarde">Tarde</MenuItem>
              <MenuItem value="Noche">Noche</MenuItem>
            </Select>
            {error && <FormHelperText>Seleccionar un turno es obligatorio</FormHelperText>}
          </FormControl>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', gap: 16 }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="outlined">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateWaiterDialog;
