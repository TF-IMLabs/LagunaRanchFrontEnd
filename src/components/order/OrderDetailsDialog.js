import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Table, TableBody, TableCell, TableContainer, TableRow, IconButton, CircularProgress, Button } from '@mui/material';
import { Close, Delete } from '@mui/icons-material';
import { styled } from '@mui/system';
import { removeCartItem } from '../../services/cartService';
import ConfirmDeleteDialog from './ConfirmDeleteProductDialog';  

const StyledDialogTitle = styled(DialogTitle)({
  color: '#DD98AD',
  backgroundColor: 'black',
  textAlign: 'center',
});

const StyledDialogActions = styled(DialogActions)({
  backgroundColor: 'black',
  justifyContent: 'center',
});

const CustomButton = styled(Button)({
  color: '#DD98AD',
  backgroundColor: 'black',
  borderColor: '#9b8c8d',
  '&:hover': { borderColor: '#DD98AD' },
});

const OrderDetailsDialog = ({ open, onClose, selectedOrder, orderInfo, orderDetails, loading, orderDetailIds }) => {
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    
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
        <StyledDialogTitle>
          Detalles del Pedido #{selectedOrder}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, color: '#DD98AD' }}>
            <Close />
          </IconButton>
        </StyledDialogTitle>
        <DialogContent sx={{ backgroundColor: '#9b8c8d' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
              <CircularProgress size={24} sx={{ color: '#DD98AD' }} />
            </Box>
          ) : (
            <>
              {orderInfo && (
                <Box sx={{ marginBottom: 2 }}>
                  <Typography variant="body1" color="black"><strong>Fecha y Hora:</strong> {new Date(orderInfo.fecha_pedido).toLocaleString()}</Typography>
                  <Typography variant="body1" color="black"><strong>Mozo:</strong> {orderInfo.nombre_mozo}</Typography>
                </Box>
              )}
              {orderDetails.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableBody>
                      {orderDetails.map((item, index) => {
                        const id_detalle = orderDetailIds ? orderDetailIds[index] : null;
                        return (
                          <TableRow key={item.id_producto}>
                            <TableCell>{item.nombre}</TableCell>
                            <TableCell align="right">{item.cantidad}x</TableCell>
                            <TableCell align="right">${parseFloat(item.precio).toFixed(2)}</TableCell>
                            <TableCell align="right">
                             <IconButton
  onClick={() => handleDeleteConfirmation(id_detalle)}
  color="error"
  disabled={orderInfo?.estado_pedido === 'Finalizado'}
>
  <Delete />
</IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="black">No hay detalles disponibles.</Typography>
              )}
            </>
          )}
        </DialogContent>
        <StyledDialogActions>
          <CustomButton onClick={onClose} variant="outlined">
            Cerrar
          </CustomButton>
        </StyledDialogActions>
  
        <ConfirmDeleteDialog
          open={confirmDeleteOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      </Dialog>
    );
  };
  

export default OrderDetailsDialog;
  