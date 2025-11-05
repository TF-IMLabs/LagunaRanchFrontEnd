import apiClient from './apiClient';

export const createWaiter = async (nombre, turno) => {
  try {
    const response = await apiClient.post('/waiter/create', { nombre, turno });
    const data = response?.data ?? response ?? null;
    return { data, message: 'Mozo creado con exito.' };
  } catch (error) {
    console.error('Error al crear el mozo:', error);
    throw error;
  }
};

export const updateWaiter = async (id_mozo, nombre, turno) => {
  try {
    const response = await apiClient.put('/waiter/update', {
      id_mozo,
      nombre,
      turno,
    });
    const data = response?.data ?? response ?? null;
    return { data, message: 'Mozo actualizado con exito.' };
  } catch (error) {
    console.error(`Error al actualizar el mozo con id ${id_mozo}:`, error);
    throw error;
  }
};

export const getAllWaiters = async () => {
  try {
    const response = await apiClient.get('/waiter/all');
    return response?.data ?? response ?? [];
  } catch (error) {
    console.error('Error al obtener los mozos:', error);
    throw error;
  }
};

export const callWaiter = async (id_mesa) => {
  try {
    const response = await apiClient.put('/waiter/call', { id_mesa });
    const data = response?.data ?? response ?? null;
    return { data, message: 'Tu mozo viene en camino.' };
  } catch (error) {
    console.error('Error al llamar al mozo:', error);
    throw error;
  }
};

export const requestBill = async (id_mesa) => {
  try {
    const response = await apiClient.put('/waiter/requestBill', { id_mesa });
    const data = response?.data ?? response ?? null;
    return { data, message: 'Tu cuenta esta en camino.' };
  } catch (error) {
    console.error('Error al solicitar la cuenta:', error);
    throw error;
  }
};

export const updateNotifications = async (id_mesa) => {
  try {
    const response = await apiClient.put('/waiter/resetNotifications', {
      id_mesa,
    });
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al resetear las notificaciones:', error);
    throw error;
  }
};
