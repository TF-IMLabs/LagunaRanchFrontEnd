import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllTables,
  updateOrderAndTableStatus,
  updateTableWaiter,
  updateTableStatus,
  deleteTableNote,
} from "../../../../services/tableService";
import { getCartInfo } from "../../../../services/cartService";
import { getAllWaiters } from "../../../../services/waiterService";
import {
  Grid,
  Typography,
  CircularProgress,
  Button,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TableDetail from "./TableCardDetail";
import WaiterDialog from "./WaiterDialog";
import CreateTableDialog from "./CreateTableDialog";
import CreateWaiterDialog from "./CreateWaiterDialog";
import OrdersDialog from "../OrdersDialog";
import { queryKeys } from "../../../../lib/queryClient";

const TablesSection = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateTableDialog, setOpenCreateTableDialog] = useState(false);
  const [openCreateWaiterDialog, setOpenCreateWaiterDialog] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [newItemsMap, setNewItemsMap] = useState({});
  const [previousOrders, setPreviousOrders] = useState({});
  const [oldProductsMap, setOldProductsMap] = useState({});
  const [selectedWaiter, setSelectedWaiter] = useState("");

  const {
    data: tables = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.tables.all,
    queryFn: getAllTables,
  });

  const { data: waiters = [] } = useQuery({
    queryKey: queryKeys.waiters.all,
    queryFn: getAllWaiters,
  });

  const tableIds = useMemo(
    () => tables.map((t) => t.ultimo_id_pedido).filter(Boolean),
    [tables]
  );

  const { data: ordersById = {}, isLoading: loadingOrders } = useQuery({
    queryKey: queryKeys.orders.list({ tableIds }),
    queryFn: async () => {
      if (!tableIds.length) return {};
      const orders = await Promise.all(
        tableIds.map((id) => getCartInfo(id).then((order) => ({ [id]: order })))
      );
      return Object.assign({}, ...orders);
    },
    enabled: tableIds.length > 0,
  });


  const [openOrdersDialog, setOpenOrdersDialog] = useState(false);

  const receiveOrderMutation = useMutation({
    mutationFn: updateOrderAndTableStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all });
    },
  });

  const updateTableStatusMutation = useMutation({
    mutationFn: ({ id_mesa, estado }) => updateTableStatus({ id_mesa, estado }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all }),
  });

  const updateWaiterMutation = useMutation({
    mutationFn: (data) => updateTableWaiter(data.id_mesa, data.id_mozo),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all }),
  });

  const deleteTableNoteMutation = useMutation({
    mutationFn: deleteTableNote,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all }),
  });

  const handleReceiveOrder = (orderId, tableId) => {
    receiveOrderMutation.mutate({ id_pedido: orderId, estado: "Recibido" });
    setNewItemsMap((prev) => ({ ...prev, [tableId]: [] }));
    setOldProductsMap((prev) => ({
      ...prev,
      [tableId]: [...(newItemsMap[tableId] || [])],
    }));
  };

  const handleOrderInProgress = (orderId, tableId) => {
    receiveOrderMutation.mutate({ id_pedido: orderId, estado: "En curso" });
    setNewItemsMap((prev) => ({ ...prev, [tableId]: [] }));
    setOldProductsMap((prev) => ({
      ...prev,
      [tableId]: [...(newItemsMap[tableId] || [])],
    }));
  };

  const handleFreeTable = (tableId) => {
    updateTableStatusMutation.mutate({ id_mesa: tableId, estado: "libre" });
    deleteTableNoteMutation.mutate(tableId);
  };

  const handleOpenDialog = (table) => {
    setCurrentTable(table);
    setSelectedWaiter("");
    setOpenDialog(true);
  };

  const handleUpdateWaiter = (waiterId) => {
    if (!waiterId || !currentTable) return;
    updateWaiterMutation.mutate({ id_mesa: currentTable.n_mesa, id_mozo: waiterId });
    setOpenDialog(false);
  };

  useEffect(() => {
    const newItems = {};
    let hasNewItems = false;

    tables.forEach((table) => {
      const order = ordersById[table.ultimo_id_pedido];
      const prevProductos = previousOrders[table.ultimo_id_pedido]?.productos || [];

      if (order?.productos) {
        const nuevos = order.productos.filter((item) => {
          const prevItem = prevProductos.find((p) => p.id_producto === item.id_producto);
          return !prevItem || Number(prevItem.cantidad) < Number(item.cantidad);
        });
        newItems[table.n_mesa] = nuevos;
        if (nuevos.length) hasNewItems = true;
      }
    });

    if (hasNewItems) setNewItemsMap((prev) => ({ ...prev, ...newItems }));
    if (JSON.stringify(previousOrders) !== JSON.stringify(ordersById)) {
      setPreviousOrders(ordersById);
    }
  }, [ordersById, tables, previousOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    }, 5000);
    return () => clearInterval(interval);
  }, [queryClient]);

  if (isLoading || loadingOrders) {
    return (
      <Typography>
        Cargando mesas... <CircularProgress size={20} />
      </Typography>
    );
  }

  if (error) {
    return <Typography>Error al cargar las mesas: {error.message}</Typography>;
  }

  return (
    <>
      <Box mb={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpenCreateTableDialog(true)}
            startIcon={<AddIcon />}
          >
            Agregar mesa
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenCreateWaiterDialog(true)}
            startIcon={<AddIcon />}
          >
            Agregar mozo
          </Button>
          <Button variant="outlined" onClick={() => setOpenOrdersDialog(true)}>
            Listar los pedidos
          </Button>
        </Box>
      </Box>
      <OrdersDialog open={openOrdersDialog} onClose={() => setOpenOrdersDialog(false)} />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {tables.map((table) => (
          <Grid item xs={12} sm={6} md={4} key={table.n_mesa}>
            <TableDetail
              table={table}
              order={ordersById[table.ultimo_id_pedido]?.productos || []}
              orderInfo={ordersById[table.ultimo_id_pedido]?.pedidoInfo?.[0] || {}}
              newItemsMap={newItemsMap}
              oldProductsMap={oldProductsMap}
              handleReceiveOrder={handleReceiveOrder}
              handleOrderInProgress={handleOrderInProgress}
              handleUpdateTableStatus={handleFreeTable}
              handleOpenDialog={handleOpenDialog}
            />
          </Grid>
        ))}
      </Grid>

      <WaiterDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        waiters={waiters}
        selectedWaiter={selectedWaiter}
        setSelectedWaiter={setSelectedWaiter}
        handleUpdateWaiter={handleUpdateWaiter}
      />

      <CreateTableDialog
        open={openCreateTableDialog}
        onClose={() => setOpenCreateTableDialog(false)}
        waiters={waiters}
      />

      <CreateWaiterDialog
        open={openCreateWaiterDialog}
        onClose={() => setOpenCreateWaiterDialog(false)}
      />
    </>
  );
};

export default TablesSection;
