import React, { useRef, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useQuery } from '@tanstack/react-query'; 
import { getAllCategories, getAllProducts } from '../../services/menuService'; 
import SubcategoryAccordion from './SubcategoryAccordion';
import ProductList from './ProductList'; 
import { styled } from '@mui/material/styles';


const CustomAccordion = styled(Accordion)(({ theme }) => ({
    borderRadius: '12px', 
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginBottom: theme.spacing(2), 
    boxShadow: 'none', 
    '& .MuiSvgIcon-root': {
        color: '#fff', 
    },
}));

const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    padding: theme.spacing(1.5, 2), 
    backgroundColor: 'transparent', 
    color: '#fff',
    borderRadius: '11px', 
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
    color: 'black',
    borderRadius: '12px', 
}));

const CategoryAccordion = ({ onProductClick }) => {
   
    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'], 
        queryFn: getAllCategories,
    });

    
    const { data: products = [], isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'], 
        queryFn: getAllProducts, 
    });

    const [expanded, setExpanded] = useState(false);
    const accordionRefs = useRef({});

   
    const handleChange = (panel) => (event, isExpanded) => {
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
        return <Typography>Cargando categorías y productos...</Typography>;
    }

    
    const dailyDishes = products.filter((product) => product.plato_del_dia === 1);

    return (
        <div>
           
            {dailyDishes.length > 0 && (
                <CustomAccordion
                    expanded={expanded === 'panelPlatoDelDia'}
                    onChange={handleChange('panelPlatoDelDia')}
                    ref={(el) => (accordionRefs.current['panelPlatoDelDia'] = el)}
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
                        
                        <ProductList products={dailyDishes} onAddToCart={onProductClick} />
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
                        />
                    </CustomAccordionDetails>
                </CustomAccordion>
            ))}
        </div>
    );
};

export default CategoryAccordion;
