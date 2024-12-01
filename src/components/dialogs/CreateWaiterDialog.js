import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Snackbar,
    Alert,
} from '@mui/material';
import { styled } from '@mui/system';
import { createWaiter } from '../../services/waiterService';

// Estilos personalizados
const CustomDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-container': {
        backdropFilter: 'blur(10px)',
    },
    '& .MuiPaper-root': {
        borderRadius: '20px',
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)',
        backgroundColor: 'black',
    },
    '& .MuiDialogTitle-root': {
        backgroundColor: 'black',
        color: '#DD98AD',
        fontWeight: 'bold',
        borderRadius: '20px 20px 0px 0px',
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)',
        textAlign: 'center', // Centramos el título
    },
    '& .MuiDialogContent-root': {
        backgroundColor: '#9b8c8d',
        color: 'black',
    },
}));

const CustomButton = styled(Button)(({ theme }) => ({
    color: '#DD98AD',
    borderColor: 'white',
    '&:hover': {
        backgroundColor: 'grey',
        borderColor: 'grey',
    },
}));

const CreateWaiterDialog = ({ open, onClose }) => {
    const [nombre, setNombre] = useState('');
    const [turno, setTurno] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleSubmit = async () => {
        try {
            const { message } = await createWaiter(nombre, turno);
            setSnackbarMessage(message);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            onClose();
            setNombre('');
            setTurno('');
        } catch (error) {
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <>
            <CustomDialog open={open} onClose={onClose}>
                <DialogTitle>Crear Nuevo Mozo</DialogTitle>
                <DialogContent>
                <TextField
    autoFocus
    margin="dense"
    label="Nombre"
    type="text"
    fullWidth
    variant="outlined"
    value={nombre}
    onChange={(e) => setNombre(e.target.value)}
    InputProps={{
        style: {
            color: 'black',
            borderRadius: '8px',
        },
    }}
    InputLabelProps={{
        style: {
            color: 'black', // Color del label
        },
    }}
    sx={{
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'black', // Color del borde por defecto
            },
            '&:hover fieldset': {
                borderColor: 'black', // Color del borde al pasar el mouse
            },
            '&.Mui-focused fieldset': {
                borderColor: '#DD98AD', // Color del borde al enfocar
            },
        },
    }}
/>
<TextField
    margin="dense"
    label="Turno"
    type="text"
    fullWidth
    variant="outlined"
    value={turno}
    onChange={(e) => setTurno(e.target.value)}
    InputProps={{
        style: {
            color: 'black',
            borderRadius: '8px',
        },
    }}
    InputLabelProps={{
        style: {
            color: 'black', // Color del label
        },
    }}
    sx={{
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'black', // Color del borde por defecto
            },
            '&:hover fieldset': {
                borderColor: 'black', // Color del borde al pasar el mouse
            },
            '&.Mui-focused fieldset': {
                borderColor: '#DD98AD', // Color del borde al enfocar
            },
        },
    }}
/>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
                    <CustomButton onClick={onClose}>Cancelar</CustomButton>
                    <CustomButton onClick={handleSubmit}>Crear</CustomButton>
                </DialogActions>
            </CustomDialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{
                        width: '100%',
                        backgroundColor: snackbarSeverity === 'success' ? '#DD98AD' : 'red',
                        color: 'black',
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default CreateWaiterDialog;
