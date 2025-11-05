import { useEffect, useState, useCallback } from 'react';

const AUTH_STORAGE_KEY = 'resto_auth';
const LEGACY_STORAGE_KEY = 'auth';
const DEFAULT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const defaultAuthState = {
  user: null,
  token: null,
  tableId: null,
  clientId: 1,
  isAdmin: false,
  isGuest: false,
  expiresAt: null,
};

function parseStoredValue(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.error('Error parsing stored auth state:', error);
    return null;
  }
}

function normalizeLegacyState(legacyState) {
  if (!legacyState) {
    return null;
  }

  return {
    user: legacyState.user ?? null,
    token: legacyState.token ?? null,
    tableId: legacyState.tableId ?? null,
    clientId: legacyState.clientId ?? 1,
    isAdmin: legacyState.isAdmin ?? false,
    isGuest: false,
    expiresAt: null,
  };
}

export const useAuthPersistence = () => {
  const [authState, setAuthState] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultAuthState;
    }

    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = parseStoredValue(stored);
      if (parsed && (!parsed.expiresAt || Date.now() < parsed.expiresAt)) {
        return parsed;
      }
    }

    const legacyStored = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyStored) {
      const legacyParsed = parseStoredValue(legacyStored);
      const normalized = normalizeLegacyState(legacyParsed);
      if (normalized) {
        window.localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(normalized),
        );
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        return normalized;
      }
    }

    return defaultAuthState;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (authState?.token) {
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(authState),
      );
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [authState]);

  const updateAuthState = useCallback((updater) => {
    setAuthState((prev) => {
      const updates =
        typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };

      if (updates.token) {
        return {
          ...prev,
          ...updates,
          expiresAt: Date.now() + DEFAULT_SESSION_DURATION,
        };
      }

      if (updates.token === null) {
        return {
          ...prev,
          ...updates,
          expiresAt: null,
        };
      }

      return { ...prev, ...updates };
    });
  }, []);

  const setUser = useCallback(
    (user, token, options = {}) => {
      updateAuthState((prev) => ({
        ...prev,
        user,
        token,
        isAdmin: options.isAdmin ?? false,
        isGuest: options.isGuest ?? false,
        tableId:
          options.tableId !== undefined ? options.tableId : prev.tableId,
        clientId:
          options.clientId !== undefined ? options.clientId : prev.clientId,
      }));
    },
    [updateAuthState],
  );

  const setTableId = useCallback(
    (tableId) => {
      updateAuthState({ tableId });
    },
    [updateAuthState],
  );

  const clearAuth = useCallback(() => {
    setAuthState(defaultAuthState);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }, []);

  const isSessionValid = useCallback(() => {
    if (!authState.token || !authState.expiresAt) {
      return false;
    }
    return Date.now() < authState.expiresAt;
  }, [authState]);

  const extendSession = useCallback(
    (duration = DEFAULT_SESSION_DURATION) => {
      if (!authState.token) return;
      setAuthState((prev) => ({
        ...prev,
        expiresAt: Date.now() + duration,
      }));
    },
    [authState.token],
  );

  return {
    authState,
    setUser,
    setTableId,
    clearAuth,
    updateAuthState,
    isSessionValid,
    extendSession,
  };
};

export default useAuthPersistence;
