import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { createDirection } from '../../services/userService';

const AddAddressDialog = ({ open, onClose, onSuccess }) => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (loading) return;
    setValue('');
    setError('');
    onClose();
  };

  const handleSave = async () => {
    if (!value.trim()) {
      setError('La direccion es requerida');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await createDirection(value.trim());
      const newId =
        result?.id_direccion ??
        result?.data?.id_direccion ??
        null;
      if (typeof onSuccess === 'function') {
        onSuccess(newId);
      }
      setValue('');
    } catch (err) {
      setError(err?.message ?? 'No pudimos guardar la direccion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Agregar direccion</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Direccion"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoFocus
            fullWidth
          />
          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddAddressDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default AddAddressDialog;
