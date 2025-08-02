import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import MenuSection from '../Admin/Menu/MenuSection';
import TablesSection from '../Admin/Orders/Tables/TablesSection';
import { useAuth } from '../../contexts/AuthContext';
import AuthDialog from '../../users/AuthDialog';
import TakeAwaySection from '../Admin/Orders/TakeAway/TakeAwaySection';
import DeliverySection from '../Admin/Orders/Delivery/DeliverySection';

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundImage: `url(${require('../../assets/backgroundamelie3.jpg')})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
      color: '#c96b21',
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
  const { isAdmin} = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  

  useEffect(() => {
    if (!isAdmin) {
      setAuthDialogOpen(true);
    }
  }, [isAdmin]);

 
  return (
    <Box sx={styles.container}>
     
     <Tabs
        value={tabIndex}
        onChange={(_, newIndex) => setTabIndex(newIndex)}
        centered
        sx={styles.tabs}
        TabIndicatorProps={{ style: { backgroundColor: '#c96b21' } }}
      >
        <Tab label="Menú" sx={styles.tab} />
        <Tab label="Mesas" sx={styles.tab} />
        <Tab label="Delivery" sx={styles.tab} />
        <Tab label="TakeAway" sx={styles.tab} />
      </Tabs>

      <Box sx={{ ...styles.contentBox, overflowY: tabIndex === 1 ? 'hidden' : 'auto' }}>
        {tabIndex === 0 && <TabPanel><MenuSection /></TabPanel>}
        {tabIndex === 1 && <TabPanel><TablesSection /></TabPanel>}
        {tabIndex === 2 && <TabPanel><DeliverySection /></TabPanel>}
        {tabIndex === 3 && <TabPanel><TakeAwaySection /></TabPanel>}
      </Box>

      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </Box>
  );
};

const TabPanel = ({ children }) => <Box sx={styles.tabPanel}>{children}</Box>;

export default AdminPage;
