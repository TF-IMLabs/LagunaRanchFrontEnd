import apiClient from './apiClient'; // Reutilizamos el cliente configurado con Axios

// Crear un pedido
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/cart/create', orderData);
    return response.data;
  } catch (error) {
    console.error('Error al crear la orden:', error);
    throw error;
  }
};

export const addProductToOrder = async (productData) => {
  try {
    console.log('Datos que se envían al backend:', productData);

    const response = await apiClient.post('/cart/add', {
      orderId: productData.orderId, // Incluye orderId
      id_producto: productData.id_producto,
      cantidad: productData.cantidad,
      // No envíes `p_del_dia` si no es necesario
    });

    console.log('Respuesta del servidor:', response.data);
    return response.data; // Retorna los datos de la respuesta
  } catch (error) {
    console.error('Error al agregar el producto a la orden:', error);
    throw error; // Propaga el error para manejarlo en el lugar de llamada
  }
};

// Obtener detalles del pedido por ID de pedido
export const getOrderDetailByOrderId = async (id_pedido) => {
  try {
    const response = await apiClient.get(`/cart/detail/${id_pedido}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    throw error;
  }
};

// Obtener información del carrito por ID de pedido
export const getCartInfo = async (id_pedido) => {
  try {
    const response = await apiClient.get(`/cart/${id_pedido}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener la información del carrito:', error);
    throw error;
  }
};

// Obtener todos los pedidos
export const getAllOrders = async () => {
  try {
    const response = await apiClient.get('/cart/all');
    return response.data;
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error);
    throw error;
  }
};

// Actualizar el estado del pedido
export const updateOrderStatus = async (orderStatusData) => {
  try {
    const response = await apiClient.put('/cart/update/order', orderStatusData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    throw error;
  }
};

// Eliminar un producto del carrito por ID de detalle
export const removeCartItem = async (id_detalle) => {
  try {
    const response = await apiClient.delete(`/cart/item/${id_detalle}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el producto del carrito:', error);
    throw error;
  }
};

// Eliminar un pedido por ID de pedido
export const removeOrder = async (id_pedido) => {
  try {
    const response = await apiClient.delete(`/cart/order/${id_pedido}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    throw error;
  }
};

// Obtener el pedido por tableId
export const GetOrderByTable = async (tableId) => {
  try {
    const response = await apiClient.get(`/cart/table/${tableId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el pedido por mesa:', error);
    throw error;
  }
};

export const updateOrderDetail = async (orderDetailData) => {
  try {
    const response = await apiClient.put('/cart/updateUnit', {
      id_pedido: orderDetailData.id_pedido,
      id_producto: orderDetailData.id_producto,
      cantidad: orderDetailData.cantidad,
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el detalle del pedido:', error);
    throw error;
  }
};

// Pasar los productos a viejo para poder diferenciarlos en el detalle del pedido
export const putProductsAsOld = async (orderId) => {
  try {
    const response = await apiClient.put('/cart/putProductsAsOld', { orderId });
    return response.data;
  } catch (error) {
    console.error('Error al marcar los productos como viejos:', error);
    throw error;
  }
};