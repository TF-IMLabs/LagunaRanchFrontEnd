import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Tab, Box, IconButton } from '@mui/material';
import { Logout } from '@mui/icons-material'; // Importamos el ícono de logout
import MenuSection from '../components/menu/MenuSection';
import TablesSection from '../components/tables/TablesSection';
import AuthContext from '../contexts/AuthContext';
import AuthDialog from '../components/dialogs/AuthDialog';

const AdminPage = () => {
  const { auth, logout } = useContext(AuthContext); // Incluimos el método logout del contexto
  const [value, setValue] = useState(0);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    // Si el usuario no está autenticado como administrador, abrir el diálogo
    if (!auth || !auth.isAdmin) {
      setAuthDialogOpen(true);
    }
  }, [auth, navigate]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCloseAuthDialog = () => {
    setAuthDialogOpen(false);
  };

  const handleLogout = () => {
    logout(); // Cerramos la sesión
    navigate('/'); // Redirigimos al usuario a la página de inicio.
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        minHeight: '100vh', 
        backgroundImage: `url(${require('../assets/backgroundamelie3.jpg')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative', // Para colocar el ícono de logout en la esquina
      }}
    >
      {/* Icono de cerrar sesión */}
      <IconButton
        onClick={handleLogout}
        sx={{ position: 'absolute', top: 16, right: 16, color: '#DD98AD' }} // Posición del ícono
      >
        <Logout />
      </IconButton>

      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="admin tabs"
        centered
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
          borderRadius: '8px', 
          mb: 2, 
        }}
        TabIndicatorProps={{
          style: { backgroundColor: '#DD98AD' }, 
        }}
      >
        <Tab
          label="Menú"
          sx={{
            color: 'white', 
            fontSize: '1.2rem', 
            '&.Mui-selected': {
              color: '#DD98AD', 
            },
          }}
        />
        <Tab
          label="Mesas"
          sx={{
            color: 'white', 
            fontSize: '1.2rem', 
            '&.Mui-selected': {
              color: '#DD98AD', 
            },
          }}
        />
      </Tabs>

      {/* Caja que se expande y no tiene scrollbar en "Mesas" */}
      <Box 
        sx={{ 
          width: '100%',      
          flexGrow: 1, // Permite que la caja crezca según el contenido
          overflowY: value === 1 ? 'hidden' : 'auto', // Sin scrollbar en la pestaña "Mesas"
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          borderRadius: '8px', 
        }}
      >
        <TabPanel value={value} index={0}>
          <MenuSection />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <TablesSection />
        </TabPanel>
      </Box>

      {/* Diálogo para autenticarse */}
      <AuthDialog open={authDialogOpen} onClose={handleCloseAuthDialog} />
    </Box>
  );
};

// Componente para paneles de pestañas
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default AdminPage;
