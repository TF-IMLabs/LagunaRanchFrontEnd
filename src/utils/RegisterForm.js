import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const RegisterForm = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    nombre: "",
    telefono: "",
    password: "",
    direccion: "",
    fecha_nac: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";

    if (!formData.telefono) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (!/^\d+$/.test(formData.telefono)) {
      newErrors.telefono = "Solo se permiten números";
    }

    // Validación nueva para contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "La contraseña debe incluir letras y números";
    }

    if (!formData.direccion) newErrors.direccion = "La dirección es obligatoria";

    if (!formData.fecha_nac) newErrors.fecha_nac = "La fecha de nacimiento es obligatoria";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "", // limpia el error al modificar el campo
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!validate()) return; // <--- Se valida antes de enviar, si hay errores no sigue

    setLoading(true);
    try {
      await register(formData);
      await login({ email: formData.email, password: formData.password });
      setSuccess("Usuario registrado y autenticado correctamente.");
      setTimeout(() => {
        onClose();
        navigate("/menu");
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.error || "Error al registrarse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
        Crear cuenta
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
          aria-label="cerrar"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
          <Stack spacing={2}>
            <TextField
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              name="nombre"
              label="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
              error={!!errors.nombre}
              helperText={errors.nombre}
            />
            <TextField
              name="telefono"
              label="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
              fullWidth
              error={!!errors.telefono}
              helperText={errors.telefono}
            />
            <TextField
              name="password"
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              name="direccion"
              label="Dirección"
              value={formData.direccion}
              onChange={handleChange}
              fullWidth
              error={!!errors.direccion}
              helperText={errors.direccion}
            />
            <TextField
              name="fecha_nac"
              label="Fecha de nacimiento"
              type="date"
              value={formData.fecha_nac}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              error={!!errors.fecha_nac}
              helperText={errors.fecha_nac}
            />

            {error && (
              <Typography variant="body2" color="error" align="center">
                {error}
              </Typography>
            )}
            {success && (
              <Typography variant="body2" color="primary" align="center">
                {success}
              </Typography>
            )}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", mb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained">
          {loading ? <CircularProgress size={24} /> : "Registrarse"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterForm;
