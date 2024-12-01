import apiClient from './apiClient'; // Reutilizamos el cliente configurado con Axios

// Obtener todos los productos
export const getAllProducts = async () => {
  try {
    const response = await apiClient.get('/menu');
    return response.data;
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    throw error;
  }
};

// Obtener producto por ID
export const getProductById = async (productId) => {
  try {
    const response = await apiClient.get(`/menu/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el producto con ID ${productId}:`, error);
    throw error;
  }
};

// Obtener todas las categorías
export const getAllCategories = async () => {
  try {
    const response = await apiClient.get('/menu/cat');
    return response.data;
  } catch (error) {
    console.error('Error al obtener todas las categorías:', error);
    throw error;
  }
};

// Obtener subcategorías por ID de categoría
export const getSubcategoriesByCategoryId = async (categoryId) => {
  try {
    const response = await apiClient.get(`/menu/subcat/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener subcategorías para la categoría con ID ${categoryId}:`, error);
    throw error;
  }
};

// Crear un producto
export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/menu', productData);
    return response.data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

// Actualizar un producto
export const updateProduct = async (productId, productData) => {
  try {
    const response = await apiClient.put(`/menu/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el producto con ID ${productId}:`, error);
    throw error;
  }
};

// Eliminar un producto
export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/menu/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${productId}:`, error);
    throw error;
  }
};

// Crear una categoría
export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/menu/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }
};

// Eliminar una categoría
export const deleteCategory = async (categoryId) => {
  try {
    const response = await apiClient.delete(`/menu/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar la categoría con ID ${categoryId}:`, error);
    throw error;
  }
};

// Actualizar el stock de un producto
export const updateStock = async (id_producto, stock) => {
  try {
    const response = await apiClient.put('/menu/updateStock', { id_producto, stock });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el stock del producto:', error);
    throw error;
  }
};

export const updatePlatoDelDia = async (id_producto, p_del_dia) => {
  try {
    const response = await apiClient.put('/menu/updatePlatoDelDia', { id_producto, p_del_dia });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el estado de plato del día:', error);
    throw error;
  }
};