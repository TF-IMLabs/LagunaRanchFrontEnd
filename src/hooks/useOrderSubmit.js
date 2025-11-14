import { useCallback, useState } from 'react';
import {
  addProductToOrder,
  createOrder,
  getOrderByTable,
  updateOrderStatus,
} from '../services/cartService';
import { ERROR_CODES, resolveErrorCode } from '../services/apiErrorCodes';

const ORDER_TYPE_MAP = {
  'dine-in': 0,
  delivery: 1,
  takeaway: 2,
};

export const VIRTUAL_TABLE = {
  delivery: 1000,
  takeaway: 2000,
};

const normalizeOrderResponse = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.result)) return response.result;
  if (Array.isArray(response.data)) return response.data;
  return [];
};

const resolveError = (error) => {
  if (error.code) {
    return error;
  }

  const code = resolveErrorCode({
    code: error?.data?.code,
    status: error?.status,
    message: error?.message ?? '',
  });

  const enriched = error;
  enriched.code = code;
  return enriched;
};

export const useOrderSubmit = ({
  tableId,
  clientId,
  cart,
  orderType,
  deliveryAddress,
  takeawaySlot,
  venueOpen,
  onSuccess,
  onError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExistingOrderId = useCallback(
    async (currentTableId) => {
      if (!currentTableId) return null;

      const response = await getOrderByTable(currentTableId);
      const resultArray = normalizeOrderResponse(response);

      if (
        resultArray.length > 0 &&
        resultArray[0]?.mensaje &&
        /no est[aá] ocupada/i.test(resultArray[0].mensaje)
      ) {
        return null;
      }

      return resultArray[0]?.id_pedido ?? null;
    },
    [],
  );

  const validateRequirements = useCallback(
    async (currentOrderType = orderType) => {
      if (cart.length === 0) {
        const error = new Error('El carrito esta vacio');
        error.code = ERROR_CODES.VALIDATION_ERROR;
        throw error;
      }

      if (!venueOpen) {
        const error = new Error('El restaurante esta cerrado ahora mismo');
        error.code = ERROR_CODES.TABLE_CLOSED;
        throw error;
      }

      if (currentOrderType === 'dine-in' && !tableId) {
        const error = new Error('No se detecto una mesa valida');
        error.code = ERROR_CODES.TABLE_CLOSED;
        throw error;
      }

      if (currentOrderType === 'delivery' && !deliveryAddress) {
        const error = new Error('Selecciona una direccion para delivery');
        error.code = ERROR_CODES.MISSING_ADDRESS;
        throw error;
      }

      if (currentOrderType === 'takeaway' && !takeawaySlot) {
        const error = new Error('Selecciona un horario de retiro para take away');
        error.code = ERROR_CODES.VALIDATION_ERROR;
        throw error;
      }
    },
    [cart.length, deliveryAddress, orderType, tableId, takeawaySlot, venueOpen],
  );

  const submitOrder = useCallback(async () => {
    const effectiveOrderType =
      orderType === 'dine-in' ? 'dine-in' : orderType || 'takeaway';

    await validateRequirements(effectiveOrderType);

    setIsSubmitting(true);

    try {
      let orderId = null;
      let isNewOrder = true;

      if (effectiveOrderType === 'dine-in') {
        orderId = await fetchExistingOrderId(tableId);
        isNewOrder = !orderId;
      }

      if (!orderId) {
        const mesaId =
          effectiveOrderType === 'dine-in'
            ? tableId
            : VIRTUAL_TABLE[effectiveOrderType] ?? VIRTUAL_TABLE.takeaway;

        const orderPayload = {
          id_cliente: Number(clientId ?? 1),
          id_mesa: Number(mesaId),
          tipo_pedido: ORDER_TYPE_MAP[effectiveOrderType] ?? 0,
        };

        const createdOrder = await createOrder(orderPayload);
        orderId =
          createdOrder?.orderId ??
          createdOrder?.data?.orderId ??
          createdOrder?.id_pedido ??
          null;

        if (!orderId) {
          const error = new Error('No se pudo crear el pedido');
          error.code = ERROR_CODES.UNKNOWN;
          throw error;
        }

        isNewOrder = true;
      }

      for (const item of cart) {
        const productId = Number(item.product.id_producto);
        const cantidad = Number(item.cantidad);

        if (!productId || !cantidad) continue;

        const basePayload = {
          id_pedido: Number(orderId),
          orderId: Number(orderId),
          id_producto: productId,
        };

        const itemNotes = item?.notes ?? item?.nota ?? item?.notas ?? '';
        if (itemNotes) {
          basePayload.notas = itemNotes;
        }

        const unitPrice = Number(item?.product?.precio ?? item?.product?.precio_unitario);
        if (!Number.isNaN(unitPrice)) {
          basePayload.precio = unitPrice;
        }

        basePayload.cantidad = cantidad;
        basePayload.nuevo = 1;

        await addProductToOrder(basePayload);
      }

      if (!isNewOrder && effectiveOrderType === 'dine-in') {
        await updateOrderStatus({
          id_pedido: Number(orderId),
          estado: 'Actualizado',
        });
      }

      if (typeof onSuccess === 'function') {
        onSuccess(orderId);
      }
    } catch (error) {
      const enriched = resolveError(error);
      if (typeof onError === 'function') {
        onError(enriched);
      }
      throw enriched;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    cart,
    clientId,
    fetchExistingOrderId,
    onError,
    onSuccess,
    orderType,
    tableId,
    validateRequirements,
  ]);

  return {
    submitOrder,
    isSubmitting,
  };
};

export default useOrderSubmit;
