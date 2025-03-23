import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/system';


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
    },
}));

const WaiterDialog = ({ open, onClose, waiters, selectedWaiter, setSelectedWaiter, handleUpdateWaiter }) => {
    return (
        <CustomDialog open={open} onClose={onClose}>
            <DialogTitle>Seleccionar Mozo</DialogTitle>
            <DialogContent>
                
                <FormControl fullWidth variant="outlined" sx={{
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
