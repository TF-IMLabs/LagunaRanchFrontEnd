import React, { useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
} from '@mui/material';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { createCategory, deleteCategory, getAllCategories } from '../../services/menuService';
import { styled } from '@mui/material/styles';

const CustomDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-container': {
      backdropFilter: 'blur(10px)', // Aplicar desenfoque al fondo
    },
    '& .MuiPaper-root': {
      borderRadius: '20px', // Bordes redondeados
      boxShadow: 'none', // Sin sombra para evitar el borde visible
      backgroundColor: '#3A1300', // Fondo uniforme oscuro
    },
    '& .MuiDialogTitle-root': {
      backgroundColor: 'black',
      color: '#DD98AD', // Texto en blanco
      fontWeight: 'bold',
      textAlign: 'center', // Texto centrado
      borderTopLeftRadius: '20px', // Bordes redondeados en la parte superior
      borderTopRightRadius: '20px', // Bordes redondeados en la parte superior
    },
    '& .MuiDialogContent-root': {
      backgroundColor: '#9b8c8d', // Fondo claro coincidente
      color: 'black', // Texto en blanco
      textAlign: 'center', // Texto centrado
    },
    '& .MuiDialogActions-root': {
      justifyContent: 'center', // Centrar botones en el diálogo
      backgroundColor: 'black',
      borderBottomLeftRadius: '20px', // Bordes redondeados en la parte inferior
      borderBottomRightRadius: '20px', // Bordes redondeados en la parte inferior
    },
  }));
  
  const CustomButton = styled(Button)(({ theme }) => ({
    color: '#DD98AD', // Texto en blanco
    borderColor: 'white', // Borde negro
    '&:hover': {
      backgroundColor: 'grey', // Fondo negro en hover
      borderColor: '#9b8c8d',
    },
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
    const { data: categories = [], isLoading: loadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: getAllCategories,
    });

    const handleAddCategory = async () => {
        if (!newCategoryName) {
            setSnackbarMessage('El nombre de la categoría es obligatorio.');
            setSnackbarOpen(true);
            return;
        }
        setConfirmationType('add');
        setConfirmationCategory(newCategoryName);
        setOpenConfirmationDialog(true);
    };

    const handleDeleteCategory = () => {
        if (categoryToDelete) {
            setConfirmationType('delete');
            setConfirmationCategory(categoryToDelete);
            setOpenConfirmationDialog(true);
        }
    };

    const handleConfirmation = async () => {
        try {
            if (confirmationType === 'add') {
                await createCategory({ nombre: confirmationCategory });
                setSnackbarMessage(`Categoría "${confirmationCategory}" agregada exitosamente.`);
            } else if (confirmationType === 'delete') {
                const category = categories.find(cat => cat.nombre === confirmationCategory);
                if (category) {
                    await deleteCategory(category.id_categoria);
                    setSnackbarMessage(`Categoría "${confirmationCategory}" eliminada exitosamente.`);
                }
            }
            queryClient.invalidateQueries(['categories']);
            setNewCategoryName('');
            setCategoryToDelete('');
            onClose();
        } catch (error) {
            console.error(`Error al ${confirmationType === 'add' ? 'agregar' : 'eliminar'} la categoría:`, error);
        } finally {
            setOpenConfirmationDialog(false);
        }
    };

    return (
        <CustomDialog open={open} onClose={onClose}>
            <DialogTitle>Agregar/Borrar Categoría</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Para agregar una nueva categoría, ingrese el nombre y haga clic en "Agregar".
                    Para eliminar una categoría, seleccione la categoría de la lista y haga clic en "Eliminar".
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Nombre de la nueva categoría"
                    type="text"
                    fullWidth
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                />

                <FormControl fullWidth margin="dense">
                    <InputLabel id="select-category-label">Seleccionar categoría para eliminar</InputLabel>
                    <Select
                        labelId="select-category-label"
                        value={categoryToDelete}
                        onChange={(e) => setCategoryToDelete(e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="">
                            
                        </MenuItem>
                        {loadingCategories ? (
                            <MenuItem disabled>Cargando categorías...</MenuItem>
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
            <DialogActions>
                <CustomButton onClick={onClose} color="primary">
                    Cancelar
                </CustomButton>
                <CustomButton onClick={handleAddCategory} color="primary">
                    Agregar
                </CustomButton>
                <CustomButton onClick={handleDeleteCategory} color="secondary" disabled={!categoryToDelete}>
                    Eliminar
                </CustomButton>
            </DialogActions>

            <CustomDialog open={openConfirmationDialog} onClose={() => setOpenConfirmationDialog(false)}>
                <DialogTitle>{confirmationType === 'add' ? 'Confirmar Agregar' : 'Confirmar Eliminar'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmationType === 'add' 
                            ? `¿Estás seguro de que deseas agregar la categoría "${confirmationCategory}"?`
                            : `¿Estás seguro de que deseas eliminar la categoría "${confirmationCategory}"?`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <CustomButton onClick={() => setOpenConfirmationDialog(false)} color="primary">
                        Cancelar
                    </CustomButton>
                    <CustomButton onClick={handleConfirmation} color="secondary">
                        {confirmationType === 'add' ? 'Agregar' : 'Eliminar'}
                    </CustomButton>
                </DialogActions>
            </CustomDialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </CustomDialog>
    );
};

export default CreateAndRemoveCategoriesDialog;
