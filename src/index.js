import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { TableAccessProvider } from './contexts/TableAccessContext';
import { BrowserRouter as Router } from 'react-router-dom';
import queryClient from './lib/queryClient';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <TableAccessProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <App />
              </Router>
            </CartProvider>
          </AuthProvider>
        </TableAccessProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
