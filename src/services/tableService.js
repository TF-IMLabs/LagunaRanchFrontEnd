import apiClient from './apiClient';

export const getAllTables = async () => {
  try {
    const response = await apiClient.get('/table/all');
    return response?.data ?? response ?? [];
  } catch (error) {
    console.error('Error al obtener todas las mesas:', error);
    throw error;
  }
};

export const getUserAndPasswByTable = async (tableId) => {
  try {
    const response = await apiClient.get(`/table/user/${tableId}`);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error(`Error al obtener el usuario y contraseña para la mesa con ID ${tableId}:`, error);
    throw error;
  }
};

export const updateTableStatus = async (tableData) => {
  try {
    const response = await apiClient.put('/table/update/table', tableData);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al actualizar el estado de la mesa:', error);
    throw error;
  }
};

export const updateOrderAndTableStatus = async (orderAndTableData) => {
  try {
    const response = await apiClient.put('/table/update/o&t', orderAndTableData);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al actualizar el estado del pedido y de la mesa:', error);
    throw error;
  }
};

export const updateTableWaiter = async (id_mesa, id_mozo) => {
  try {
    const response = await apiClient.put('/table/update/table/waiter', { id_mesa, id_mozo });
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al actualizar el mozo de la mesa:', error);
    throw error;
  }
};

export const updateTableInfo = async (tableData) => {
  try {
    const response = await apiClient.put('/table/update/info', tableData);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al actualizar la información de la mesa:', error);
    throw error;
  }
};

export const createTable = async (tableData) => {
  try {
    const response = await apiClient.post('/table/create', tableData);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al crear la mesa:', error);
    throw error;
  }
};

export const updateTableNote = async (id_mesa, nota) => {
  try {
    const response = await apiClient.put('/table/update/note', { id_mesa, nota });
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al actualizar la nota de la mesa:', error);
    throw error;
  }
};

export const deleteTableNote = async (id_mesa) => {
  try {
    const response = await apiClient.delete('/table/delete/note', { data: { id_mesa } });
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al eliminar la nota de la mesa:', error);
    throw error;
  }
};
