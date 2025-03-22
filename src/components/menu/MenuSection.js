import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllCategories, getAllProducts, updateStock, updateProduct, deleteProduct, createProduct, updatePlatoDelDia, getSubcategoriesByCategoryId, createSubCategory, deleteSubCategory } from '../../services/menuService';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddProductDialog from '../dialogs/AddProductDialog';
import CreateAndRemoveCategoriesDialog from '../dialogs/CreateAndDeleteCategoriesDialog';
import CreateAndDeleteSubcategoriesDialog from '../dialogs/CreateAndDeleteSubcategoriesDialog';
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
            .then(data => setSubcategories(Array.isArray(data) ? data : []))
            .catch(error => console.error('Error al obtener subcategorías:', error));
    }, [selectedCategory]);

    const handleCategoryChange = (event) => setSelectedCategory(event.target.value);
    const handleSearchTermChange = (event) => setSearchTerm(event.target.value);

    const handleToggleStock = async (productId, currentStock) => {
        const newStock = currentStock ? 0 : 1;
        try {
            await updateStock(productId, newStock);
            queryClient.setQueryData(['products'], (oldProducts) =>
                oldProducts.map((product) =>
                    product.id_producto === productId ? { ...product, stock: newStock, visible: newStock === 1 } : product
                )
            );
        } catch (error) {
            console.error('Error al actualizar el stock:', error);
        }
    };

    const handleEditClick = (product) => {
        setEditingProductId(product.id_producto);
        setEditingProductData({ 
            nombre: product.nombre, 
            precio: product.precio, 
            descripcion: product.descripcion,
            dieta: product.dieta || '' 
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name !== 'dieta') {
            setEditingProductData((prevData) => ({ ...prevData, [name]: value }));
            return;
        }

        setEditingProductData((prevData) => {
            let updatedData = { ...prevData, [name]: value };

            if (value === 'ninguno') {
                updatedData.vegetariano = 0;
                updatedData.celiaco = 0;
                updatedData.vegano = 0;
            } else if (value === 'vegetariano') {
                updatedData.vegetariano = 1;
                updatedData.celiaco = 0;
                updatedData.vegano = 0;
            } else if (value === 'celiaco') {
                updatedData.vegetariano = 0;
                updatedData.celiaco = 1;
                updatedData.vegano = 0;
            } else if (value === 'vegano') {
                updatedData.vegetariano = 0;
                updatedData.celiaco = 0;
                updatedData.vegano = 1;
            }

            return updatedData;
        });
    };

    const handleSaveClick = async (productId) => {
        if (!editingProductData.nombre || !editingProductData.precio) return console.error('El nombre y el precio son obligatorios');
        try {
            await updateProduct(productId, editingProductData);
            queryClient.setQueryData(['products'], (oldProducts) =>
                oldProducts.map((product) => (product.id_producto === productId ? { ...product, ...editingProductData } : product))
            );
            setEditingProductId(null);
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
        }
    };

    const handleAddProduct = async (newProductData) => {
        try {
            await createProduct(newProductData);
            queryClient.invalidateQueries(['products']);
            setOpenAddProductDialog(false);
        } catch (error) {
            console.error('Error al agregar el producto:', error);
        }
    };

    const handleTogglePlatoDelDia = async (productId, currentStatus) => {
        const newStatus = currentStatus ? 0 : 1;
        try {
            await updatePlatoDelDia(productId, newStatus);
            queryClient.setQueryData(['products'], (oldProducts) =>
                oldProducts.map((product) =>
                    product.id_producto === productId ? { ...product, plato_del_dia: newStatus } : product
                )
            );
        } catch (error) {
            console.error('Error al actualizar el estado del Plato del Día:', error);
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await deleteProduct(productToDelete.id_producto);
            queryClient.invalidateQueries(['products']);
            setOpenDialog(false);
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    };

    const filteredProducts = products.filter((product) =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedCategory ? product.id_categoria === selectedCategory : true)
    );

    return (
        <Box sx={{ backgroundColor: 'rgb(155, 140, 141)', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Button variant="contained" sx={{ width: '250px', height: '50px', mb: 2, backgroundColor: 'black', color: '#DD98AD', '&:hover': { backgroundColor: 'grey' } }} startIcon={<AddIcon />} onClick={() => setOpenAddProductDialog(true)}>Agregar Producto</Button>
                <Button variant="contained" sx={{ width: '300px', height: '50px', ml: 2, backgroundColor: 'black', color: '#DD98AD', '&:hover': { backgroundColor: 'grey' } }} onClick={() => setOpenCategoriesDialog(true)} startIcon={<AddIcon />}>Agregar/Eliminar Categoría</Button>
                <Button variant="contained" sx={{ width: '300px', height: '50px', ml: 2, backgroundColor: 'black', color: '#DD98AD', '&:hover': { backgroundColor: 'grey' } }} onClick={() => setOpenSubcategoriesDialog(true)} startIcon={<AddIcon />}>Agregar/Eliminar Subcategoría</Button>
            </Box>

            <TextField fullWidth label="Buscar en todo el menú" variant="outlined" value={searchTerm} onChange={handleSearchTermChange} sx={{ mb: 4, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'black' }, '&:hover fieldset': { borderColor: 'black' }, '&.Mui-focused fieldset': { borderColor: '#DD98AD' } }, '& .MuiInputLabel-root': { color: 'black' }, '& .MuiInputLabel-root.Mui-focused': { color: 'black' } }} />
            <FormControl fullWidth sx={{ 
    mb: 4, 
    '& .MuiInputLabel-root': { color: 'black' }, 
    '& .MuiInputLabel-root.Mui-focused': { color: 'black' }, 
    '& .MuiOutlinedInput-root': { 
        '& fieldset': { borderColor: 'black' }, 
        '&:hover fieldset': { borderColor: 'black' }, 
        '&.Mui-focused fieldset': { borderColor: '#DD98AD' } 
    } 
}}>
    <InputLabel id="category-select-label">Filtrar por categoría</InputLabel>
    <Select labelId="category-select-label" value={selectedCategory} onChange={handleCategoryChange}>
        <MenuItem value=""><em>Todos</em></MenuItem>
        {categories.map((category) => <MenuItem key={category.id_categoria} value={category.id_categoria}>{category.nombre}</MenuItem>)}
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

            <AddProductDialog open={openAddProductDialog} onClose={() => setOpenAddProductDialog(false)} onAddProduct={handleAddProduct} categories={categories} subcategories={subcategories} />
            <CreateAndRemoveCategoriesDialog open={openCategoriesDialog} onClose={() => setOpenCategoriesDialog(false)} />
            <CreateAndDeleteSubcategoriesDialog open={openSubcategoriesDialog} onClose={() => setOpenSubcategoriesDialog(false)} categories={categories} subcategories={subcategories} onCreate={createSubCategory} onDelete={deleteSubCategory} />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Eliminar Producto</DialogTitle>
                <DialogContent>
                    <DialogContentText>¿Estás seguro de que deseas eliminar el producto "{productToDelete?.nombre}"?</DialogContentText>
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
