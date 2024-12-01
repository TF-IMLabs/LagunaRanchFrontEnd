import React, { createContext, useState, useContext } from 'react'; 
import { addProductToOrder, createOrder, GetOrderByTable, updateOrderDetail, updateOrderStatus } from '../services/cartService';
import { useAuth } from './AuthContext';
import SuccessDialog from '../components/dialogs/SuccessDialog'; // Importar el nuevo componente

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { auth } = useAuth();
  const { tableId, clientId } = auth;
  const [cart, setCart] = useState([]);
  const [combinedDialogOpen, setCombinedDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false); // Estado para el diálogo de éxito

  // Funciones para manejar el carrito
  const addToCart = (product, quantity) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.product.id_producto === product.id_producto && item.product.nuevo === 0
      );

      if (existingItemIndex > -1) {
        // Si ya existe con nuevo=0, creamos una nueva entrada con nuevo=1
        return [...prevCart, { product: { ...product, nuevo: 1 }, cantidad: quantity }];
      } else {
        // Si no existe, simplemente lo agregamos al carrito
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
      console.log("Buscando orden actual para la mesa con ID:", tableId);
      const existingOrder = await GetOrderByTable(tableId);
      console.log("Resultado de GetOrderByTable:", existingOrder);
      
      if (existingOrder && existingOrder.result.length > 0) {
        const firstResult = existingOrder.result[0];
        if (firstResult.mensaje === "La mesa no está ocupada.") {
          console.log("La mesa no está ocupada.");
          return null;
        } else {
          const orderId = firstResult.id_pedido;
          console.log("Orden actual encontrada con ID:", orderId);
          return orderId;
        }
      }
    }
    return null;
  };

  const sendOrder = async () => {
    if (cart.length === 0 || !tableId || !clientId) {
      console.log("No se puede enviar el pedido: carrito vacío o faltan datos de mesa/cliente");
      return;
    }
  
    setLoading(true);
    try {
      console.log("Enviando pedido...");
      const existingOrderId = await fetchCurrentOrder();
      let orderId = existingOrderId;
  
      let isNewOrder = false; // Variable para determinar si estamos creando una nueva orden
  
      if (!orderId) {
        console.log("No se encontró una orden existente, creando nueva orden...");
        // Crear nueva orden si no existe
        const orderData = {
          id_cliente: parseInt(clientId, 10),
          id_mesa: parseInt(tableId, 10),
        };
  
        const response = await createOrder(orderData);
        console.log("Respuesta de createOrder:", response);
        if (response && response.orderId) {
          orderId = response.orderId;
          isNewOrder = true; // Marcamos que se ha creado una nueva orden
          console.log("Nueva orden creada con ID:", orderId);
        } else {
          throw new Error('No se pudo obtener el orderId después de crear la orden');
        }
      }
  
      if (!orderId) {
        throw new Error('No se pudo obtener un ID de orden válido');
      }
  
      console.log("Obteniendo detalles de la orden existente...");
      const existingOrderDetails = await GetOrderByTable(tableId);
      console.log("Detalles de la orden existente:", existingOrderDetails);
      
      let itemsUpdated = false;  // Flag para verificar si se han agregado nuevos elementos
  
      for (const item of cart) {
        console.log("Procesando producto:", item.product.id_producto);
        const existingDetail = existingOrderDetails.result.find(
          detail => detail.id_producto === item.product.id_producto && detail.nuevo === 0
        );
  
        if (existingDetail) {
          console.log("Actualizando cantidad para el producto existente:", item.product.id_producto);
          await updateOrderDetail({
            id_pedido: orderId,
            id_producto: item.product.id_producto,
            cantidad: item.cantidad, // Asegúrate de pasar solo la cantidad del carrito
          });
          
          itemsUpdated = true;
        } else {
          console.log("Agregando nuevo producto a la orden:", item.product.id_producto);
          const productData = {
            orderId: parseInt(orderId, 10),
            id_producto: parseInt(item.product.id_producto, 10),
            cantidad: parseInt(item.cantidad, 10),
          };
          
          await addProductToOrder(productData);
          itemsUpdated = true;
        }
      }
  
      if (orderId && itemsUpdated && !isNewOrder) {
        console.log("Actualizando el estado de la orden a 'Actualizado'...");
        await updateOrderStatus({ id_pedido: orderId, estado: 'Actualizado' });
      }
  
      // Actualizar el estado de los productos nuevos (nuevo=1) a viejo (nuevo=0)
      await Promise.all(cart.map(item => {
        if (item.product.nuevo === 1) {
          return updateOrderDetail({
            id_pedido: orderId,
            id_producto: item.product.id_producto,
            cantidad: item.cantidad,
            nuevo: 0,  // Cambiamos el estado de nuevo a 0
          });
        }
        return null;
      }));
  
      console.log("Vaciando carrito...");
      emptyCart();
      setSuccessDialogOpen(true);
      console.log("Pedido enviado con éxito.");
    } catch (error) {
      console.error('Error al enviar el pedido:', error.response ? error.response.data : error.message);
      alert('Error al enviar el pedido: ' + (error.response ? error.response.data : error.message));
    } finally {
      setLoading(false);
      closeCombinedDialog();
    }
  };

  const openCombinedDialog = () => setCombinedDialogOpen(true);
  const closeCombinedDialog = () => setCombinedDialogOpen(false);
  
  const handleCloseSuccessDialog = () => setSuccessDialogOpen(false); // Manejar el cierre del diálogo de éxito

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeItem,
      emptyCart,
      updateItemQuantity,
      sendOrder,
      combinedDialogOpen,
      openCombinedDialog,
      closeCombinedDialog,
      loading,
    }}>
      {children}
      <SuccessDialog open={successDialogOpen} onClose={handleCloseSuccessDialog} /> {/* Añadir el diálogo aquí */}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
