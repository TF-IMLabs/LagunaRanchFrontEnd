import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  useTheme,
} from "@mui/material";
import TakeoutDiningIcon from "@mui/icons-material/TakeoutDining"; // Icono para takeaway
import OrdersDialog from "../OrdersDialog";

const TakeAwaySection = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleOpen = () => {
    setLoading(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 2.5,
        borderRadius: 2,
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TakeoutDiningIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              Pedidos Take Away
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualiza y entrega los retiros programados rápidamente.
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          onClick={handleOpen}
          aria-label="Abrir lista de pedidos para llevar"
          disabled={loading}
          sx={{ minWidth: { xs: "100%", sm: 220 } }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Listar pedidos take away"
          )}
        </Button>
      </Stack>

      <OrdersDialog open={open} onClose={handleClose} tipoPedido={2} />
    </Paper>
  );
};

export default TakeAwaySection;
