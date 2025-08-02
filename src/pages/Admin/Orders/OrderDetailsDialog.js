import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableRow, IconButton, CircularProgress,Button
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Detalles del Pedido #{selectedOrder}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, color: '#c96b21' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: '#c78048' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress size={24} sx={{ color: '#c96b21' }} />
          </Box>
        ) : (
          <>
            {pedidoData && (
              <Box sx={{ marginBottom: 2 }}>
                <Typography variant="body1" color="black"><strong>Fecha y Hora:</strong> {new Date(pedidoData.fecha_pedido).toLocaleString()}</Typography>
                <Typography variant="body1" color="black"><strong>Mozo:</strong> {pedidoData.nombre_mozo}</Typography>
              </Box>
            )}
            {productos.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableBody>
                    {productos.map((item) => (
                      <TableRow key={item.id_detalle}>
                        <TableCell>{item.nombre}</TableCell>
                        <TableCell align="right">{item.cantidad}x</TableCell>
                        <TableCell align="right">${parseFloat(item.precio).toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => handleDeleteConfirmation(item.id_detalle)}
                            color="error"
                            disabled={pedidoData?.estado_pedido === 'Finalizado'}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="black">No hay detalles disponibles.</Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
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
