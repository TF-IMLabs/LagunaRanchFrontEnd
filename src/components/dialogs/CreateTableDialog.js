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

const CreateTableDialog = ({ open, onClose, waiters = [] }) => {
    const [capacidad, setCapacidad] = useState('');
    const [id_mozo, setIdMozo] = useState('');

    const handleSubmit = async () => {
        try {
            await createTable({ capacidad, id_mozo });
            onClose();
            setCapacidad('');
            setIdMozo('');
        } catch (error) {
            console.error('Error al crear la mesa:', error);
        }
    };

    return (
        <CustomDialog open={open} onClose={onClose}>
            <DialogTitle>Crea una Nueva Mesa</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Capacidad"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={capacidad}
                    onChange={(e) => setCapacidad(e.target.value)}
                />
                <FormControl fullWidth margin="dense" variant="outlined">
                    <InputLabel id="mozo-select-label">Seleccionar Mozo</InputLabel>
                    <Select
                        labelId="mozo-select-label"
                        value={id_mozo}
                        onChange={(e) => setIdMozo(e.target.value)}
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
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', gap: 2 }}> {/* Centramos los botones */}
                <CustomButton onClick={onClose}>Cancelar</CustomButton>
                <CustomButton onClick={handleSubmit}>Crear</CustomButton>
            </DialogActions>
        </CustomDialog>
    );
};

export default CreateTableDialog;
