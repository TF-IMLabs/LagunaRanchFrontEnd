import React, { useState, useContext } from 'react';
import { AppBar, Toolbar, IconButton, Button, Badge } from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';
import logo from '../../assets/amelie-logo-rosa.png';
import CartIcon from '@mui/icons-material/ShoppingCart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AuthDialog from '..//dialogs/AuthDialog';
import { useCart } from '../../contexts/CartContext'; 
import AuthContext from '../../contexts/AuthContext'; 
import CombinedDialog from '../dialogs/CombinedDialog';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'black',
  color: '#DD98AD',
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
  color: '#DD98AD',
  fontSize: '20px',
  textTransform: 'none',
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
}));

const Title = styled('div')(({ theme }) => ({
  flexGrow: 1,
  textAlign: 'center',
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
  const { cart, combinedDialogOpen, openCombinedDialog, closeCombinedDialog } = useCart(); 
  const { auth } = useContext(AuthContext); 

  // Estado para manejar la apertura/cierre del diálogo de autenticación
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const totalItems = cart.reduce((total, item) => total + item.cantidad, 0);

  return (
    <StyledAppBar position="static" data-test="app-bar">
  <StyledToolbar data-test="toolbar">
    <div data-test="empty-div-left"></div>
    <Title data-test="title">
      <IconButton
        edge="start"
        color="inherit"
        aria-label="logo"
        component={Link}
        to="/"
        data-test="logo-button"
      >
        <Logo src={logo} alt="Logo" data-test="logo" />
      </IconButton>
    </Title>
    <div data-test="nav-buttons">
      <NavButton component={Link} to="/" data-test="nav-button-inicio">Inicio</NavButton>
      <NavButton component={Link} to="/menu" data-test="nav-button-menu">Menú</NavButton>
      {auth.isAdmin && (
        <NavButton component={Link} to="/admin" data-test="nav-button-admin">Admin</NavButton>
      )}
      <NavButton color="inherit" onClick={openCombinedDialog} data-test="cart-button">
        <CustomBadge badgeContent={totalItems} color="secondary" data-test="cart-badge">
          <CartIcon data-test="cart-icon" />
        </CustomBadge>
      </NavButton>
      {!auth.isAdmin && (
        <NavButton
          color="inherit"
          onClick={() => setAuthDialogOpen(true)}
          data-test="admin-settings-button"
        >
          <AdminPanelSettingsIcon data-test="admin-settings-icon" />
        </NavButton>
      )}
    </div>
  </StyledToolbar>
  <CombinedDialog open={combinedDialogOpen} onClose={closeCombinedDialog} data-test="combined-dialog" />
  <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} data-test="auth-dialog" />
</StyledAppBar>

  );
};

export default Header;
