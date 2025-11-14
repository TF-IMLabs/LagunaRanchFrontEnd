import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableRow, IconButton, CircularProgress, Button, Paper,
  Tooltip,
} from '@mui/material';
import { Close, Delete } from '@mui/icons-material';
import { removeCartItem } from '../../../services/cartService';
import ConfirmDeleteDialog from './ConfirmDeleteProductDialog';

const OrderDetailsDialog = ({ open, onClose, selectedOrder, orderInfo, loading }) => {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const pedidoData = orderInfo?.pedidoInfo?.[0] || null;
  const productos = orderInfo?.productos || [];

  const handleRemoveItem = async (id_detalle) => {
    try {
      if (!id_detalle) {
        console.error('id_detalle es undefined o null');
        return;
      }
      await removeCartItem(id_detalle);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleDeleteConfirmation = (id_detalle) => {
    setItemToDelete(id_detalle);
    setConfirmDeleteOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await handleRemoveItem(itemToDelete);
    }
    setConfirmDeleteOpen(false);
    setItemToDelete(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="order-details-title"
      PaperProps={{
        sx: {
          backgroundColor: (theme) => theme.palette.background.paper,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) => theme.shadows[10],
        },
      }}
    >
      <DialogTitle
        id="order-details-title"
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 1,
        }}
      >
        Detalles del Pedido
        <IconButton
          onClick={onClose}
          color="inherit"
          aria-label="Cerrar"
          sx={{ ml: 2 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress size={24} color="inherit" />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {pedidoData && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  backgroundColor: (theme) => theme.palette.background.paper,
                }}
              >
                <Typography variant="subtitle2" color="primary.main" gutterBottom>
                  Información del pedido
                </Typography>
                <Typography variant="body2">
                  <strong>Fecha y Hora:</strong> {new Date(pedidoData.fecha_pedido).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Mozo:</strong> {pedidoData.nombre_mozo}
                </Typography>
              </Box>
            )}
            {productos.length > 0 ? (
              <TableContainer
                component={Paper}
                sx={{
                  backgroundColor: (theme) => theme.palette.background.paper,
                  borderRadius: 2,
                }}
              >
                <Table size="small">
                  <TableBody>
                    {productos.map((item) => (
                      <TableRow key={item.id_detalle}>
                        <TableCell>
                          <Typography variant="body2" color="text.primary">
                            {item.nombre}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {item.cantidad}x
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.primary">
                            ${parseFloat(item.precio).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Eliminar producto del pedido">
                            <span>
                              <IconButton
                                onClick={() => handleDeleteConfirmation(item.id_detalle)}
                                color="error"
                                disabled={pedidoData?.estado_pedido === 'Finalizado'}
                                aria-label={`Eliminar ${item.nombre} del pedido`}
                                size="small"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay detalles disponibles.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', px: 3 }}>
        <Button onClick={onClose} color="primary" variant="contained">
          Cerrar
        </Button>
      </DialogActions>

      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </Dialog>
  );
};

export default OrderDetailsDialog;
