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
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  minHeight: '100vh',
  boxSizing: 'border-box',
  overflow: 'hidden',
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
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    filter: 'blur(6px)',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
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
  padding: '8px 24px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  borderRadius: '8px',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  width: '100%', // Asegura que ocupe todo el ancho disponible
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem',
  margin: 0, // Elimina márgenes predeterminados del Typography
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgb(155, 140, 141)',
  borderRadius: '8px',
  padding: theme.spacing(2),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'flex-start',
  },
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
          <TitleTypography variant="h4" gutterBottom>
            NUESTRO MENÚ
          </TitleTypography>
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
