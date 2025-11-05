// src/components/dialogs/OrdersDialog.jsx
import React, { useEffect, useMemo, useState } from 'react';
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
import { Visibility, Delete } from '@mui/icons-material';
import {
  getAllOrders,
  getCartInfo,
  getOrderDetailByOrderId,
  removeOrder,
} from '../../../services/cartService';
import { getAllTables } from '../../../services/tableService';
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
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderDetailIds, setOrderDetailIds] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setOrdersLoading(true);
      setFetchError(null);
      try {
        const [ordersData, tablesData] = await Promise.all([getAllOrders(), getAllTables()]);

        const cartInfoList = await Promise.all(
          ordersData.map((order) =>
            getCartInfo(order.id_pedido)
              .then((data) => normalizeCartInfo(data))
              .catch((error) => {
                console.error(`Error al obtener el carrito para el pedido ${order.id_pedido}:`, error);
                return null;
              }),
          ),
        );

        const enrichedOrders = ordersData.reduce((acc, order, idx) => {
          const cartInfo = cartInfoList[idx];
          if (!cartInfo) return acc;
          if (String(getOrderType(cartInfo)) !== String(tipoPedido)) return acc;
          acc.push({ ...order, cartInfo });
          return acc;
        }, []);

        setOrders(enrichedOrders);
        setFilteredOrders(enrichedOrders);
        setTables(tablesData);
      } catch (error) {
        console.error('Error al obtener pedidos o mesas:', error);
        setFetchError('No se pudieron cargar los pedidos. Intentá nuevamente.');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchData();
  }, [open, tipoPedido]);

  const handleOrderClick = async (id_pedido) => {
    setDetailsDialogOpen(true);
    setLoadingDetails(true);
    try {
      const currentOrder = orders.find((order) => order.id_pedido === id_pedido);
      const cachedCartInfo = currentOrder?.cartInfo;

      const [cartInfoResponse, detailsResponse] = await Promise.all([
        cachedCartInfo ? Promise.resolve(cachedCartInfo) : getCartInfo(id_pedido).then(normalizeCartInfo),
        getOrderDetailByOrderId(id_pedido),
      ]);

      const normalizedCartInfo = cachedCartInfo ? cachedCartInfo : normalizeCartInfo(cartInfoResponse);

      if (!cachedCartInfo) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id_pedido === id_pedido ? { ...order, cartInfo: normalizedCartInfo } : order,
          ),
        );
        setFilteredOrders((prev) =>
          prev.map((order) =>
            order.id_pedido === id_pedido ? { ...order, cartInfo: normalizedCartInfo } : order,
          ),
        );
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

  useEffect(() => {
    let computed = orders;
    if (selectedTable) {
      computed = computed.filter((order) => order.id_mesa === selectedTable);
    }
    if (selectedStatus) {
      computed = computed.filter((order) => order.estado === selectedStatus);
    }
    setFilteredOrders(computed);
  }, [selectedTable, selectedStatus, orders]);

  const handleDeleteOrder = async () => {
    try {
      if (orderToDelete) {
        await removeOrder(orderToDelete);
        const updated = orders.filter((order) => order.id_pedido !== orderToDelete);
        setOrders(updated);
        setFilteredOrders(updated);
      }
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

  const emptyState = useMemo(() => filteredOrders.length === 0, [filteredOrders]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth="lg"
      aria-labelledby="orders-dialog-title"
    >
      <DialogTitle id="orders-dialog-title">Pedidos</DialogTitle>
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
  tipoPedido: PropTypes.string.isRequired,
};
