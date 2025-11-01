import { useQuery } from '@tanstack/react-query';
import { getAllCategories, getAllProducts } from '../services/menuService';

export const useMenuData = () => {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
  });

  return { categoriesQuery, productsQuery };
};

export default useMenuData;
