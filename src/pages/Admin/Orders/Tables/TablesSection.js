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
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Person as PersonIcon,
  ReceiptLong as ReceiptLongIcon,
  LocalDining as LocalDiningIcon,
  TableRestaurant as TableRestaurantIcon,
  Badge as BadgeIcon,
  ListAlt as ListAltIcon,
} from "@mui/icons-material";
import TableDetail from "./TableCardDetail";
import WaiterDialog from "./WaiterDialog";
import ManageTablesDialog from "./ManageTablesDialog";
import ManageWaitersDialog from "./ManageWaitersDialog";
import OrdersDialog from "../OrdersDialog";
import { queryKeys } from "../../../../lib/queryClient";
import useVenueStatus from '../../../../hooks/useVenueStatus';

const TablesSection = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [manageTablesOpen, setManageTablesOpen] = useState(false);
  const [manageWaitersOpen, setManageWaitersOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [newItemsMap, setNewItemsMap] = useState({});
  const [previousOrders, setPreviousOrders] = useState({});
  const [oldProductsMap, setOldProductsMap] = useState({});
  const [selectedWaiter, setSelectedWaiter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState(null);
  const { isOpen: venueIsOpen, setVenueStatus } = useVenueStatus();

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

  const tableStats = useMemo(() => {
    const free = tables.filter(
      (table) => table.estado?.toLowerCase() === "libre"
    ).length;
    const occupied = tables.length - free;
    return {
      occupied,
      free,
    };
  }, [tables]);

  const tableIds = useMemo(() => {
    const ids = tables
      .map((t) => t.ultimo_id_pedido)
      .filter((id) => id !== null && id !== undefined)
      .map((id) => Number(id));
    const uniqueIds = Array.from(new Set(ids));
    return uniqueIds.sort((a, b) => a - b);
  }, [tables]);

  const { data: ordersById = {}, isLoading: loadingOrders } = useQuery({
    queryKey: queryKeys.orders.list({ tableIds }),
    queryFn: async () => {
      if (!tableIds.length) return {};
      const orders = await Promise.all(
        tableIds.map((id) =>
          getCartInfo(id).then((order) => ({ [id]: order }))
        )
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

  const getTableAlertState = (table, orderLookup = {}) => {
    const order = orderLookup[table.ultimo_id_pedido];
    const productos = Array.isArray(order?.productos) ? order.productos : [];
    const hasNewProducts = productos.some((item) => Number(item.nuevo) === 1);

    return {
      callw: table.callw === 1,
      bill: table.bill === 1,
      new: hasNewProducts,
    };
  };

  const attentionCount = useMemo(
    () =>
      tables.filter((table) => {
        const alerts = getTableAlertState(table, ordersById);
        return alerts.callw || alerts.bill || alerts.new;
      }).length,
    [tables, ordersById],
  );

  const alertLegend = [
    {
      label: "Llamado al mozo",
      Icon: PersonIcon,
      color: "warning",
    },
    {
      label: "Cuenta solicitada",
      Icon: ReceiptLongIcon,
      color: "info",
    },
    {
      label: "Nuevos productos",
      Icon: LocalDiningIcon,
      color: "success",
    },
  ];

  const summaryMetrics = [
    {
      label: "Ocupadas",
      value: tableStats.occupied,
      palette: "error",
      type: "occupied",
      description: "Actualmente en servicio.",
    },
    {
      label: "Libres",
      value: tableStats.free,
      palette: "success",
      type: "free",
      description: "Disponibles para asignar.",
    },
    {
      label: "Atencion",
      value: attentionCount,
      palette: "warning",
      type: "attention",
      description: "Mesas con solicitudes o nuevos productos.",
      legend: alertLegend,
    },
  ];

  const deleteTableNoteMutation = useMutation({
    mutationFn: deleteTableNote,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all }),
  });

  const handleBulkUpdate = async (estado) => {
    if (!tables.length) return;
    setBulkUpdating(true);
    setBulkFeedback(null);
    const tableIds = tables
      .map((table) => table.id_mesa ?? table.n_mesa ?? table.id)
      .filter((id) => typeof id !== "undefined" && id !== null);
    try {
      await Promise.all(
        tableIds.map((id_mesa) => updateTableStatus({ id_mesa, estado })),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all });
      setBulkFeedback({
        severity: "success",
        message:
          estado === "libre"
            ? "Todas las mesas fueron marcadas como libres."
            : "Todas las mesas fueron bloqueadas.",
      });
      setVenueStatus({ isOpen: estado === "libre", updatedAt: Date.now() });
    } catch (bulkError) {
      console.error("Error al actualizar el estado del restaurante:", bulkError);
      setBulkFeedback({
        severity: "error",
        message: "No pudimos actualizar todas las mesas. Intenta nuevamente.",
      });
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleCloseBulkFeedback = () => setBulkFeedback(null);

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

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const tableState = (table.estado || "").toLowerCase();
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "occupied"
          ? tableState !== "libre"
          : statusFilter === "free"
          ? tableState === "libre"
          : (() => {
            const alerts = getTableAlertState(table, ordersById);
            return alerts.callw || alerts.bill || alerts.new;
          })();

      return matchesStatus;
    });
  }, [tables, statusFilter, ordersById]);

  const handleMetricClick = (type) => {
    setStatusFilter((prev) => (prev === type ? "all" : type));
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
  };

  const hasActiveFilters = statusFilter !== "all";

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
      <Box
        sx={{
          width: "100%",
          px: { xs: 1, md: 2.5 },
          py: { xs: 1.5, md: 2.5 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: { xs: 2, md: 2.5 },
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Administrar mesas">
              <IconButton
                color="primary"
                onClick={() => setManageTablesOpen(true)}
                aria-label="Administrar mesas"
                sx={{
                  border: (theme) => `1px solid ${theme.palette.primary.main}`,
                  borderRadius: 2,
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  "&:hover": {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                  },
                }}
              >
                <TableRestaurantIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Administrar mozos">
              <IconButton
                color="primary"
                onClick={() => setManageWaitersOpen(true)}
                aria-label="Administrar mozos"
                sx={{
                  border: (theme) => `1px solid ${theme.palette.primary.main}`,
                  borderRadius: 2,
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  "&:hover": {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                  },
                }}
              >
                <BadgeIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}
            flexGrow={1}
          >
            <Chip
              label={venueIsOpen ? "Restaurante abierto" : "Restaurante cerrado"}
              color={venueIsOpen ? "success" : "error"}
              variant="outlined"
              sx={{ alignSelf: "flex-start" }}
            />
            <Button
              variant="contained"
              color="success"
              onClick={() => handleBulkUpdate("libre")}
              disabled={bulkUpdating || !tables.length}
            >
              {bulkUpdating ? "Actualizando..." : "Abrir restaurante"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleBulkUpdate("bloqueada")}
              disabled={bulkUpdating || !tables.length}
            >
              Cerrar restaurante
            </Button>
          </Stack>
          <Tooltip title="Listar los pedidos">
            <IconButton
              color="primary"
              onClick={() => setOpenOrdersDialog(true)}
              aria-label="Listar los pedidos"
              sx={{
                border: (theme) => `1px solid ${theme.palette.primary.main}`,
                borderRadius: 2,
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                "&:hover": {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                },
              }}
            >
              <ListAltIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid
          container
          spacing={{ xs: 1.5, md: 2 }}
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          {summaryMetrics.map(
            ({ label, value, palette, type, description, legend = [] }) => {
              const isActive = statusFilter === type;
              return (
                <Grid item xs={12} sm={4} md={4} key={label}>
                  <Paper
                    elevation={0}
                    onClick={() => handleMetricClick(type)}
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      borderRadius: 2,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      border: (theme) =>
                        `1px solid ${
                          isActive
                            ? theme.palette[palette]?.main || theme.palette.primary.main
                            : alpha(theme.palette[palette]?.main || theme.palette.primary.main, 0.4)
                        }`,
                      backgroundColor: (theme) =>
                        isActive
                          ? alpha(theme.palette[palette]?.main || theme.palette.primary.main, 0.22)
                          : alpha(theme.palette[palette]?.main || theme.palette.primary.main, 0.08),
                      boxShadow: (theme) =>
                        isActive
                          ? `0 0 28px ${alpha(theme.palette[palette]?.main || theme.palette.primary.main, 0.5)}`
                          : `0 0 18px ${alpha(theme.palette[palette]?.main || theme.palette.primary.main, 0.2)}`,
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      color: "common.white",
                    }}
                  >
                    <Chip
                      label={label}
                      size="small"
                      color={palette}
                      variant={isActive ? "filled" : "outlined"}
                      sx={{ fontWeight: 600, borderColor: (theme) => theme.palette[palette]?.main }}
                    />
                    <Typography variant="h4" component="p" sx={{ fontWeight: 700 }}>
                      {value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>
                    {legend.length > 0 && (
                      <Stack spacing={0.6} mt={1}>
                        {legend.map(({ label: legendLabel, Icon, color }) => (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            key={legendLabel}
                          >
                            <Icon
                              sx={{
                                color: (theme) => theme.palette[color]?.main,
                                fontSize: 18,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {legendLabel}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              );
            },
          )}
        </Grid>

        {hasActiveFilters && (
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems="center"
            sx={{ mb: { xs: 2, md: 2.5 } }}
          >
            <Typography variant="body2" color="text.secondary">
              Filtro activo: {statusFilter === "occupied" ? "Ocupadas" : statusFilter === "free" ? "Libres" : "Atencion"}
            </Typography>
            <Button onClick={handleClearFilters} size="small" color="primary">
              Limpiar filtro
            </Button>
          </Stack>
        )}

        <Grid
          container
          spacing={{ xs: 1.5, md: 2 }}
          columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 20 }}
        >
          {filteredTables.length ? (
            filteredTables.map((table) => {
              const alerts = getTableAlertState(table, ordersById);
              const hasAlert = alerts.callw || alerts.bill || alerts.new;
              return (
                <Grid item xs={4} sm={4} md={3} lg={4} xl={4} key={table.n_mesa}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      p: 0.25,
                      transition: "all 0.3s ease",
                      backgroundColor: (theme) =>
                        hasAlert
                          ? alpha(theme.palette.warning.main, 0.15)
                          : "transparent",
                      boxShadow: hasAlert
                        ? (theme) => `0 0 18px ${alpha(theme.palette.warning.main, 0.25)}`
                        : "none",
                    }}
                  >
                    <TableDetail
                      table={table}
                      order={ordersById[table.ultimo_id_pedido]?.productos || []}
                      orderInfo={
                        ordersById[table.ultimo_id_pedido]?.pedidoInfo?.[0] || {}
                      }
                      newItemsMap={newItemsMap}
                      oldProductsMap={oldProductsMap}
                      handleReceiveOrder={handleReceiveOrder}
                      handleOrderInProgress={handleOrderInProgress}
                      handleUpdateTableStatus={handleFreeTable}
                      handleOpenDialog={handleOpenDialog}
                    />
                  </Box>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  textAlign: "center",
                  backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.7),
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No hay mesas que coincidan con los filtros actuales.
                </Typography>
                <Button onClick={handleClearFilters} sx={{ mt: 1 }} size="small">
                  Limpiar filtros
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      <OrdersDialog
        open={openOrdersDialog}
        onClose={() => setOpenOrdersDialog(false)}
        tipoPedido="0"
      />

      <WaiterDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        waiters={waiters}
        selectedWaiter={selectedWaiter}
        setSelectedWaiter={setSelectedWaiter}
        handleUpdateWaiter={handleUpdateWaiter}
      />

      <ManageTablesDialog
        open={manageTablesOpen}
        onClose={() => setManageTablesOpen(false)}
      />

      <ManageWaitersDialog
        open={manageWaitersOpen}
        onClose={() => setManageWaitersOpen(false)}
      />

      <Snackbar
        open={Boolean(bulkFeedback)}
        autoHideDuration={4000}
        onClose={handleCloseBulkFeedback}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={bulkFeedback?.severity ?? "info"}
          onClose={handleCloseBulkFeedback}
          variant="filled"
        >
          {bulkFeedback?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TablesSection;
