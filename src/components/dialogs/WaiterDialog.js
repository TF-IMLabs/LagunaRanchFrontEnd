import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/system';

// Estilos personalizados
const CustomDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-container': {
        backdropFilter: 'blur(10px)', // Añadir desenfoque de fondo
    },
    '& .MuiPaper-root': {
        borderRadius: '20px', // Bordes redondeados
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)', // Sombra sutil
        backgroundColor: '#fff', // Color de fondo blanco para mayor elegancia
    },
    '& .MuiDialogTitle-root': {
        backgroundColor: '#d9c9a3',
        color: '#3e2d1f',
        fontWeight: 'bold',
        borderRadius: '20px 20px 0px 0px', // Bordes redondeados
        boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.2)', // Sombra sutil
    },
    '& .MuiDialogContent-root': {
        backgroundColor: '#ffffff',
        color: '#3e2d1f',
    },
}));

const CustomButton = styled(Button)(({ theme }) => ({
    color: '#3e2d1f',
    borderColor: '#3e2d1f',
    '&:hover': {
        backgroundColor: '#f5f5dc',
        borderColor: '#3e2d1f',
    },
}));

const WaiterDialog = ({ open, onClose, waiters, selectedWaiter, setSelectedWaiter, handleUpdateWaiter }) => {
    return (
        <CustomDialog open={open} onClose={onClose}>
            <DialogTitle variant='h5'>Seleccionar Mozo</DialogTitle>
            <DialogContent>
                <FormControl fullWidth variant="outlined">
                    <InputLabel id="select-waiter-label">Mozo</InputLabel>
                    <Select
                        labelId="select-waiter-label"
                        value={selectedWaiter}
                        onChange={(e) => setSelectedWaiter(e.target.value)}
                        label="Mozo"
                    >
                        {waiters.map(waiter => (
                            <MenuItem key={waiter.id_mozo} value={waiter.id_mozo}>
                                {waiter.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <CustomButton onClick={onClose}>Cancelar</CustomButton>
                <CustomButton onClick={() => handleUpdateWaiter(selectedWaiter)}>Asignar Mozo</CustomButton>
            </DialogActions>
        </CustomDialog>
    );
};

export default WaiterDialog;
