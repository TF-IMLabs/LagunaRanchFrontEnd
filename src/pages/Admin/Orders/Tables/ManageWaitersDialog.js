import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Fab,
  TextField,
  Snackbar,
  Alert,
  Stack,
  Box,
  Button,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import {
  getAllWaiters,
  createWaiter,
  updateWaiter,
  deleteWaiter,
} from '../../../../services/waiterService';
import { queryKeys } from '../../../../lib/queryClient';

const shiftOptions = ['Mañana', 'Tarde', 'Noche'];

const defaultForm = { id_mozo: null, nombre: '', turno: '' };

const ManageWaitersDialog = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [waiters, setWaiters] = useState([]);
  const [snackbar, setSnackbar] = useState(null);
  const [formValues, setFormValues] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchWaiters = async () => {
    try {
      const response = await getAllWaiters();
      setWaiters(Array.isArray(response) ? response : response?.data ?? []);
    } catch (error) {
      console.error('Error al cargar los mozos:', error);
      setSnackbar({ severity: 'error', message: 'No se pudieron cargar los mozos.' });
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchWaiters();
  }, [open]);

  const handleCloseSnackbar = () => setSnackbar(null);

  const startCreate = () => {
    setEditMode(false);
    setFormValues(defaultForm);
    setFormErrors({});
  };

  const startEdit = (waiter) => {
    setEditMode(true);
    setFormValues({
      id_mozo: waiter.id_mozo,
      nombre: waiter.nombre,
      turno: waiter.turno,
    });
    setFormErrors({});
  };

  const handleInputChange = ({ target: { name, value } }) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.nombre?.trim()) errors.nombre = 'El nombre es requerido';
    if (!formValues.turno) errors.turno = 'El turno es requerido';
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    try {
      setSubmitting(true);
      if (editMode) {
        await updateWaiter(formValues.id_mozo, formValues.nombre.trim(), formValues.turno);
        setSnackbar({ severity: 'success', message: 'Mozo actualizado correctamente.' });
      } else {
        await createWaiter(formValues.nombre.trim(), formValues.turno);
        setSnackbar({ severity: 'success', message: 'Mozo creado correctamente.' });
      }
      setFormValues(defaultForm);
      setEditMode(false);
      await fetchWaiters();
      queryClient.invalidateQueries({ queryKey: queryKeys.waiters.all });
    } catch (error) {
      console.error('Error al guardar el mozo:', error);
      setSnackbar({ severity: 'error', message: 'No se pudo guardar el mozo.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      await deleteWaiter(deleteTarget.id_mozo);
      setSnackbar({ severity: 'success', message: 'Mozo eliminado correctamente.' });
      setDeleteTarget(null);
      await fetchWaiters();
      queryClient.invalidateQueries({ queryKey: queryKeys.waiters.all });
    } catch (error) {
      console.error('Error al eliminar el mozo:', error);
      setSnackbar({ severity: 'error', message: 'No se pudo eliminar el mozo.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="manage-waiters-title"
      >
        <DialogTitle
          id="manage-waiters-title"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 1,
          }}
        >
          Administrar mozos
          <IconButton aria-label="Cerrar" onClick={onClose} size="small" color="inherit">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
            <TextField
              label="Nombre"
              name="nombre"
              value={formValues.nombre}
              onChange={handleInputChange}
              error={Boolean(formErrors.nombre)}
              helperText={formErrors.nombre}
            />
            <TextField
              label="Turno"
              name="turno"
              value={formValues.turno}
              onChange={handleInputChange}
              select
              error={Boolean(formErrors.turno)}
              helperText={formErrors.turno}
            >
              {shiftOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <Tooltip title={editMode ? 'Actualizar mozo' : 'Agregar mozo'}>
              <span>
                <Fab
                  color="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{ alignSelf: 'center' }}
                >
                  {editMode ? <SaveIcon /> : <AddIcon />}
                </Fab>
              </span>
            </Tooltip>
            {editMode && (
              <Tooltip title="Cancelar edición">
                <IconButton color="inherit" onClick={startCreate}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          <Box
            sx={{
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              overflow: 'auto',
              maxHeight: 360,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Turno</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waiters.map((waiter) => (
                  <TableRow key={waiter.id_mozo}>
                    <TableCell>{waiter.id_mozo}</TableCell>
                    <TableCell>{waiter.nombre}</TableCell>
                    <TableCell>{waiter.turno}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar mozo">
                        <IconButton onClick={() => startEdit(waiter)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar mozo">
                        <IconButton onClick={() => setDeleteTarget(waiter)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!waiters.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No hay mozos registrados.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', px: 3, py: 2 }}>
          <Button onClick={onClose} color="primary" variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>Eliminar mozo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Estás seguro de que deseas eliminar a {deleteTarget?.nombre}? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={submitting}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.severity || 'info'} onClose={handleCloseSnackbar} variant="filled">
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

ManageWaitersDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ManageWaitersDialog;
