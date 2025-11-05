import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import apiClient, {
  AUTH_LOGOUT_EVENT,
  ERROR_CODES,
} from '../services/apiClient';
import useAuthPersistence from '../hooks/useAuthPersistence';
import useTableDetection from '../hooks/useTableDetection';

const AuthContext = createContext(null);

const DEFAULT_GUEST_PASSWORD = 'Invitad@Resto!';

export const AuthProvider = ({ children }) => {
  const {
    authState,
    setUser,
    setTableId,
    clearAuth,
    extendSession,
  } = useAuthPersistence();
  const {
    tableId: detectedTableId,
    isDetecting: isDetectingTable,
  } = useTableDetection();

  const [isLoading, setIsLoading] = useState(false);
  const [orderType, setOrderTypeState] = useState('takeaway');

  const tableId = authState.tableId;
  const token = authState.token;

  useEffect(() => {
    if (token) {
      apiClient.setAuthToken(token);
    } else {
      apiClient.clearAuthToken();
    }
  }, [token]);

  useEffect(() => {
    if (detectedTableId && detectedTableId !== tableId) {
      setTableId(detectedTableId);
      setOrderTypeState('dine-in');
    }

    if (!detectedTableId && !tableId && orderType === 'dine-in') {
      setOrderTypeState('takeaway');
    }
  }, [detectedTableId, tableId, orderType, setTableId]);

  const isAuthenticated = useMemo(
    () => Boolean(authState.user && token),
    [authState.user, token],
  );

  const canAddToCart = useMemo(() => {
    if (isAuthenticated) {
      return true;
    }

    return orderType === 'dine-in' && Boolean(tableId);
  }, [isAuthenticated, orderType, tableId]);

  const register = useCallback(async (userData) => {
    return apiClient.post('/user/create', userData);
  }, []);

  const login = useCallback(
    async ({ email, password, tableId: overrideTableId } = {}) => {
      setIsLoading(true);
      try {
        const data = await apiClient.post('/user/login', { email, password });
        const { token: receivedToken, user } = data;

        const resolvedTableId =
          typeof overrideTableId !== 'undefined'
            ? overrideTableId
            : tableId ?? null;

        setUser(user, receivedToken, {
          isAdmin: Boolean(user?.isAdmin),
          isGuest: false,
          tableId: resolvedTableId,
          clientId: user?.id_cliente ?? authState.clientId ?? 1,
        });

        if (typeof overrideTableId !== 'undefined') {
          setTableId(overrideTableId);
        }

        return user;
      } finally {
        setIsLoading(false);
      }
    },
    [authState.clientId, setTableId, setUser, tableId],
  );

  const loginGuest = useCallback(
    async (incomingTableId) => {
      const targetTableId = incomingTableId ?? tableId;

      if (!targetTableId) {
        const error = new Error('Se necesita un ID de mesa para el login invitado');
        error.code = ERROR_CODES.TABLE_CLOSED;
        throw error;
      }

      const email = `Invitado${targetTableId}@resto.com`;

      const applyGuestSession = (user, guestToken) => {
        setUser(user, guestToken, {
          isAdmin: false,
          isGuest: true,
          tableId: targetTableId,
          clientId: user?.id_cliente ?? authState.clientId ?? 1,
        });
        setTableId(targetTableId);
        setOrderTypeState('dine-in');
        apiClient.setAuthToken(guestToken);
      };

      setIsLoading(true);
      try {
        const data = await apiClient.post('/user/login', {
          email,
          password: DEFAULT_GUEST_PASSWORD,
        });
        applyGuestSession(data.user, data.token);
        return data.user;
      } catch (error) {
        if (
          error.code === ERROR_CODES.VALIDATION_ERROR ||
          /no encontrado/i.test(error.message)
        ) {
          await register({
            email,
            password: DEFAULT_GUEST_PASSWORD,
            nombre: `Invitado Mesa ${targetTableId}`,
            direccion: '',
            telefono: '',
            fecha_nac: '',
          });
          const data = await apiClient.post('/user/login', {
            email,
            password: DEFAULT_GUEST_PASSWORD,
          });
          applyGuestSession(data.user, data.token);
          return data.user;
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [authState.clientId, register, setTableId, setUser, tableId],
  );

  const logout = useCallback(
    ({ silent = false } = {}) => {
      clearAuth();
      apiClient.clearAuthToken();
      setOrderTypeState('takeaway');

      if (!silent && typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth:session-ended', {
            detail: { reason: ERROR_CODES.SESSION_EXPIRED },
          }),
        );
      }
    },
    [clearAuth],
  );

  useEffect(() => {
    const handleForcedLogout = () => {
      logout({ silent: true });
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout);
    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout);
    };
  }, [logout]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const handleActivity = () => {
      extendSession();
    };

    events.forEach((event) =>
      window.addEventListener(event, handleActivity, true),
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity, true),
      );
    };
  }, [extendSession, token]);

  const setOrderType = useCallback((type) => {
    setOrderTypeState(type);
  }, []);

  const value = useMemo(
    () => ({
      user: authState.user,
      token,
      tableId,
      clientId: authState.clientId,
      isAdmin: authState.isAdmin,
      isGuest: authState.isGuest,
      isAuthenticated,
      isLoading: isLoading || isDetectingTable,
      orderType,
      canAddToCart,
      register,
      login,
      loginGuest,
      logout,
      setTableId,
      setOrderType,
      extendSession,
    }),
    [
      authState.clientId,
      authState.isAdmin,
      authState.isGuest,
      authState.user,
      canAddToCart,
      extendSession,
      isAuthenticated,
      isDetectingTable,
      isLoading,
      login,
      loginGuest,
      logout,
      orderType,
      register,
      setOrderType,
      setTableId,
      tableId,
      token,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
