import { useState, useEffect, useCallback } from 'react';

const extractTableIdFromHash = (hash) => {
  const match = hash.match(/(?:table|mesa)[=:]?(\d+)/i);
  if (!match) return null;
  const parsed = parseInt(match[1], 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const extractTableIdFromPath = (path) => {
  const match = path.match(/\/(?:table|mesa)\/(\d+)/i);
  if (!match) return null;
  const parsed = parseInt(match[1], 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const extractTableIdFromSearch = (searchParams) => {
  const tableParam =
    searchParams.get('tableId') ||
    searchParams.get('mesa') ||
    searchParams.get('table');

  if (!tableParam) {
    return null;
  }

  const parsed = parseInt(tableParam, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const useTableDetection = () => {
  const [tableId, setTableId] = useState(null);
  const [isDetecting, setIsDetecting] = useState(true);

  const detectTable = useCallback(() => {
    try {
      const url = new URL(window.location.href);

      const fromSearch = extractTableIdFromSearch(url.searchParams);
      if (fromSearch) return fromSearch;

      const fromHash = extractTableIdFromHash(url.hash);
      if (fromHash) return fromHash;

      const fromPath = extractTableIdFromPath(url.pathname);
      if (fromPath) return fromPath;

      return null;
    } catch (error) {
      console.error('Error detecting table ID:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initialTableId = detectTable();
    setTableId(initialTableId);
    setIsDetecting(false);
  }, [detectTable]);

  useEffect(() => {
    const handleUrlChange = () => {
      setIsDetecting(true);
      const detected = detectTable();
      setTableId(detected);
      setIsDetecting(false);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [detectTable]);

  const setManualTableId = useCallback((id) => {
    setTableId(id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (id) {
        url.searchParams.set('tableId', String(id));
      } else {
        url.searchParams.delete('tableId');
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return {
    tableId,
    isDetecting,
    setTableId: setManualTableId,
  };
};

export default useTableDetection;
