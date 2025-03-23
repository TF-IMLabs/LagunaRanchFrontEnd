import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/system';
import { getSubcategoriesByCategoryId } from '../../services/menuService'; 

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
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#DD98AD',
  },
}));

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    backdropFilter: 'blur(10px)',
  },
  '& .MuiPaper-root': {
    borderRadius: '20px',
    boxShadow: 'none',
    backgroundColor: 'rgb(155, 140, 141)',
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
  '& .MuiDialogActions-root': {
    justifyContent: 'center', 
    backgroundColor: 'black',
    borderBottomLeftRadius: '20px', 
    borderBottomRightRadius: '20px', 
  },
}));


const CustomButton = styled(Button)(({ theme }) => ({
  color: '#DD98AD',
  borderColor: 'rgb(155, 140, 141)',
  '&:hover': {
    backgroundColor: 'grey',
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
}));

const CreateAndDeleteSubcategoriesDialog = ({
  open,
  onClose,
  categories,
  onCreate,
  onDelete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [action, setAction] = useState('add');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    if (selectedCategory) {
      getSubcategoriesByCategoryId(selectedCategory)
        .then((subcats) => {
          const subcategoriesArray = Object.values(subcats);
          setSubcategories(subcategoriesArray);
        })
        .catch((error) => {
          console.error('Error al obtener subcategorías:', error);
          setSubcategories([]);
        });
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  const handleConfirm = () => {
    if (action === 'add') {
      if (!selectedCategory || !subcategoryName.trim()) {
        setSnackbarMessage('Por favor, seleccione una categoría y complete el nombre de la subcategoría.');
        setSnackbarSeverity('error');
      } else {
        onCreate(selectedCategory, subcategoryName);
        setSnackbarMessage('Subcategoría agregada exitosamente!');
        setSnackbarSeverity('success');
      }
    } else if (action === 'delete') {
      if (!selectedCategory || !selectedSubcategory) {
        setSnackbarMessage('Por favor, seleccione una categoría y una subcategoría para eliminar.');
        setSnackbarSeverity('error');
      } else {
        onDelete(selectedSubcategory);
        setSnackbarMessage('Subcategoría eliminada exitosamente!');
        setSnackbarSeverity('success');
      }
    }

    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <>
      <CustomDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Agregar/Eliminar Subcategoría</DialogTitle>
        <DialogContent>
          <CustomFormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="action-select-label">Acción</InputLabel>
            <Select
              labelId="action-select-label"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="add">Agregar</MenuItem>
              <MenuItem value="delete">Eliminar</MenuItem>
            </Select>
          </CustomFormControl>

          <CustomFormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-select-label">Categoría</InputLabel>
            <Select
              labelId="category-select-label"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.id_categoria} value={category.id_categoria}>
                  {category.nombre}
                </MenuItem>
              ))}
            </Select>
          </CustomFormControl>

          {action === 'add' && (
            <CustomTextField
              fullWidth
              label="Nombre de la Subcategoría"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
            />
          )}

          {action === 'delete' && (
            <CustomFormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="subcategory-select-label">Subcategoría</InputLabel>
              <Select
                labelId="subcategory-select-label"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
              >
                {subcategories.length > 0 ? (
                  subcategories.map((sub) => (
                    <MenuItem key={sub.id_subcategoria} value={sub.id_subcategoria}>
                      {sub.nombre}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay subcategorías disponibles</MenuItem>
                )}
              </Select>
            </CustomFormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <CustomButton onClick={onClose}>Cancelar</CustomButton>
          <CustomButton onClick={handleConfirm}>Confirmar</CustomButton>
        </DialogActions>
      </CustomDialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateAndDeleteSubcategoriesDialog;
