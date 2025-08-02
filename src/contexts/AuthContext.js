// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('auth');
    return saved
      ? JSON.parse(saved)
      : { user: null, token: null, tableId: null, clientId: 1, isAdmin: false };
  });

  useEffect(() => {
    if (auth.token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [auth.token]);

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableId = params.get('tableId');
    if (tableId) {
      setAuth(prev => ({ ...prev, tableId: Number(tableId) }));
    }
  }, []);

  const register = async (userData) => {
    const response = await apiClient.post('/user/create', userData);
    return response.data;
  };

  const login = async ({ email, password, tableId: tid } = {}) => {
    const { data } = await apiClient.post('/user/login', { email, password });
    const { token, user } = data;
    setAuth(prev => ({
      ...prev,
      user,
      token,
      isAdmin: user.isAdmin,
      ...(typeof tid !== 'undefined' ? { tableId: tid } : {}),
    }));
    return user;
  };

  const loginGuest = async (tableId) => {
    const email = `Invitado${tableId}@resto.com`;
    const password = 'Invitad@Resto!';

    const handleGuestLogin = (user, token) => {
      setAuth({
        user: { ...user },
        token,
        tableId,
        clientId: 1,
        isAdmin: false,
      });
    };

    try {
      const { data } = await apiClient.post('/user/login', { email, password });
      handleGuestLogin(data.user, data.token);
    } catch (err) {
      if (err.message.includes('Usuario no encontrado')) {
        await register({
          email,
          password,
          nombre: `Invitado Mesa ${tableId}`,
          direccion: '',
          telefono: '',
          fecha_nac: '',
        });
        const { data } = await apiClient.post('/user/login', { email, password });
        handleGuestLogin(data.user, data.token);
      } else {
        throw err;
      }
    }
  };

  const logout = () => {
    setAuth({ user: null, token: null, tableId: null, clientId: 1, isAdmin: false });
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        tableId: auth.tableId,
        clientId: auth.clientId,
        isAdmin: auth.isAdmin,
        register,
        login,
        loginGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
