import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { getAllTables } from '../services/tableService';
import { queryKeys } from '../lib/queryClient';
import { readTableCache, writeTableCache } from '../utils/venueState';

const TableAccessContext = createContext(null);

const AUTH_STORAGE_KEY = 'resto_auth';
const LEGACY_AUTH_KEY = 'auth';
const isBrowser =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeTableId = (table) => {
  if (!table) return null;
  const candidate =
    table.id_mesa ?? table.n_mesa ?? table.id ?? table.idMesa ?? null;
  const numericValue = Number(candidate);
  if (Number.isNaN(numericValue) || numericValue <= 0) {
    return null;
  }
  return numericValue;
};

const normalizeEstado = (estado) => String(estado ?? '').toLowerCase().trim();

const readAdminFlag = () => {
  if (!isBrowser) return false;
  try {
    const stored =
      window.localStorage.getItem(AUTH_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_AUTH_KEY);
    if (!stored) {
      return false;
    }
    const parsed = JSON.parse(stored);
    return Boolean(parsed?.isAdmin);
  } catch (error) {
    console.error('Error reading admin flag:', error);
    return false;
  }
};

export const TableAccessProvider = ({ children }) => {
  const [cachedTables, setCachedTables] = useState(() => readTableCache());
  const [canFetch, setCanFetch] = useState(() => readAdminFlag());

  useEffect(() => {
    if (!isBrowser) return () => {};
    const handleStorageChange = () => {
      setCanFetch(readAdminFlag());
      setCachedTables(readTableCache());
    };
    const tableCacheListener = () => {
      setCachedTables(readTableCache());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:session-ended', handleStorageChange);
    window.addEventListener('tables:cache', tableCacheListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:session-ended', handleStorageChange);
      window.removeEventListener('tables:cache', tableCacheListener);
    };
  }, []);

  const tablesQuery = useQuery({
    queryKey: queryKeys.tables.all,
    queryFn: getAllTables,
    enabled: canFetch,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (canFetch && Array.isArray(tablesQuery.data)) {
      setCachedTables(tablesQuery.data);
      writeTableCache(tablesQuery.data);
    }
  }, [canFetch, tablesQuery.data]);

  const effectiveTables = useMemo(() => {
    if (canFetch && Array.isArray(tablesQuery.data)) {
      return tablesQuery.data;
    }
    return cachedTables;
  }, [cachedTables, canFetch, tablesQuery.data]);

  const tableMap = useMemo(() => {
    const entries = new Map();
    (effectiveTables ?? []).forEach((table) => {
      const id = normalizeTableId(table);
      if (id) {
        entries.set(id, table);
      }
    });
    return entries;
  }, [effectiveTables]);

  const getTableInfo = useCallback(
    (tableId) => {
      if (!tableId) return null;
      const numericId = Number(tableId);
      if (Number.isNaN(numericId)) return null;
      return tableMap.get(numericId) ?? null;
    },
    [tableMap],
  );

  const validateTable = useCallback(
    (tableId) => {
      if (!tableId) {
        return {
          state: 'missing',
          tableId: null,
          table: null,
          status: null,
        };
      }

      const numericId = Number(tableId);
      if (Number.isNaN(numericId) || numericId <= 0) {
        return {
          state: 'invalid-format',
          tableId: tableId ?? null,
          table: null,
          status: null,
        };
      }

      const table = tableMap.get(numericId);
      if (!table) {
        return {
          state: 'not-found',
          tableId: numericId,
          table: null,
          status: null,
        };
      }

      const status = normalizeEstado(table.estado);
      if (status === 'bloqueada') {
        return {
          state: 'blocked',
          tableId: numericId,
          table,
          status,
        };
      }

      if (status === 'libre' || status === 'ocupada') {
        return {
          state: 'valid',
          tableId: numericId,
          table,
          status,
        };
      }

      return {
        state: 'unsupported',
        tableId: numericId,
        table,
        status,
      };
    },
    [tableMap],
  );

  const value = useMemo(
    () => ({
      tables: effectiveTables ?? [],
      isLoading: canFetch ? tablesQuery.isLoading : false,
      isFetching: canFetch ? tablesQuery.isFetching : false,
      error: canFetch ? tablesQuery.error ?? null : null,
      refetchTables: tablesQuery.refetch,
      getTableInfo,
      validateTable,
    }),
    [
      canFetch,
      effectiveTables,
      getTableInfo,
      tablesQuery.error,
      tablesQuery.isFetching,
      tablesQuery.isLoading,
      tablesQuery.refetch,
      validateTable,
    ],
  );

  return (
    <TableAccessContext.Provider value={value}>
      {children}
    </TableAccessContext.Provider>
  );
};

TableAccessProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTableAccess = () => useContext(TableAccessContext);

export default TableAccessContext;
