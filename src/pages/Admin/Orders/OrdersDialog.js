// src/components/dialogs/OrdersDialog.jsx
import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PropTypes from 'prop-types';
import { Visibility, Delete, Close } from '@mui/icons-material';
import {
  getAllOrders,
  getCartInfo,
  getOrderDetailByOrderId,
  removeOrder,
} from '../../../services/cartService';
import { getAllTables } from '../../../services/tableService';
import { queryKeys } from '../../../lib/queryClient';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import OrderDetailsDialog from './OrderDetailsDialog';

const normalizeCartInfo = (cartInfo) => {
  if (!cartInfo) {
    return { pedidoInfo: [], productos: [] };
  }

  if (Array.isArray(cartInfo)) {
    const productos = Array.isArray(cartInfo.productos) ? cartInfo.productos : [];
    return { pedidoInfo: cartInfo, productos };
  }

  const pedidoInfo = Array.isArray(cartInfo.pedidoInfo)
    ? cartInfo.pedidoInfo
    : cartInfo.pedidoInfo
    ? [cartInfo.pedidoInfo]
    : [];

  const productos = Array.isArray(cartInfo.productos) ? cartInfo.productos : [];

  return { pedidoInfo, productos };
};

const getOrderType = (cartInfo) => {
  if (!cartInfo) return undefined;
  const info = Array.isArray(cartInfo.pedidoInfo) ? cartInfo.pedidoInfo[0] : cartInfo.pedidoInfo;
  return info?.tipo_pedido;
};

const OrdersDialog = ({ open, onClose, tipoPedido = '0' }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderDetailIds, setOrderDetailIds] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  const ordersQueryKey = useMemo(
    () => [...queryKeys.orders.list({ tipoPedido }), tipoPedido],
    [tipoPedido],
  );

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    error: ordersError,
  } = useQuery({
    queryKey: ordersQueryKey,
    enabled: open,
    staleTime: 30_000,
    cacheTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [ordersResponse, tablesResponse] = await Promise.all([getAllOrders(), getAllTables()]);

      const detailedOrders = await Promise.all(
        ordersResponse.map(async (order) => {
          try {
            const cartInfo = normalizeCartInfo(await getCartInfo(order.id_pedido));
            if (String(getOrderType(cartInfo)) !== String(tipoPedido)) {
              return null;
            }
            return { ...order, cartInfo };
          } catch (error) {
            console.error(`Error al obtener el carrito para el pedido ${order.id_pedido}:`, error);
            return null;
          }
        }),
      );

      return {
        orders: detailedOrders.filter(Boolean),
        tables: tablesResponse,
      };
    },
  });

  const orders = useMemo(() => ordersData?.orders ?? [], [ordersData]);
  const tables = useMemo(() => ordersData?.tables ?? [], [ordersData]);
  const ordersLoading = isOrdersLoading || isOrdersFetching;
  const fetchError =
    ordersError?.message ||
    (ordersError ? 'No se pudieron cargar los pedidos. Intenta nuevamente.' : null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTable =
        selectedTable === '' ? true : String(order.id_mesa) === String(selectedTable);
      const matchesStatus = selectedStatus === '' ? true : order.estado === selectedStatus;
      return matchesTable && matchesStatus;
    });
  }, [orders, selectedTable, selectedStatus]);



  const handleOrderClick = async (id_pedido) => {
    setDetailsDialogOpen(true);
    setLoadingDetails(true);
    try {
      const currentOrder = orders.find((order) => order.id_pedido === id_pedido);
      const cachedCartInfo = currentOrder?.cartInfo;

      const [resolvedCartInfo, detailsResponse] = await Promise.all([
        cachedCartInfo
          ? Promise.resolve(cachedCartInfo)
          : getCartInfo(id_pedido).then((data) => normalizeCartInfo(data)),
        getOrderDetailByOrderId(id_pedido),
      ]);

      const normalizedCartInfo = resolvedCartInfo;

      if (!cachedCartInfo) {
        queryClient.setQueryData(ordersQueryKey, (previous) => {
          if (!previous?.orders) {
            return previous;
          }
          const updatedOrders = previous.orders.map((order) =>
            order.id_pedido === id_pedido ? { ...order, cartInfo: normalizedCartInfo } : order,
          );
          return { ...previous, orders: updatedOrders };
        });
      }

      const detailIds = (detailsResponse?.detalles ?? []).map((detail) => detail.id_detalle);

      setOrderInfo(normalizedCartInfo);
      setOrderDetails(normalizedCartInfo.productos);
      setOrderDetailIds(detailIds);
      setSelectedOrder(id_pedido);
    } catch (error) {
      console.error('Error al obtener los detalles del pedido:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedOrder(null);
    setOrderDetails([]);
    setOrderDetailIds([]);
    setOrderInfo(null);
  };

  const handleTableChange = (event) => setSelectedTable(event.target.value);
  const handleStatusChange = (event) => setSelectedStatus(event.target.value);

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await removeOrder(orderToDelete);
      await queryClient.invalidateQueries({ queryKey: ordersQueryKey });
    } catch (error) {
      console.error('Error al eliminar el pedido:', error);
    } finally {
      setConfirmDeleteOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleConfirmDelete = (id_pedido) => {
    setOrderToDelete(id_pedido);
    setConfirmDeleteOpen(true);
  };

  const handleCloseConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    setOrderToDelete(null);
  };

  const emptyState = !ordersLoading && filteredOrders.length === 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth="lg"
      aria-labelledby="orders-dialog-title"
    >
      <DialogTitle
        id="orders-dialog-title"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}
      >
        Pedidos
        <IconButton aria-label="Cerrar listado de pedidos" onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 500,
              overflowX: 'auto',
            }}
          >
            <Table
              stickyHeader
              aria-label="Listado de pedidos"
              sx={{ minWidth: { xs: 600, md: 'auto' } }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>ID Pedido</TableCell>
                  <TableCell>
                    Mesa
                    <FormControl sx={{ ml: 1, minWidth: 100 }} size="small">
                      <Select value={selectedTable} onChange={handleTableChange} displayEmpty inputProps={{ 'aria-label': 'Filtrar por mesa' }}>
                        <MenuItem value="">Todas</MenuItem>
                        {tables.map((table) => (
                          <MenuItem key={table.id_mesa} value={table.id_mesa}>{`Mesa ${table.id_mesa}`}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    Estado
                    <FormControl sx={{ ml: 1, minWidth: 100 }} size="small">
                      <Select value={selectedStatus} onChange={handleStatusChange} displayEmpty inputProps={{ 'aria-label': 'Filtrar por estado' }}>
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="En Curso">En curso</MenuItem>
                        <MenuItem value="Recibido">Recibido</MenuItem>
                        <MenuItem value="Iniciado">Iniciado</MenuItem>
                        <MenuItem value="Actualizado">Actualizado</MenuItem>
                        <MenuItem value="Finalizado">Finalizado</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordersLoading &&
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {Array.from({ length: 4 }).map((__, cellIndex) => (
                        <TableCell key={`skeleton-cell-${index}-${cellIndex}`}>
                          <Skeleton height={28} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {!ordersLoading && !emptyState &&
                  filteredOrders.map((order) => (
                    <TableRow key={order.id_pedido} hover>
                      <TableCell>{order.id_pedido}</TableCell>
                      <TableCell>{order.id_mesa}</TableCell>
                      <TableCell sx={{ color: order.estado === 'Finalizado' ? 'green' : 'orange' }}>
                        {order.estado}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver detalle del pedido">
                          <IconButton
                            onClick={() => handleOrderClick(order.id_pedido)}
                            aria-label={`Ver detalle del pedido ${order.id_pedido}`}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar pedido">
                          <IconButton
                            onClick={() => handleConfirmDelete(order.id_pedido)}
                            color="error"
                            aria-label={`Eliminar pedido ${order.id_pedido}`}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                {!ordersLoading && emptyState && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      {fetchError || 'No hay pedidos para mostrar.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <ConfirmDeleteDialog
          open={confirmDeleteOpen}
          onClose={handleCloseConfirmDelete}
          onConfirm={handleDeleteOrder}
        />

        <OrderDetailsDialog
          open={detailsDialogOpen}
          onClose={handleCloseDetailsDialog}
          orderDetails={orderDetails}
          orderDetailIds={orderDetailIds}
          orderInfo={orderInfo}
          loading={loadingDetails}
          orderId={selectedOrder}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OrdersDialog;

OrdersDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tipoPedido: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

OrdersDialog.defaultProps = {
  tipoPedido: '0',
};
