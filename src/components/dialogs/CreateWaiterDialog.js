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
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    FormHelperText,
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
        boxShadow: 'none',
        backgroundColor: 'black',
    },
    '& .MuiDialogTitle-root': {
        backgroundColor: 'black',
        color: '#DD98AD',
        fontWeight: 'bold',
        borderRadius: '20px 20px 0px 0px',
        textAlign: 'center',
    },
    '& .MuiDialogContent-root': {
        backgroundColor: 'rgb(155, 140, 141)',
        color: 'black',
    },
}));

const CustomButton = styled(Button)(({ theme }) => ({
    color: '#DD98AD',
    borderColor: 'rgb(155, 140, 141)',
    '&:hover': {
        backgroundColor: 'grey',
        borderColor: 'grey',
    },
}));

const CustomFormControl = styled(FormControl)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'black',
        },
        '&:hover fieldset': {
            borderColor: 'grey',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#DD98AD',
        },
    },
    '& .MuiInputLabel-root': {
        color: 'black',
    },
    '& .MuiFormHelperText-root': {
        color: 'red',
    },
}));

const CreateWaiterDialog = ({ open, onClose }) => {
    const [nombre, setNombre] = useState('');
    const [turno, setTurno] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [error, setError] = useState(false);

    const handleSubmit = async () => {
        if (!turno) {
            setError(true);
            return;
        }

        try {
            const { message } = await createWaiter(nombre, turno);
            setSnackbarMessage(message);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            onClose();
            setNombre('');
            setTurno('');
            setError(false);
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
                        InputLabelProps={{
                            style: { color: 'black' },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'black' },
                                '&:hover fieldset': { borderColor: 'grey' },
                                '&.Mui-focused fieldset': { borderColor: '#DD98AD' },
                            },
                        }}
                    />
                    <CustomFormControl fullWidth margin="dense" variant="outlined" error={error}>
                        <InputLabel id="turno-select-label">Turno</InputLabel>
                        <Select
                            labelId="turno-select-label"
                            value={turno}
                            onChange={(e) => {
                                setTurno(e.target.value);
                                setError(false);
                            }}
                        >
                            <MenuItem value="Mañana">Mañana</MenuItem>
                            <MenuItem value="Tarde">Tarde</MenuItem>
                            <MenuItem value="Noche">Noche</MenuItem>
                        </Select>
                        {error && <FormHelperText>Seleccionar un turno es obligatorio</FormHelperText>}
                    </CustomFormControl>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
                    <CustomButton onClick={onClose} variant="outlined">
                        Cancelar
                    </CustomButton>
                    <CustomButton onClick={handleSubmit} variant="outlined">
                        Crear
                    </CustomButton>
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
