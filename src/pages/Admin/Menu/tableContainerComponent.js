import React from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const COLUMN_COUNT = 7;
const SKELETON_ROWS = 6;

const TableContainerComponent = ({
  products = [],
  totalCount = 0,
  isLoading,
  isRefetching,
  editingProductId,
  editingProductData,
  categories,
  subcategories,
  handleInputChange,
  handleSaveClick,
  handleToggleStock,
  handleEditClick,
  handleTogglePlatoDelDia,
  setProductToDelete,
  setOpenDialog,
  searchTerm = '',
  loadFeedback,
  canLoadMore,
  isFetchingNextPage,
  onLoadMore,
}) => {
  const safeProducts = Array.isArray(products) ? products : [];
  const showEmptyState = !isLoading && !isRefetching && safeProducts.length === 0;
  const emptyMessage = 'No se encontraron productos para esta búsqueda o categoría.';
  const normalizedSearch = String(searchTerm ?? '').trim().toLowerCase();

  const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const getHighlightedText = (value, fallback = 'Sin descripción') => {
    if (!normalizedSearch) return value || fallback;
    const stringValue = String(value ?? '');
    if (!stringValue) return fallback;
    const parts = stringValue.split(new RegExp(`(${escapeRegExp(normalizedSearch)})`, 'ig'));
    return parts.map((part, index) =>
      part.toLowerCase() === normalizedSearch ? (
        <Box
          component="span"
          key={`${stringValue}-${index}`}
          sx={{ color: 'warning.main', fontWeight: 700 }}
        >
          {part}
        </Box>
      ) : (
        <React.Fragment key={`${stringValue}-${index}`}>{part}</React.Fragment>
      ),
    );
  };

  const handleLoadMore = () => {
    if (!canLoadMore || !onLoadMore) return;
    onLoadMore();
  };

  const resolveCategoryName = (product) => {
    const categoryFromList =
      categories.find((category) => String(category.id_categoria) === String(product.id_categoria))
        ?.nombre;
    return (
      categoryFromList ||
      product.category_name ||
      product.nombre_categoria ||
      product.categoria ||
      product.nombreCategoria ||
      'Sin categoría'
    );
  };

  const resolveSubcategoryName = (product) =>
    product.subcategoria_nombre ||
    product.subcategory_name ||
    product.nombre_subcategoria ||
    product.subcategoria ||
    '';

  const getCategoryLabel = (product) => {
    const categoryName = resolveCategoryName(product);
    const subcategoryName = resolveSubcategoryName(product);
    return subcategoryName ? `${categoryName} / ${subcategoryName}` : categoryName;
  };

  const renderDietLabel = (product) => {
    if (product.vegetariano) return 'Vegetariano';
    if (product.celiaco) return 'Celíaco';
    if (product.vegano) return 'Vegano';
    return 'Ninguno';
  };

  const renderSkeletonRows = (rows = SKELETON_ROWS, keyPrefix = 'skeleton') =>
    Array.from({ length: rows }).map((_, rowIndex) => (
      <TableRow key={`${keyPrefix}-${rowIndex}`}>
        {Array.from({ length: COLUMN_COUNT }).map((__, cellIndex) => (
          <TableCell key={`${keyPrefix}-${rowIndex}-${cellIndex}`}>
            <Skeleton variant="rounded" height={20} />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <Box>
      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          borderRadius: 2,
          backgroundColor: (theme) => theme.palette.background.paper,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          maxHeight: 520,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            '& th': { py: 1, px: 1.5, fontWeight: 600, backgroundColor: 'background.default' },
            '& td': { py: 0.75, px: 1.5 },
          }}
        >
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
            {isLoading && renderSkeletonRows()}

            {!isLoading &&
              safeProducts.map((product) => (
                <TableRow key={product.id_producto}>
                  <TableCell>
                    {editingProductId === product.id_producto ? (
                      <TextField
                        name="nombre"
                        value={editingProductData.nombre}
                        onChange={handleInputChange}
                        size="small"
                      />
                    ) : (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography component="span" fontWeight={600}>
                          {getHighlightedText(product.nombre || 'Sin nombre', 'Sin nombre')}
                        </Typography>
                        {product.plato_del_dia ? (
                          <Chip
                            label="Del dia"
                            size="small"
                            color="success"
                            variant="outlined"
                            icon={<RestaurantIcon sx={{ fontSize: 16 }} />}
                          />
                        ) : null}
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editingProductId === product.id_producto ? (
                      <TextField
                        name="precio"
                        value={editingProductData.precio}
                        onChange={handleInputChange}
                        type="number"
                        size="small"
                      />
                    ) : (
                      `$${product.precio}`
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip
                      title={
                        editingProductId === product.id_producto
                          ? editingProductData.descripcion || 'Sin descripcion'
                          : product.descripcion || 'Sin descripcion'
                      }
                    >
                      <span>
                        {editingProductId === product.id_producto ? (
                          <TextField
                            name="descripcion"
                            value={editingProductData.descripcion}
                            onChange={handleInputChange}
                            size="small"
                          />
                        ) : (
                          <Typography component="span">
                            {getHighlightedText(product.descripcion || 'Sin descripcion')}
                          </Typography>
                        )}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    {editingProductId === product.id_producto ? (
                      <FormControl sx={{ minWidth: 120 }} fullWidth size="small">
                        <InputLabel>Dieta</InputLabel>
                        <Select
                          name="dieta"
                          label="Dieta"
                          value={editingProductData.dieta || ''}
                          onChange={handleInputChange}
                          size="small"
                        >
                          <MenuItem value="ninguno">
                            <em>Ninguno</em>
                          </MenuItem>
                          <MenuItem value="vegetariano">Vegetariano</MenuItem>
                          <MenuItem value="celiaco">Celíaco</MenuItem>
                          <MenuItem value="vegano">Vegano</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      renderDietLabel(product)
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editingProductId === product.id_producto ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>Categoría</InputLabel>
                        <Select
                          name="id_categoria"
                          label="Categoria"
                          value={editingProductData.id_categoria || product.id_categoria || ''}
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
                      <Typography component="span">{getCategoryLabel(product)}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={product.stock ? 'Disponible' : 'Sin stock'}
                      size="small"
                      color={product.stock ? 'success' : 'default'}
                      variant={product.stock ? 'filled' : 'outlined'}
                      sx={{ minWidth: 92 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {editingProductId === product.id_producto ? (
                      <Tooltip title={`Guardar cambios de ${product.nombre}`}>
                        <IconButton
                          onClick={() => handleSaveClick(product.id_producto)}
                          aria-label={`Guardar cambios de ${product.nombre}`}
                        >
                          <SaveIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={`Editar ${product.nombre}`}>
                        <IconButton
                          onClick={() => handleEditClick(product)}
                          aria-label={`Editar ${product.nombre}`}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={product.stock ? 'Ocultar del menu' : 'Mostrar en el menu'}>
                      <IconButton
                        onClick={() => handleToggleStock(product.id_producto, product.stock)}
                        aria-label={
                          product.stock
                            ? `Ocultar ${product.nombre} del menu`
                            : `Mostrar ${product.nombre} en el menu`
                        }
                      >
                        {product.stock ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`Eliminar ${product.nombre}`}>
                      <IconButton
                        onClick={() => {
                          setProductToDelete(product);
                          setOpenDialog(true);
                        }}
                        aria-label={`Eliminar ${product.nombre}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        product.plato_del_dia
                          ? 'Quitar Plato del Dia'
                          : 'Marcar como Plato del Dia'
                      }
                    >
                      <IconButton
                        onClick={() =>
                          handleTogglePlatoDelDia(product.id_producto, product.plato_del_dia)
                        }
                        aria-label={
                          product.plato_del_dia
                            ? `Quitar ${product.nombre} como Plato del Dia`
                            : `Marcar ${product.nombre} como Plato del Dia`
                        }
                      >
                        <RestaurantIcon color={product.plato_del_dia ? 'success' : 'disabled'} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && isRefetching && renderSkeletonRows(2, 'refetch')}

            {showEmptyState && (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {isRefetching && !isLoading && (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Actualizando elementos...
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {canLoadMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
          <Stack spacing={0.75} alignItems="center">
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
              startIcon={
                isFetchingNextPage ? <CircularProgress size={16} thickness={5} /> : null
              }
            >
              {isFetchingNextPage ? 'Cargando...' : 'Cargar mas'}
            </Button>
            {loadFeedback ? (
              <Typography variant="caption" color="text.secondary">
                +{loadFeedback} productos cargados recientemente.
              </Typography>
            ) : null}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default TableContainerComponent;

