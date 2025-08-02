import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Tooltip, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const TableContainerComponent = ({ 
    filteredProducts, 
    categories, 
    searchTerm, 
    editingProductId, 
    editingProductData, 
    handleInputChange, 
    handleSaveClick, 
    handleToggleStock, 
    handleEditClick, 
    handleTogglePlatoDelDia, 
    handleDeleteProduct, 
    setProductToDelete, 
    setOpenDialog 
}) => {

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="center">Precio</TableCell>
                        <TableCell align="center">Descripción</TableCell>
                        <TableCell align="center">Dieta</TableCell>
                        <TableCell align="center">Categoría</TableCell>
                        <TableCell align="center">Stock</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredProducts.length ? (
                        filteredProducts.map((product) => {

                            return (
                                <TableRow key={product.id_producto}>
                                    <TableCell>
                                        {editingProductId === product.id_producto ? (
                                            <TextField
                                                name="nombre"
                                                value={editingProductData.nombre}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            product.nombre
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {editingProductId === product.id_producto ? (
                                            <TextField
                                                name="precio"
                                                value={editingProductData.precio}
                                                onChange={handleInputChange}
                                                type="number"
                                            />
                                        ) : (
                                            `$${product.precio}`
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={editingProductId === product.id_producto ? editingProductData.descripcion : product.descripcion}>
                                            <span>
                                                {editingProductId === product.id_producto ? (
                                                    <TextField
                                                        name="descripcion"
                                                        value={editingProductData.descripcion}
                                                        onChange={handleInputChange}
                                                    />
                                                ) : (
                                                    product.descripcion
                                                )}
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        {editingProductId === product.id_producto ? (
                                            <FormControl sx={{ minWidth: 120 }} fullWidth>
                                                <InputLabel>Dieta</InputLabel>
                                                <Select
                                                    name="dieta"
                                                    value={editingProductData.dieta || ''}
                                                    onChange={handleInputChange}
                                                >
                                                    <MenuItem value="ninguno"><em>Ninguno</em></MenuItem>
                                                    <MenuItem value="vegetariano">Vegetariano</MenuItem>
                                                    <MenuItem value="celiaco">Celíaco</MenuItem>
                                                    <MenuItem value="vegano">Vegano</MenuItem>
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            product.vegetariano ? 'Vegetariano' :
                                            product.celiaco ? 'Celíaco' :
                                            product.vegano ? 'Vegano' :
                                            'Ninguno'
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {editingProductId === product.id_producto ? (
                                            <FormControl fullWidth>
                                                <InputLabel>Categoría</InputLabel>
                                                <Select
                                                    name="id_categoria"
                                                    value={editingProductData.id_categoria || ''}
                                                    onChange={handleInputChange}
                                                >
                                                    {categories.map((category) => (
                                                        <MenuItem key={category.id_categoria} value={category.id_categoria}>
                                                            {category.nombre}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            categories.find(category => category.id_categoria === product.id_categoria)?.nombre || 'Sin categoría'
                                        )}
                                    </TableCell>
                                    <TableCell align="center">{product.stock ? 'Disponible' : 'Sin stock'}</TableCell>
                                    <TableCell align="center">
                                        {editingProductId === product.id_producto ? (
                                            <IconButton onClick={() => handleSaveClick(product.id_producto)}><SaveIcon /></IconButton>
                                        ) : (
                                            <IconButton onClick={() => handleEditClick(product)}><EditIcon /></IconButton>
                                        )}
                                        <IconButton onClick={() => handleToggleStock(product.id_producto, product.stock)}>{product.stock ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton>
                                        <IconButton onClick={() => { setProductToDelete(product); setOpenDialog(true); }}><DeleteIcon /></IconButton>
                                        <IconButton onClick={() => handleTogglePlatoDelDia(product.id_producto, product.plato_del_dia)}>{product.plato_del_dia ? <RestaurantIcon color="success" /> : <RestaurantIcon color="disabled" />}</IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow><TableCell colSpan={8} align="center">No hay productos que coincidan con la búsqueda.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TableContainerComponent;
