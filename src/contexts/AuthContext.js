import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth
      ? JSON.parse(savedAuth)
      : {
          user: null,
          tableId: null,
          clientId: 1,
          isAdmin: false,
        };
  });

  // Guarda cambios en auth
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  // Setea tableId si viene por query y guarda el tiempo
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tableId = queryParams.get('tableId');

    if (tableId) {
      setAuth((prevState) => ({ ...prevState, tableId: Number(tableId) }));
      localStorage.setItem('tableIdSetTime', Date.now());
    }
  }, []);

  // Remueve tableId si pasaron más de 20 minutos
  useEffect(() => {
    const tableIdSetTime = localStorage.getItem('tableIdSetTime');

    if (tableIdSetTime) {
      const timePassed = Date.now() - Number(tableIdSetTime);
      const twentyMinutes = 20 * 60 * 1000;

      if (timePassed >= twentyMinutes) {
        setAuth((prevState) => ({ ...prevState, tableId: null }));
        localStorage.removeItem('tableIdSetTime');
      } else {
        const remainingTime = twentyMinutes - timePassed;
        const timeout = setTimeout(() => {
          setAuth((prevState) => ({ ...prevState, tableId: null }));
          localStorage.removeItem('tableIdSetTime');
        }, remainingTime);

        return () => clearTimeout(timeout); // limpiar si desmonta
      }
    }
  }, [auth.tableId]);

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
    localStorage.removeItem('tableIdSetTime');
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        loginAsGuest,
        loginAsAdmin,
        logout,
        tableId: auth.tableId,
        isAdmin: auth.isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
