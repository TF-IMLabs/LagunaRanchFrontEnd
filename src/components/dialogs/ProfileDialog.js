// src/components/dialogs/ProfileDialog.jsx
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Typography, IconButton, Grid, Box, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUserById,
  updateUser,
  createDirection,
  updateDirection,
  deleteDirection,
  recoverPassword
} from '../../services/userService';

const ProfileDialog = ({ open, onClose }) => {
  const { user } = useAuth();

  // ✅ Detectamos si es invitado por el email
  const isGuest = user?.email?.toLowerCase().startsWith('invitado');

  const [userData, setUserData] = useState({ nombre: '', email: '', telefono: '', fecha_nac: '', direcciones: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const [showRecover, setShowRecover] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoverError, setRecoverError] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await getUserById();
        setUserData({ ...response, direcciones: response.direcciones || [] });
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchUser();
  }, [open, user]);

  useEffect(() => {
    const validate = (data) => {
      const errs = {};

      if (!data.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
      if (!data.email.trim()) errs.email = 'El email es obligatorio.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Email no válido.';
      if (data.telefono && !/^\d*$/.test(data.telefono)) errs.telefono = 'Sólo números permitidos en teléfono.';
      if (data.fecha_nac && isNaN(new Date(data.fecha_nac).getTime())) errs.fecha_nac = 'Fecha inválida.';

      if (data.direcciones.some(d => !d.direccion.trim())) errs.direcciones = 'Todas las direcciones deben estar completas.';

      setErrors(errs);

      return Object.keys(errs).length === 0;
    };

    setIsValid(validate(userData));
  }, [userData]);

  const handleUserChange = (field) => (e) => {
    if (isGuest) return;

    if (field === 'telefono') {
      const val = e.target.value;
      if (/^\d*$/.test(val)) {
        setUserData({ ...userData, [field]: val });
      }
    } else {
      setUserData({ ...userData, [field]: e.target.value });
    }
  };

  const handleDirectionChange = (index, value) => {
    if (isGuest) return;

    const updated = [...userData.direcciones];
    updated[index].direccion = value;
    setUserData({ ...userData, direcciones: updated });
  };

  const handleAddDirection = () => {
    if (isGuest) return;

    setUserData(prev => ({ ...prev, direcciones: [...prev.direcciones, { direccion: '' }] }));
  };

  const handleRemoveDirection = async (index) => {
    if (isGuest) return;

    const direccion = userData.direcciones[index];
    if (direccion.id_direccion) {
      try {
        await deleteDirection(direccion.id_direccion);
      } catch (err) {
        console.error('Error al eliminar la dirección:', err);
      }
    }
    const updated = [...userData.direcciones];
    updated.splice(index, 1);
    setUserData({ ...userData, direcciones: updated });
  };

  const handleSave = async () => {
    if (isGuest || !isValid) return;

    setSaving(true);
    try {
      await updateUser({
        email: userData.email,
        nombre: userData.nombre,
        telefono: userData.telefono,
        fecha_nac: userData.fecha_nac || null,
      });

      for (const dir of userData.direcciones) {
        if (dir.id_direccion) {
          await updateDirection({ id_direccion: dir.id_direccion, direccion: dir.direccion });
        } else if (dir.direccion) {
          await createDirection({ direccion: dir.direccion, clientId: user.id });
        }
      }

      onClose();
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRecoverClick = () => {
    if (isGuest) return;
    setShowRecover(true);
    setRecoverError('');
    setRecoverSuccess('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRecoverCancel = () => {
    setShowRecover(false);
    setRecoverError('');
    setRecoverSuccess('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRecoverSubmit = async () => {
    if (isGuest) return;
    setRecoverError('');
    setRecoverSuccess('');
    if (!newPassword || !confirmPassword) {
      setRecoverError('Por favor completa ambos campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setRecoverError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await recoverPassword({ email: userData.email, newPassword });
      setRecoverSuccess('Contraseña actualizada con éxito.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowRecover(false);
      }, 2000);
    } catch (error) {
      setRecoverError(error.message || 'Error al recuperar la contraseña.');
    }
  };

  const canSave = () => {
    if (saving || loading) return false;
    if (isGuest) return false;
    return isValid;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Mi Perfil</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre"
              value={userData.nombre}
              onChange={handleUserChange('nombre')}
              error={!!errors.nombre}
              helperText={errors.nombre}
              disabled={isGuest}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={userData.email}
              onChange={handleUserChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              disabled={isGuest}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Teléfono"
              value={userData.telefono}
              onChange={handleUserChange('telefono')}
              error={!!errors.telefono}
              helperText={errors.telefono}
              disabled={isGuest}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Fecha de nacimiento"
              type="date"
              value={userData.fecha_nac || ''}
              onChange={handleUserChange('fecha_nac')}
              InputLabelProps={{ shrink: true }}
              error={!!errors.fecha_nac}
              helperText={errors.fecha_nac}
              disabled={isGuest}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Direcciones</Typography>
            {userData.direcciones.map((dir, index) => (
              <Box key={index} display="flex" alignItems="center" mt={1}>
                <TextField
                  fullWidth
                  value={dir.direccion}
                  onChange={(e) => handleDirectionChange(index, e.target.value)}
                  label={`Dirección ${index + 1}`}
                  sx={{ flexGrow: 1, mr: 1 }}
                  error={!!errors.direcciones && !dir.direccion.trim()}
                  disabled={isGuest}
                />
                {!isGuest && (
                  <Tooltip title={`Eliminar dirección ${index + 1}`}>
                    <span>
                      <IconButton
                        onClick={() => handleRemoveDirection(index)}
                        color="error"
                        aria-label={`Eliminar dirección ${index + 1}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>
            ))}
            {!!errors.direcciones && (
              <Typography color="error" variant="body2" mt={1}>
                {errors.direcciones}
              </Typography>
            )}
            {!isGuest && (
              <Button onClick={handleAddDirection} startIcon={<AddIcon />} sx={{ mt: 1 }}>
                Agregar dirección
              </Button>
            )}
          </Grid>

          {!showRecover && !isGuest && (
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={handleRecoverClick}>
                Recuperar Contraseña
              </Button>
            </Grid>
          )}

          {showRecover && !isGuest && (
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Cambiar contraseña
              </Typography>
              <TextField
                fullWidth
                label="Nueva contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Confirmar nueva contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              {recoverError && (
                <Typography color="error" sx={{ mb: 1 }}>
                  {recoverError}
                </Typography>
              )}
              {recoverSuccess && (
                <Typography color="success.main" sx={{ mb: 1 }}>
                  {recoverSuccess}
                </Typography>
              )}
              <Box display="flex" justifyContent="space-between">
                <Button onClick={handleRecoverCancel} color="secondary">
                  Cancelar
                </Button>
                <Button variant="contained" color="primary" onClick={handleRecoverSubmit}>
                  Guardar contraseña
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={saving}>
          Cancelar
        </Button>
        {!isGuest && (
          <Button
            onClick={handleSave}
            startIcon={<SaveIcon />}
            variant="contained"
            color="primary"
            disabled={!canSave()}
          >
            Guardar cambios
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;
