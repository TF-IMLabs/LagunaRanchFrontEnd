import React, { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Button, Badge,
  Dialog, DialogActions, DialogContent, DialogTitle, Box,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import logo from '../assets/logoranch.png';
import CartIcon from '@mui/icons-material/ShoppingCart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AuthDialog from '../components/dialogs/AuthDialog';
import CombinedDialog from '../pages/Menu/CombinedDialog';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileDialog from '../components/dialogs/ProfileDialog'; 
import LoginIcon from '@mui/icons-material/Login'; 


const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.primary.main,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
}));

const Logo = styled('img')(({ theme }) => ({
  height: 70,
  marginRight: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    height: 64,
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: 20,
  textTransform: 'none',
  padding: theme.spacing(0, 1),
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: theme.palette.background.default,
    opacity: 0.85,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: 18,
    marginRight: theme.spacing(0.5),
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0, 1.5),
}));

const CustomBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-dot': {
    backgroundColor: theme.palette.primary.main,
  },
  '& .MuiBadge-badge': {
    color: theme.palette.background.default,
    backgroundColor: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

const ActionsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const Header = () => {
  const { cart, combinedDialogOpen, openCombinedDialog, closeCombinedDialog, emptyCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const totalItems = cart.reduce((t, item) => t + item.cantidad, 0);

  const handleLoginSuccess = (user) => {
    setAuthDialogOpen(false);
    if (user.isAdmin) {
      navigate('/admin');
    } else {
      openCombinedDialog();
    }
  };

  const handleLogout = () => {
    logout();
    emptyCart();
    navigate('/');
  };

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <IconButton component={Link} to="/" aria-label="Ir al inicio">
          <Logo src={logo} alt="Logo" />
        </IconButton>

        <ActionsWrapper>
          <NavButton component={Link} to="/menu" aria-label="Ir al menú">
            <MenuBookIcon fontSize="small" />
          </NavButton>

          <NavButton onClick={openCombinedDialog} aria-label="Ver carrito">
            <CustomBadge badgeContent={totalItems} showZero={false}>
              <CartIcon fontSize="small" />
            </CustomBadge>
          </NavButton>

          {!user && (
            <NavButton onClick={() => setAuthDialogOpen(true)} aria-label="Iniciar sesión">
              <LoginIcon fontSize="small" />
            </NavButton>
          )}

          {user && (
            <>
              {!!user.isAdmin && (
                <NavButton component={Link} to="/admin" aria-label="Panel de administración">
                  <AdminPanelSettingsIcon fontSize="small" />
                </NavButton>
              )}
              <NavButton onClick={() => setProfileDialogOpen(true)} aria-label="Perfil">
                <AccountCircleIcon fontSize="small" />
              </NavButton>
              <NavButton onClick={() => setConfirmLogoutOpen(true)} aria-label="Cerrar sesión">
                <LogoutIcon fontSize="small" />
              </NavButton>
            </>
          )}
        </ActionsWrapper>
      </StyledToolbar>

      <CombinedDialog open={combinedDialogOpen} onClose={closeCombinedDialog} />
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <Dialog open={confirmLogoutOpen} onClose={() => setConfirmLogoutOpen(false)}>
        <DialogTitle>Confirmar Salida</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que quieres cerrar sesión?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogoutOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button
  onClick={() => {
    setConfirmLogoutOpen(false); 
    handleLogout();              
  }}
  color="primary"
>
  Aceptar
</Button>
        </DialogActions>
      </Dialog>

      <ProfileDialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} />
    </StyledAppBar>
  );
};

export default Header;
