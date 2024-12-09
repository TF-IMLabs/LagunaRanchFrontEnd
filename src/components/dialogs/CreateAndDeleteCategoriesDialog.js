import React, { useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert,
} from '@mui/material';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { createCategory, deleteCategory, getAllCategories } from '../../services/menuService';
import { styled } from '@mui/material/styles';

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': { backdropFilter: 'blur(10px)' },
  '& .MuiPaper-root': { borderRadius: '20px', boxShadow: 'none', backgroundColor: '#3A1300' },
  '& .MuiDialogTitle-root': { backgroundColor: 'black', color: '#DD98AD', fontWeight: 'bold', textAlign: 'center' },
  '& .MuiDialogContent-root': { backgroundColor: '#9b8c8d', color: 'black', textAlign: 'center' },
  '& .MuiDialogActions-root': { justifyContent: 'center', backgroundColor: 'black' },
}));

const CustomButton = styled(Button)(({ theme }) => ({
  color: '#DD98AD', borderColor: 'white', '&:hover': { backgroundColor: 'grey', borderColor: '#9b8c8d' },
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'black' },
    '&:hover fieldset': { borderColor: 'grey' },
    '&.Mui-focused fieldset': { borderColor: '#DD98AD' },
  },
  '& .MuiInputLabel-root': { color: 'black' },
}));

const CustomFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'black' },
    '&:hover fieldset': { borderColor: 'grey' },
    '&.Mui-focused fieldset': { borderColor: '#DD98AD' },
  },
  '& .MuiInputLabel-root': { color: 'black' },
}));

const CreateAndRemoveCategoriesDialog = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState('');
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [confirmationType, setConfirmationType] = useState('');
  const [confirmationCategory, setConfirmationCategory] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // React Query v5 - Corrected query
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });

  const handleAction = async (actionType, categoryName) => {
    if (!categoryName) return setSnackbarMessage('El nombre de la categoría es obligatorio.');
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
    }
  };

  return (
    <CustomDialog open={open} onClose={onClose}>
      <DialogTitle>Agregar/Borrar Categoría</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Ingresa el nombre para agregar o selecciona una categoría para eliminar.
        </DialogContentText>
        <CustomTextField
          autoFocus margin="dense" label="Nueva categoría" fullWidth value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)} required
        />
        <CustomFormControl fullWidth margin="dense">
          <InputLabel>Seleccionar categoría</InputLabel>
          <Select value={categoryToDelete} onChange={(e) => setCategoryToDelete(e.target.value)}>
            <MenuItem value="">--Seleccionar--</MenuItem>
            {loadingCategories ? <MenuItem disabled>Cargando...</MenuItem> : categories.map((category) =>
              <MenuItem key={category.id_categoria} value={category.nombre}>{category.nombre}</MenuItem>
            )}
          </Select>
        </CustomFormControl>
      </DialogContent>
      <DialogActions>
        <CustomButton onClick={onClose}>Cancelar</CustomButton>
        <CustomButton onClick={() => handleAction('add', newCategoryName)}>Agregar</CustomButton>
        <CustomButton onClick={() => handleAction('delete', categoryToDelete)} disabled={!categoryToDelete}>Eliminar</CustomButton>
      </DialogActions>

      <CustomDialog open={openConfirmationDialog} onClose={() => setOpenConfirmationDialog(false)}>
        <DialogTitle>{confirmationType === 'add' ? 'Confirmar Agregar' : 'Confirmar Eliminar'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas {confirmationType === 'add' ? 'agregar' : 'eliminar'} la categoría "{confirmationCategory}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={() => setOpenConfirmationDialog(false)}>Cancelar</CustomButton>
          <CustomButton onClick={handleConfirmation}>{confirmationType === 'add' ? 'Agregar' : 'Eliminar'}</CustomButton>
        </DialogActions>
      </CustomDialog>

      <Snackbar
        open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info">{snackbarMessage}</Alert>
      </Snackbar>
    </CustomDialog>
  );
};

export default CreateAndRemoveCategoriesDialog;
