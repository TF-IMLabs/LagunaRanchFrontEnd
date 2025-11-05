import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Home from '../pages/Home/Home';
import Menu from '../pages/Menu/MenuPage';
import AdminPage from '../pages/Admin/AdminPage';
import TableLoginDialog from '../components/dialogs/TableLoginDialog';
import { useAuth } from '../contexts/AuthContext';

const AppRouter = () => {
  const { tableId, user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (tableId && !user) {
      setDialogOpen(true);
    } else {
      setDialogOpen(false);
    }
  }, [tableId, user]);

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      })}
    >
      <Header />

      <TableLoginDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 3, md: 6 },
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default AppRouter;
