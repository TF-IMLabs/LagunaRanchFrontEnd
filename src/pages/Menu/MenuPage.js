import React, { useState } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import backgroundImage from '../../assets/background8.jpg';
import celiacoIcon from '../../assets/celiaco.png';
import veganoIcon from '../../assets/vegano.png';
import vegetarianoIcon from '../../assets/vegetariano.png';
import { useCart } from '../../contexts/CartContext';
import CategoryAccordion from './CategoryAccordion';
import CombinedDialog from './CombinedDialog';
import ProductDialog from './ProductDialog';

const MainContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.palette.neutral.main,
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
  borderRadius: 12,
  padding: theme.spacing(4),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
  maxWidth: 900,
  margin: '0 auto',
  backgroundColor: alpha(theme.palette.background.paper, 0.92),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const HighlightedText = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '8px 24px',
  backgroundColor: alpha(theme.palette.background.default, 0.85),
  color: theme.palette.primary.contrastText,
  borderRadius: 8,
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  width: '100%',
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontSize: '1.8rem',
  margin: 0,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.accent.main, 0.3),
  borderRadius: 8,
  padding: theme.spacing(2),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
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

const advantages = [
  { src: vegetarianoIcon, alt: 'Vegetariano', text: 'Apto vegetarianos' },
  { src: celiacoIcon, alt: 'Celíaco', text: 'Apto celíacos' },
  { src: veganoIcon, alt: 'Vegano', text: 'Apto veganos' },
];

const MenuPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { combinedDialogOpen, closeCombinedDialog } = useCart();

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
            {'NUESTRO MENÚ'}
          </TitleTypography>
        </HighlightedText>
        <InfoBox>
          <Grid container spacing={2} justifyContent="center">
            {advantages.map((icon) => (
              <Grid item xs={12} sm={4} key={icon.alt}>
                <IconContainer>
                  <Icon src={icon.src} alt={icon.alt} />
                  <Typography color="text.primary">{icon.text}</Typography>
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

      <CombinedDialog open={combinedDialogOpen} onClose={closeCombinedDialog} />
    </MainContainer>
  );
};

export default MenuPage;
