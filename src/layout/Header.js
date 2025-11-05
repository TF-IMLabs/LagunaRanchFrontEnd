import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import CartIcon from '@mui/icons-material/ShoppingCart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';
import AuthDialog from '../components/dialogs/AuthDialog';
import CombinedDialog from '../pages/Menu/CombinedDialog';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileDialog from '../components/dialogs/ProfileDialog';
import logo from '../assets/logoranch.png';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  color: theme.palette.primary.main,
  backdropFilter: 'blur(6px)',
}));

const Logo = styled('img')(({ theme }) => ({
  height: 70,
  width: 'auto',
  objectFit: 'contain',
  [theme.breakpoints.down('sm')]: {
    height: 56,
  },
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: 18,
  textTransform: 'none',
  padding: theme.spacing(0.5, 1),
  minWidth: 'auto',
  transition: theme.transitions.create(['color', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1.5),
  },
}));

const CustomBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    color: theme.palette.background.default,
    backgroundColor: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

const ActionsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  width: 'min(300px, 80vw)',
  padding: theme.spacing(2, 1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(8px)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const Header = () => {
  const { cart, combinedDialogOpen, openCombinedDialog, closeCombinedDialog, clearCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const totalItems = cart.reduce((t, item) => t + item.cantidad, 0);

  const handleLoginSuccess = (loggedUser) => {
    setAuthDialogOpen(false);
    if (loggedUser.isAdmin) {
      navigate('/admin');
    } else {
      openCombinedDialog();
    }
  };

  const handleLogout = () => {
    logout();
    clearCart();
    navigate('/');
  };

  const mobileListItem = (icon, label, action, to) => (
    <ListItemButton
      onClick={() => {
        setMobileNavOpen(false);
        if (action) action();
      }}
      component={to ? Link : 'button'}
      to={to}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );

  const desktopNav = (
    <>
      <NavButton component={Link} to="/menu" aria-label="Ir al men\u00fa">
        <MenuBookIcon fontSize="small" />
      </NavButton>
      <NavButton onClick={openCombinedDialog} aria-label="Ver carrito">
        <CustomBadge badgeContent={totalItems} showZero={false}>
          <CartIcon fontSize="small" />
        </CustomBadge>
      </NavButton>
      {!user && (
        <NavButton onClick={() => setAuthDialogOpen(true)} aria-label="Iniciar sesi\u00f3n">
          <LoginIcon fontSize="small" />
        </NavButton>
      )}
      {user && (
        <>
          {!!user.isAdmin && (
            <NavButton component={Link} to="/admin" aria-label="Panel de administraci\u00f3n">
              <AdminPanelSettingsIcon fontSize="small" />
            </NavButton>
          )}
          <NavButton onClick={() => setProfileDialogOpen(true)} aria-label="Perfil">
            <AccountCircleIcon fontSize="small" />
          </NavButton>
          <NavButton onClick={() => setConfirmLogoutOpen(true)} aria-label="Cerrar sesi\u00f3n">
            <LogoutIcon fontSize="small" />
          </NavButton>
        </>
      )}
    </>
  );

  return (
    <StyledAppBar position="sticky" elevation={0}>
      <StyledToolbar disableGutters>
        <IconButton component={Link} to="/" aria-label="Ir al inicio" sx={{ p: 0 }}>
          <Logo src={logo} alt="Logo" />
        </IconButton>

        {isMobile ? (
          <IconButton
            color="inherit"
            aria-label="Abrir menú"
            onClick={() => setMobileNavOpen(true)}
            edge="end"
            sx={{
              width: 40,
              height: 40,
              '& svg': { fontSize: 22 },
            }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <ActionsWrapper>{desktopNav}</ActionsWrapper>
        )}
      </StyledToolbar>

      <Drawer
        anchor="left"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <DrawerContent>
          <Box display="flex" alignItems="center" gap={1.5} px={1}>
            <Logo src={logo} alt="Logo" />
          </Box>
          <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.2) }} />
          <List sx={{ flexGrow: 1 }}>
            {mobileListItem(<MenuBookIcon fontSize="small" />, 'Men\u00fa', null, '/menu')}
            {mobileListItem(
              <CustomBadge badgeContent={totalItems} showZero={false}>
                <CartIcon fontSize="small" />
              </CustomBadge>,
              'Tu pedido',
              openCombinedDialog,
            )}
            {!user &&
              mobileListItem(<LoginIcon fontSize="small" />, 'Iniciar sesi\u00f3n', () =>
                setAuthDialogOpen(true),
              )}
            {user && (
              <>
                {!!user.isAdmin &&
                  mobileListItem(
                    <AdminPanelSettingsIcon fontSize="small" />,
                    'Panel admin',
                    null,
                    '/admin',
                  )}
                {mobileListItem(
                  <AccountCircleIcon fontSize="small" />,
                  'Perfil',
                  () => setProfileDialogOpen(true),
                )}
                {mobileListItem(
                  <LogoutIcon fontSize="small" />,
                  'Cerrar sesi\u00f3n',
                  () => setConfirmLogoutOpen(true),
                )}
              </>
            )}
          </List>
        </DrawerContent>
      </Drawer>

      <CombinedDialog open={combinedDialogOpen} onClose={closeCombinedDialog} />
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <Dialog open={confirmLogoutOpen} onClose={() => setConfirmLogoutOpen(false)}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>Confirmar salida</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          \u00bfEst\u00e1s seguro de que quer\u00e9s cerrar sesi\u00f3n?
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setConfirmLogoutOpen(false)} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              setConfirmLogoutOpen(false);
              handleLogout();
            }}
            variant="contained"
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
