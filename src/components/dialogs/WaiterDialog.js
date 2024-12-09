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
        boxShadow: 'none', // Sin sombra
        backgroundColor: 'black', // Fondo personalizado
    },
    '& .MuiDialogTitle-root': {
        backgroundColor: 'black', // Fondo negro para el título
        color: '#DD98AD', // Color rosa para el texto
        fontWeight: 'bold',
        borderRadius: '20px 20px 0px 0px', // Bordes redondeados
        textAlign: 'center', // Centramos el título
    },
    '& .MuiDialogContent-root': {
        backgroundColor: 'rgb(155, 140, 141)', // Fondo de contenido
        color: 'black',
    },
}));

const CustomButton = styled(Button)(({ theme }) => ({
    color: '#DD98AD', // Color de texto de los botones
    borderColor: 'rgb(155, 140, 141)', // Borde gris
    '&:hover': {
        backgroundColor: 'grey', // Fondo gris al pasar el ratón
    },
}));

const WaiterDialog = ({ open, onClose, waiters, selectedWaiter, setSelectedWaiter, handleUpdateWaiter }) => {
    return (
        <CustomDialog open={open} onClose={onClose}>
            <DialogTitle>Seleccionar Mozo</DialogTitle>
            <DialogContent>
                {/* Aquí aplicamos los estilos correctamente */}
                <FormControl fullWidth variant="outlined" sx={{
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'black', // Borde por defecto
                        },
                        '&:hover fieldset': {
                            borderColor: 'grey', // Borde al pasar el ratón
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#DD98AD', // Borde rosa al enfocar
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: 'black', // Color del label
                    }
                }}>
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
            <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
                <CustomButton onClick={onClose}>Cancelar</CustomButton>
                <CustomButton onClick={() => handleUpdateWaiter(selectedWaiter)}>Asignar Mozo</CustomButton>
            </DialogActions>
        </CustomDialog>
    );
};

export default WaiterDialog;
