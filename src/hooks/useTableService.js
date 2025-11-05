import { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateTableNote as updateTableNoteService } from '../services/tableService';
import {
  callWaiter as callWaiterService,
  requestBill as requestBillService,
} from '../services/waiterService';
import { ERROR_CODES } from '../services/apiErrorCodes';

export const useTableService = () => {
  const { tableId, orderType } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canUseTableService = orderType === 'dine-in' && Boolean(tableId);

  const ensureAvailability = useCallback(() => {
    if (!canUseTableService) {
      const serviceError = new Error(
        'Los servicios de mesa están disponibles solo para pedidos en el local',
      );
      serviceError.code = ERROR_CODES.TABLE_CLOSED;
      setError(serviceError);
      return false;
    }
    return true;
  }, [canUseTableService]);

  const callWaiter = useCallback(async () => {
    if (!ensureAvailability()) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await callWaiterService(Number(tableId));
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [ensureAvailability, tableId]);

  const requestBill = useCallback(async () => {
    if (!ensureAvailability()) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await requestBillService(Number(tableId));
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [ensureAvailability, tableId]);

  const updateNote = useCallback(
    async (note) => {
      if (!ensureAvailability()) {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        await updateTableNoteService(Number(tableId), note);
        return true;
      } catch (err) {
        setError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [ensureAvailability, tableId],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    callWaiter,
    requestBill,
    updateNote,
    loading,
    error,
    clearError,
    canUseTableService,
  };
};

export default useTableService;
