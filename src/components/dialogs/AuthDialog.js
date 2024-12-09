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
  useMediaQuery,
  useTheme,
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
    overflow: "visible", // Permitir crecimiento dinámico del diálogo
  },
  "& .MuiPaper-root": {
    borderRadius: "20px",
    boxShadow: "none",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    overflow: "visible", // Evitar scroll interno
  },
  "& .MuiDialogTitle-root": {
    color: "#DD98AD",
    textAlign: "center",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
  },
  "& .MuiDialogContent-root": {
    backgroundColor: "rgb(155, 140, 141)",
    color: "#DD98AD",
    textAlign: "center",
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    justifyContent: "center",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
  },
}));

const CustomButton = styled(Button)(({ theme }) => ({
  color: "#DD98AD",
  borderColor: "rgb(155, 140, 141)",
  "&:hover": {
    backgroundColor: "black",
    borderColor: "black",
  },
}));

const AuthDialog = ({ open, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginAsAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    onClose();
    navigate("/");
  };

  return (
    <CustomDialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile} // Pantalla completa en dispositivos móviles
      aria-labelledby="auth-dialog-title"
      TransitionComponent={Transition}
    >
      <DialogTitle id="auth-dialog-title">
        Iniciar Sesión
        <IconButton
          onClick={handleClose}
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
              backgroundColor: "transparent",
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "black",
            },
            "& .MuiInput-underline:hover:before": {
              borderBottomColor: "black",
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "black",
            },
            "& .MuiInputLabel-root": {
              color: "black",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "black",
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
              backgroundColor: "transparent",
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "black",
            },
            "& .MuiInput-underline:hover:before": {
              borderBottomColor: "black",
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "black",
            },
            "& .MuiInputLabel-root": {
              color: "black",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "black",
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
