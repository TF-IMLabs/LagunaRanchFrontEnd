import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Tab, Box, IconButton } from '@mui/material';
import { Logout } from '@mui/icons-material';
import MenuSection from '../components/menu/MenuSection';
import TablesSection from '../components/tables/TablesSection';
import OrdersSection from '../components/order/OrdersSection';
import OrdersStats from '../components/order/OrderStats';
import AuthContext from '../contexts/AuthContext';
import AuthDialog from '../components/dialogs/AuthDialog';

const styles = {
  container: {
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
    position: 'relative',
  },
  logoutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    color: '#DD98AD',
  },
  tabs: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '8px',
    marginBottom: 2,
  },
  tab: {
    color: 'white',
    fontSize: '1.2rem',
    '&.Mui-selected': {
      color: '#DD98AD',
    },
  },
  contentBox: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
  },
  tabPanel: { padding: 3 },
};

const AdminPage = () => {
  const { auth, logout } = useContext(AuthContext);
  const [tabIndex, setTabIndex] = useState(0);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.isAdmin) setAuthDialogOpen(true);
  }, [auth]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={styles.container}>
      <IconButton onClick={handleLogout} sx={styles.logoutButton}>
        <Logout />
      </IconButton>

      <Tabs
        value={tabIndex}
        onChange={(_, newIndex) => setTabIndex(newIndex)}
        centered
        sx={styles.tabs}
        TabIndicatorProps={{ style: { backgroundColor: '#DD98AD' } }}
      >
        <Tab label="Menú" sx={styles.tab} />
        <Tab label="Mesas" sx={styles.tab} />
        <Tab label="Pedidos" sx={styles.tab} />
        <Tab label="Estadísticas" sx={styles.tab} />
      </Tabs>

      <Box sx={{ ...styles.contentBox, overflowY: tabIndex === 1 ? 'hidden' : 'auto' }}>
        {tabIndex === 0 && <TabPanel><MenuSection /></TabPanel>}
        {tabIndex === 1 && <TabPanel><TablesSection /></TabPanel>}
        {tabIndex === 2 && <TabPanel><OrdersSection /></TabPanel>}
        {tabIndex === 3 && <TabPanel><OrdersStats /></TabPanel>}
      </Box>

      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </Box>
  );
};

const TabPanel = ({ children }) => <Box sx={styles.tabPanel}>{children}</Box>;

export default AdminPage;