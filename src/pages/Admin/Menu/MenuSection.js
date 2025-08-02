import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllCategories,
  getAllProducts,
  updateStock,
  updateProduct,
  deleteProduct,
  createProduct,
  updatePlatoDelDia,
  getSubcategoriesByCategoryId,
  createSubCategory,
  deleteSubCategory,
} from '../../../services/menuService';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddProductDialog from './AddProductDialog';
import CreateAndRemoveCategoriesDialog from './CreateAndDeleteCategoriesDialog';
import CreateAndDeleteSubcategoriesDialog from './CreateAndDeleteSubcategoriesDialog';
import TableContainerComponent from './tableContainerComponent';

const MenuSection = () => {
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getAllCategories });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getAllProducts });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProductData, setEditingProductData] = useState({ nombre: '', precio: '', descripcion: '', dieta: '' });
  const [openSubcategoriesDialog, setOpenSubcategoriesDialog] = useState(false);
  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
  const [openCategoriesDialog, setOpenCategoriesDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (!selectedCategory) return setSubcategories([]);
    getSubcategoriesByCategoryId(selectedCategory)
      .then((data) => setSubcategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [selectedCategory]);

  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);
  const handleSearchTermChange = (e) => setSearchTerm(e.target.value);

  const handleEditClick = (product) => {
    setEditingProductId(product.id_producto);
    setEditingProductData({
      nombre: product.nombre,
      precio: product.precio,
      descripcion: product.descripcion,
      dieta: product.dieta || '',
    });
  };

  const handleInputChange = ({ target: { name, value } }) => {
    if (name !== 'dieta') {
      return setEditingProductData((prev) => ({ ...prev, [name]: value }));
    }

    const dietaFlags = {
      ninguno: { vegetariano: 0, celiaco: 0, vegano: 0 },
      vegetariano: { vegetariano: 1, celiaco: 0, vegano: 0 },
      celiaco: { vegetariano: 0, celiaco: 1, vegano: 0 },
      vegano: { vegetariano: 0, celiaco: 0, vegano: 1 },
    };

    setEditingProductData((prev) => ({
      ...prev,
      dieta: value,
      ...dietaFlags[value],
    }));
  };

  const handleSaveClick = async (productId) => {
    if (!editingProductData.nombre || !editingProductData.precio) return;
    try {
      await updateProduct(productId, editingProductData);
      queryClient.setQueryData(['products'], (old) =>
        old.map((p) => (p.id_producto === productId ? { ...p, ...editingProductData } : p))
      );
      setEditingProductId(null);
    } catch (err) {
      console.error('Error al actualizar el producto:', err);
    }
  };

  const handleToggleStock = async (id, current) => {
    const newStock = current ? 0 : 1;
    try {
      await updateStock(id, newStock);
      queryClient.setQueryData(['products'], (old) =>
        old.map((p) => (p.id_producto === id ? { ...p, stock: newStock, visible: newStock === 1 } : p))
      );
    } catch (err) {
      console.error('Error al actualizar el stock:', err);
    }
  };

  const handleTogglePlatoDelDia = async (id, current) => {
    const newStatus = current ? 0 : 1;
    try {
      await updatePlatoDelDia(id, newStatus);
      queryClient.setQueryData(['products'], (old) =>
        old.map((p) => (p.id_producto === id ? { ...p, plato_del_dia: newStatus } : p))
      );
    } catch (err) {
      console.error('Error al actualizar el Plato del Día:', err);
    }
  };

  const handleAddProduct = async (newProduct) => {
    try {
      await createProduct(newProduct);
      queryClient.invalidateQueries(['products']);
      setOpenAddProductDialog(false);
    } catch (err) {
      console.error('Error al agregar el producto:', err);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id_producto);
      queryClient.invalidateQueries(['products']);
      setOpenDialog(false);
    } catch (err) {
      console.error('Error al eliminar el producto:', err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || p.id_categoria === selectedCategory)
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddProductDialog(true)}>
          Agregar Producto
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCategoriesDialog(true)}>
          Agregar/Eliminar Categoría
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenSubcategoriesDialog(true)}>
          Agregar/Eliminar Subcategoría
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Buscar en todo el menú"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchTermChange}
        sx={{ mb: 4 }}
      />

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="category-select-label">Filtrar por categoría</InputLabel>
        <Select labelId="category-select-label" value={selectedCategory} onChange={handleCategoryChange}>
          <MenuItem value="">
            <em>Todos</em>
          </MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id_categoria} value={cat.id_categoria}>
              {cat.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainerComponent
        filteredProducts={filteredProducts}
        editingProductId={editingProductId}
        editingProductData={editingProductData}
        categories={categories}
        subcategories={subcategories}
        handleInputChange={handleInputChange}
        handleEditClick={handleEditClick}
        handleSaveClick={handleSaveClick}
        handleToggleStock={handleToggleStock}
        handleTogglePlatoDelDia={handleTogglePlatoDelDia}
        setProductToDelete={setProductToDelete}
        setOpenDialog={setOpenDialog}
      />

      <AddProductDialog
        open={openAddProductDialog}
        onClose={() => setOpenAddProductDialog(false)}
        onAddProduct={handleAddProduct}
        categories={categories}
        subcategories={subcategories}
      />

      <CreateAndRemoveCategoriesDialog open={openCategoriesDialog} onClose={() => setOpenCategoriesDialog(false)} />

      <CreateAndDeleteSubcategoriesDialog
        open={openSubcategoriesDialog}
        onClose={() => setOpenSubcategoriesDialog(false)}
        categories={categories}
        subcategories={subcategories}
        onCreate={createSubCategory}
        onDelete={deleteSubCategory}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Eliminar Producto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el producto "{productToDelete?.nombre}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteProduct}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuSection;
