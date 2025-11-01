import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Slide,
  useMediaQuery,
  useTheme,
  Typography,
  Box,
  Stack,
  IconButton,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import RegisterForm from './RegisterForm';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const AuthDialog = ({ open, onClose, loginParams, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const usernameRef = useRef(null);

  useEffect(() => {
    if (open && usernameRef.current) {
      usernameRef.current.focus();
    }
  }, [open]);

  const handleLogin = async () => {
    setError('');

    if (!username || !password) {
      setError('Por favor completá todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const user = await login({
        email: username,
        password,
        tableId: loginParams?.tableId,
      });
      setLoading(false);

      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else {
        if (user?.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }

      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Credenciales incorrectas');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
    navigate('/');
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        TransitionComponent={Transition}
        aria-labelledby="auth-dialog-title"
      >
        <DialogTitle id="auth-dialog-title" sx={{ position: 'relative', textAlign: 'center', fontWeight: 600 }}>
          Iniciar sesión
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            aria-label="Cerrar"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Stack spacing={3}>
              <TextField
                label="Usuario"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                inputRef={usernameRef}
                autoComplete="username"
              />
              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {error && (
                <Typography variant="body2" color="error" align="center">
                  {error}
                </Typography>
              )}
              <Typography variant="body2" align="center">
                ¿No tenés cuenta?{' '}
                <Button onClick={() => setRegisterOpen(true)} variant="text" size="small">
                  Registrate
                </Button>
              </Typography>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', mb: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleLogin} variant="contained" disabled={loading} autoFocus={false}>
            {loading ? 'Cargando...' : 'Iniciar sesión'}
          </Button>
        </DialogActions>
      </Dialog>

      <RegisterForm open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </>
  );
};

export default AuthDialog;
