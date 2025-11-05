import { useCallback, useEffect, useState } from 'react';

const CART_STORAGE_KEY = 'resto_cart';
const CART_TIMESTAMP_KEY = 'resto_cart_timestamp';
const MAX_CART_AGE = 30 * 60 * 1000; // 30 minutes

const readStoredCart = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    const savedTimestamp = window.localStorage.getItem(CART_TIMESTAMP_KEY);

    if (!savedCart || !savedTimestamp) {
      const legacyCart = window.localStorage.getItem('cart');
      const legacyTimestamp = window.localStorage.getItem('cartSetTime');

      if (legacyCart && legacyTimestamp) {
        const migratedCart = JSON.parse(legacyCart);
        const migratedTimestamp = Number(legacyTimestamp);

        if (
          Array.isArray(migratedCart) &&
          !Number.isNaN(migratedTimestamp) &&
          Date.now() - migratedTimestamp < MAX_CART_AGE
        ) {
          window.localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(migratedCart),
          );
          window.localStorage.setItem(
            CART_TIMESTAMP_KEY,
            migratedTimestamp.toString(),
          );
          window.localStorage.removeItem('cart');
          window.localStorage.removeItem('cartSetTime');
          return migratedCart;
        }
      }

      return [];
    }

    const timestamp = parseInt(savedTimestamp, 10);
    if (Number.isNaN(timestamp)) {
      return [];
    }

    if (Date.now() - timestamp > MAX_CART_AGE) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(CART_TIMESTAMP_KEY);
      return [];
    }

    return JSON.parse(savedCart);
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
};

export const useCartPersistence = () => {
  const [cart, setCart] = useState(() => readStoredCart());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (cart.length > 0) {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        window.localStorage.setItem(
          CART_TIMESTAMP_KEY,
          Date.now().toString(),
        );
      } else {
        window.localStorage.removeItem(CART_STORAGE_KEY);
        window.localStorage.removeItem(CART_TIMESTAMP_KEY);
      }
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }, [cart]);

  const updateCart = useCallback((updater) => {
    setCart((prevCart) => {
      if (typeof updater === 'function') {
        return updater(prevCart);
      }
      return updater;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(CART_TIMESTAMP_KEY);
    }
  }, []);

  const getCartAge = useCallback(() => {
    if (typeof window === 'undefined') {
      return 0;
    }

    const savedTimestamp = window.localStorage.getItem(CART_TIMESTAMP_KEY);
    if (!savedTimestamp) {
      return 0;
    }

    const timestamp = parseInt(savedTimestamp, 10);
    if (Number.isNaN(timestamp)) {
      return 0;
    }

    return Date.now() - timestamp;
  }, []);

  const isCartExpired = useCallback(() => {
    return getCartAge() > MAX_CART_AGE;
  }, [getCartAge]);

  const refreshCartTimestamp = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (cart.length > 0) {
      window.localStorage.setItem(
        CART_TIMESTAMP_KEY,
        Date.now().toString(),
      );
    }
  }, [cart]);

  return {
    cart,
    updateCart,
    clearCart,
    refreshCartTimestamp,
    getCartAge,
    isCartExpired,
    maxAge: MAX_CART_AGE,
  };
};

export default useCartPersistence;
