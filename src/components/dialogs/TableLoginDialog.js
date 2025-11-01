import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Button, Box, Typography, Divider, CircularProgress
} from '@mui/material';
import {
  Info as InfoIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  RoomService as RoomServiceIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import AuthDialog from './AuthDialog';
import { callWaiter } from '../../services/waiterService';

const TableLoginDialog = ({ open, onClose }) => {
  const { tableId, login, register } = useAuth();
  const { openCombinedDialog } = useCart();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [error, setError] = useState('');
  const [waiterMessage, setWaiterMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [callingWaiter, setCallingWaiter] = useState(false);

  const GUEST_PASSWORD = 'Invitad@Resto!';

 const handleGuest = async () => {
  const email = `Invitado${tableId}@resto.com`;
  setLoading(true);
  setError('');

  try {
    // Intentar loguearse primero
    await login({ email, password: GUEST_PASSWORD, tableId });
  } catch (loginError) {
    // Si el login falla con 404, crear usuario
    if (loginError.response?.status === 500) {
      try {
        await register({
          email,
          password: GUEST_PASSWORD,
          nombre: `Invitado Mesa ${tableId}`,
          telefono: '',
          direccion: '',
          fecha_nac: '',
        });
        // Luego loguear
        await login({ email, password: GUEST_PASSWORD, tableId });
      } catch (registerError) {
        setError('No se pudo crear el usuario invitado.');
        setLoading(false);
        return;
      }

    } else {
      setError('Error al ingresar como invitado.');
      setLoading(false);
      return;
    }
  }

  setLoading(false);
  onClose();
  openCombinedDialog();
}
  const handleCallWaiter = async () => {
    setCallingWaiter(true);
    setError('');
    try {
      await callWaiter(tableId);
      setWaiterMessage('El mozo fue notificado 🧑‍🍳');
      setTimeout(() => setWaiterMessage(''), 3000);
    } catch (e) {
      setError('No se pudo llamar al mozo. ❌');
    } finally {
      setCallingWaiter(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{`Mesa ${tableId}`}</DialogTitle>
      <DialogContent>
        {!showLoginForm ? (
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <InfoIcon color="info" />
              <Typography variant="body2" color="text.secondary">
                Elegí cómo querés ingresar. Podés hacer tu pedido como invitado, iniciar sesión con tu cuenta o llamar al mozo si necesitás ayuda.
              </Typography>
            </Box>

            <Divider />

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GroupIcon />}
              onClick={handleGuest}
              disabled={loading || callingWaiter}
            >
              {loading ? 'Ingresando...' : 'Ingresar como invitado'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={() => setShowLoginForm(true)}
              disabled={loading || callingWaiter}
            >
              Ingresar con tu cuenta
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              startIcon={callingWaiter ? <CircularProgress size={20} color="inherit" /> : <RoomServiceIcon />}
              onClick={handleCallWaiter}
              disabled={loading || callingWaiter}
            >
              {callingWaiter ? 'Llamando al mozo...' : 'Llamar al Mozo'}
            </Button>

            {error && (
              <Typography color="error" mt={1}>
                {error}
              </Typography>
            )}
            {waiterMessage && (
              <Typography color="success.main" mt={1}>
                {waiterMessage}
              </Typography>
            )}
          </Box>
        ) : (
          <AuthDialog
            open={true}
            onClose={onClose}
            loginParams={{ tableId }}
            onLoginSuccess={() => {
              onClose();
              openCombinedDialog();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TableLoginDialog;
