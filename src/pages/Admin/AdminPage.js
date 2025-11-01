import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { styled } from '@mui/system';
import { alpha } from '@mui/material/styles';
import MenuSection from '../Admin/Menu/MenuSection';
import TablesSection from '../Admin/Orders/Tables/TablesSection';
import { useAuth } from '../../contexts/AuthContext';
import AuthDialog from '../../components/dialogs/AuthDialog';
import TakeAwaySection from '../Admin/Orders/TakeAway/TakeAwaySection';
import DeliverySection from '../Admin/Orders/Delivery/DeliverySection';

const AdminWrapper = styled(Box)(({ theme }) => ({
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
  padding: theme.spacing(4, 2),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.85),
  borderRadius: 8,
  marginBottom: theme.spacing(2),
  padding: theme.spacing(0.5),
  '.MuiTabs-flexContainer': {
    gap: theme.spacing(0.5),
  },
  '.MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '1.1rem',
  fontWeight: 600,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  width: '100%',
  flexGrow: 1,
  backgroundColor: alpha(theme.palette.background.paper, 0.85),
  borderRadius: 8,
  overflow: 'hidden',
}));

const TabPanel = ({ children }) => <Box sx={{ p: 3 }}>{children}</Box>;

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setAuthDialogOpen(true);
    }
  }, [isAdmin]);

  return (
    <AdminWrapper>
      <StyledTabs
        value={tabIndex}
        onChange={(_, newIndex) => setTabIndex(newIndex)}
        centered
      >
        <StyledTab label="Menú" />
        <StyledTab label="Mesas" />
        <StyledTab label="Delivery" />
        <StyledTab label="Take Away" />
      </StyledTabs>

      <ContentBox sx={{ overflowY: tabIndex === 1 ? 'hidden' : 'auto' }}>
        {tabIndex === 0 && (
          <TabPanel>
            <MenuSection />
          </TabPanel>
        )}
        {tabIndex === 1 && (
          <TabPanel>
            <TablesSection />
          </TabPanel>
        )}
        {tabIndex === 2 && (
          <TabPanel>
            <DeliverySection />
          </TabPanel>
        )}
        {tabIndex === 3 && (
          <TabPanel>
            <TakeAwaySection />
          </TabPanel>
        )}
      </ContentBox>

      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </AdminWrapper>
  );
};

export default AdminPage;
