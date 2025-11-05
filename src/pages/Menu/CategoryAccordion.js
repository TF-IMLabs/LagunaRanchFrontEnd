import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { alpha, styled } from '@mui/material/styles';
import useMenuData from '../../hooks/useMenuData';
import ProductList from './ProductList';
import SubcategoryAccordion from './SubcategoryAccordion';

const HEADER_FALLBACK_HEIGHT = 88;
const COLLAPSE_DURATION = 320;

const getHeaderHeight = () => {
  const headerEl = document.querySelector('header.MuiAppBar-root');
  return headerEl ? headerEl.getBoundingClientRect().height : HEADER_FALLBACK_HEIGHT;
};

const scrollToWithOffset = (element) => {
  if (!element) return;
  const offset = getHeaderHeight() + 12;
  const top = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({
    top: top - offset,
    behavior: 'smooth',
  });
};

const CustomAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.background.default, 0.82),
  marginBottom: theme.spacing(1.5),
  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05)',
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  position: 'relative',
  overflow: 'hidden',
  scrollMarginTop: '110px',
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.contrastText,
  },
  '&.Mui-expanded': {
    boxShadow: '0 0 0 1px rgba(255, 140, 0, 0.36), 0 10px 26px rgba(0, 0, 0, 0.32)',
    transform: 'translateY(-2px)',
  },
}));

const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(1.1, 1.8),
  color: theme.palette.primary.contrastText,
  borderRadius: 11,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textTransform: 'uppercase',
  minHeight: 56,
  '&.Mui-expanded': {
    minHeight: 56,
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
  padding: theme.spacing(1.75, 2),
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  borderRadius: 12,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 1.25, 1.75),
  },
}));

const LoadingSkeleton = () => (
  <Box>
    {Array.from({ length: 3 }).map((_, index) => (
      <Skeleton
        key={`category-skeleton-${index}`}
        variant="rectangular"
        height={62}
        sx={{ mb: 1.5, borderRadius: 2 }}
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
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    if (isExpanded) {
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

  if (isLoadingCategories || isLoadingProducts) {
    return <LoadingSkeleton />;
  }

  const dailyDishes = products.filter((product) => product.plato_del_dia === 1);

  return (
    <Stack spacing={{ xs: 1.75, md: 2.5 }}>
      {dailyDishes.length > 0 && (
        <CustomAccordion
          expanded={expanded === 'panelPlatoDelDia'}
          onChange={handleChange('panelPlatoDelDia')}
          ref={(el) => {
            accordionRefs.current.panelPlatoDelDia = el;
          }}
        >
          <CustomAccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panelPlatoDelDia-content"
            id="panelPlatoDelDia-header"
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                letterSpacing: '0.08em',
                fontSize: 'clamp(1.05rem, 0.95rem + 0.5vw, 1.45rem)',
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
          ref={(el) => {
            accordionRefs.current[`panel${category.id_categoria}`] = el;
          }}
        >
          <CustomAccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${category.id_categoria}-content`}
            id={`panel${category.id_categoria}-header`}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                letterSpacing: '0.06em',
                fontSize: 'clamp(1.05rem, 0.96rem + 0.45vw, 1.4rem)',
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
    </Stack>
  );
};

CategoryAccordion.propTypes = {
  onProductClick: PropTypes.func,
};

export default CategoryAccordion;
