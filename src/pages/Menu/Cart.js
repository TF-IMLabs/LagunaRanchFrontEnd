import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateTableNote } from '../../services/tableService';
import { VIRTUAL_TABLE } from '../../hooks/useOrderSubmit';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import ConfirmOrderDialog from './ConfirmOrderDialog';
import AddAddressDialog from '../../components/dialogs/AddAddressDialog';

const Cart = ({ onClose }) => {
  const { tableId, orderType, tableValidation, isAuthenticated } =
    useAuth();
  const {
    cart,
    updateItemQuantity,
    removeItem,
    sendOrder,
    addresses,
    addressesLoading,
    deliveryAddressId,
    setDeliveryAddressId,
    pickupTime,
    setPickupTime,
    selectedAddress,
    setOrderType: updateOrderType,
    venueIsOpen,
    canUseTableOrders,
    refreshAddresses,
  } = useCart();
  const [note, setNote] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const hasTableAssigned = Boolean(tableId);
  const showBasicAuthPrompt = !isAuthenticated && !hasTableAssigned;

  const showDineInTab = hasTableAssigned;
  const showDeliveryTab = isAuthenticated;
  const showTakeawayTab = isAuthenticated;

  const availableModes = useMemo(() => {
    if (showDineInTab) {
      return ['dine-in'];
    }
    const modes = [];
    if (showDeliveryTab) modes.push('delivery');
    if (showTakeawayTab) modes.push('takeaway');
    return modes;
  }, [showDeliveryTab, showDineInTab, showTakeawayTab]);

  useEffect(() => {
    if (!availableModes.length) return;
    if (!availableModes.includes(orderType)) {
      updateOrderType(availableModes[0]);
    }
  }, [availableModes, orderType, updateOrderType]);

  const dineInEnabled = showDineInTab && venueIsOpen && canUseTableOrders;
  const deliveryEnabled =
    showDeliveryTab && venueIsOpen && addresses.length > 0 && !hasTableAssigned;
  const takeawayEnabled =
    showTakeawayTab && venueIsOpen && !hasTableAssigned;

  const dineInReason = !venueIsOpen
    ? 'Disponible solo cuando el local esta abierto.'
    : !canUseTableOrders
    ? 'Disponible solo con QR valido y local abierto.'
    : '';
  const deliveryReason = !venueIsOpen
    ? 'Disponible solo cuando el local esta abierto.'
    : !isAuthenticated
    ? 'Inicia sesion para usar delivery.'
    : addresses.length === 0
    ? 'Agrega una direccion para poder enviar el pedido.'
    : '';
  const takeawayReason = !venueIsOpen
    ? 'Disponible solo cuando el local esta abierto.'
    : !isAuthenticated
    ? 'Inicia sesion para usar take away.'
    : '';

  const tableUnavailable =
    orderType === 'dine-in' && tableValidation?.state !== 'valid';
  const missingTable = orderType === 'dine-in' && !tableId;
  const missingDeliveryAddress =
    orderType === 'delivery' && !selectedAddress;
  const missingPickupTime = orderType === 'takeaway' && !pickupTime;
  const mustLogin = !isAuthenticated && orderType !== 'dine-in';
  const isSendDisabled =
    cart.length === 0 ||
    isSubmitting ||
    mustLogin ||
    !venueIsOpen ||
    missingTable ||
    missingDeliveryAddress ||
    missingPickupTime;

  const handleAuthPrompt = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('auth:open'));
  };

  if (showBasicAuthPrompt) {
    return (
      <Box
        sx={{
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Para realizar un pedido necesitás iniciar sesión o crear una cuenta.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleAuthPrompt}
          sx={{ alignSelf: 'center', minWidth: 260 }}
        >
          Iniciar sesión / Crear cuenta
        </Button>
      </Box>
    );
  }

  const handleModeChange = (_event, nextMode) => {
    if (!nextMode || nextMode === orderType) {
      return;
    }

    const meta =
      {
        'dine-in': { enabled: dineInEnabled, reason: dineInReason },
        delivery: { enabled: deliveryEnabled, reason: deliveryReason },
        takeaway: { enabled: takeawayEnabled, reason: takeawayReason },
      }[nextMode] || {};

    if (!meta.enabled) {
      if (meta.reason) {
        setFeedback({ severity: 'info', message: meta.reason });
      }
      return;
    }

    updateOrderType(nextMode);
  };

  const handleAddressCreated = async (newAddressId) => {
    setDeliveryAddressId(newAddressId);
    await refreshAddresses(newAddressId);
    setAddressDialogOpen(false);
  };

  const renderAddressLabel = (address) => {
    if (!address) return 'Sin dirección';
    if (address.alias && address.direccion) {
      return `${address.alias} - ${address.direccion}`;
    }
    return address.direccion ?? 'Dirección sin nombre';
  };

  const handleSendOrder = async () => {
    if (!venueIsOpen) {
      setFeedback({
        severity: 'warning',
        message: 'El restaurante esta cerrado. Solo podes revisar el menú por ahora.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const noteSections = [];
      if (orderType === 'delivery' && selectedAddress) {
        const direccion = selectedAddress.alias
          ? `${selectedAddress.alias} - ${selectedAddress.direccion}`
          : selectedAddress.direccion ?? '';
        noteSections.push(`Delivery a: ${direccion}`);
      }
      if (orderType === 'takeaway' && pickupTime) {
        noteSections.push(`Retiro estimado: ${pickupTime}`);
      }
      if (note.trim()) {
        noteSections.push(`Nota: ${note.trim()}`);
      }

      const targetTableId =
        orderType === 'dine-in'
          ? tableId
          : VIRTUAL_TABLE[orderType] ?? null;

      if (targetTableId && noteSections.length > 0) {
        await updateTableNote(targetTableId, noteSections.join(' | '));
      }

      await sendOrder();
      onClose();
    } catch (error) {
      console.error('Error al enviar el pedido:', error);
      setFeedback({
        severity: 'error',
        message: 'Ocurrio un error al enviar tu pedido. Intenta nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseFeedback = (_event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback(null);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {!venueIsOpen && (
        <Alert severity="warning">
          El restaurante está cerrado. Podes explorar el menú pero no realizar pedidos.
        </Alert>
      )}
      {orderType === 'dine-in' && tableUnavailable && (
        <Alert severity="warning">
          La mesa detectada ya no esta habilitada para nuevos pedidos. Consulta al mozo o inicia sesión para otra modalidad.
        </Alert>
      )}
      {mustLogin && orderType !== 'dine-in' && (
        <Alert severity="info">Inicia sesión para usar delivery o take away.</Alert>
      )}

      {!hasTableAssigned && (
        <Box
          sx={{
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 2,
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Modo de pedido
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={orderType}
            onChange={handleModeChange}
          >
            {showDineInTab && (
              <ToggleButton value="dine-in" disabled={!dineInEnabled}>
                En el local
              </ToggleButton>
            )}
            {showDeliveryTab && (
              <ToggleButton value="delivery" disabled={!deliveryEnabled}>
                Delivery
              </ToggleButton>
            )}
            {showTakeawayTab && (
              <ToggleButton value="takeaway" disabled={!takeawayEnabled}>
                Take away
              </ToggleButton>
            )}
          </ToggleButtonGroup>

          <Stack spacing={0.5} mt={1}>
            {showDineInTab && !dineInEnabled && (
              <Typography variant="caption" color="text.secondary">
                En el local: {dineInReason}
              </Typography>
            )}
            {showDeliveryTab && !deliveryEnabled && (
              <Typography variant="caption" color="text.secondary">
                Delivery: {deliveryReason}
              </Typography>
            )}
            {showTakeawayTab && !takeawayEnabled && (
              <Typography variant="caption" color="text.secondary">
                Take away: {takeawayReason}
              </Typography>
            )}
          </Stack>

          {orderType === 'delivery' && (
            <Box mt={2} display="flex" flexDirection="column" gap={1}>
              {addressesLoading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Cargando direcciones...
                  </Typography>
                </Box>
              ) : addresses.length ? (
                <FormControl fullWidth size="small">
                  <InputLabel id="delivery-address-label">Dirección de entrega</InputLabel>
                  <Select
                    labelId="delivery-address-label"
                    value={deliveryAddressId ?? ''}
                    label="Direccion de entrega"
                    onChange={(event) => setDeliveryAddressId(event.target.value)}
                  >
                    {addresses.map((address) => (
                      <MenuItem
                        key={address.id_direccion ?? address.id}
                        value={address.id_direccion ?? address.id}
                      >
                        {renderAddressLabel(address)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Alert severity="info">
                  Todavía no cargaste direcciones. Agrega una para poder usar delivery.
                </Alert>
              )}

              <Button
                variant="text"
                size="small"
                onClick={() => setAddressDialogOpen(true)}
                sx={{ alignSelf: 'flex-start' }}
              >
                Agregar dirección
              </Button>
            </Box>
          )}

          {orderType === 'takeaway' && (
            <TextField
              label="Hora estimada de retiro"
              type="time"
              value={pickupTime}
              onChange={(event) => setPickupTime(event.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      )}

      {orderType === 'delivery' && !addressesLoading && missingDeliveryAddress && (
        <Alert severity="info">
          Selecciona o crea una dirección para continuar con el pedido a domicilio.
        </Alert>
      )}
      {orderType === 'takeaway' && missingPickupTime && (
        <Alert severity="info">
          Elegí un horario estimado de retiro para confirmar tu pedido.
        </Alert>
      )}
      {missingTable && (
        <Alert severity="info">
          Escanea el QR de tu mesa para poder pedir en el local.
        </Alert>
      )}

      {cart.length === 0 ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="outlined"
            onClick={() => {
              onClose();
              navigate('/menu');
            }}
            fullWidth
            sx={{ maxWidth: 320 }}
          >
            Suma productos
          </Button>
        </Box>
      ) : (
        <>
          {cart.map(({ product, cantidad }) => (
            <Box
              key={product.id_producto}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                boxShadow: '0 6px 16px rgba(0,0,0,0.28)',
              }}
            >
              <Typography variant="h6" component="h3" translate="no">
                {product.nombre}
              </Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
                mt={1.5}
              >
                <Typography variant="body1">
                  {`$${product.precio}`} x {cantidad}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Tooltip title={`Disminuir cantidad de ${product.nombre}`}>
                    <span>
                      <IconButton
                        onClick={() => updateItemQuantity(product.id_producto, cantidad - 1)}
                        disabled={cantidad <= 1}
                        aria-label={`Disminuir cantidad de ${product.nombre}`}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Typography variant="body1" component="span" aria-live="polite">
                    {cantidad}
                  </Typography>
                  <Tooltip title={`Aumentar cantidad de ${product.nombre}`}>
                    <span>
                      <IconButton
                        onClick={() => updateItemQuantity(product.id_producto, cantidad + 1)}
                        disabled={cantidad >= 10}
                        aria-label={`Aumentar cantidad de ${product.nombre}`}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={`Quitar ${product.nombre}`}>
                    <IconButton
                      onClick={() => removeItem(product.id_producto)}
                      aria-label={`Quitar ${product.nombre} del pedido`}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}

          <TextField
            label="Nota del pedido"
            variant="outlined"
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            margin="normal"
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: theme.palette.primary.main },
                '&:hover fieldset': { borderColor: theme.palette.primary.light },
                '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: theme.palette.text.primary,
              },
            }}
          />

          <Box
            mt={2}
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={2}
            justifyContent="space-between"
          >
            <Button
              variant="outlined"
              onClick={() => {
                onClose();
                navigate('/menu');
              }}
              fullWidth
            >
              Seguir pidiendo
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenDialog(true)}
              disabled={isSendDisabled}
              fullWidth
            >
              Enviar pedido
            </Button>
          </Box>

          <ConfirmOrderDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            onSendOrder={handleSendOrder}
            cart={cart}
            note={note}
            isSubmitting={isSubmitting}
          />
        </>
      )}

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback?.severity ?? 'info'}
          variant="filled"
          elevation={6}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>

      <AddAddressDialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        onSuccess={handleAddressCreated}
      />
    </Box>
  );
};

Cart.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Cart;
