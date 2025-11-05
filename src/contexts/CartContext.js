import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Snackbar, Alert } from '@mui/material';
import SuccessDialog from '../components/dialogs/SuccessDialog';
import { useAuth } from './AuthContext';
import useCartPersistence from '../hooks/useCartPersistence';
import useExistingOrder from '../hooks/useExistingOrder';
import useOrderSubmit from '../hooks/useOrderSubmit';
import useTableService from '../hooks/useTableService';
import { ERROR_CODES } from '../services/apiErrorCodes';

const CartContext = createContext(null);

const ERROR_MESSAGES = {
  [ERROR_CODES.MISSING_ADDRESS]:
    'Necesitamos que completes una dirección para poder enviar tu pedido de delivery.',
  [ERROR_CODES.TABLE_CLOSED]:
    'No encontramos una mesa activa asociada. Escaneá nuevamente el código QR.',
  [ERROR_CODES.SESSION_EXPIRED]:
    'Tu sesión expiró. Iniciá sesión para continuar.',
};

const resolveFeedbackMessage = (error) => {
  if (!error) return 'Ocurrió un error inesperado al enviar el pedido.';

  if (ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  return error.message || 'No se pudo enviar el pedido. Intentá nuevamente.';
};

export const CartProvider = ({ children }) => {
  const { tableId, clientId, orderType, token } = useAuth();
  const {
    cart: persistedCart,
    updateCart,
    clearCart: clearPersistedCart,
    refreshCartTimestamp,
  } = useCartPersistence();
  const { existingItems, loadExistingOrder, loading: loadingExisting } =
    useExistingOrder();
  const { callWaiter, requestBill, updateNote, canUseTableService } =
    useTableService();

  const [combinedDialogOpen, setCombinedDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { submitOrder, isSubmitting } = useOrderSubmit({
    tableId,
    clientId,
    cart: persistedCart,
    orderType,
    existingItems,
    onSuccess: () => {
      clearPersistedCart();
      setSuccessDialogOpen(true);
      if (tableId) {
        loadExistingOrder(tableId);
      }
    },
    onError: (error) => {
      setFeedback({
        severity: 'error',
        message: resolveFeedbackMessage(error),
      });
    },
  });

  useEffect(() => {
    if (tableId && token) {
      loadExistingOrder(tableId);
    } else {
      loadExistingOrder(null);
    }
  }, [tableId, token, loadExistingOrder]);

  const addToCart = useCallback(
    (product, quantity) => {
      if (!quantity || quantity <= 0) return;

      updateCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) =>
            item.product.id_producto === product.id_producto &&
            item.product.nuevo === 0,
        );

        if (existingIndex > -1) {
          return [
            ...prevCart,
            { product: { ...product, nuevo: 1 }, cantidad: quantity },
          ];
        }

        return [...prevCart, { product, cantidad: quantity }];
      });

      refreshCartTimestamp();
    },
    [refreshCartTimestamp, updateCart],
  );

  const removeItem = useCallback(
    (productId) => {
      updateCart((prevCart) =>
        prevCart.filter((item) => item.product.id_producto !== productId),
      );
      refreshCartTimestamp();
    },
    [refreshCartTimestamp, updateCart],
  );

  const clearCart = useCallback(() => {
    clearPersistedCart();
  }, [clearPersistedCart]);

  const updateItemQuantity = useCallback(
    (productId, newQuantity) => {
      updateCart((prevCart) => {
        const nextCart = prevCart
          .map((item) => {
            if (item.product.id_producto !== productId) {
              return item;
            }

            if (newQuantity <= 0) {
              return null;
            }

            return {
              ...item,
              cantidad: newQuantity,
            };
          })
          .filter(Boolean);

        return nextCart;
      });
      refreshCartTimestamp();
    },
    [refreshCartTimestamp, updateCart],
  );

  const sendOrder = useCallback(async () => {
    try {
      await submitOrder();
      setCombinedDialogOpen(false);
    } catch (error) {
      // Error is already handled through onError callback.
    }
  }, [submitOrder]);

  const openCombinedDialog = useCallback(
    () => setCombinedDialogOpen(true),
    [],
  );
  const closeCombinedDialog = useCallback(
    () => setCombinedDialogOpen(false),
    [],
  );

  const handleCloseSuccessDialog = useCallback(
    () => setSuccessDialogOpen(false),
    [],
  );

  const handleCloseFeedback = useCallback((_event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback(null);
  }, []);

  const value = useMemo(
    () => ({
      cart: persistedCart,
      existingItems,
      addToCart,
      removeItem,
      clearCart,
      updateItemQuantity,
      sendOrder,
      combinedDialogOpen,
      openCombinedDialog,
      closeCombinedDialog,
      loading: isSubmitting || loadingExisting,
      callWaiter,
      requestBill,
      updateNote,
      canUseTableService,
    }),
    [
      addToCart,
      callWaiter,
      canUseTableService,
      clearCart,
      closeCombinedDialog,
      combinedDialogOpen,
      existingItems,
      isSubmitting,
      loadingExisting,
      openCombinedDialog,
      persistedCart,
      removeItem,
      requestBill,
      sendOrder,
      updateItemQuantity,
      updateNote,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <SuccessDialog
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
      />
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback?.severity ?? 'info'}
          variant="filled"
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
