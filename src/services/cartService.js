import apiClient from './apiClient';

const unwrapResponse = (response, fallback = null) =>
  response?.data ?? response ?? fallback;

export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/cart/create', orderData);
    return unwrapResponse(response);
  } catch (error) {
    console.error('Error al crear la orden:', error);
    throw error;
  }
};

export const addProductToOrder = async ({
  id_pedido,
  orderId,
  id_producto,
  cantidad,
  notas,
  precio,
  nuevo,
}) => {
  try {
    const resolvedOrderId =
      typeof orderId !== 'undefined' ? orderId : id_pedido;

    if (!resolvedOrderId) {
      throw new Error('orderId es requerido para agregar productos');
    }

    const payload = {
      orderId: Number(resolvedOrderId),
      id_producto,
      cantidad,
    };

    if (typeof notas !== 'undefined') {
      payload.notas = notas;
    }

    if (typeof precio !== 'undefined') {
      payload.precio = precio;
    }

    if (typeof nuevo !== 'undefined') {
      payload.nuevo = nuevo;
    }

    const response = await apiClient.post('/cart/add', payload);
    return unwrapResponse(response);
  } catch (error) {
    console.error('Error al agregar el producto a la orden:', error);
    throw error;
  }
};

export const getOrderDetailByOrderId = async (id_pedido) => {
  try {
    const response = await apiClient.get(`/cart/detail/${id_pedido}`);
    return unwrapResponse(response, []);
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    throw error;
  }
};

export const getCartInfo = async (id_pedido) => {
  try {
    const response = await apiClient.get(`/cart/${id_pedido}`);
    return unwrapResponse(response, null);
  } catch (error) {
    console.error('Error al obtener la informacion del carrito:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await apiClient.get('/cart/all');
    return unwrapResponse(response, []);
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderStatusData) => {
  try {
    const response = await apiClient.put('/cart/update/order', orderStatusData);
    return unwrapResponse(response);
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    throw error;
  }
};

export const updateOrderDelay = async (delayData) => {
  try {
    const response = await apiClient.put('/cart/updateDelay', delayData);
    return unwrapResponse(response);
  } catch (error) {
    console.error('Error al actualizar el delay del pedido:', error);
    throw error;
  }
};

export const removeCartItem = async (id_detalle) => {
  try {
    const response = await apiClient.delete(`/cart/item/${id_detalle}`);
    return unwrapResponse(response);
  } catch (error) {
    console.error('Error al eliminar el producto del carrito:', error);
    throw error;
  }
};

export const removeOrder = async (id_pedido) => {
  try {
    const response = await apiClient.delete(`/cart/order/${id_pedido}`);
    return unwrapResponse(response);
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    throw error;
  }
};

export const getOrderByTable = async (id_table) => {
  try {
    const response = await apiClient.get(`/cart/table/${id_table}`);
    return unwrapResponse(response, null);
  } catch (error) {
    console.error('Error al obtener el pedido por mesa:', error);
    throw error;
  }
};

export const updateOrderDetail = async ({ id_pedido, id_producto, cantidad, nuevo }) => {
  try {
    const response = await apiClient.put('/cart/updateUnit', {
      id_pedido,
      id_producto,
      cantidad,
      ...(typeof nuevo !== 'undefined' ? { nuevo } : {}),
    });
    return unwrapResponse(response);
  } catch (error) {
    console.error('Error al actualizar el detalle del pedido:', error);
    throw error;
  }
};

export const putProductsAsOld = async (id_pedido) => {
  try {
    const response = await apiClient.put('/cart/putProductsAsOld', { id_pedido });
    return unwrapResponse(response);
  } catch (error) {
    console.error('Error al marcar los productos como antiguos:', error);
    throw error;
  }
};
