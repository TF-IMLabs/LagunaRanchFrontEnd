import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { getSubcategoriesByCategoryId } from '../../services/menuService';
import ProductList from './ProductList';

const CustomAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: 'transparent',
  marginBottom: theme.spacing(2),
  boxShadow: 'none',
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.contrastText,
  },
}));

const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '1.7rem',
  padding: theme.spacing(1.5, 2),
  backgroundColor: 'transparent',
  color: theme.palette.primary.contrastText,
  borderRadius: 11,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textTransform: 'uppercase',
  '& .MuiAccordionSummary-content': {
    justifyContent: 'center',
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    justifyContent: 'center',
  },
}));

const CustomAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  borderRadius: 12,
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
    queryKey: ['subcategories', categoryId],
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

  const handleChange = (panel) => (_event, isExpandedPanel) => {
    setExpanded(isExpandedPanel ? panel : false);

    if (isExpandedPanel) {
      setTimeout(() => {
        const element = accordionRefs.current[panel];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });
        }
      }, 300);
    }
  };

  if (isLoading || productsLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <Typography>Error al obtener subcategorías: {error.message}</Typography>;
  }

  return (
    <div>
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
                  variant="h5"
                  sx={{
                    fontSize: {
                      xs: '1rem',
                      sm: '1.2rem',
                      md: '1.5rem',
                      lg: '1.7rem',
                    },
                    display: 'flex',
                    alignItems: 'center',
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
    </div>
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
