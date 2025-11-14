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
import { useTableAccess } from './TableAccessContext';
import useVenueStatus from '../hooks/useVenueStatus';

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
  const {
    validateTable,
    isLoading: isTableRegistryLoading,
    error: tableRegistryError,
    refetchTables,
  } = useTableAccess();
  const { isOpen: isVenueOpen } = useVenueStatus();

  const [isLoading, setIsLoading] = useState(false);
  const [orderType, setOrderTypeState] = useState('takeaway');
  const [tableValidation, setTableValidation] = useState({
    state: 'missing',
    tableId: null,
    table: null,
    status: null,
  });

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
    if (!detectedTableId) {
      setTableValidation({
        state: 'missing',
        tableId: null,
        table: null,
        status: null,
      });
      if (tableId) {
        setTableId(null);
      }
      if (orderType === 'dine-in') {
        setOrderTypeState('takeaway');
      }
      return;
    }

    if (isTableRegistryLoading) {
      setTableValidation({
        state: 'loading',
        tableId: detectedTableId,
        table: null,
        status: null,
      });
      return;
    }

    if (tableRegistryError) {
      setTableValidation({
        state: 'error',
        tableId: detectedTableId,
        table: null,
        status: null,
      });
      return;
    }

    const validation = validateTable(detectedTableId);
    setTableValidation(validation);

    if (validation.state === 'valid' && isVenueOpen) {
      if (tableId !== detectedTableId) {
        setTableId(detectedTableId);
      }
      if (orderType !== 'dine-in') {
        setOrderTypeState('dine-in');
      }
    } else if (tableId) {
      setTableId(null);
      if (orderType === 'dine-in') {
        setOrderTypeState('takeaway');
      }
    }
  }, [
    detectedTableId,
    isTableRegistryLoading,
    isVenueOpen,
    orderType,
    setOrderTypeState,
    setTableId,
    tableId,
    tableRegistryError,
    validateTable,
  ]);

  const isAuthenticated = useMemo(
    () => Boolean(authState.user && token),
    [authState.user, token],
  );

  const canUseTableOrders = tableValidation.state === 'valid' && isVenueOpen;

  const canAddToCart = useMemo(() => {
    if (!isVenueOpen) {
      return false;
    }

    if (isAuthenticated) {
      return true;
    }

    return orderType === 'dine-in' && Boolean(tableId);
  }, [isAuthenticated, isVenueOpen, orderType, tableId]);

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
      const targetTableId = incomingTableId ?? detectedTableId ?? tableId;

      if (!targetTableId) {
        const error = new Error('Se necesita un ID de mesa para el login invitado');
        error.code = ERROR_CODES.TABLE_CLOSED;
        throw error;
      }

      let validation = validateTable(targetTableId);
      if (validation.state === 'not-found' || validation.state === 'error') {
        await refetchTables();
        validation = validateTable(targetTableId);
      }
      if (validation.state !== 'valid') {
        const error = new Error(
          validation.state === 'blocked'
            ? 'Esta mesa esta bloqueada. Pide ayuda a tu mozo.'
            : 'No encontramos una mesa habilitada para este codigo.',
        );
        error.code = ERROR_CODES.TABLE_CLOSED;
        throw error;
      }

      if (!isVenueOpen) {
        const error = new Error('El restaurante esta cerrado en este momento.');
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
    [
      authState.clientId,
      detectedTableId,
      isVenueOpen,
      refetchTables,
      register,
      setTableId,
      setUser,
      tableId,
      validateTable,
    ],
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

  useEffect(() => {
    if (!isVenueOpen && orderType === 'dine-in') {
      setOrderTypeState('takeaway');
    }
  }, [isVenueOpen, orderType]);

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
      isLoading: isLoading || isDetectingTable || isTableRegistryLoading,
      orderType,
      canAddToCart,
      register,
      login,
      loginGuest,
      logout,
      setTableId,
      setOrderType,
      extendSession,
      requestedTableId: detectedTableId,
      tableValidation,
      canUseTableOrders,
      refetchTables,
      isVenueOpen,
    }),
    [
      authState.clientId,
      authState.isAdmin,
      authState.isGuest,
      authState.user,
      canUseTableOrders,
      canAddToCart,
      detectedTableId,
      extendSession,
      isAuthenticated,
      isDetectingTable,
      isTableRegistryLoading,
      isLoading,
      login,
      loginGuest,
      logout,
      refetchTables,
      orderType,
      register,
      setOrderType,
      setTableId,
      isVenueOpen,
      tableValidation,
      tableId,
      token,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
