import React, { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Button, Badge,
  Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import logo from '../assets/BarTF&IMLabs.png';
import CartIcon from '@mui/icons-material/ShoppingCart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AuthDialog from '../users/AuthDialog';
import CombinedDialog from '../pages/Menu/CombinedDialog';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileDialog from '../users/ProfileDialog'; 
import LoginIcon from '@mui/icons-material/Login'; 


const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'black',
  color: '#c96b21',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
}));

const Logo = styled('img')(({ theme }) => ({
  height: '70px',
  marginRight: '10px',
  [theme.breakpoints.down('sm')]: {
    height: '70px',
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#c96b21',
  fontSize: '20px',
  textTransform: 'none',
  padding: '0 10px',
  '&:hover': {
    backgroundColor: 'black',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '20px',
    marginRight: '5px',
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 10px',
}));

const CustomBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-dot': {
    backgroundColor: 'black',
  },
  '& .MuiBadge-badge': {
    color: 'white',
    backgroundColor: 'black',
    border: '1px solid black',
  },
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
        <IconButton component={Link} to="/">
          <Logo src={logo} alt="Logo" />
        </IconButton>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <NavButton component={Link} to="/menu">
            <MenuBookIcon fontSize="small" />
          </NavButton>

          <NavButton onClick={openCombinedDialog}>
  <CustomBadge badgeContent={totalItems} showZero={false}>
    <CartIcon fontSize="small" />
  </CustomBadge>
</NavButton>

          {!user && (
            <NavButton onClick={() => setAuthDialogOpen(true)}>
              <LoginIcon fontSize="small" />
            </NavButton>
          )}

          {user && (
            <>
              {!!user.isAdmin && (
  <NavButton component={Link} to="/admin">
    <AdminPanelSettingsIcon fontSize="small" />
  </NavButton>
)}
              <NavButton onClick={() => setProfileDialogOpen(true)}>
                <AccountCircleIcon fontSize="small" />
              </NavButton>
              <NavButton onClick={() => setConfirmLogoutOpen(true)}>
                <LogoutIcon fontSize="small" />
              </NavButton>
            </>
          )}
        </div>
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
