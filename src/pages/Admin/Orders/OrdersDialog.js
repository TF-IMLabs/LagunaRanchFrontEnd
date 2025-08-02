// src/components/dialogs/OrdersDialog.jsx
import React, { useEffect, useState } from "react";
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
  MenuItem
} from "@mui/material";
import { Visibility, Delete } from "@mui/icons-material";
import {
  getAllOrders, getCartInfo, getOrderDetailByOrderId, removeOrder
} from "../../../services/cartService";
import { getAllTables } from "../../../services/tableService";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import OrderDetailsDialog from "./OrderDetailsDialog";

const OrdersDialog = ({ open, onClose, tipoPedido = 0 }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderDetailIds, setOrderDetailIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const ordersData = await getAllOrders();
          const tablesData = await getAllTables();

          const filtered = [];

          for (const order of ordersData) {
            try {
              const cartInfo = await getCartInfo(order.id_pedido);

              

              if (String(cartInfo[0]?.tipo_pedido) === String(tipoPedido)) {
                filtered.push(order);
              }
            } catch (error) {
              console.error(`❌ Error al obtener getCartInfo para pedido ${order.id_pedido}:`, error);
            }
          }

          setOrders(filtered);
          setFilteredOrders(filtered);
          setTables(tablesData);
        } catch (error) {
          console.error("❌ Error al obtener pedidos o mesas:", error);
        }
      };
      fetchData();
    }
  }, [open, tipoPedido]);

  const handleOrderClick = async (id_pedido) => {
    setDetailsDialogOpen(true);
    setLoading(true);
    try {
      const details = await getCartInfo(id_pedido);
      const detailsResponse = await getOrderDetailByOrderId(id_pedido);

  
      const detailIds = detailsResponse.detalles.map(detail => detail.id_detalle);
      setOrderInfo(details[0]);
      setOrderDetails(details.productos);
      setOrderDetailIds(detailIds);
      setSelectedOrder(id_pedido);
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
    }
    setLoading(false);
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
    let filtered = orders;
    if (selectedTable) filtered = filtered.filter(order => order.id_mesa === selectedTable);
    if (selectedStatus) filtered = filtered.filter(order => order.estado === selectedStatus);
    setFilteredOrders(filtered);
  }, [selectedTable, selectedStatus, orders]);

  const handleDeleteOrder = async () => {
    try {
      if (orderToDelete) {
        await removeOrder(orderToDelete);
        const updated = orders.filter(order => order.id_pedido !== orderToDelete);
        setOrders(updated);
        setFilteredOrders(updated);
      }
    } catch (error) {
      console.error("❌ Error deleting order:", error);
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Pedidos</DialogTitle>
      <DialogContent dividers>
        <Box>
          <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID Pedido</TableCell>
                  <TableCell>
                    Mesa
                    <FormControl sx={{ ml: 1, minWidth: 100 }} size="small">
                      <Select value={selectedTable} onChange={handleTableChange} displayEmpty>
                        <MenuItem value="">Todas</MenuItem>
                        {tables.map(table => (
                          <MenuItem key={table.id_mesa} value={table.id_mesa}>{`Mesa ${table.id_mesa}`}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    Estado
                    <FormControl sx={{ ml: 1, minWidth: 100 }} size="small">
                      <Select value={selectedStatus} onChange={handleStatusChange} displayEmpty>
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="En Curso">En Curso</MenuItem>
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
                {filteredOrders.map((order) => (
                  <TableRow key={order.id_pedido} hover>
                    <TableCell>{order.id_pedido}</TableCell>
                    <TableCell>{order.id_mesa}</TableCell>
                    <TableCell sx={{ color: order.estado === 'Finalizado' ? 'green' : 'orange' }}>
                      {order.estado}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOrderClick(order.id_pedido)}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleConfirmDelete(order.id_pedido)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
          loading={loading}
          orderId={selectedOrder}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OrdersDialog;
