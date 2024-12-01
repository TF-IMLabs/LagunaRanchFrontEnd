import React, { useEffect, useState } from 'react';
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
    FormControlLabel, 
    Checkbox, 
    Box 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getSubcategoriesByCategoryId } from '../services/menuService';

// Estilos personalizados para el diálogo y el botón
const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    backdropFilter: 'blur(10px)', // Añadir desenfoque de fondo
  },
  '& .MuiPaper-root': {
    borderRadius: '20px', // Bordes redondeados.
    boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)', // Sombra sutil.
    backgroundColor: '#fff', // Color de fondo blanco para mayor elegancia.
  },
  '& .MuiDialogTitle-root': {
    backgroundColor: '#d9c9a3',
    color: '#3e2d1f',
    fontWeight: 'bold',
    borderRadius: '20px 20px 0px 0px', // Bordes redondeados
    boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)', // Sombra sutil
  },
  '& .MuiDialogContent-root': {
    backgroundColor: '#ffffff',
    color: '#3e2d1f',
  },
}));

const CustomButton = styled(Button)(({ theme }) => ({
  color: '#3e2d1f',
  borderColor: '#3e2d1f',
  '&:hover': {
    backgroundColor: '#f5f5dc',
    borderColor: '#3e2d1f',
  },
}));

const AddProductDialog = ({ open, onClose, categories, onAddProduct }) => {
  const [newProductData, setNewProductData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    id_categoria: '',
    id_subcategoria: null,
    vegano: false,
    celiaco: false,
    vegetariano: false,
  });

  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setNewProductData({
        nombre: '',
        precio: '',
        descripcion: '',
        id_categoria: '',
        id_subcategoria: null,
        vegano: false,
        celiaco: false,
        vegetariano: false,
      });
      setFilteredSubcategories([]);
    }
  }, [open]);

  const handleNewProductChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setNewProductData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'id_categoria') {
      const selectedCategoryId = value;
      try {
        const subcats = await getSubcategoriesByCategoryId(selectedCategoryId);
        const subcategoriesArray = Object.values(subcats);
        setFilteredSubcategories(subcategoriesArray);
      } catch (error) {
        console.error("Error al obtener subcategorías:", error);
        setFilteredSubcategories([]);
      }
      setNewProductData((prevData) => ({
        ...prevData,
        id_subcategoria: null,
      }));
    }

    if (name === 'id_subcategoria' && value === '') {
      setNewProductData((prevData) => ({
        ...prevData,
        id_subcategoria: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newProductData.nombre) {
      errors.nombre = 'El nombre del producto es requerido.';
    }
    if (!newProductData.precio) {
      errors.precio = 'El precio es requerido.';
    }
    return errors;
  };

  const handleAddProduct = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setConfirmationOpen(true); // Abre el diálogo de confirmación
  };

  const handleConfirmAddProduct = () => {
    const productDataToSend = {
      ...newProductData,
      precio: Number(newProductData.precio),
      vegano: newProductData.vegano ? 1 : 0,
      celiaco: newProductData.celiaco ? 1 : 0,
      vegetariano: newProductData.vegetariano ? 1 : 0,
    };

    onAddProduct(productDataToSend);
    setNewProductData({
      nombre: '',
      precio: '',
      descripcion: '',
      id_categoria: '',
      id_subcategoria: null,
      vegano: false,
      celiaco: false,
      vegetariano: false,
    });
    setFilteredSubcategories([]);
    setFormErrors({});
    setConfirmationOpen(false);
    alert('Producto agregado exitosamente!');
  };

  return (
    <>
      <CustomDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle align='center'>Agregar un nuevo producto al menú</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre del producto"
              name="nombre"
              fullWidth
              value={newProductData.nombre}
              onChange={handleNewProductChange}
              variant="outlined"
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
            />
            <TextField
              margin="dense"
              label="Precio"
              name="precio"
              type="number"
              fullWidth
              value={newProductData.precio}
              onChange={handleNewProductChange}
              variant="outlined"
              error={!!formErrors.precio}
              helperText={formErrors.precio}
              inputProps={{ min: 0, inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <TextField
              margin="dense"
              label="Descripción"
              name="descripcion"
              fullWidth
              multiline
              rows={3}
              value={newProductData.descripcion}
              onChange={handleNewProductChange}
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel id="new-category-select-label">Categoría</InputLabel>
              <Select
                labelId="new-category-select-label"
                name="id_categoria"
                value={newProductData.id_categoria}
                onChange={handleNewProductChange}
                variant="outlined"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id_categoria} value={category.id_categoria}>
                    {category.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="new-subcategory-select-label">Subcategoría</InputLabel>
              <Select
                labelId="new-subcategory-select-label"
                name="id_subcategoria"
                value={newProductData.id_subcategoria || ''}
                onChange={handleNewProductChange}
                variant="outlined"
              >
                <MenuItem value={null}>Sin subcategoría</MenuItem>
                {filteredSubcategories.length > 0 ? (
                  filteredSubcategories.map((subcategory) => (
                    <MenuItem key={subcategory.id_subcategoria} value={subcategory.id_subcategoria}>
                      {subcategory.nombre}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay subcategorías disponibles</MenuItem>
                )}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newProductData.vegano}
                  onChange={handleNewProductChange}
                  name="vegano"
                />
              }
              label="Vegano"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newProductData.celiaco}
                  onChange={handleNewProductChange}
                  name="celiaco"
                />
              }
              label="Celiaco"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newProductData.vegetariano}
                  onChange={handleNewProductChange}
                  name="vegetariano"
                />
              }
              label="Vegetariano"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <CustomButton onClick={onClose} color="secondary" variant="outlined">
            Cancelar
          </CustomButton>
          <CustomButton onClick={handleAddProduct} color="" variant="outlined">
            Agregar
          </CustomButton>
        </DialogActions>
      </CustomDialog>

      {/* Diálogo de Confirmación */}
      <CustomDialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Nuevo Producto</DialogTitle>
        <DialogContent>
          <Box>
            <p><strong>Nombre:</strong> {newProductData.nombre}</p>
            <p><strong>Precio:</strong> ${newProductData.precio}</p>
            <p><strong>Descripción:</strong> {newProductData.descripcion}</p>
            <p><strong>Categoría:</strong> {categories.find(cat => cat.id_categoria === newProductData.id_categoria)?.nombre || 'Sin categoría'}</p>
            <p><strong>Subcategoría:</strong> {filteredSubcategories.find(subcat => subcat.id_subcategoria === newProductData.id_subcategoria)?.nombre || 'Sin subcategoría'}</p>
            <p><strong>Vegano:</strong> {newProductData.vegano ? 'Sí' : 'No'}</p>
            <p><strong>Celiaco:</strong> {newProductData.celiaco ? 'Sí' : 'No'}</p>
            <p><strong>Vegetariano:</strong> {newProductData.vegetariano ? 'Sí' : 'No'}</p>
          </Box>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={() => setConfirmationOpen(false)} color="secondary" variant="outlined">
            Cancelar
          </CustomButton>
          <CustomButton onClick={handleConfirmAddProduct} color="" variant="outlined">
            Confirmar
          </CustomButton>
        </DialogActions>
      </CustomDialog>
    </>
  );
};

export default AddProductDialog;
