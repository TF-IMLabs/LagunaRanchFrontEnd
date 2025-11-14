import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  createSubCategory,
  deleteCategory,
  deleteSubCategory,
  getAllCategories,
  getSubcategoriesByCategoryId,
  updateCategory,
  updateSubCategory,
} from '../../../services/menuService';
import { queryKeys } from '../../../lib/queryClient';

const ManageCategoriesDialog = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null); // { id, value }
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [confirmState, setConfirmState] = useState(null); // { entity, id, name }
  const [snackbar, setSnackbar] = useState(null);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.menu.categories(),
    queryFn: getAllCategories,
    enabled: open,
  });

  const categories = useMemo(
    () => (Array.isArray(categoriesQuery.data) ? categoriesQuery.data : []),
    [categoriesQuery.data],
  );
  const isCategoriesLoading = categoriesQuery.isLoading || categoriesQuery.isFetching;

  const selectedCategory = useMemo(
    () => categories.find((cat) => String(cat.id_categoria) === String(selectedCategoryId)),
    [categories, selectedCategoryId],
  );
  const selectedCategoryKey = selectedCategory?.id_categoria ?? null;

  const {
    data: subcategoriesData = [],
    isLoading: isSubcategoriesLoading,
    isFetching: isSubcategoriesFetching,
    refetch: refetchSubcategories,
  } = useQuery({
    queryKey: ['subcategories', selectedCategoryKey],
    queryFn: () => getSubcategoriesByCategoryId(selectedCategoryKey),
    enabled: open && Boolean(selectedCategoryKey),
  });

  const subcategories = useMemo(() => {
    if (Array.isArray(subcategoriesData)) return subcategoriesData;
    if (subcategoriesData && typeof subcategoriesData === 'object') {
      return Object.values(subcategoriesData);
    }
    return [];
  }, [subcategoriesData]);

  const isSubcategoriesBusy =
    isSubcategoriesLoading || (isSubcategoriesFetching && !subcategories.length);

  useEffect(() => {
    if (!open) {
      setSelectedCategoryId('');
      setNewCategoryName('');
      setNewSubcategoryName('');
      setEditingCategory(null);
      setEditingSubcategory(null);
      return;
    }

    if (!selectedCategoryId && categories.length) {
      setSelectedCategoryId(String(categories[0].id_categoria));
    }
  }, [open, categories, selectedCategoryId]);

  useEffect(() => {
    if (open && selectedCategoryKey) {
      refetchSubcategories();
    }
  }, [open, selectedCategoryKey, refetchSubcategories]);

  const invalidateCategories = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.menu.categories() });

  const showSnackbar = (message, severity = 'success') => setSnackbar({ message, severity });

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => createCategory(payload),
    onSuccess: () => {
      invalidateCategories();
      setNewCategoryName('');
      showSnackbar('Categoria creada correctamente.');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }) => updateCategory(id, { name }),
    onSuccess: () => {
      invalidateCategories();
      setEditingCategory(null);
      showSnackbar('Categoria actualizada.');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: (_, id) => {
      invalidateCategories();
      if (String(selectedCategoryId) === String(id)) {
        setSelectedCategoryId('');
      }
      showSnackbar('Categoria eliminada.');
    },
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: (payload) => createSubCategory(payload),
    onSuccess: () => {
      refetchSubcategories();
      setNewSubcategoryName('');
      showSnackbar('Subcategoria creada.');
    },
  });

  const updateSubcategoryMutation = useMutation({
    mutationFn: ({ id, name }) => updateSubCategory(id, { name }),
    onSuccess: () => {
      refetchSubcategories();
      setEditingSubcategory(null);
      showSnackbar('Subcategoria actualizada.');
    },
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: (id) => deleteSubCategory(id),
    onSuccess: () => {
      refetchSubcategories();
      showSnackbar('Subcategoria eliminada.');
    },
  });

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategoryMutation.mutate({ nombre: newCategoryName.trim() });
  };

  const handleAddSubcategory = () => {
    if (!selectedCategoryId || !newSubcategoryName.trim()) return;
    createSubcategoryMutation.mutate({
      id_category: Number(selectedCategoryId),
      name: newSubcategoryName.trim(),
    });
  };

  const handleCategoryRenameSubmit = () => {
    if (!editingCategory) return;
    const trimmed = editingCategory.value.trim();
    if (!trimmed || trimmed === editingCategory.original) {
      setEditingCategory(null);
      return;
    }
    updateCategoryMutation.mutate({
      id: editingCategory.id,
      name: trimmed,
    });
  };

  const handleSubcategoryRenameSubmit = () => {
    if (!editingSubcategory) return;
    const trimmed = editingSubcategory.value.trim();
    if (!trimmed || trimmed === editingSubcategory.original) {
      setEditingSubcategory(null);
      return;
    }
    updateSubcategoryMutation.mutate({
      id: editingSubcategory.id,
      name: trimmed,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmState) return;
    try {
      if (confirmState.entity === 'category') {
        await deleteCategoryMutation.mutateAsync(confirmState.id);
      } else if (confirmState.entity === 'subcategory') {
        await deleteSubcategoryMutation.mutateAsync(confirmState.id);
      }
    } finally {
      setConfirmState(null);
    }
  };

  const renderListSkeleton = () =>
    Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={`skeleton-${index}`} variant="rounded" height={48} />
    ));

  const renderCategoryRow = (category) => {
    const isSelected = String(selectedCategoryId) === String(category.id_categoria);
    const isEditing = editingCategory?.id === category.id_categoria;

    return (
      <Box
        key={category.id_categoria}
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 1.5,
          border: (theme) =>
            `1px solid ${
              isSelected ? theme.palette.warning.main : theme.palette.divider
            }`,
          backgroundColor: (theme) =>
            isSelected
              ? theme.palette.action.selected
              : theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
        onClick={() => setSelectedCategoryId(String(category.id_categoria))}
      >
        {isEditing ? (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <TextField
              size="small"
              value={editingCategory.value}
              onChange={(e) =>
                setEditingCategory((prev) => ({ ...prev, value: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCategoryRenameSubmit();
                }
                if (e.key === 'Escape') setEditingCategory(null);
              }}
              autoFocus
              fullWidth
            />
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                handleCategoryRenameSubmit();
              }}
              disabled={!editingCategory.value.trim()}
            >
              Guardar
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                setEditingCategory(null);
              }}
            >
              Cancelar
            </Button>
          </Stack>
        ) : (
          <Typography
            variant="body1"
            sx={{ flex: 1, fontWeight: isSelected ? 600 : 500 }}
          >
            {category.nombre}
          </Typography>
        )}

        {!isEditing && (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCategory({
                    id: category.id_categoria,
                    value: category.nombre,
                    original: category.nombre,
                  });
                }}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmState({
                    entity: 'category',
                    id: category.id_categoria,
                    name: category.nombre,
                  });
                }}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>
    );
  };

  const renderSubcategoryRow = (sub) => {
    const isEditing = editingSubcategory?.id === sub.id_subcategoria;

    return (
      <Box
        key={sub.id_subcategoria}
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 1.5,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {isEditing ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
            <TextField
              size="small"
              value={editingSubcategory.value}
              onChange={(e) =>
                setEditingSubcategory((prev) => ({ ...prev, value: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubcategoryRenameSubmit();
                }
                if (e.key === 'Escape') setEditingSubcategory(null);
              }}
              autoFocus
              fullWidth
            />
            <Button
              size="small"
              variant="contained"
              onClick={handleSubcategoryRenameSubmit}
              disabled={!editingSubcategory.value.trim()}
            >
              Guardar
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setEditingSubcategory(null)}
            >
              Cancelar
            </Button>
          </Stack>
        ) : (
          <Typography variant="body1" sx={{ flex: 1 }}>
            {sub.nombre}
          </Typography>
        )}
        {!isEditing && (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={() =>
                  setEditingSubcategory({
                    id: sub.id_subcategoria,
                    value: sub.nombre,
                    original: sub.nombre,
                  })
                }
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                onClick={() =>
                  setConfirmState({
                    entity: 'subcategory',
                    id: sub.id_subcategoria,
                    name: sub.nombre,
                  })
                }
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle sx={{ fontWeight: 600 }}>Administrar categorías y subcategorías</DialogTitle>
        <DialogContent dividers>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems="stretch"
          >
            <Box sx={{ flex: 1, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, p: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Categorías
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    label="Nueva categoria"
                    size="small"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    fullWidth
                  />
                  <Tooltip title="Crear categoria">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={handleAddCategory}
                        disabled={
                          !newCategoryName.trim() || createCategoryMutation.isPending
                        }
                        sx={{
                          border: (theme) => `1px solid ${theme.palette.primary.main}`,
                          borderRadius: 2,
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <Divider />

                <Stack spacing={1} sx={{ maxHeight: 360, overflowY: 'auto' }}>
                  {isCategoriesLoading
                    ? renderListSkeleton()
                    : categories.length
                    ? categories.map(renderCategoryRow)
                    : (
                      <Typography variant="body2" color="text.secondary">
                        No hay categorías registradas.
                      </Typography>
                    )}
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, p: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Subcategorías {selectedCategoryId ? '' : '(selecciona una categoria)'}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    label="Nueva subcategoria"
                    size="small"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    fullWidth
                    disabled={!selectedCategoryId}
                  />
                  <Tooltip title="Crear subcategoria">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={handleAddSubcategory}
                        disabled={
                          !selectedCategoryId ||
                          !newSubcategoryName.trim() ||
                          createSubcategoryMutation.isPending
                        }
                        sx={{
                          border: (theme) => `1px solid ${theme.palette.primary.main}`,
                          borderRadius: 2,
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <Divider />
                <Stack spacing={1} sx={{ minHeight: 120, maxHeight: 360, overflowY: 'auto' }}>
                  {isSubcategoriesBusy ? (
                    renderListSkeleton()
                  ) : !selectedCategoryId ? (
                    <Typography variant="body2" color="text.secondary">
                      Selecciona una categoría para ver sus subcategorias.
                    </Typography>
                  ) : subcategories.length ? (
                    subcategories.map(renderSubcategoryRow)
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No subcategorías registradas.
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', px: 3 }}>
          <Button onClick={onClose} color="primary" variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmState)} onClose={() => setConfirmState(null)}>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {confirmState?.entity === 'category'
            ? 'Eliminar categoria'
            : 'Eliminar subcategoria'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmState?.entity === 'category'
              ? `Eliminar la categoria "${confirmState?.name}" tambien removera todas sus subcategorias.`
              : `Estas seguro de eliminar la subcategoria "${confirmState?.name}"?`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={() => setConfirmState(null)}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.severity ?? 'success'} onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ManageCategoriesDialog;
