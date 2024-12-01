import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllCategories, getAllProducts, updateStock, updateProduct, deleteProduct, createProduct,updatePlatoDelDia, getSubcategoriesByCategoryId } from '../../services/menuService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, FormControl, InputLabel, Select, MenuItem, IconButton, TextField, Button, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddProductDialog from '../dialogs/AddProductDialog';
import CreateAndRemoveCategoriesDialog from '../dialogs/CreateAndDeleteCategoriesDialog'; // Importamos el nuevo componente

const MenuSection = () => {
    const queryClient = useQueryClient();
    const { data: categories = [], isLoading: loadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: getAllCategories,
    });

    const { data: products = [], isLoading: loadingProducts } = useQuery({
        queryKey: ['products'],
        queryFn: getAllProducts,
    });

    const [selectedCategory, setSelectedCategory] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProductId, setEditingProductId] = useState(null);
    const [editingProductData, setEditingProductData] = useState({ nombre: '', precio: '', descripcion: '' });

    const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
    const [openCategoriesDialog, setOpenCategoriesDialog] = useState(false); // Estado para el diálogo de categorías
    const [openDialog, setOpenDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (selectedCategory) {
                try {
                    const subcategoriesData = await getSubcategoriesByCategoryId(selectedCategory);
                    if (subcategoriesData && typeof subcategoriesData === 'object') {
                        const subcategoriesArray = Object.values(subcategoriesData);
                        setSubcategories(subcategoriesArray);
                    } else {
                        setSubcategories([]);
                    }
                } catch (error) {
                    console.error('Error al obtener subcategorías:', error);
                    setSubcategories([]);
                }
            } else {
                setSubcategories([]);
            }
        };
        fetchSubcategories();
    }, [selectedCategory]);

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

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
        setEditingProductData({ nombre: product.nombre, precio: product.precio, descripcion: product.descripcion });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'precio' && isNaN(value)) return;
        setEditingProductData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSaveClick = async (productId) => {
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

    const handleOpenAddProductDialog = () => {
        setOpenAddProductDialog(true);
    };

    const handleCloseAddProductDialog = () => {
        setOpenAddProductDialog(false);
    };

    const handleAddProduct = async (newProductData) => {
        try {
            await createProduct(newProductData);
            queryClient.invalidateQueries(['products']);
            handleCloseAddProductDialog();
        } catch (error) {
            console.error('Error al agregar el producto:', error);
        }
    };

    const handleOpenDialog = (product) => {
        setProductToDelete(product);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setProductToDelete(null);
    };

    const handleDeleteProduct = async () => {
        if (productToDelete) {
            try {
                await deleteProduct(productToDelete.id_producto);
                queryClient.invalidateQueries(['products']);
                handleCloseDialog();
            } catch (error) {
                console.error('Error al eliminar el producto:', error);
            }
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

    if (loadingCategories || loadingProducts) {
        return <div>Cargando...</div>;
    }

    const filteredProducts = products.filter((product) =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedCategory ? product.id_categoria === selectedCategory : true)
    );

    return (
        <Box sx={{ backgroundColor: 'rgb(155, 140, 141)', p: 2}}>
                                   <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}> {/* Contenedor para alinear botones horizontalmente */}
  {/* Botón para abrir el diálogo de agregar producto */}
  <Button
    variant="contained"
    sx={{ 
      width: '250px', // Establecer un ancho fijo
      height: '50px', // Establecer una altura fija
      mb: 2, // Margen inferior solo para el primer botón
      backgroundColor: 'black', // El color de fondo traslúcido que usaste en las Tabs
      color: '#DD98AD', // Color blanco para el texto
      '&:hover': { 
        backgroundColor: 'grey', // Fondo más oscuro al pasar el mouse
      },
    }}
    startIcon={<AddIcon />}
    onClick={handleOpenAddProductDialog}
  >
    Agregar Producto
  </Button>

  {/* Botón para abrir el diálogo de agregar/borrar categoría */}
  <Button
    variant="contained"
    sx={{ 
      width: '300px', // Mismo ancho que el primer botón
      height: '50px', // Mismo alto que el primer botón
      ml: 2, // Margen izquierdo para separar los botones
      backgroundColor: 'black', // Mismo color de fondo traslúcido
      color: '#DD98AD', // Color del texto blanco
      '&:hover': { 
        backgroundColor: 'grey', // Fondo más oscuro al hacer hover
      },
    }}
    onClick={() => setOpenCategoriesDialog(true)}
    startIcon={<AddIcon />}
  >
    Agregar/Eliminar Categoría
  </Button>
</Box>


<TextField
  fullWidth
  label="Buscar en todo el menú"
  variant="outlined"
  value={searchTerm}
  onChange={handleSearchTermChange}
  sx={{
    mb: 4,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'black', // Color de los bordes por defecto
      },
      '&:hover fieldset': {
        borderColor: 'black', // Color de los bordes al pasar el cursor
      },
      '&.Mui-focused fieldset': {
        borderColor: 'black', // Color de los bordes al hacer focus
      },
    },
    '& .MuiInputLabel-root': {
      color: 'black', // Color del label por defecto
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: 'black', // Color del label al hacer focus
    },
  }}
/>

            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel id="category-select-label">Filtrar por categoría</InputLabel>
                <Select labelId="category-select-label" value={selectedCategory} onChange={handleCategoryChange}>
                    <MenuItem value="">
                        <em>Todos</em>
                    </MenuItem>
                    {categories.map((category) => (
                        <MenuItem key={category.id_categoria} value={category.id_categoria}>
                            {category.nombre}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell align="center">Precio</TableCell>
                            <TableCell align="center">Descripción</TableCell>
                            <TableCell align="center">Stock</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id_producto}>
                                    <TableCell>
                                        {editingProductId === product.id_producto ? (
                                            <TextField name="nombre" value={editingProductData.nombre} onChange={handleInputChange} />
                                        ) : (
                                            product.nombre
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {editingProductId === product.id_producto ? (
                                            <TextField name="precio" value={editingProductData.precio} onChange={handleInputChange} type="number" />
                                        ) : (
                                            `$${product.precio}`
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={editingProductId === product.id_producto ? editingProductData.descripcion : product.descripcion}>
                                            <span>{editingProductId === product.id_producto ? <TextField name="descripcion" value={editingProductData.descripcion} onChange={handleInputChange} /> : product.descripcion}</span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">{product.stock ? 'Disponible' : 'Sin stock'}</TableCell>
                                    <TableCell align="center">
    {editingProductId === product.id_producto ? (
        <IconButton onClick={() => handleSaveClick(product.id_producto)}>
            <SaveIcon />
        </IconButton>
    ) : (
        <IconButton onClick={() => handleEditClick(product)}>
            <EditIcon />
        </IconButton>
    )}
    <IconButton onClick={() => handleToggleStock(product.id_producto, product.stock)}>
        {product.stock ? <VisibilityOffIcon /> : <VisibilityIcon />}
    </IconButton>
    <IconButton onClick={() => handleOpenDialog(product)}>
        <DeleteIcon />
    </IconButton>
    <IconButton onClick={() => handleTogglePlatoDelDia(product.id_producto, product.plato_del_dia)}>
        {product.plato_del_dia ? (
            <RestaurantIcon color="success" />
        ) : (
            <RestaurantIcon color="disabled" />
        )}
    </IconButton>
</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No hay productos que coincidan con la búsqueda.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddProductDialog 
                open={openAddProductDialog} 
                onClose={handleCloseAddProductDialog} 
                onAddProduct={handleAddProduct} 
                categories={categories} 
                subcategories={subcategories} 
            />

            <CreateAndRemoveCategoriesDialog 
                open={openCategoriesDialog} 
                onClose={() => setOpenCategoriesDialog(false)} 
            />

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Eliminar Producto</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar el producto "{productToDelete?.nombre}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleDeleteProduct} color="secondary">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MenuSection;
