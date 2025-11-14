import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getAllCategories, getAllProducts, getPaginatedProducts } from '../services/menuService';
import { queryKeys } from '../lib/queryClient';

export const useMenuData = ({ productsOptions } = {}) => {
  const shouldUsePagination = Boolean(productsOptions?.paginated);
  const filters = productsOptions?.filters ?? {};
  const pageSize = productsOptions?.pageSize ?? 20;
  const normalizedSearch = String(filters.search ?? '').trim();
  const normalizedCategory =
    filters.categoryId ?? filters.category ?? filters.categorySlug ?? '';
  const categoryKey =
    normalizedCategory === null || normalizedCategory === undefined
      ? ''
      : String(normalizedCategory);
  const searchKey = normalizedSearch.toLowerCase();

  const categoriesQuery = useQuery({
    queryKey: queryKeys.menu.categories(),
    queryFn: getAllCategories,
  });

  const paginatedProductsQuery = useInfiniteQuery({
    queryKey: [
      ...queryKeys.menu.products(),
      'paginated',
      searchKey,
      categoryKey,
      pageSize,
    ],
    queryFn: ({ pageParam = 1, signal }) =>
      getPaginatedProducts({
        page: pageParam,
        limit: pageSize,
        search: normalizedSearch,
        category: categoryKey,
        categoryId: filters.categoryId,
        signal,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? (lastPage.page ?? 1) + 1 : undefined,
    keepPreviousData: true,
    enabled: shouldUsePagination,
  });

  const allProductsQuery = useQuery({
    queryKey: queryKeys.menu.products(),
    queryFn: getAllProducts,
    enabled: !shouldUsePagination,
  });

  const shouldFilterLocally = !shouldUsePagination && (searchKey || categoryKey);
  const locallyFilteredData = useMemo(() => {
    if (!shouldFilterLocally) return allProductsQuery.data;
    const source = allProductsQuery.data ?? [];
    return source.filter((product = {}) => {
      const matchesSearch = searchKey
        ? String(product.nombre ?? '')
            .toLowerCase()
            .includes(searchKey) ||
          String(product.descripcion ?? '')
            .toLowerCase()
            .includes(searchKey)
        : true;
      const matchesCategory = categoryKey
        ? String(product.id_categoria ?? '') === String(categoryKey)
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [shouldFilterLocally, allProductsQuery.data, searchKey, categoryKey]);

  const productsQuery = shouldUsePagination
    ? paginatedProductsQuery
    : {
        ...allProductsQuery,
        data: locallyFilteredData,
      };

  return { categoriesQuery, productsQuery };
};

export default useMenuData;
