import React from 'react';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext'; // Asegúrate de importar AuthProvider correctamente
import { CartProvider } from './contexts/CartContext'; // Importa tu CartProvider

const App = () => {
  return (
    <AuthProvider>
      <CartProvider> {/* Envuelve AppRouter con CartProvider */}
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
