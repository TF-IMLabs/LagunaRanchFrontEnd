import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormControlLabel, Checkbox, Box, Typography
} from '@mui/material';
import { getSubcategoriesByCategoryId } from '../../../services/menuService';

const AddProductDialog = ({ open, onClose, categories, onAddProduct }) => {
  const [newProductData, setNewProductData] = useState({
    nombre: '', precio: '', descripcion: '',
    id_categoria: '', id_subcategoria: null,
    vegano: false, celiaco: false, vegetariano: false
  });
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setNewProductData({
        nombre: '', precio: '', descripcion: '',
        id_categoria: '', id_subcategoria: null,
        vegano: false, celiaco: false, vegetariano: false
      });
      setFilteredSubcategories([]);
      setFormErrors({});
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
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Agregar un nuevo producto al menú
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre del producto"
              name="nombre"
              value={newProductData.nombre}
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
              fullWidth
              variant="outlined"
              margin="dense"
              onChange={handleNewProductChange}
            />
            <TextField
              label="Precio"
              name="precio"
              type="number"
              value={newProductData.precio}
              error={!!formErrors.precio}
              helperText={formErrors.precio}
              fullWidth
              variant="outlined"
              margin="dense"
              onChange={handleNewProductChange}
            />
            <TextField
              label="Descripción"
              name="descripcion"
              multiline
              rows={3}
              value={newProductData.descripcion}
              fullWidth
              variant="outlined"
              margin="dense"
              onChange={handleNewProductChange}
            />

            <FormControl fullWidth margin="dense" variant="outlined">
              <InputLabel id="categoria-select-label">Categoría</InputLabel>
              <Select
                labelId="categoria-select-label"
                name="id_categoria"
                value={newProductData.id_categoria}
                onChange={handleNewProductChange}
                label="Categoría"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" variant="outlined">
              <InputLabel id="subcategoria-select-label">Subcategoría</InputLabel>
              <Select
                labelId="subcategoria-select-label"
                name="id_subcategoria"
                value={newProductData.id_subcategoria || ''}
                onChange={handleNewProductChange}
                label="Subcategoría"
              >
                <MenuItem value={null}>Sin subcategoría</MenuItem>
                {filteredSubcategories.map((sub) => (
                  <MenuItem key={sub.id_subcategoria} value={sub.id_subcategoria}>
                    {sub.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {['vegano', 'celiaco', 'vegetariano'].map((attr) => (
              <FormControlLabel
                key={attr}
                control={<Checkbox checked={newProductData[attr]} name={attr} onChange={handleNewProductChange} />}
                label={attr.charAt(0).toUpperCase() + attr.slice(1)}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleAddProduct} variant="outlined">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirmar Nuevo Producto
        </DialogTitle>
        <DialogContent>
          <Box>
            <Typography variant="body1"><strong>Nombre:</strong> {newProductData.nombre}</Typography>
            <Typography variant="body1"><strong>Precio:</strong> ${newProductData.precio}</Typography>
            <Typography variant="body1"><strong>Descripción:</strong> {newProductData.descripcion}</Typography>
            <Typography variant="body1"><strong>Categoría:</strong> {categories.find(cat => cat.id_categoria === newProductData.id_categoria)?.nombre || 'Sin categoría'}</Typography>
            <Typography variant="body1"><strong>Subcategoría:</strong> {filteredSubcategories.find(sub => sub.id_subcategoria === newProductData.id_subcategoria)?.nombre || 'Sin subcategoría'}</Typography>
            <Typography variant="body1"><strong>Vegano:</strong> {newProductData.vegano ? 'Sí' : 'No'}</Typography>
            <Typography variant="body1"><strong>Celiaco:</strong> {newProductData.celiaco ? 'Sí' : 'No'}</Typography>
            <Typography variant="body1"><strong>Vegetariano:</strong> {newProductData.vegetariano ? 'Sí' : 'No'}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={() => setConfirmationOpen(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleConfirmAddProduct} variant="outlined">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddProductDialog;
