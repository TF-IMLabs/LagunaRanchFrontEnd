import { useCallback, useState } from 'react';
import { getOrderByTable } from '../services/cartService';

const normalizeOrderItem = (item) => {
  const cantidad = Number(item.cantidad ?? item.cant ?? 0);
  if (!item.id_producto || !cantidad) {
    return null;
  }

  return {
    product: {
      id_producto: item.id_producto,
      nombre: item.nombre ?? `Producto ${item.id_producto}`,
      descripcion: item.descripcion ?? '',
      precio: item.precio ?? item.precio_unitario ?? '0',
      imagen: item.imagen ?? null,
      stock: 1,
      plato_del_dia: item.nuevo ?? 0,
      id_categoria: item.id_categoria ?? item.categoria_id ?? null,
      id_subcategoria: item.id_subcategoria ?? item.subcategoria_id ?? null,
      vegetariano: item.vegetariano ?? 0,
      vegano: item.vegano ?? 0,
      celiaco: item.celiaco ?? 0,
      nuevo: 0,
      disponible: true,
      categoria_id: item.id_categoria ?? item.categoria_id ?? 0,
      subcategoria_id: item.id_subcategoria ?? item.subcategoria_id ?? null,
    },
    cantidad,
    notes: item.notas ?? '',
  };
};

export const useExistingOrder = () => {
  const [existingItems, setExistingItems] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadExistingOrder = useCallback(async (tableId) => {
    if (!tableId) {
      setExistingItems([]);
      setOrderId(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getOrderByTable(tableId);
      const resultArray = Array.isArray(response?.result)
        ? response.result
        : Array.isArray(response)
        ? response
        : [];

      if (
        resultArray.length > 0 &&
        resultArray[0] &&
        typeof resultArray[0].mensaje === 'string' &&
        /no est[aá] ocupada/i.test(resultArray[0].mensaje)
      ) {
        setExistingItems([]);
        setOrderId(null);
        return;
      }

      const normalized = resultArray
        .map((item) => normalizeOrderItem(item))
        .filter(Boolean);

      setExistingItems(normalized);
      setOrderId(resultArray[0]?.id_pedido ?? null);
    } catch (err) {
      console.error('Error loading existing order:', err);
      setExistingItems([]);
      setOrderId(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    existingItems,
    orderId,
    loadExistingOrder,
    loading,
    error,
  };
};

export default useExistingOrder;
