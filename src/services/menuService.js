import apiClient from './apiClient';

export const getAllProducts = async () => {
  try {
    const response = await apiClient.get('/menu');
    return response?.data ?? response ?? [];
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    throw error;
  }
};

export const getPaginatedProducts = async ({
  page = 1,
  limit = 20,
  search = '',
  category,
  categoryId,
  signal,
} = {}) => {
  try {
    const params = {
      page,
      limit,
    };

    const resolvedCategory = categoryId ?? category;
    if (resolvedCategory) {
      params.category = resolvedCategory;
    }

    const normalizedSearch = String(search).trim();
    if (normalizedSearch) {
      params.search = normalizedSearch;
    }

    const data = await apiClient.get('/menu', {
      params,
      signal,
    });

    return normalizeProductsPage(data, { page, limit });
  } catch (error) {
    console.error('Error al obtener productos paginados:', error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await apiClient.get(`/menu/product/${productId}`);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error(`Error al obtener el producto con ID ${productId}:`, error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await apiClient.get('/menu/categories');
    return response?.data ?? response ?? [];
  } catch (error) {
    console.error('Error al obtener todas las categorías:', error);
    throw error;
  }
};

export const getSubcategoriesByCategoryId = async (categoryId) => {
  try {
    const response = await apiClient.get(`/menu/subcategories/category/${categoryId}`);
    return response?.data ?? response ?? [];
  } catch (error) {
    console.error(`Error al obtener subcategorías para la categoría con ID ${categoryId}:`, error);
    throw error;
  }
};

export const getProductsByCategoryId = async (categoryId) => {
  try {
    const response = await apiClient.get(`/menu/products/category/${categoryId}`);
    return response?.data ?? response ?? [];
  } catch (error) {
    console.error(`Error al obtener productos para la categoría con ID ${categoryId}:`, error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/menu', productData);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await apiClient.put(`/menu/product/${productId}`, productData);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error(`Error al actualizar el producto con ID ${productId}:`, error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/menu/product/${productId}`);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error(`Error al eliminar el producto con ID ${productId}:`, error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await apiClient.post('/menu/category', categoryData);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await apiClient.delete(`/menu/category/${categoryId}`);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error(`Error al eliminar la categoría con ID ${categoryId}:`, error);
    throw error;
  }
};

export const updateStock = async (id_producto, stock) => {
  try {
    const response = await apiClient.put('/menu/updateStock', { id_producto, stock });
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al actualizar el stock del producto:', error);
    throw error;
  }
};

export const updatePlatoDelDia = async (id_producto, p_del_dia) => {
  try {
    const response = await apiClient.put('/menu/updatePlatoDelDia', { id_producto, p_del_dia });
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al actualizar el estado de plato del día:', error);
    throw error;
  }
};

export const createSubCategory = async (subCategoryData) => {
  try {
    const payload = {
      id_category: subCategoryData.id_category ?? subCategoryData.categoryId,
      name: subCategoryData.name ?? subCategoryData.subcategoryName,
    };
    const response = await apiClient.post('/menu/subCategory', payload);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error('Error al crear subcategoría:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await apiClient.put('/menu/category', {
      id_category: categoryId,
      ...categoryData,
    });
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error(`Error al actualizar la categoría con ID ${categoryId}:`, error);
    throw error;
  }
};

export const updateSubCategory = async (subCategoryId, subCategoryData) => {
  try {
    const response = await apiClient.put('/menu/subCategory', {
      id_subcategory: subCategoryId,
      ...subCategoryData,
    });
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error(`Error al actualizar la subcategoría con ID ${subCategoryId}:`, error);
    throw error;
  }
};

export const deleteSubCategory = async (subCategoryId) => {
  try {
    const response = await apiClient.delete(`/menu/subCategory/${subCategoryId}`);
    return response?.data ?? response ?? null;
  } catch (error) {
    console.error(`Error al eliminar la subcategoría con ID ${subCategoryId}:`, error);
    throw error;
  }
};
function extractProductArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeProductsPage(payload, { page, limit }) {
  const items = extractProductArray(payload);

  const resolvedTotal =
    [payload?.total, payload?.count, payload?.data?.total, payload?.meta?.total].find(
      (value) => typeof value === 'number',
    ) ?? (Array.isArray(payload) ? payload.length : items.length);

  const resolvedPageSize =
    Number(payload?.pageSize ?? payload?.limit ?? payload?.perPage ?? payload?.meta?.perPage) ||
    limit;

  const resolvedPage =
    Number(payload?.page ?? payload?.currentPage ?? payload?.meta?.page) || page;

  const hasMore =
    typeof payload?.hasMore === 'boolean'
      ? payload.hasMore
      : resolvedTotal
      ? resolvedPage * resolvedPageSize < resolvedTotal
      : items.length === resolvedPageSize;

  return {
    items,
    total: resolvedTotal,
    page: resolvedPage,
    pageSize: resolvedPageSize,
    hasMore,
  };
}
