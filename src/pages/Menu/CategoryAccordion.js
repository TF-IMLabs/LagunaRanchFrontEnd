import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Skeleton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { alpha, styled } from '@mui/material/styles';
import useMenuData from '../../hooks/useMenuData';
import ProductList from './ProductList';
import SubcategoryAccordion from './SubcategoryAccordion';

const CustomAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  marginBottom: theme.spacing(2),
  boxShadow: 'none',
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.contrastText,
  },
}));

const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
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

const LoadingSkeleton = () => (
  <Box>
    {Array.from({ length: 3 }).map((_, index) => (
      <Skeleton
        key={`category-skeleton-${index}`}
        variant="rectangular"
        height={62}
        sx={{ mb: 2, borderRadius: 2 }}
      />
    ))}
  </Box>
);

const CategoryAccordion = ({ onProductClick }) => {
  const { categoriesQuery, productsQuery } = useMenuData();
  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const isLoadingCategories = categoriesQuery.isLoading;
  const isLoadingProducts = productsQuery.isLoading;

  const [expanded, setExpanded] = useState(false);
  const accordionRefs = useRef({});

  const handleChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    if (isExpanded) {
      setTimeout(() => {
        const element = accordionRefs.current[panel];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  if (isLoadingCategories || isLoadingProducts) {
    return <LoadingSkeleton />;
  }

  const dailyDishes = products.filter((product) => product.plato_del_dia === 1);

  return (
    <div>
      {dailyDishes.length > 0 && (
        <CustomAccordion
          expanded={expanded === 'panelPlatoDelDia'}
          onChange={handleChange('panelPlatoDelDia')}
          ref={(el) => (accordionRefs.current.panelPlatoDelDia = el)}
        >
          <CustomAccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panelPlatoDelDia-content"
            id="panelPlatoDelDia-header"
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: {
                  sm: '1.5rem',
                  md: '1.7rem',
                },
              }}
              translate="no"
            >
              Plato del Día
            </Typography>
          </CustomAccordionSummary>
          <CustomAccordionDetails>
            <ProductList
              products={dailyDishes}
              onAddToCart={onProductClick}
              isLoading={isLoadingProducts}
            />
          </CustomAccordionDetails>
        </CustomAccordion>
      )}

      {categories.map((category) => (
        <CustomAccordion
          key={category.id_categoria}
          expanded={expanded === `panel${category.id_categoria}`}
          onChange={handleChange(`panel${category.id_categoria}`)}
          ref={(el) => (accordionRefs.current[`panel${category.id_categoria}`] = el)}
        >
          <CustomAccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${category.id_categoria}-content`}
            id={`panel${category.id_categoria}-header`}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: {
                  sm: '1.5rem',
                  md: '1.7rem',
                },
              }}
              translate="no"
            >
              {category.nombre}
            </Typography>
          </CustomAccordionSummary>
          <CustomAccordionDetails>
            <SubcategoryAccordion
              categoryId={category.id_categoria}
              onProductClick={onProductClick}
              allProducts={products}
              productsLoading={isLoadingProducts}
            />
          </CustomAccordionDetails>
        </CustomAccordion>
      ))}
    </div>
  );
};

CategoryAccordion.propTypes = {
  onProductClick: PropTypes.func,
};

export default CategoryAccordion;
