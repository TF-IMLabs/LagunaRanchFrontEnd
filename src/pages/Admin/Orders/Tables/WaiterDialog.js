import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';


const WaiterDialog = ({ open, onClose, waiters, selectedWaiter, setSelectedWaiter, handleUpdateWaiter }) => {
    return (
        <Dialog open={open} onClose={onClose}>
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
                            borderColor: '#c96b21', 
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
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={() => handleUpdateWaiter(selectedWaiter)}>Asignar Mozo</Button>
            </DialogActions>
        </Dialog>
    );
};

export default WaiterDialog;
