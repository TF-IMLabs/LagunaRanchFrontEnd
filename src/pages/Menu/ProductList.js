import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, keyframes, styled } from '@mui/material/styles';
import celiacoIcon from '../../assets/celiaco.png';
import veganoIcon from '../../assets/vegano.png';
import vegetarianoIcon from '../../assets/vegetariano.png';
import ProductDialog from './ProductDialog';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 12px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const formatPrice = (value) => {
  const numericValue = Number.parseInt(`${value}`, 10);
  if (Number.isNaN(numericValue)) {
    return '$0';
  }
  return `$${numericValue.toLocaleString('es-AR')}`;
};

const ProductCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  height: '100%',
  minHeight: 220,
  transformOrigin: 'center',
  backgroundColor: alpha(theme.palette.background.default, 0.92),
  borderRadius: 14,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  transition: 'transform 190ms ease-out, box-shadow 220ms ease',
  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.24)',
  overflow: 'hidden',
  willChange: 'transform, box-shadow',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.04)',
    pointerEvents: 'none',
    opacity: 0.55,
    transition: 'opacity 200ms ease',
  },
  '&:hover, &:focus-within': {
    transform: 'scale(1.02)',
    boxShadow: '0 18px 36px rgba(190, 120, 55, 0.35)',
  },
  '&:hover::after, &:focus-within::after': {
    opacity: 0.85,
  },
}));

const ProductActionArea = styled(CardActionArea)(() => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  flex: 1,
  width: '100%',
  height: '100%',
  padding: 0,
  justifyContent: 'space-between',
  '&::after': {
    pointerEvents: 'none',
  },
  '& .MuiCardActionArea-focusHighlight': {
    borderRadius: 'inherit',
  },
}));

const BadgeText = styled(Typography)(({ theme }) => ({
  whiteSpace: 'nowrap',
  color: theme.palette.primary.contrastText,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  fontWeight: 600,
  borderRadius: 999,
  padding: theme.spacing(0.45, 1.4),
  backgroundColor: alpha(theme.palette.primary.main, 0.22),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.6)}`,
  letterSpacing: '0.08em',
  boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.45)}`,
  transition: 'box-shadow 220ms ease, transform 220ms ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  flexShrink: 0,
}));

const PriceTag = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: 'clamp(1rem, 0.95rem + 0.25vw, 1.25rem)',
  color: theme.palette.primary.main,
  whiteSpace: 'nowrap',
  marginLeft: 'auto',
  textAlign: 'right',
}));

const IconGroup = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.6),
  minHeight: 20,
  '& img': {
    width: 20,
    height: 20,
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
  },
}));

const LoadingSkeleton = () => (
  <Grid container spacing={{ xs: 1.2, sm: 2.5 }}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={`product-skeleton-${index}`}>
        <Skeleton
          variant="rounded"
          height={220}
          sx={{ borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)' }}
        />
      </Grid>
    ))}
  </Grid>
);

const ProductList = React.memo(
  ({
    subcategoryId,
    products,
    allProducts = [],
    onAddToCart,
    isLoading = false,
  }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const productList = useMemo(() => {
      if (products && products.length > 0) {
        return products.filter((product) => product.stock > 0);
      }
      if (subcategoryId && allProducts.length > 0) {
        return allProducts.filter(
          (product) => product.id_subcategoria === subcategoryId && product.stock > 0,
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

    const renderIcons = (product) => {
      const items = [];
      if (product.vegetariano === 1) {
        items.push(
          <Tooltip key="vegetariano" title="Apto vegetarianos">
            <img
              src={vegetarianoIcon}
              alt="Vegetariano"
              loading="lazy"
            />
          </Tooltip>,
        );
      }
      if (product.vegano === 1) {
        items.push(
          <Tooltip key="vegano" title="Apto veganos">
            <img src={veganoIcon} alt="Vegano" loading="lazy" />
          </Tooltip>,
        );
      }
      if (product.celiaco === 1) {
        items.push(
          <Tooltip key="celiaco" title="Apto celíacos">
            <img src={celiacoIcon} alt="Celíaco" loading="lazy" />
          </Tooltip>,
        );
      }
      return items.length ? <IconGroup>{items}</IconGroup> : null;
    };

    if (isLoading) {
      return <LoadingSkeleton />;
    }

    const renderedProducts =
      productList.length > 0
        ? productList.map((product, index) => {
            const trimmedDescription = (product.descripcion ?? '').trim();
            const hasDescription = Boolean(trimmedDescription);
            const hasBadge = product.plato_del_dia === 1;
            const iconElements = renderIcons(product);
            const hasIcons = Boolean(iconElements);
            const titleLength = (product.nombre ?? '').length;
            const isCompact = !hasDescription && !hasBadge && !hasIcons && titleLength <= 20;
            const cardPadding = isCompact ? { xs: 1.4, sm: 1.8 } : { xs: 2, sm: 2.25 };
            const detailSpacing = hasDescription ? 1.1 : 0.5;
            const footerSpacing = hasDescription ? { pt: 0.5 } : { pt: 0.4 };
            const animationDelay = Math.min(index, 6) * 50;

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={product.id_producto}
                sx={{
                  opacity: 0,
                  animation: `${fadeInUp} 260ms ease-out forwards`,
                  animationDelay: `${animationDelay}ms`,
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                    opacity: 1,
                  },
                }}
              >
                <ProductCard sx={{ mb: { xs: 1, sm: 0 }, minHeight: isCompact ? 185 : 220 }}>
                  <ProductActionArea
                    onClick={() => handleClick(product)}
                    sx={{ justifyContent: isCompact ? 'flex-start' : 'space-between' }}
                  >
                    <CardContent
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        p: cardPadding,
                        flexGrow: 1,
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          flexGrow: 1,
                          gap: detailSpacing,
                          minHeight: 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 0.75,
                          }}
                        >
                          <Typography
                            variant="h6"
                            component="h3"
                            translate="no"
                            sx={{
                              fontWeight: 500,
                              fontSize: 'clamp(0.98rem, 0.93rem + 0.2vw, 1.15rem)',
                              lineHeight: 1.25,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {product.nombre}
                          </Typography>
                          {hasIcons && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                              {iconElements}
                            </Box>
                          )}
                        </Box>

                        {hasDescription && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: (theme) => alpha(theme.palette.text.primary, 0.72),
                              lineHeight: 1.35,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {trimmedDescription}
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          width: '100%',
                          columnGap: 1.5,
                          mt: 'auto',
                          ...footerSpacing,
                        }}
                      >
                        {product.plato_del_dia === 1 && (
                          <BadgeText component="span">PLATO DEL DÍA</BadgeText>
                        )}
                        <PriceTag component="span">{formatPrice(product.precio)}</PriceTag>
                      </Box>
                    </CardContent>
                  </ProductActionArea>
                </ProductCard>
              </Grid>
            );
          })
        : (
          <Grid item xs={12}>
            <Typography align="center" variant="body1" color="text.secondary">
              No hay productos disponibles para esta categoría.
            </Typography>
          </Grid>
        );

    return (
      <>
        <Grid container spacing={{ xs: 1.2, sm: 2 }} columns={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          {renderedProducts}
        </Grid>

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
  },
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
    }),
  ),
  allProducts: PropTypes.arrayOf(
    PropTypes.shape({
      id_producto: PropTypes.number.isRequired,
      id_subcategoria: PropTypes.number,
      id_categoria: PropTypes.number,
      stock: PropTypes.number.isRequired,
    }),
  ),
  onAddToCart: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default ProductList;
