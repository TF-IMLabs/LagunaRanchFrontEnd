import apiClient from './apiClient';

const unwrapResponse = (response, fallback = null) =>
  response?.data ?? response ?? fallback;

export const getUserById = async () => {
  try {
    const response = await apiClient.get('/user');
    return unwrapResponse(response, null);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    throw new Error('Error al obtener el usuario.');
  }
};

export const updateUser = async (userData) => {
  try {
    const response = await apiClient.put('/user/update', userData);
    return {
      data: unwrapResponse(response, null),
      message: 'Usuario actualizado con exito.',
    };
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    throw new Error('Error al actualizar el usuario.');
  }
};

export const updateAdminStatus = async (statusData) => {
  try {
    const response = await apiClient.put('/user/admin/', statusData);
    return {
      data: unwrapResponse(response, null),
      message: 'Estado de administrador actualizado.',
    };
  } catch (error) {
    console.error('Error al actualizar el estado admin:', error);
    throw new Error('Error al actualizar el estado admin.');
  }
};

export const recoverPassword = async ({ email, newPassword }) => {
  try {
    const response = await apiClient.put('/user/recover-password', {
      email,
      newPassword,
    });
    return {
      data: unwrapResponse(response, null),
      message: 'Contrasena actualizada con exito.',
    };
  } catch (error) {
    console.error('Error al recuperar la contrasena:', error);
    throw new Error('Error al recuperar la contrasena.');
  }
};

export const deleteUser = async () => {
  try {
    const response = await apiClient.delete('/user/delete');
    return {
      data: unwrapResponse(response, null),
      message: 'Usuario eliminado con exito.',
    };
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw new Error('Error al eliminar el usuario.');
  }
};

export const createDirection = async (direccion) => {
  try {
    const response = await apiClient.post('/user/direction', { direccion });
    return {
      data: unwrapResponse(response, null),
      message: 'Direccion creada con exito.',
    };
  } catch (error) {
    console.error('Error al crear la direccion:', error);
    throw new Error('Error al crear la direccion.');
  }
};

export const updateDirection = async ({ id_direccion, direccion }) => {
  try {
    const response = await apiClient.put('/user/direction', {
      id_direccion,
      direccion,
    });
    return {
      data: unwrapResponse(response, null),
      message: 'Direccion actualizada con exito.',
    };
  } catch (error) {
    console.error('Error al actualizar la direccion:', error);
    throw new Error('Error al actualizar la direccion.');
  }
};

export const deleteDirection = async (id_direccion) => {
  try {
    const response = await apiClient.delete('/user/direction', {
      data: { id_direccion },
    });
    return {
      data: unwrapResponse(response, null),
      message: 'Direccion eliminada con exito.',
    };
  } catch (error) {
    console.error('Error al eliminar la direccion:', error);
    throw new Error('Error al eliminar la direccion.');
  }
};
