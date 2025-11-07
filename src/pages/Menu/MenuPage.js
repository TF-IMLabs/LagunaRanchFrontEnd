import React, { useState } from 'react';
import { Box, Container, Grid, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import backgroundImage from '../../assets/backgroundandi2.png';
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
  padding: 'clamp(2.75rem, 6vw, 4rem) clamp(1rem, 4vw, 2.75rem)',
  minHeight: '100vh',
  boxSizing: 'border-box',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    padding: 'clamp(2.25rem, 6vw, 3rem) clamp(0.9rem, 4vw, 2rem)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: 'clamp(1.8rem, 7vw, 2.5rem) clamp(0.75rem, 5vw, 1.5rem)',
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
    transform: 'none',
    zIndex: 0,
    pointerEvents: 'none',
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const MenuContainer = styled(Container)(({ theme }) => ({
  borderRadius: 16,
  padding: 'clamp(2.2rem, 4vw, 3.2rem)',
  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.35)',
  width: '100%',
  maxWidth: theme.breakpoints.values.lg,
  margin: '0 auto',
  backgroundColor: alpha(theme.palette.background.paper, 0.88),
  backdropFilter: 'blur(6px)',
  [theme.breakpoints.down('md')]: {
    padding: 'clamp(1.75rem, 5vw, 2.4rem)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: 'clamp(1.5rem, 6vw, 2rem)',
    borderRadius: 12,
  },
}));

const HighlightedText = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(1.2, 2.4),
  backgroundColor: alpha(theme.palette.background.default, 0.7),
  backdropFilter: 'blur(8px)',
  color: theme.palette.primary.contrastText,
  borderRadius: 12,
  marginBottom: theme.spacing(3),
  boxShadow: 'inset 0 -8px 15px rgba(0, 0, 0, 0.25)',
  textAlign: 'center',
  width: '100%',
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.accent.main, 0.28),
  borderRadius: 12,
  padding: theme.spacing(2.4, 2.1),
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
  marginTop: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.6, 1.8),
    gap: theme.spacing(1.4),
  },
}));

const IconContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.4, 0.75),
  minHeight: 48,
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'center',
  },
}));

const Icon = styled('img')(({ theme }) => ({
  width: 'clamp(24px, 5vw, 32px)',
  height: 'clamp(24px, 5vw, 32px)',
  objectFit: 'contain',
  [theme.breakpoints.down('sm')]: {
    width: 'clamp(22px, 7vw, 28px)',
    height: 'clamp(22px, 7vw, 28px)',
  },
}));

const advantages = [
  { src: vegetarianoIcon, alt: 'Vegetariano', text: 'Apto vegetarianos' },
  { src: celiacoIcon, alt: 'Celiaco', text: 'Apto celíacos' },
  { src: veganoIcon, alt: 'Vegano', text: 'Apto veganos' },
];

const MenuPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { combinedDialogOpen, closeCombinedDialog } = useCart();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
      <MenuContainer disableGutters>
        <Stack spacing={isSmallScreen ? 2.5 : 3.25}>
          <HighlightedText>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 600 }}>
              NUESTRO MENÚ
            </Typography>
          </HighlightedText>

          <InfoBox>
            <Grid
              container
              spacing={{ xs: 1.5, sm: 2 }}
              justifyContent="center"
              alignItems="center"
            >
              {advantages.map((icon) => (
                <Grid item xs={12} sm={6} md={4} key={icon.alt}>
                  <IconContainer>
                    <Icon src={icon.src} alt={icon.alt} loading="lazy" />
                    <Typography
                      color="text.primary"
                      variant="body1"
                      sx={{ fontWeight: 400, lineHeight: 1.4 }}
                    >
                      {icon.text}
                    </Typography>
                  </IconContainer>
                </Grid>
              ))}
            </Grid>
          </InfoBox>

          <CategoryAccordion onProductClick={handleOpenDialog} />
        </Stack>

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
