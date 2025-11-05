import { useQuery } from '@tanstack/react-query';
import { getAllCategories, getAllProducts } from '../services/menuService';
import { queryKeys } from '../lib/queryClient';

export const useMenuData = () => {
  const categoriesQuery = useQuery({
    queryKey: queryKeys.menu.categories(),
    queryFn: getAllCategories,
  });

  const productsQuery = useQuery({
    queryKey: queryKeys.menu.products(),
    queryFn: getAllProducts,
  });

  return { categoriesQuery, productsQuery };
};

export default useMenuData;
