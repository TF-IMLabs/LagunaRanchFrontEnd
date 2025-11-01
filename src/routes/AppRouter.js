import React, { useState, useEffect } from 'react';
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
    }
  }, [tableId, user]);

  return (
    <>
      <Header />
      <TableLoginDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Footer />
    </>
  );
};

export default AppRouter;
