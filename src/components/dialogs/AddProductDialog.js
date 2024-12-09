import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormControlLabel, Checkbox, Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getSubcategoriesByCategoryId } from '../../services/menuService';

// Estilos personalizados
const CustomDialog = styled(Dialog)({
  '& .MuiDialog-container': { backdropFilter: 'blur(10px)' },
  '& .MuiPaper-root': {
    borderRadius: '20px', boxShadow: 'none', backgroundColor: 'rgb(155, 140, 141)'
  },
  '& .MuiDialogTitle-root': {
    backgroundColor: 'black', color: '#DD98AD', textAlign: 'center'
  },
  '& .MuiDialogContent-root': { backgroundColor: 'rgb(155, 140, 141)', color: 'black' },
  '& .MuiDialogActions-root': { justifyContent: 'center', backgroundColor: 'black' }
});

const CustomButton = styled(Button)({
  color: '#DD98AD', borderColor: 'rgb(155, 140, 141)',
  '&:hover': { backgroundColor: 'grey', borderColor: 'grey' }
});

// Estilos de los campos de entrada (TextField y Select)
const CustomTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'black' },
    '&:hover fieldset': { borderColor: 'grey' },
    '&.Mui-focused fieldset': { borderColor: '#DD98AD' },
  },
  '& .MuiInputLabel-root': {
    color: 'black',
    '&.Mui-focused': { color: 'black' }
  },
}));

const CustomFormControl = styled(FormControl)(() => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'black' },
    '&:hover fieldset': { borderColor: 'grey' },
    '&.Mui-focused fieldset': { borderColor: '#DD98AD' },
  },
  '& .MuiInputLabel-root': {
    color: 'black',
    '&.Mui-focused': { color: 'black' }
  },
  '& .MuiSelect-select': {
    color: 'black',
  },
}));

// Estilos personalizados para el Checkbox
const CustomCheckbox = styled(Checkbox)(() => ({
  color: 'black',
  '&.Mui-checked': {
    color: '#DD98AD',
  },
}));

const initialProductData = {
  nombre: '', precio: '', descripcion: '',
  id_categoria: '', id_subcategoria: null,
  vegano: false, celiaco: false, vegetariano: false
};

const AddProductDialog = ({ open, onClose, categories, onAddProduct }) => {
  const [newProductData, setNewProductData] = useState(initialProductData);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setNewProductData(initialProductData);
      setFilteredSubcategories([]);
    }
  }, [open]);

  const handleNewProductChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setNewProductData((prevData) => ({ ...prevData, [name]: newValue }));

    if (name === 'id_categoria') {
      try {
        const subcats = await getSubcategoriesByCategoryId(value);
        setFilteredSubcategories(Object.values(subcats));
        setNewProductData((prevData) => ({ ...prevData, id_subcategoria: null }));
      } catch {
        setFilteredSubcategories([]);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newProductData.nombre) errors.nombre = 'El nombre es requerido.';
    if (!newProductData.precio) errors.precio = 'El precio es requerido.';
    return errors;
  };

  const handleAddProduct = () => {
    const errors = validateForm();
    if (Object.keys(errors).length) return setFormErrors(errors);
    setConfirmationOpen(true);
  };

  const handleConfirmAddProduct = () => {
    onAddProduct({
      ...newProductData,
      precio: Number(newProductData.precio),
      vegano: newProductData.vegano ? 1 : 0,
      celiaco: newProductData.celiaco ? 1 : 0,
      vegetariano: newProductData.vegetariano ? 1 : 0
    });
    setConfirmationOpen(false);
    onClose();
  };

  return (
    <>
      <CustomDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar un nuevo producto al menú</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <CustomTextField label="Nombre del producto" name="nombre" value={newProductData.nombre}
              error={!!formErrors.nombre} helperText={formErrors.nombre} fullWidth
              variant="outlined" margin="dense" onChange={handleNewProductChange} />
            <CustomTextField label="Precio" name="precio" type="number" value={newProductData.precio}
              error={!!formErrors.precio} helperText={formErrors.precio} fullWidth
              variant="outlined" margin="dense" onChange={handleNewProductChange} />
            <CustomTextField label="Descripción" name="descripcion" multiline rows={3}
              value={newProductData.descripcion} fullWidth variant="outlined" margin="dense"
              onChange={handleNewProductChange} />

            <CustomFormControl fullWidth margin="dense" variant="outlined">
              <InputLabel id="categoria-select-label">Categoría</InputLabel>
              <Select
                labelId="categoria-select-label"
                name="id_categoria"
                value={newProductData.id_categoria}
                onChange={handleNewProductChange}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </CustomFormControl>

            <CustomFormControl fullWidth margin="dense" variant="outlined">
              <InputLabel id="subcategoria-select-label">Subcategoría</InputLabel>
              <Select
                labelId="subcategoria-select-label"
                name="id_subcategoria"
                value={newProductData.id_subcategoria || ''}
                onChange={handleNewProductChange}
              >
                <MenuItem value={null}>Sin subcategoría</MenuItem>
                {filteredSubcategories.map((sub) => (
                  <MenuItem key={sub.id_subcategoria} value={sub.id_subcategoria}>
                    {sub.nombre}
                  </MenuItem>
                ))}
              </Select>
            </CustomFormControl>

            {['vegano', 'celiaco', 'vegetariano'].map((attr) => (
              <FormControlLabel key={attr} control={<CustomCheckbox checked={newProductData[attr]} name={attr} onChange={handleNewProductChange} />} label={attr.charAt(0).toUpperCase() + attr.slice(1)} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={onClose}>Cancelar</CustomButton>
          <CustomButton onClick={handleAddProduct}>Agregar</CustomButton>
        </DialogActions>
      </CustomDialog>

      {/* Diálogo de confirmación */}
      <CustomDialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Nuevo Producto</DialogTitle>
        <DialogContent>
          <Box>
            <p><strong>Nombre:</strong> {newProductData.nombre}</p>
            <p><strong>Precio:</strong> ${newProductData.precio}</p>
            <p><strong>Descripción:</strong> {newProductData.descripcion}</p>
            <p><strong>Categoría:</strong> {categories.find(cat => cat.id_categoria === newProductData.id_categoria)?.nombre || 'Sin categoría'}</p>
            <p><strong>Subcategoría:</strong> {filteredSubcategories.find(sub => sub.id_subcategoria === newProductData.id_subcategoria)?.nombre || 'Sin subcategoría'}</p>
            <p><strong>Vegano:</strong> {newProductData.vegano ? 'Sí' : 'No'}</p>
            <p><strong>Celiaco:</strong> {newProductData.celiaco ? 'Sí' : 'No'}</p>
            <p><strong>Vegetariano:</strong> {newProductData.vegetariano ? 'Sí' : 'No'}</p>
          </Box>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={() => setConfirmationOpen(false)}>Cancelar</CustomButton>
          <CustomButton onClick={handleConfirmAddProduct}>Confirmar</CustomButton>
        </DialogActions>
      </CustomDialog>
    </>
  );
};

export default AddProductDialog;
