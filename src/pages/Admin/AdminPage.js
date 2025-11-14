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

const adminBackground = require('../../assets/backgroundamelie3.jpg');

const AdminWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  position: 'relative',
  padding: theme.spacing(4, 2, 5),
  gap: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3, 1.5, 4),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 1, 3),
  },
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'fixed',
    inset: 0,
    backgroundImage: `url(${adminBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transform: 'scale(1.05)',
    willChange: 'transform',
    zIndex: 0,
  },
  '&::after': {
    content: '""',
    position: 'fixed',
    inset: 0,
    backgroundColor: alpha(theme.palette.background.default, 0.72),
    backdropFilter: 'blur(8px)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  '& > *': {
    position: 'relative',
    zIndex: 2,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.78),
  borderRadius: 16,
  padding: theme.spacing(1.5, 2),
  width: '100%',
  alignSelf: 'center',
  maxWidth: '960px',
  margin: '0 auto',
  boxShadow: '0 12px 28px rgba(0,0,0,0.4)',
  backdropFilter: 'blur(10px)',
  '.MuiTabs-flexContainer': {
    gap: theme.spacing(1.5),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  '.MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 4,
    borderRadius: 4,
    transition: 'all 0.4s ease',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '1.2rem',
  fontWeight: 700,
  minHeight: 56,
  padding: theme.spacing(1, 2.4),
  letterSpacing: 0.5,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  width: '100%',
  flexGrow: 1,
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  maxWidth: '100%',
}));

const TabPanel = ({ children }) => (
  <Box
    sx={{
      p: { xs: 1.5, md: 2 },
      height: '100%',
      overflow: 'auto',
    }}
  >
    {children}
  </Box>
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
        aria-label="Panel de administraci�n"
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
