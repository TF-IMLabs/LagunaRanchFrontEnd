import { QueryClient } from '@tanstack/react-query';

export const queryKeys = {
  menu: {
    all: ['menu'],
    categories: () => [...queryKeys.menu.all, 'categories'],
    products: () => [...queryKeys.menu.all, 'products'],
    byCategory: (categoryId) => [
      ...queryKeys.menu.all,
      'category',
      categoryId ?? 'all',
    ],
    subcategories: (categoryId) => [
      ...queryKeys.menu.all,
      'subcategories',
      categoryId ?? 'all',
    ],
  },
  waiters: {
    all: ['waiters'],
  },
  orders: {
    all: ['orders'],
    list: (filters = {}) => [...queryKeys.orders.all, 'list', filters],
    detail: (orderId) => [...queryKeys.orders.all, 'detail', orderId],
    live: () => [...queryKeys.orders.all, 'live'],
    stats: () => [...queryKeys.orders.all, 'stats'],
  },
  tables: {
    all: ['tables'],
    detail: (tableId) => [...queryKeys.tables.all, 'detail', tableId],
  },
  auth: {
    session: ['auth', 'session'],
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000, // 10 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: false,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
    mutations: {
      retry: 1,
    },
  },
});

export default queryClient;
