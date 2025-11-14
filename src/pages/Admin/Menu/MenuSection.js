import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  updateStock,
  updateProduct,
  deleteProduct,
  createProduct,
  updatePlatoDelDia,
  getSubcategoriesByCategoryId,
} from '../../../services/menuService';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CategoryIcon from '@mui/icons-material/Category';
import AddProductDialog from './AddProductDialog';
import ManageCategoriesDialog from './ManageCategoriesDialog';
import TableContainerComponent from './tableContainerComponent';
import useMenuData from '../../../hooks/useMenuData';
import { queryKeys } from '../../../lib/queryClient';

const PRODUCTS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 350;

const MenuSection = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [loadFeedback, setLoadFeedback] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProductData, setEditingProductData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    dieta: '',
    id_categoria: '',
  });
  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
  const [openCategoryManager, setOpenCategoryManager] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [debouncedSearchTerm, selectedCategory]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      return;
    }

    getSubcategoriesByCategoryId(selectedCategory)
      .then((data) => setSubcategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [selectedCategory]);

  useEffect(() => {
    if (!loadFeedback) return undefined;
    const timer = setTimeout(() => setLoadFeedback(null), 2400);
    return () => clearTimeout(timer);
  }, [loadFeedback]);

  const productFilters = useMemo(() => {
    const filters = {};
    if (debouncedSearchTerm) {
      filters.search = debouncedSearchTerm;
    }
    if (selectedCategory) {
      filters.categoryId = selectedCategory;
    }
    return filters;
  }, [debouncedSearchTerm, selectedCategory]);

  const { categoriesQuery, productsQuery } = useMenuData({
    productsOptions: {
      paginated: false,
      filters: productFilters,
      pageSize: PRODUCTS_PER_PAGE,
    },
  });

  const categories = categoriesQuery.data ?? [];
  const paginatedPages = productsQuery.data?.pages ?? [];
  const products = paginatedPages.length
    ? paginatedPages.flatMap((page) => page?.items ?? [])
    : productsQuery.data ?? [];
  const totalProducts = paginatedPages.length
    ? paginatedPages[0]?.total ?? products.length
    : products.length;

  const isInfiniteQuery = typeof productsQuery.fetchNextPage === 'function';
  const isProductsLoading =
    productsQuery.isLoading || (productsQuery.isFetching && !(products?.length > 0));
  const isProductsRefetching = productsQuery.isFetching && !isProductsLoading;
  const hasNextPage = Boolean(productsQuery.hasNextPage);
  const rawIsFetchingNextPage = Boolean(productsQuery.isFetchingNextPage);
  const fetchNextPage = productsQuery.fetchNextPage ?? (() => Promise.resolve());

  const resolvedTotal =
    typeof totalProducts === 'number' && !Number.isNaN(totalProducts)
      ? totalProducts
      : products.length;
  const displayedProducts = isInfiniteQuery
    ? products
    : products.slice(0, Math.min(visibleCount, products.length));
  const showingProducts = displayedProducts.length;
  const totalLabel = resolvedTotal || products.length;
  const allProductsLoaded = isInfiniteQuery
    ? resolvedTotal > 0
      ? showingProducts >= resolvedTotal
      : !hasNextPage
    : showingProducts >= products.length;
  const clientCanLoadMore = !isInfiniteQuery && products.length > showingProducts;
  const canLoadMore = isInfiniteQuery
    ? Boolean(hasNextPage && !allProductsLoaded)
    : clientCanLoadMore;

  const handleClientLoadMore = () => {
    if (!clientCanLoadMore) return;
    setVisibleCount((prev) => {
      const previousVisible = Math.min(prev, products.length);
      const nextVisible = Math.min(prev + PRODUCTS_PER_PAGE, products.length);
      const increment = nextVisible - previousVisible;
      if (increment > 0) {
        setLoadFeedback(increment);
      }
      return nextVisible;
    });
  };
  const loadMoreHandler = isInfiniteQuery ? fetchNextPage : handleClientLoadMore;
  const isFetchingNextPage = isInfiniteQuery ? rawIsFetchingNextPage : false;

  const invalidateProducts = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.menu.products() });

  const handleCategoryChange = (e) => setSelectedCategory(e.target.value ?? '');
  const handleSearchTermChange = (e) => setSearchTerm(e.target.value);
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id_producto);
    setEditingProductData({
      nombre: product.nombre,
      precio: product.precio,
      descripcion: product.descripcion,
      dieta: product.dieta || '',
      id_categoria: product.id_categoria ?? '',
    });
  };

  const handleInputChange = ({ target: { name, value } }) => {
    if (name !== 'dieta') {
      setEditingProductData((prev) => ({ ...prev, [name]: value }));
      return;
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
      setEditingProductId(null);
      await invalidateProducts();
    } catch (err) {
      console.error('Error al actualizar el producto:', err);
    }
  };

  const handleToggleStock = async (id, current) => {
    const newStock = current ? 0 : 1;
    try {
      await updateStock(id, newStock);
      await invalidateProducts();
    } catch (err) {
      console.error('Error al actualizar el stock:', err);
    }
  };

  const handleTogglePlatoDelDia = async (id, current) => {
    const newStatus = current ? 0 : 1;
    try {
      await updatePlatoDelDia(id, newStatus);
      await invalidateProducts();
    } catch (err) {
      console.error('Error al actualizar el Plato del Dia:', err);
    }
  };

  const handleAddProduct = async (newProduct) => {
    try {
      await createProduct(newProduct);
      await invalidateProducts();
      setOpenAddProductDialog(false);
    } catch (err) {
      console.error('Error al agregar el producto:', err);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id_producto);
      await invalidateProducts();
      setOpenDialog(false);
    } catch (err) {
      console.error('Error al eliminar el producto:', err);
    }
  };

  const filterChips = [
    debouncedSearchTerm
      ? {
          id: 'search',
          label: `Coincide con "${debouncedSearchTerm}"`,
          onDelete: () => setSearchTerm(''),
        }
      : null,
    selectedCategory
      ? {
          id: 'category',
          label:
            categories.find((cat) => String(cat.id_categoria) === String(selectedCategory))
              ?.nombre || 'Categoria seleccionada',
          onDelete: () => setSelectedCategory(''),
        }
      : null,
  ].filter(Boolean);
  const hasFilters = filterChips.length > 0;


  const counterText = `Mostrando ${Math.min(showingProducts, totalLabel)} de ${totalLabel} productos`;

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, md: 2 },
      }}
    >

      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
          alignItems={{ xs: 'stretch', lg: 'center' }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.25}
            flex={1}
            alignItems="stretch"
          >
            <TextField
              fullWidth
              size="small"
              label="Buscar en todo el menu"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchTermChange}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', md: 240 },
              }}
            />

            <FormControl
              fullWidth
              size="small"
              sx={{
                flex: { md: 0.5, lg: 0.35 },
                minWidth: { xs: '100%', md: 220 },
              }}
            >
              <InputLabel id="category-select-label">Filtrar por categoría</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategory}
                label="Filtrar por categoria"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id_categoria} value={String(cat.id_categoria)}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<RestaurantMenuIcon />}
              onClick={() => setOpenAddProductDialog(true)}
              sx={{
                borderRadius: 999,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Agregar producto
            </Button>
            <Tooltip title="Administrar categorías y subcategorías">
              <IconButton
                aria-label="Administrar categorías"
                onClick={() => setOpenCategoryManager(true)}
                sx={{
                  border: (theme) => `1px solid ${theme.palette.primary.main}`,
                  borderRadius: 2,
                  color: (theme) => theme.palette.primary.main,
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  width: 48,
                  height: 48,
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.24),
                  },
                }}
              >
                <CategoryIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {hasFilters && (
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            {filterChips.map((chip) => (
              <Chip
                key={chip.id}
                label={chip.label}
                onDelete={chip.onDelete}
                size="small"
                color="warning"
                variant="outlined"
              />
            ))}
            <Button size="small" onClick={handleClearFilters} variant="text" sx={{ ml: 0.5 }}>
              Limpiar filtros
            </Button>
          </Stack>
        )}
      </Stack>

      <Divider sx={{ my: 1 }} />

      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {counterText}
        {isProductsRefetching ? ' - Actualizando...' : ''}
      </Typography>

      <TableContainerComponent
        products={displayedProducts}
        totalCount={totalLabel}
        isLoading={isProductsLoading}
        isRefetching={isProductsRefetching}
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
        searchTerm={debouncedSearchTerm}
        loadFeedback={loadFeedback}
        canLoadMore={canLoadMore}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={loadMoreHandler}
      />

      <AddProductDialog
        open={openAddProductDialog}
        onClose={() => setOpenAddProductDialog(false)}
        onAddProduct={handleAddProduct}
        categories={categories}
        subcategories={subcategories}
      />

      <ManageCategoriesDialog
        open={openCategoryManager}
        onClose={() => setOpenCategoryManager(false)}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>
          Eliminar producto
        </DialogTitle>
        <DialogContent>
          <DialogContentText color="text.secondary">
            Estás seguro de que deseas eliminar el producto "{productToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: 'text.secondary',
              color: 'text.secondary',
              '&:hover': { borderColor: 'text.primary', color: 'text.primary' },
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleDeleteProduct} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuSection;


