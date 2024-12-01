import React, { useState } from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import { styled } from '@mui/system';
import CategoryAccordion from '../components/menu/CategoryAccordion';
import ProductDialog from '../components/dialogs/ProductDialog';
import vegetarianoIcon from '../assets/vegetariano.png';
import celiacoIcon from '../assets/celiaco.png';
import veganoIcon from '../assets/vegano.png';
import backgroundImage from '../assets/background8.jpg';
import { useCart } from '../contexts/CartContext';
import CombinedDialog from '../components/dialogs/CombinedDialog';

const MainContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: '#d9c9a3',
  position: 'relative', // Para que el pseudo-elemento se posicione correctamente
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  minHeight: '100vh', // Hace que el MainContainer ocupe al menos toda la altura de la ventana
  boxSizing: 'border-box',
  overflow: 'hidden', // Asegura que no se desborden elementos
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${backgroundImage})`, // Usa la imagen de fondo pasada como prop
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed', // Mantiene el fondo fijo al desplazarse
    filter: 'blur(6px)', // Aplica el desenfoque
    zIndex: 0, // Asegura que esté detrás del contenido
  },
  '& > *': {
    position: 'relative', // Asegura que el contenido esté por encima del fondo
    zIndex: 1,
  },
}));


const MenuContainer = styled(Container)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(4),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  maxWidth: '900px',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const HighlightedText = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  borderRadius: '8px',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgb(155, 140, 141)',
  borderRadius: '8px',
  padding: theme.spacing(2),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  marginTop: theme.spacing(4),
  display: 'flex', // Flexbox para centrar contenido
  flexDirection: 'column', // Asegura que los ítems estén en columna
  alignItems: 'center', // Centra horizontalmente
  justifyContent: 'center', // Centra verticalmente
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center', // Centra horizontalmente
  marginBottom: theme.spacing(2),
}));


const Icon = styled('img')(({ theme }) => ({
  width: 30,
  height: 30,
  marginRight: theme.spacing(1),
}));

const MenuPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { orderDialogOpen, closeOrderDialog } = useCart();

  const handleOpenDialog = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  return (
    <MainContainer>
      <MenuContainer>
        <HighlightedText>
          <Typography variant="h4" gutterBottom>
           NUESTRO MENÚ
          </Typography>
        </HighlightedText>
        <InfoBox>
          <Grid container spacing={2}>
            {[
              { src: vegetarianoIcon, alt: 'Vegetariano', text: 'Apto vegetarianos' },
              { src: veganoIcon, alt: 'Vegano', text: 'Apto veganos' },
              { src: celiacoIcon, alt: 'Celiaco', text: 'Apto celíacos' },
            ].map((icon, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <IconContainer>
                  <Icon src={icon.src} alt={icon.alt} />
                  <Typography>{icon.text}</Typography>
                </IconContainer>
              </Grid>
            ))}
          </Grid>
        </InfoBox>
        <CategoryAccordion onProductClick={handleOpenDialog} />
        {selectedProduct && (
          <ProductDialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            product={selectedProduct}
          />
        )}
      </MenuContainer>

      <CombinedDialog open={orderDialogOpen} onClose={closeOrderDialog} />
    </MainContainer>
  );
};

export default MenuPage;
