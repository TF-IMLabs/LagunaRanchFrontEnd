import React, { useEffect, useMemo, useState } from 'react';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { tableService } from '../../../../services/tableService';
import { waiterService, getAllWaiters } from '../../../../services/waiterService';
import { queryKeys } from '../../../../lib/queryClient';

const defaultForm = { capacidad: '', id_mozo: '' };

const ManageTablesDialog = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const waiterOptions = useMemo(
    () => waiters.map((waiter) => ({ value: waiter.id_mozo, label: waiter.nombre })),
    [waiters],
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tablesResponse, waitersResponse] = await Promise.all([
        tableService.getAll(),
        waiterService.getAll?.() ?? getAllWaiters(),
      ]);
      setTables(Array.isArray(tablesResponse) ? tablesResponse : tablesResponse?.data ?? []);
      setWaiters(Array.isArray(waitersResponse) ? waitersResponse : waitersResponse?.data ?? []);
    } catch (error) {
      console.error('Error al cargar las mesas o mozos:', error);
      setSnackbar({ severity: 'error', message: 'No se pudieron cargar los datos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchData();
  }, [open]);

  const handleCloseSnackbar = () => setSnackbar(null);

  const handleInputChange = ({ target: { name, value } }) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.capacidad) {
      errors.capacidad = 'La capacidad es requerida';
    }
    return errors;
  };

  const handleAddTable = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    try {
      setSubmitting(true);
      await tableService.create({
        capacidad: Number(formValues.capacidad),
        id_mozo: formValues.id_mozo || null,
      });
      setSnackbar({ severity: 'success', message: 'Mesa creada correctamente.' });
      setFormValues(defaultForm);
      await fetchData();
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all });
    } catch (error) {
      console.error('Error al crear la mesa:', error);
      setSnackbar({ severity: 'error', message: 'No se pudo crear la mesa.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!deleteTarget) return;
    try {
      setSubmitting(true);
      const targetId = deleteTarget?.id_mesa ?? deleteTarget?.n_mesa;
      if (!targetId) {
        setSnackbar({ severity: 'error', message: 'No se pudo determinar la mesa seleccionada.' });
        return;
      }
      await tableService.delete(targetId);
      setSnackbar({ severity: 'success', message: 'Mesa eliminada correctamente.' });
      setDeleteTarget(null);
      await fetchData();
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all });
    } catch (error) {
      console.error('Error al eliminar la mesa:', error);
      setSnackbar({ severity: 'error', message: 'No se pudo eliminar la mesa.' });
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
        aria-labelledby="manage-tables-title"
      >
        <DialogTitle
          id="manage-tables-title"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 1,
          }}
        >
          Administrar mesas
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
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
                <TextField
                  label="Capacidad"
                  name="capacidad"
                  type="number"
                  value={formValues.capacidad}
                  onChange={handleInputChange}
                  error={Boolean(formErrors.capacidad)}
                  helperText={formErrors.capacidad}
                />
                <FormControl fullWidth>
                  <InputLabel id="waiter-select-label">Mozo</InputLabel>
                  <Select
                    labelId="waiter-select-label"
                    label="Mozo"
                    name="id_mozo"
                    value={formValues.id_mozo}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">
                      <em>Sin asignar</em>
                    </MenuItem>
                    {waiterOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip title="Agregar mesa">
                  <span>
                    <Fab
                      color="primary"
                      onClick={handleAddTable}
                      disabled={submitting}
                      sx={{ alignSelf: 'center' }}
                    >
                      <AddIcon />
                    </Fab>
                  </span>
                </Tooltip>
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
                      <TableCell>Capacidad</TableCell>
                      <TableCell>Mozo</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tables.map((table) => {
                      const tableId = table.id_mesa ?? table.n_mesa;
                      return (
                        <TableRow key={tableId ?? Math.random()}>
                          <TableCell>{tableId}</TableCell>
                          <TableCell>{table.capacidad ?? '-'}</TableCell>
                          <TableCell>{table.nombre_mozo || 'Sin asignar'}</TableCell>
                          <TableCell>{table.estado || '—'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Eliminar mesa">
                            <span>
                              <IconButton
                                color="error"
                                disabled={submitting}
                                onClick={() => setDeleteTarget(table)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                        </TableRow>
                      );
                    })}
                    {!tables.length && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No hay mesas registradas.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', px: 3, py: 2 }}>
          <Button onClick={onClose} color="primary" variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>Eliminar mesa</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Estás seguro de que deseas eliminar la mesa {deleteTarget?.id_mesa ?? deleteTarget?.n_mesa}? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDeleteTable} variant="contained" color="error" disabled={submitting}>
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

ManageTablesDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ManageTablesDialog;
