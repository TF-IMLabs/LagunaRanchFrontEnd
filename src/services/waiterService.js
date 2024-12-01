import apiClient from './apiClient'; 

// Crear un mozo
export const createWaiter = async (nombre, turno) => {
  try {
    const response = await apiClient.post('/waiter/create', { nombre, turno });
    return { data: response.data, message: 'Mozo creado con éxito. 🎉' };
  } catch (error) {
    console.error('Error al crear el mozo:', error);
    throw new Error('Error al crear el mozo. Intenta nuevamente. ❌'); 
  }
};

// Actualizar un mozo
export const updateWaiter = async (id_mozo, nombre, turno) => {
  try {
    const response = await apiClient.put('/waiter/update', { id_mozo, nombre, turno });
    return { data: response.data, message: 'Mozo actualizado con éxito. ✅' };
  } catch (error) {
    console.error(`Error al actualizar el mozo con id ${id_mozo}:`, error);
    throw new Error(`Error al actualizar el mozo con id ${id_mozo}. ❌`); 
  }
};

export const getAllWaiters = async () => {
  try {
    const response = await apiClient.get('/waiter/all');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los mozos:', error);
    throw new Error('Error al obtener los mozos. ❌'); 
  }
};

export const callWaiter = async (id_mesa) => {
  try {
    const response = await apiClient.put('/waiter/call', { id_mesa });
    return { data: response.data, message: 'Listo! Tu mozo viene en camino 🍽️' };
  } catch (error) {
    console.error('Error al llamar al mozo:', error);
    throw new Error('Error al llamar al mozo. Intenta nuevamente. ❌'); 
  }
};

// Solicitar la cuenta
export const requestBill = async (id_mesa) => {
  try {
    const response = await apiClient.put('/waiter/requestBill', { id_mesa });
    return { data: response.data, message: 'Perfecto! Tu cuenta está en camino 🧾' };
  } catch (error) {
    console.error('Error al solicitar la cuenta:', error);
    throw new Error('Error al solicitar la cuenta. Intenta nuevamente. ❌'); 
  }
};

// Resetear notificaciones
export const updateNotifications = async (id_mesa) => {
  try {
    const response = await apiClient.put('/waiter/resetNotifications', { id_mesa });
    return response.data; 
  } catch (error) {
    console.error('Error al resetear las notificaciones:', error);
    throw new Error('Error al resetear las notificaciones. ❌'); 
  }
};
