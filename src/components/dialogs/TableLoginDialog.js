import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Info as InfoIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  RoomService as RoomServiceIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import AuthDialog from './AuthDialog';
import { callWaiter } from '../../services/waiterService';
import { ERROR_CODES } from '../../services/apiErrorCodes';

const STRINGS = {
  invalidTable: 'No se detectó una mesa válida.',
  guestError: 'Error al ingresar como invitado.',
  tableValidation: 'No pudimos validar la mesa. Verificá el código QR e intentá nuevamente.',
  sessionExpired: 'Tu sesión caducó. Ingresá nuevamente.',
  waiterCallError: 'No se pudo llamar al mozo. Intentá nuevamente.',
  helperText:
    'Elegí cómo querés ingresar. Podés hacer tu pedido como invitado, iniciar sesión con tu cuenta o llamar al mozo si necesitás ayuda.',
};

const TableLoginDialog = ({ open, onClose }) => {
  const { tableId, loginGuest, isLoading: authLoading, token } = useAuth();
  const { openCombinedDialog } = useCart();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [error, setError] = useState('');
  const [waiterMessage, setWaiterMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [callingWaiter, setCallingWaiter] = useState(false);

  const handleGuestLoginError = (loginError) => {
    if (loginError.code === ERROR_CODES.TABLE_CLOSED) {
      setError(STRINGS.tableValidation);
    } else if (loginError.code === ERROR_CODES.SESSION_EXPIRED) {
      setError(STRINGS.sessionExpired);
    } else {
      setError(STRINGS.guestError);
    }
  };

  const handleGuest = async () => {
    if (!tableId) {
      setError(STRINGS.invalidTable);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginGuest(tableId);
      onClose();
      openCombinedDialog();
    } catch (loginError) {
      handleGuestLoginError(loginError);
    } finally {
      setLoading(false);
    }
  };

  const handleCallWaiter = async () => {
    if (!tableId) {
      setError(STRINGS.invalidTable);
      return;
    }

    setCallingWaiter(true);
    setError('');
    setWaiterMessage('');
    try {
      if (!token) {
        try {
          await loginGuest(tableId);
        } catch (loginError) {
          handleGuestLoginError(loginError);
          return;
        }
      }
      const response = await callWaiter(tableId);
      const message = response?.message || 'El mozo fue notificado correctamente.';
      setWaiterMessage(message);
      setTimeout(() => setWaiterMessage(''), 3000);
    } catch (e) {
      setError(STRINGS.waiterCallError);
    } finally {
      setCallingWaiter(false);
    }
  };

  const isBusy = loading || callingWaiter || authLoading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="table-login-dialog-title"
    >
      <DialogTitle id="table-login-dialog-title">{`Mesa ${tableId ?? ''}`}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!showLoginForm ? (
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <InfoIcon color="info" />
              <Typography variant="body2" color="text.secondary">
                {STRINGS.helperText}
              </Typography>
            </Box>

            <Divider />

            <Button
              variant="outlined"
              startIcon={
                isBusy ? <CircularProgress size={20} color="inherit" /> : <GroupIcon />
              }
              onClick={handleGuest}
              disabled={isBusy}
              fullWidth
            >
              {loading ? 'Ingresando...' : 'Ingresar como invitado'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={() => setShowLoginForm(true)}
              disabled={isBusy}
              fullWidth
            >
              Ingresar con tu cuenta
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              startIcon={
                callingWaiter ? <CircularProgress size={20} color="inherit" /> : <RoomServiceIcon />
              }
              onClick={handleCallWaiter}
              disabled={isBusy}
              fullWidth
            >
              {callingWaiter ? 'Llamando al mozo...' : 'Llamar al mozo'}
            </Button>

            {error && (
              <Typography color="error" mt={1} textAlign="center">
                {error}
              </Typography>
            )}
            {waiterMessage && (
              <Typography color="success.main" mt={1} textAlign="center">
                {waiterMessage}
              </Typography>
            )}
          </Box>
        ) : (
          <AuthDialog
            open
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

TableLoginDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TableLoginDialog;
