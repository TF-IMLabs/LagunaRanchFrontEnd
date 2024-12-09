import React, { useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    FormHelperText,
} from '@mui/material';
import { styled } from '@mui/system';
import { createTable } from '../../services/tableService';

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

const CustomTextField = styled(TextField)(({ theme }) => ({
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

const CreateTableDialog = ({ open, onClose, waiters = [] }) => {
    const [capacidad, setCapacidad] = useState('');
    const [id_mozo, setIdMozo] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = async () => {
        if (!id_mozo) {
            setError(true);
            return;
        }

        try {
            await createTable({ capacidad, id_mozo });
            onClose();
            setCapacidad('');
            setIdMozo('');
            setError(false);
        } catch (error) {
            console.error('Error al crear la mesa:', error);
        }
    };

    return (
        <CustomDialog open={open} onClose={onClose}>
            <DialogTitle>Crea una Nueva Mesa</DialogTitle>
            <DialogContent>
                <CustomTextField
                    autoFocus
                    margin="dense"
                    label="Capacidad"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={capacidad}
                    onChange={(e) => setCapacidad(e.target.value)}
                />
                <CustomFormControl fullWidth margin="dense" variant="outlined" error={error}>
                    <InputLabel id="mozo-select-label">Seleccionar Mozo</InputLabel>
                    <Select
                        labelId="mozo-select-label"
                        value={id_mozo}
                        onChange={(e) => {
                            setIdMozo(e.target.value);
                            setError(false);
                        }}
                    >
                        {waiters.length > 0 ? (
                            waiters.map((waiter) => (
                                <MenuItem key={waiter.id_mozo} value={waiter.id_mozo}>
                                    {waiter.nombre}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>No hay mozos disponibles</MenuItem>
                        )}
                    </Select>
                    {error && <FormHelperText>Seleccionar un mozo es obligatorio</FormHelperText>}
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
    );
};

export default CreateTableDialog;
