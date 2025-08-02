import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { createTable } from '../../../../services/tableService';

const CreateTableDialog = ({ open, onClose, waiters = [] }) => {
  const [capacidad, setCapacidad] = useState('');
  const [id_mozo, setIdMozo] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (!id_mozo) {
      setError(true);
      return;
    }

    try {
      await createTable({ capacidad, id_mozo });
      onClose();
      setCapacidad('');
      setIdMozo('');
      setError(false);
    } catch (error) {
      console.error('Error al crear la mesa:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Crea una Nueva Mesa
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Capacidad"
          type="number"
          fullWidth
          variant="outlined"
          value={capacidad}
          onChange={(e) => setCapacidad(e.target.value)}
        />

        <FormControl fullWidth margin="dense" variant="outlined" error={error}>
          <InputLabel id="mozo-select-label">Seleccionar Mozo</InputLabel>
          <Select
            labelId="mozo-select-label"
            value={id_mozo}
            onChange={(e) => {
              setIdMozo(e.target.value);
              setError(false);
            }}
          >
            {waiters.length > 0 ? (
              waiters.map((waiter) => (
                <MenuItem key={waiter.id_mozo} value={waiter.id_mozo}>
                  {waiter.nombre}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No hay mozos disponibles</MenuItem>
            )}
          </Select>
          {error && <FormHelperText>Seleccionar un mozo es obligatorio</FormHelperText>}
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
  );
};

export default CreateTableDialog;
