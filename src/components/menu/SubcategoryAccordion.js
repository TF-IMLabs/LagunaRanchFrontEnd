import React, { useMemo, useRef, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useQuery } from '@tanstack/react-query';
import { getSubcategoriesByCategoryId, getAllProducts } from '../../services/menuService';
import ProductList from './ProductList';
import { styled } from '@mui/material/styles';

const CustomAccordion = styled(Accordion)(({ theme }) => ({
    borderRadius: '12px',
    backgroundColor: 'transparent',
    marginBottom: theme.spacing(2),
    boxShadow: 'none',
    '& .MuiSvgIcon-root': {
        color: '#fff',
    },
}));

const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '1.7rem',
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

const fetchSubcategoriesAndProducts = async (categoryId) => {
    const subcategoriesData = await getSubcategoriesByCategoryId(categoryId);
    const formattedSubcategories = Array.isArray(subcategoriesData) ? subcategoriesData : Object.values(subcategoriesData);

    const allProducts = await getAllProducts();
    
   
    const filteredProducts = allProducts.filter(product => 
        product.id_categoria === categoryId && product.stock > 0
    );

    return { subcategories: formattedSubcategories, products: filteredProducts };
};

const SubcategoryAccordion = ({ categoryId }) => {
    const [expanded, setExpanded] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['subcategoriesAndProducts', categoryId],
        queryFn: () => fetchSubcategoriesAndProducts(categoryId),
    });

    const accordionRefs = useRef({});

    const subcategories = useMemo(() => data?.subcategories || [], [data?.subcategories]);
    const products = useMemo(() => data?.products || [], [data?.products]);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);

        if (isExpanded) {
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

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error fetching data: {error.message}</p>;

    return (
        <div>
            {subcategories.length > 0 ? (
                subcategories.map((subcategory) => {
                    const panelId = `panel-${subcategory.id_subcategoria}`;
                    
                    
                    const productsForSubcategory = products.filter(product => product.id_subcategoria === subcategory.id_subcategoria);

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
                                
                                <ProductList subcategoryId={subcategory.id_subcategoria} products={productsForSubcategory} />
                            </CustomAccordionDetails>
                        </CustomAccordion>
                    );
                })
            ) : (
                <ProductList products={products} />
            )}
        </div>
    );
};

export default SubcategoryAccordion;
