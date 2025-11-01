import React, { createContext, useState, useContext, useEffect } from 'react'; 
import { addProductToOrder, createOrder, getOrderByTable, updateOrderDetail, updateOrderStatus } from '../services/cartService';
import { useAuth } from './AuthContext';
import SuccessDialog from '../components/dialogs/SuccessDialog'; 
import { Snackbar, Alert } from '@mui/material';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { tableId, clientId } = useAuth();

  const maxCartAge = 30 * 60 * 1000; 

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    const savedTime = localStorage.getItem('cartSetTime');
    if (savedCart && savedTime) {
      const timePassed = Date.now() - Number(savedTime);
      if (timePassed < maxCartAge) {
        return JSON.parse(savedCart);
      } else {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartSetTime');
      }
    }
    return [];
  });

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('cartSetTime', Date.now());
    } else {
      localStorage.removeItem('cart');
      localStorage.removeItem('cartSetTime');
    }
  }, [cart]);

  const [combinedDialogOpen, setCombinedDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false); 
  const [feedback, setFeedback] = useState(null);

  const addToCart = (product, quantity) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.product.id_producto === product.id_producto && item.product.nuevo === 0
      );

      if (existingItemIndex > -1) {
        return [...prevCart, { product: { ...product, nuevo: 1 }, cantidad: quantity }];
      } else {
        return [...prevCart, { product, cantidad: quantity }];
      }
    });
  };

  const removeItem = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id_producto !== itemId));
  };

  const emptyCart = () => {
    setCart([]);
  };

  
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    localStorage.removeItem('cartSetTime');
  };

  const updateItemQuantity = (productId, newQuantity) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id_producto === productId);
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        if (newQuantity <= 0) {
          updatedCart.splice(existingItemIndex, 1);
        } else {
          updatedCart[existingItemIndex].cantidad = newQuantity;
        }
        return updatedCart;
      }
      return prevCart;
    });
  };

  const fetchCurrentOrder = async () => {
    if (tableId) {
      const existingOrder = await getOrderByTable(tableId);
      if (existingOrder && existingOrder.result.length > 0) {
        const firstResult = existingOrder.result[0];
        if (firstResult.mensaje === "La mesa no estÃ¡ ocupada.") {
          return null;
        } else {
          const orderId = firstResult.id_pedido;
          return orderId;
        }
      }
    }
    return null;
  };

  const sendOrder = async () => {
    if (cart.length === 0 || !tableId || !clientId) {
      return;
    }

    setLoading(true);
    try {
      const existingOrderId = await fetchCurrentOrder();
      let orderId = existingOrderId;
      let isNewOrder = false; 
  
      if (!orderId) {
        const orderData = {
          id_cliente: parseInt(clientId, 10),
          id_mesa: parseInt(tableId, 10),
          tipo_pedido: 0,
        };
  
        const response = await createOrder(orderData);
        if (response && response.orderId) {
          orderId = response.orderId;
          isNewOrder = true; 
        } else {
          throw new Error('No se pudo obtener el orderId despuÃ©s de crear la orden');
        }
      }
  
      if (!orderId) {
        throw new Error('No se pudo obtener un ID de orden vÃ¡lido');
      }
  
      const existingOrderDetails = await getOrderByTable(tableId);
      let itemsUpdated = false;  
  
      for (const item of cart) {
        const existingDetail = existingOrderDetails.result.find(
          detail => detail.id_producto === item.product.id_producto && detail.nuevo === 0
        );
  
        if (existingDetail) {
          await updateOrderDetail({
            id_pedido: orderId,
            id_producto: item.product.id_producto,
            cantidad: item.cantidad, 
          });
          itemsUpdated = true;
        } else {
          const productData = {
            id_pedido: parseInt(orderId, 10),
            id_producto: parseInt(item.product.id_producto, 10),
            cantidad: parseInt(item.cantidad, 10),
          };
          await addProductToOrder(productData);
          itemsUpdated = true;
        }
      }
  
      if (orderId && itemsUpdated && !isNewOrder) {
        await updateOrderStatus({ id_pedido: orderId, estado: 'Actualizado' });
      }
  
      await Promise.all(cart.map(item => {
        if (item.product.nuevo === 1) {
          return updateOrderDetail({
            id_pedido: orderId,
            id_producto: item.product.id_producto,
            cantidad: item.cantidad,
            nuevo: 0,  
          });
        }
        return null;
      }));
  
      emptyCart();
      setSuccessDialogOpen(true);
      
    } catch (error) {
      console.error('Error al enviar el pedido:', error.response ? error.response.data : error.message);
      const message = error.response ? error.response.data : error.message;
      setFeedback({ severity: 'error', message: `Error al enviar el pedido: ${message}` });
    } finally {
      setLoading(false);
      closeCombinedDialog();
    }
  };

  const openCombinedDialog = () => setCombinedDialogOpen(true);
  const closeCombinedDialog = () => setCombinedDialogOpen(false);
  const handleCloseSuccessDialog = () => setSuccessDialogOpen(false); 
  const handleCloseFeedback = (_event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback(null);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeItem,
      emptyCart,
      clearCart, 
      updateItemQuantity,
      sendOrder,
      combinedDialogOpen,
      openCombinedDialog,
      closeCombinedDialog,
      loading,
    }}>
      {children}
      <SuccessDialog open={successDialogOpen} onClose={handleCloseSuccessDialog} />
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseFeedback} severity={feedback?.severity ?? 'info'} variant="filled">
          {feedback?.message}
        </Alert>
      </Snackbar>
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
