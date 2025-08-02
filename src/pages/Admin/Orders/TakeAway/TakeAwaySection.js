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
      elevation={3}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 2,
        maxWidth: 600,
        mx: "auto",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <TakeoutDiningIcon color="primary" fontSize="large" />
        <Typography variant="h4" component="h2" sx={{ fontWeight: "bold" }}>
          Pedidos para llevar (Take Away)
        </Typography>
      </Stack>

      <Typography variant="body1" color="text.secondary" mb={4}>
        Aquí puedes ver y gestionar todos los pedidos para llevar
      </Typography>

      <Box textAlign="center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleOpen}
          aria-label="Abrir lista de pedidos para llevar"
          disabled={loading}
          sx={{ px: 4 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Listar pedidos take away"}
        </Button>
      </Box>

      <OrdersDialog open={open} onClose={handleClose} tipoPedido={2} />
    </Paper>
  );
};

export default TakeAwaySection;
