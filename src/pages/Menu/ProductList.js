import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { Box, List, ListItem, ListItemText, Skeleton, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import celiacoIcon from '../../assets/celiaco.png';
import veganoIcon from '../../assets/vegano.png';
import vegetarianoIcon from '../../assets/vegetariano.png';
import ProductDialog from './ProductDialog';

const BlinkText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '0.9rem',
  animation: 'blink-animation 1.5s ease-in-out infinite',
  padding: theme.spacing(0.3, 0.8),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.background.default, 0.6),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  letterSpacing: '0.05em',
  display: 'inline-flex',
  justifyContent: 'flex-end',
  marginLeft: 'auto',
  '@keyframes blink-animation': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.3 },
    '100%': { opacity: 1 },
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
    padding: theme.spacing(0.2, 0.5),
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.accent.main,
  borderRadius: 8,
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.01)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    color: theme.palette.neutral.contrastText,
    fontWeight: 'bold',
    fontSize: '1.2rem',
    display: 'flex',
    justifyContent: 'space-between',
    textAlign: 'justify',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
    },
  },
  '& .MuiListItemText-secondary': {
    display: 'flex',
    justifyContent: 'space-between',
    color: theme.palette.neutral.contrastText,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'justify',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9rem',
    },
  },
}));

const IconGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: theme.spacing(1),
  '& img': {
    width: 20,
    height: 20,
    marginLeft: theme.spacing(0.5),
  },
}));

const LoadingSkeleton = () => (
  <Box>
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton
        key={`product-skeleton-${index}`}
        variant="rectangular"
        height={68}
        sx={{ mb: 1.5, borderRadius: 2 }}
      />
    ))}
  </Box>
);

const ProductList = React.memo(
  ({ subcategoryId, products, allProducts = [], onAddToCart, isLoading = false }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const productList = useMemo(() => {
      if (products && products.length > 0) {
        return products.filter((product) => product.stock > 0);
      }
      if (subcategoryId && allProducts.length > 0) {
        return allProducts.filter(
          (product) => product.id_subcategoria === subcategoryId && product.stock > 0
        );
      }
      return [];
    }, [products, subcategoryId, allProducts]);

    const handleClick = (product) => {
      setSelectedProduct(product);
      setDialogOpen(true);
    };

    const handleCloseDialog = () => {
      setDialogOpen(false);
      setSelectedProduct(null);
    };

    const renderIcons = (product) => (
      <IconGroup>
        {product.vegetariano === 1 && <img src={vegetarianoIcon} alt="Vegetariano" />}
        {product.vegano === 1 && <img src={veganoIcon} alt="Vegano" />}
        {product.celiaco === 1 && <img src={celiacoIcon} alt="Celíaco" />}
      </IconGroup>
    );

    if (isLoading) {
      return <LoadingSkeleton />;
    }

    return (
      <>
        <List>
          {productList.length > 0 ? (
            productList.map((product) => (
              <StyledListItem key={product.id_producto} onClick={() => handleClick(product)}>
                <StyledListItemText
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                  primary={
                    <Box
                      component="span"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%',
                        gap: 1,
                      }}
                    >
                      <Typography component="span" variant="body1" translate="no">
                        {product.nombre}
                      </Typography>
                      {renderIcons(product)}
                      {product.plato_del_dia === 1 && <BlinkText>Plato del Día</BlinkText>}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Typography
                        variant="body2"
                        sx={(theme) => ({
                          color: alpha(theme.palette.text.primary, 0.75),
                          marginBottom: 0.5,
                          textAlign: 'justify',
                        })}
                      >
                        {product.descripcion || ''}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          fontWeight: 'bold',
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <span>${product.precio}</span>
                      </Typography>
                    </Box>
                  }
                />
              </StyledListItem>
            ))
          ) : (
            <Typography>No hay productos para esta subcategoría.</Typography>
          )}
        </List>

        {selectedProduct && (
          <ProductDialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            product={selectedProduct}
            onAddToCart={onAddToCart}
          />
        )}
      </>
    );
  }
);

ProductList.propTypes = {
  subcategoryId: PropTypes.number,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id_producto: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      descripcion: PropTypes.string,
      precio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      stock: PropTypes.number.isRequired,
      id_subcategoria: PropTypes.number,
      id_categoria: PropTypes.number,
      vegetariano: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
      vegano: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
      celiaco: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
      plato_del_dia: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    })
  ),
  allProducts: PropTypes.arrayOf(
    PropTypes.shape({
      id_producto: PropTypes.number.isRequired,
      id_subcategoria: PropTypes.number,
      id_categoria: PropTypes.number,
      stock: PropTypes.number.isRequired,
    })
  ),
  onAddToCart: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default ProductList;
