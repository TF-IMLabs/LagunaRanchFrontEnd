import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Home from '../pages/Home';
import Menu from '../pages/MenuPage';
import AdminPage from '../pages/AdminPage'; // Importa la AdminPage.

const AppRouter = () => (
  <>
  
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/admin" element={<AdminPage />} /> {/* Ruta para la AdminPage. */}
    </Routes>
    <Footer />

  </>
);

export default AppRouter;
