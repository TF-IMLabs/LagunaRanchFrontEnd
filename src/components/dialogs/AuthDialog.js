import React, { useState, useContext, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Slide,
} from "@mui/material";
import { styled } from "@mui/system";
import AuthContext from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

// Transición personalizada
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

// Estilos personalizados
const CustomDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-container": {
    backdropFilter: "blur(10px)", // Añadir desenfoque de fondo
  },
  "& .MuiPaper-root": {
    borderRadius: "20px", // Bordes redondeados
    boxShadow: "none", // Eliminar sombra para evitar el borde visible
    backgroundColor: "rgba(0, 0, 0, 0.9)", // Fondo uniforme para todo el diálogo
  },
  "& .MuiDialogTitle-root": {
    color: "#DD98AD", // Cambiar color de fuente a blanco
    textAlign: "center", // Centrar el texto del título
    borderTopLeftRadius: "20px", // Bordes redondeados
    borderTopRightRadius: "20px", // Bordes redondeados
  },
  "& .MuiDialogContent-root": {
    backgroundColor: "rgb(155, 140, 141)", // Hacer coincidir el color de fondo del contenido
    color: "#DD98AD", // Cambiar color de fuente a blanco
    textAlign: "center", // Centrar el texto del contenido
  },
  "& .MuiDialogActions-root": {
    justifyContent: "center", // Centrar los botones en el diálogo
    //
    borderBottomLeftRadius: "20px", // Bordes redondeados
    borderBottomRightRadius: "20px", // Bordes redondeados
  },
}));

const CustomButton = styled(Button)(({ theme }) => ({
  color: "#DD98AD", // Cambiar color de fuente a blanco
  borderColor: "rgb(155, 140, 141)", // Cambiar color de borde a blanco
  "&:hover": {
    backgroundColor: "black",
    borderColor: "black", // Borde blanco en estado hover
  },
}));

const AuthDialog = ({ open, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginAsAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  // Efecto para manejar el foco al abrir el diálogo
  useEffect(() => {
    if (open) {
      const dialogElement = document.querySelector('[role="dialog"]');
      if (dialogElement) {
        dialogElement.focus();
      }
    }
  }, [open]);

  const handleLogin = () => {
    if (loginAsAdmin(username, password)) {
      navigate("/admin"); // Redirige a la página de administración
      onClose();
    } else {
      alert("Credenciales incorrectas");
    }
  };

  const handleClose = () => {
    onClose(); // Cierra el diálogo
    navigate("/"); // Redirige a la página de inicio
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClose} // Redirige al cerrar el diálogo
      fullWidth
      maxWidth="sm"
      aria-labelledby="auth-dialog-title" // Etiqueta aria para accesibilidad
      TransitionComponent={Transition} // Añadir la transición
    >
      <DialogTitle id="auth-dialog-title">
        Iniciar Sesión
        <IconButton
          onClick={handleClose} // Redirige a la página de inicio al hacer clic en la "X"
          sx={{ position: "absolute", right: 8, top: 8 }}
          aria-label="cerrar"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Usuario"
          type="text"
          fullWidth
          variant="standard"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{
            "& .MuiInputBase-root": {
              backgroundColor: "transparent", // Fondo transparente
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "black", // Borde inferior negro en estado normal
            },
            "& .MuiInput-underline:hover:before": {
              borderBottomColor: "black", // Borde inferior negro al pasar el cursor
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "black", // Borde inferior negro al hacer focus
            },
            "& .MuiInputLabel-root": {
              color: "black", // Label en negro
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "black", // Label negro al hacer focus
            },
          }}
        />
        <TextField
          margin="dense"
          label="Contraseña"
          type="password"
          fullWidth
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            "& .MuiInputBase-root": {
              backgroundColor: "transparent", // Fondo transparente
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "black", // Borde inferior negro en estado normal
            },
            "& .MuiInput-underline:hover:before": {
              borderBottomColor: "black", // Borde inferior negro al pasar el cursor
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "black", // Borde inferior negro al hacer focus
            },
            "& .MuiInputLabel-root": {
              color: "black", // Label en negro
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "black", // Label negro al hacer focus
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <CustomButton onClick={handleClose} variant="outlined" color="error">
          Cancelar
        </CustomButton>
        <CustomButton onClick={handleLogin} variant="outlined" color="primary">
          Iniciar Sesión
        </CustomButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default AuthDialog;
