import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllTables,
  updateOrderAndTableStatus,
  updateTableWaiter,
  updateTableStatus,
  deleteTableNote,
} from "../../services/tableService"; // Asegúrate de que deleteTableNote esté importada
import { getCartInfo } from "../../services/cartService";
import { getAllWaiters } from "../../services/waiterService";
import { Grid, Typography, CircularProgress, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TableDetail from "./TableCardDetail";
import WaiterDialog from "../dialogs/WaiterDialog";
import CreateTableDialog from "../dialogs/CreateTableDialog"; // Importa el diálogo de crear mesa
import CreateWaiterDialog from "../dialogs/CreateWaiterDialog"; // Importa el diálogo de crear mozo

const TablesSection = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateTableDialog, setOpenCreateTableDialog] = useState(false); // Estado para el diálogo de crear mesa
  const [openCreateWaiterDialog, setOpenCreateWaiterDialog] = useState(false); // Estado para el diálogo de crear mozo
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
    queryKey: ["tables"],
    queryFn: getAllTables,
  });

  const { data: waiters = [] } = useQuery({
    queryKey: ["waiters"],
    queryFn: getAllWaiters,
  });

  const { data: ordersById = {}, isLoading: loadingOrders } = useQuery({
    queryKey: ["orders", tables.map((table) => table.ultimo_id_pedido)],
    queryFn: async () => {
      const validIds = tables
        .map((table) => table.ultimo_id_pedido)
        .filter((id) => id);
      if (validIds.length === 0) return {};
      const orderPromises = validIds.map((id) =>
        getCartInfo(id).then((order) => ({ [id]: order }))
      );
      const ordersArray = await Promise.all(orderPromises);
      return Object.assign({}, ...ordersArray);
    },
    enabled: tables.length > 0,
  });

  const receiveOrderMutation = useMutation({
    mutationFn: updateOrderAndTableStatus,
    onSuccess: () => {
      queryClient.invalidateQueries("orders");
      queryClient.invalidateQueries("tables");
    },
  });

  const updateTableStatusMutation = useMutation({
    mutationFn: ({ id_mesa, estado }) => updateTableStatus({ id_mesa, estado }),
    onSuccess: () => {
      queryClient.invalidateQueries("tables");
    },
    onError: (error) => {
      console.error("Error al actualizar el estado de la mesa:", error);
    },
  });

  const updateWaiterMutation = useMutation({
    mutationFn: (data) => updateTableWaiter(data.id_mesa, data.id_mozo),
    onSuccess: () => {
      queryClient.invalidateQueries("tables");
    },
  });

  const deleteTableNoteMutation = useMutation({
    mutationFn: (tableId) => deleteTableNote(tableId), // Asegúrate de que deleteTableNote esté correctamente implementada
    onSuccess: () => {
      queryClient.invalidateQueries("tables"); // Vuelve a cargar las tablas después de eliminar la nota
    },
  });

  const handleReceiveOrder = (orderId, tableId) => {
    const newStatus = { id_pedido: orderId, estado: "Recibido" };
    receiveOrderMutation.mutate(newStatus);
    setNewItemsMap((prev) => ({ ...prev, [tableId]: [] }));
    setOldProductsMap((prev) => ({
      ...prev,
      [tableId]: [...(newItemsMap[tableId] || [])],
    }));
  };

  const handleUpdateTableStatus = (tableId) => {
    const newStatus = "libre";
    updateTableStatusMutation.mutate({ id_mesa: tableId, estado: newStatus });
    deleteTableNoteMutation.mutate(tableId); // Llama a deleteTableNote después de actualizar el estado de la mesa
  };

  const handleOrderInProgress = (orderId, tableId) => {
    const newStatus = { id_pedido: orderId, estado: "En curso" };
    receiveOrderMutation.mutate(newStatus);
    setNewItemsMap((prev) => ({ ...prev, [tableId]: [] }));
    setOldProductsMap((prev) => ({
      ...prev,
      [tableId]: [...(newItemsMap[tableId] || [])],
    }));
  };

  const handleOpenDialog = (table) => {
    setCurrentTable(table);
    setSelectedWaiter("");
    setOpenDialog(true);
  };

  const handleUpdateWaiter = (waiterId) => {
    if (!waiterId || !currentTable) return;
    const data = { id_mozo: waiterId, id_mesa: currentTable.n_mesa };
    updateWaiterMutation.mutate(data);
    setOpenDialog(false);
  };

  useEffect(() => {
    const newItems = {};
    let hasNewItems = false;

    tables.forEach((table) => {
      const order = ordersById[table.ultimo_id_pedido];
      if (order) {
        const previousOrder = previousOrders[table.ultimo_id_pedido] || [];
        newItems[table.n_mesa] = order.filter((item) => {
          const previousItem = previousOrder.find(
            (o) => o.id_producto === item.id_producto
          );
          return !previousItem || previousItem.cantidad < item.cantidad;
        });

        if (newItems[table.n_mesa].length > 0) {
          hasNewItems = true;
        }
      }
    });

    if (hasNewItems) {
      setNewItemsMap((prev) => ({ ...prev, ...newItems }));
    }

    if (JSON.stringify(previousOrders) !== JSON.stringify(ordersById)) {
      setPreviousOrders(ordersById);
    }
  }, [ordersById, tables, previousOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries("tables");
      queryClient.invalidateQueries("orders");
    }, 5000);
    return () => clearInterval(interval);
  }, [queryClient]);

  if (isLoading || loadingOrders)
    return (
      <Typography>
        Cargando mesas... <CircularProgress size={20} />
      </Typography>
    );
  if (error)
    return <Typography>Error al cargar las mesas: {error.message}</Typography>;

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Button
          variant="contained"
          sx={{
            width: "200px",
            height: "50px",
            mb: 2,
            backgroundColor: "black",
            color: "#DD98AD",
            "&:hover": {
              backgroundColor: "grey",
            },
          }}
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateTableDialog(true)}
          style={{ marginRight: "10px" }}
        >
          Agregar Mesa
        </Button>
        <Button
          variant="contained"
          sx={{
            width: "200px",
            height: "50px",
            mb: 2,
            backgroundColor: "black",
            color: "#DD98AD",
            "&:hover": {
              backgroundColor: "grey",
            },
          }}
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateWaiterDialog(true)}
        >
          Agregar Mozo
        </Button>
      </div>
      <Grid container spacing={0}>
        {tables.map((table) => {
          const order = ordersById[table.ultimo_id_pedido] || {};
          return (
            <Grid item xs={12} sm={6} md={4} key={table.n_mesa}>
              <TableDetail
                table={table}
                order={order}
                newItemsMap={newItemsMap}
                oldProductsMap={oldProductsMap}
                handleReceiveOrder={handleReceiveOrder}
                handleUpdateTableStatus={handleUpdateTableStatus}
                handleOrderInProgress={handleOrderInProgress}
                handleOpenDialog={handleOpenDialog}
              />
            </Grid>
          );
        })}
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
      />

      <CreateWaiterDialog
        open={openCreateWaiterDialog}
        onClose={() => setOpenCreateWaiterDialog(false)}
      />
    </div>
  );
};

export default TablesSection;
