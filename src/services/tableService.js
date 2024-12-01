import apiClient from './apiClient'; // Reutilizamos el cliente configurado con Axios

// Obtener todas las mesas
export const getAllTables = async () => {
  try {
    const response = await apiClient.get('/table/all');
    return response.data;
  } catch (error) {
    console.error('Error al obtener todas las mesas:', error);
    throw error;
  }
};

// Obtener usuario y contraseña por ID de mesa
export const getUserAndPasswByTable = async (tableId) => {
  try {
    const response = await apiClient.get(`/table/user/${tableId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el usuario y contraseña para la mesa con ID ${tableId}:`, error);
    throw error;
  }
};

// Actualizar el estado de una mesa
export const updateTableStatus = async (tableData) => {
  try {
    const response = await apiClient.put('/table/update/table', tableData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el estado de la mesa:', error);
    throw error;
  }
};

// Actualizar el estado de un pedido y una mesa
export const updateOrderAndTableStatus = async (orderAndTableData) => {
  try {
    const response = await apiClient.put('/table/update/o&t', orderAndTableData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el estado del pedido y de la mesa:', error);
    throw error;
  }
};

// Actualizar el mozo de una mesa
export const updateTableWaiter = async (id_mesa, id_mozo) => {
  try {
    const response = await apiClient.put('/table/update/table/waiter', { id_mesa, id_mozo });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el mozo de la mesa:', error);
    throw error;
  }
};

// Actualizar la información de una mesa (capacidad, estado, mozo)
export const updateTableInfo = async (tableData) => {
  try {
    const response = await apiClient.put('/table/update/info', tableData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la información de la mesa:', error);
    throw error;
  }
};

// Crear una nueva mesa
export const createTable = async (tableData) => {
  try {
    const response = await apiClient.post('/table/create', tableData);
    return response.data;
  } catch (error) {
    console.error('Error al crear la mesa:', error);
    throw error;
  }
};

// Actualizar la nota de una mesa
export const updateTableNote = async (id_mesa, nota) => {
  try {
    const response = await apiClient.put('/table/update/note', { id_mesa, nota });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la nota de la mesa:', error);
    throw error;
  }
};

// Eliminar la nota de una mesa
export const deleteTableNote = async (id_mesa) => {
  try {
    const response = await apiClient.delete('/table/delete/note', { data: { id_mesa } });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la nota de la mesa:', error);
    throw error;
  }
};