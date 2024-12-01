import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : {
      user: null,
      tableId: null,
      clientId: 1,
      isAdmin: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tableId = queryParams.get('tableId');
  
    if (tableId) {
      setAuth((prevState) => ({ ...prevState, tableId: Number(tableId) }));
    }
  }, []);

  const loginAsGuest = () => {
    setAuth((prevState) => ({
      ...prevState,
      user: { username: 'invitado', clientId: 1 },
    }));
  };

  const loginAsAdmin = (username, password) => {
    if (username === 'admin' && password === 'password123') {
      setAuth((prevState) => ({
        ...prevState,
        user: { username: 'admin', clientId: null },
        isAdmin: true,
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuth({
      user: null,
      tableId: null,
      clientId: 1,
      isAdmin: false,
    });
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ auth, loginAsGuest, loginAsAdmin, logout, tableId: auth.tableId, isAdmin: auth.isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Exportamos useAuth para acceder al contexto
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
