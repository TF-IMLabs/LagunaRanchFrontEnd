import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { getSubcategoriesByCategoryId } from '../../../services/menuService';

const CreateAndDeleteSubcategoriesDialog = ({
  open,
  onClose,
  categories,
  onCreate,
  onDelete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [action, setAction] = useState('add');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    if (selectedCategory) {
      getSubcategoriesByCategoryId(selectedCategory)
        .then((subcats) => {
          const subcategoriesArray = Object.values(subcats);
          setSubcategories(subcategoriesArray);
        })
        .catch((error) => {
          console.error('Error al obtener subcategorías:', error);
          setSubcategories([]);
        });
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  const handleConfirm = () => {
    if (action === 'add') {
      if (!selectedCategory || !subcategoryName.trim()) {
        setSnackbarMessage('Por favor, seleccione una categoría y complete el nombre de la subcategoría.');
        setSnackbarSeverity('error');
      } else {
        onCreate(selectedCategory, subcategoryName);
        setSnackbarMessage('Subcategoría agregada exitosamente!');
        setSnackbarSeverity('success');
      }
    } else if (action === 'delete') {
      if (!selectedCategory || !selectedSubcategory) {
        setSnackbarMessage('Por favor, seleccione una categoría y una subcategoría para eliminar.');
        setSnackbarSeverity('error');
      } else {
        onDelete(selectedSubcategory);
        setSnackbarMessage('Subcategoría eliminada exitosamente!');
        setSnackbarSeverity('success');
      }
    }
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ style: { borderRadius: 20, boxShadow: 'none' } }}>
        <DialogTitle>
          Agregar/Eliminar Subcategoría
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="action-select-label">Acción</InputLabel>
            <Select
              labelId="action-select-label"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="add">Agregar</MenuItem>
              <MenuItem value="delete">Eliminar</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="category-select-label">Categoría</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.id_categoria} value={category.id_categoria}>
                  {category.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {action === 'add' && (
            <TextField
              fullWidth
              label="Nombre de la Subcategoría"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              margin="normal"
            />
          )}

          {action === 'delete' && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="subcategory-select-label">Subcategoría</InputLabel>
              <Select
                labelId="subcategory-select-label"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
              >
                {subcategories.length > 0 ? (
                  subcategories.map((sub) => (
                    <MenuItem key={sub.id_subcategoria} value={sub.id_subcategoria}>
                      {sub.nombre}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay subcategorías disponibles</MenuItem>
                )}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateAndDeleteSubcategoriesDialog;
