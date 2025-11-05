import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { alpha, styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { getSubcategoriesByCategoryId } from '../../services/menuService';
import { queryKeys } from '../../lib/queryClient';
import ProductList from './ProductList';

const HEADER_FALLBACK_HEIGHT = 88;
const COLLAPSE_DURATION = 320;

const getHeaderHeight = () => {
  const headerEl = document.querySelector('header.MuiAppBar-root');
  return headerEl ? headerEl.getBoundingClientRect().height : HEADER_FALLBACK_HEIGHT;
};

const scrollToWithOffset = (element) => {
  if (!element) return;
  const offset = getHeaderHeight() + 12;
  const targetPosition = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({
    top: targetPosition - offset,
    behavior: 'smooth',
  });
};

const CustomAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.background.default, 0.6),
  marginBottom: theme.spacing(1.2),
  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.04)',
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  overflow: 'hidden',
  scrollMarginTop: '110px',
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.contrastText,
  },
  '&.Mui-expanded': {
    boxShadow: '0 0 0 1px rgba(255, 140, 0, 0.28), 0 8px 22px rgba(0, 0, 0, 0.28)',
    transform: 'translateY(-2px)',
  },
}));

const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1, 1.6),
  backgroundColor: 'transparent',
  color: theme.palette.primary.contrastText,
  borderRadius: 11,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textTransform: 'uppercase',
  minHeight: 52,
  '&.Mui-expanded': {
    minHeight: 52,
  },
  '& .MuiAccordionSummary-content': {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    justifyContent: 'center',
  },
}));

const CustomAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(1.5, 1.8),
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  borderRadius: 12,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.25, 1.25, 1.6),
  },
}));

const normalizeSubcategories = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : Object.values(data);
};

const LoadingSkeleton = () => (
  <Box>
    {Array.from({ length: 3 }).map((_, index) => (
      <Skeleton
        key={`subcategory-skeleton-${index}`}
        variant="rectangular"
        height={56}
        sx={{ mb: 1.5, borderRadius: 2 }}
      />
    ))}
  </Box>
);

const SubcategoryAccordion = ({ categoryId, onProductClick, allProducts = [], productsLoading }) => {
  const [expanded, setExpanded] = useState(false);

  const { data: subcategoriesData, isLoading, error } = useQuery({
    queryKey: queryKeys.menu.subcategories(categoryId),
    queryFn: () => getSubcategoriesByCategoryId(categoryId),
  });

  const subcategories = useMemo(
    () => normalizeSubcategories(subcategoriesData),
    [subcategoriesData]
  );

  const productsByCategory = useMemo(
    () => (allProducts ?? []).filter(
      (product) => product.id_categoria === categoryId && product.stock > 0
    ),
    [allProducts, categoryId]
  );

  const accordionRefs = useRef({});
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (panel) => (_event, isExpandedPanel) => {
    setExpanded(isExpandedPanel ? panel : false);

    if (isExpandedPanel) {
      window.requestAnimationFrame(() => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(() => {
          const element = accordionRefs.current[panel];
          if (element) {
            scrollToWithOffset(element);
          }
        }, COLLAPSE_DURATION);
      });
    }
  };

  if (isLoading || productsLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <Typography>Error al obtener subcategorías: {error.message}</Typography>;
  }

  return (
    <Stack spacing={{ xs: 1.6, md: 2.4 }}>
      {subcategories.length > 0 ? (
        subcategories.map((subcategory) => {
          const panelId = `panel-${subcategory.id_subcategoria}`;
          const productsForSubcategory = productsByCategory.filter(
            (product) => product.id_subcategoria === subcategory.id_subcategoria
          );

          return (
            <CustomAccordion
              key={subcategory.id_subcategoria}
              expanded={expanded === panelId}
              onChange={handleChange(panelId)}
              ref={(el) => (accordionRefs.current[panelId] = el)}
            >
              <CustomAccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${panelId}-content`}
                id={`${panelId}-header`}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 500,
                    fontSize: 'clamp(0.95rem, 0.9rem + 0.4vw, 1.2rem)',
                    display: 'flex',
                    alignItems: 'center',
                    letterSpacing: '0.04em',
                  }}
                  translate="no"
                >
                  {subcategory.nombre}
                </Typography>
              </CustomAccordionSummary>
              <CustomAccordionDetails>
                <ProductList
                  subcategoryId={subcategory.id_subcategoria}
                  products={productsForSubcategory}
                  onAddToCart={onProductClick}
                />
              </CustomAccordionDetails>
            </CustomAccordion>
          );
        })
      ) : (
        <ProductList products={productsByCategory} onAddToCart={onProductClick} />
      )}
    </Stack>
  );
};

SubcategoryAccordion.propTypes = {
  categoryId: PropTypes.number.isRequired,
  onProductClick: PropTypes.func,
  allProducts: PropTypes.arrayOf(
    PropTypes.shape({
      id_producto: PropTypes.number.isRequired,
      id_categoria: PropTypes.number,
      id_subcategoria: PropTypes.number,
      stock: PropTypes.number,
    })
  ),
  productsLoading: PropTypes.bool,
};

export default SubcategoryAccordion;
