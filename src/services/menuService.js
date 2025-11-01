import apiClient from './apiClient';

export const getAllProducts = async () => {
  try {
    const response = await apiClient.get('/menu');
    return response.data;
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await apiClient.get(`/menu/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el producto con ID ${productId}:`, error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await apiClient.get('/menu/categories');
    return response.data;
  } catch (error) {
    console.error('Error al obtener todas las categorías:', error);
    throw error;
  }
};

export const getSubcategoriesByCategoryId = async (categoryId) => {
  try {
    const response = await apiClient.get(`/menu/subcategories/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener subcategorías para la categoría con ID ${categoryId}:`, error);
    throw error;
  }
};

export const getProductsByCategoryId = async (categoryId) => {
  try {
    const response = await apiClient.get(`/menu/products/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener productos para la categoría con ID ${categoryId}:`, error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/menu', productData);
    return response.data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await apiClient.put(`/menu/product/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el producto con ID ${productId}:`, error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/menu/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${productId}:`, error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/menu/category', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await apiClient.delete(`/menu/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar la categoría con ID ${categoryId}:`, error);
    throw error;
  }
};

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

export const createSubCategory = async (subCategoryData) => {
  try {
    const response = await apiClient.post('/menu/subCategory', subCategoryData);
    return response.data;
  } catch (error) {
    console.error('Error al crear subcategoría:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await apiClient.put('/menu/category', { id: categoryId, ...categoryData });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la categoría con ID ${categoryId}:`, error);
    throw error;
  }
};

export const updateSubCategory = async (subCategoryId, subCategoryData) => {
  try {
    const response = await apiClient.put('/menu/subCategory', { id: subCategoryId, ...subCategoryData });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la subcategoría con ID ${subCategoryId}:`, error);
    throw error;
  }
};

export const deleteSubCategory = async (subCategoryId) => {
  try {
    const response = await apiClient.delete(`/menu/subCategory/${subCategoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar la subcategoría con ID ${subCategoryId}:`, error);
    throw error;
  }
};
