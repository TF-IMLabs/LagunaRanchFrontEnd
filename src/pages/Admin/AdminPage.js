import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import PropTypes from 'prop-types';
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
  padding: theme.spacing(6, 2),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 2),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 1.5),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundColor: alpha(theme.palette.background.default, 0.6),
    backdropFilter: 'blur(6px)',
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.85),
  borderRadius: 10,
  marginBottom: theme.spacing(3),
  padding: theme.spacing(0.5),
  maxWidth: '100%',
  '.MuiTabs-flexContainer': {
    gap: theme.spacing(0.5),
    flexWrap: 'wrap',
  },
  '.MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '1rem',
  fontWeight: 600,
  minHeight: 48,
  padding: theme.spacing(0.5, 1.5),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  width: '100%',
  flexGrow: 1,
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
  maxWidth: theme.breakpoints.values.lg,
}));

const TabPanel = ({ children }) => (
  <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', overflow: 'auto' }}>{children}</Box>
);

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
};

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
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        aria-label="Panel de administración"
      >
        <StyledTab label="Menú" />
        <StyledTab label="Mesas" />
        <StyledTab label="Delivery" />
        <StyledTab label="Take away" />
      </StyledTabs>

      <ContentBox>
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
