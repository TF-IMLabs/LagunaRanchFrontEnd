import React, { useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert,
} from '@mui/material';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { createCategory, deleteCategory, getAllCategories } from '../../../services/menuService';

const CreateAndRemoveCategoriesDialog = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState('');
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [confirmationType, setConfirmationType] = useState('');
  const [confirmationCategory, setConfirmationCategory] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });

  const handleAction = async (actionType, categoryName) => {
    if (!categoryName) {
      setSnackbarMessage('El nombre de la categoría es obligatorio.');
      setSnackbarOpen(true);
      return;
    }
    setConfirmationType(actionType);
    setConfirmationCategory(categoryName);
    setOpenConfirmationDialog(true);
  };

  const handleConfirmation = async () => {
    try {
      if (confirmationType === 'add') {
        await createCategory({ nombre: confirmationCategory });
        setSnackbarMessage(`Categoría "${confirmationCategory}" agregada.`);
      } else if (confirmationType === 'delete') {
        const category = categories.find(cat => cat.nombre === confirmationCategory);
        if (category) await deleteCategory(category.id_categoria);
        setSnackbarMessage(`Categoría "${confirmationCategory}" eliminada.`);
      }
      queryClient.invalidateQueries(['categories']);
      setNewCategoryName('');
      setCategoryToDelete('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setOpenConfirmationDialog(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} PaperProps={{ style: { borderRadius: 20, boxShadow: 'none' } }}>
        <DialogTitle>
          Agregar/Borrar Categoría
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ingresa el nombre para agregar o selecciona una categoría para eliminar.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nueva categoría"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Seleccionar categoría</InputLabel>
            <Select
              value={categoryToDelete}
              onChange={(e) => setCategoryToDelete(e.target.value)}
            >
              <MenuItem value="">--Seleccionar--</MenuItem>
              {loadingCategories ? (
                <MenuItem disabled>Cargando...</MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category.id_categoria} value={category.nombre}>
                    {category.nombre}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => handleAction('add', newCategoryName)}>
            Agregar
          </Button>
          <Button onClick={() => handleAction('delete', categoryToDelete)} disabled={!categoryToDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmationDialog} onClose={() => setOpenConfirmationDialog(false)} PaperProps={{ style: { borderRadius: 20, boxShadow: 'none' } }}>
        <DialogTitle>
          {confirmationType === 'add' ? 'Confirmar Agregar' : 'Confirmar Eliminar'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas {confirmationType === 'add' ? 'agregar' : 'eliminar'} la categoría "{confirmationCategory}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={() => setOpenConfirmationDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmation}>
            {confirmationType === 'add' ? 'Agregar' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateAndRemoveCategoriesDialog;
