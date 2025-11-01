import apiClient from './apiClient';

export const getUserById = async () => {
  try {
    const response = await apiClient.get('/user');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw new Error('Error al obtener el usuario.');
  }
};

export const updateUser = async (userData) => {
  try {
    const response = await apiClient.put('/user/update', userData);
    return { data: response.data, message: 'Usuario actualizado con éxito.' };
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    throw new Error('Error al actualizar el usuario.');
  }
};

export const updateAdminStatus = async (statusData) => {
  try {
    const response = await apiClient.put('/user/admin/', statusData);
    return { data: response.data, message: 'Estado de administrador actualizado.' };
  } catch (error) {
    console.error('Error al actualizar el estado admin:', error);
    throw new Error('Error al actualizar el estado admin.');
  }
};

export const recoverPassword = async ({ email, newPassword }) => {
  try {
    const response = await apiClient.put('/user/recover-password', { email, newPassword });
    return { data: response.data, message: 'Contraseña actualizada con éxito.' };
  } catch (error) {
    console.error('Error al recuperar la contraseña:', error);
    throw new Error('Error al recuperar la contraseña.');
  }
};

export const deleteUser = async () => {
  try {
    const response = await apiClient.delete('/user/delete');
    return { data: response.data, message: 'Usuario eliminado con éxito.' };
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw new Error('Error al eliminar el usuario.');
  }
};

export const createDirection = async (direccion) => {
  try {
    const response = await apiClient.post('/user/direction', { direccion });
    return { data: response.data, message: 'Dirección creada con éxito.' };
  } catch (error) {
    console.error('Error al crear la dirección:', error);
    throw new Error('Error al crear la dirección.');
  }
};

export const updateDirection = async ({ id_direccion, direccion }) => {
  try {
    const response = await apiClient.put('/user/direction', { id_direccion, direccion });
    return { data: response.data, message: 'Dirección actualizada con éxito.' };
  } catch (error) {
    console.error('Error al actualizar la dirección:', error);
    throw new Error('Error al actualizar la dirección.');
  }
};

export const deleteDirection = async (id_direccion) => {
  try {
    const response = await apiClient.delete('/user/direction', { data: { id_direccion } });
    return { data: response.data, message: 'Dirección eliminada con éxito.' };
  } catch (error) {
    console.error('Error al eliminar la dirección:', error);
    throw new Error('Error al eliminar la dirección.');
  }
};
