import React, { useRef, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useQuery } from '@tanstack/react-query'; 
import { getAllCategories, getAllProducts } from '../../services/menuService'; 
import SubcategoryAccordion from './SubcategoryAccordion';
import ProductList from './ProductList'; 
import { styled } from '@mui/material/styles';

// Estilos personalizados para Accordion
const CustomAccordion = styled(Accordion)(({ theme }) => ({
    borderRadius: '12px', 
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginBottom: theme.spacing(2), 
    boxShadow: 'none', 
    '& .MuiSvgIcon-root': {
        color: '#fff', 
    },
}));

// Estilos personalizados para AccordionSummary
const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    padding: theme.spacing(1.5, 2), // Padding para el encabezado del acordeón
    backgroundColor: 'transparent', // Color de fondo para el encabezado del acordeón
    color: '#fff', // Color del texto
    borderRadius: '11px', // Bordes redondeados solo en la parte superior
    display: 'flex', // Usar flexbox para centrar el texto
    alignItems: 'center', // Alinear verticalmente en el centro
    justifyContent: 'center', // Alinear horizontalmente en el centro
    textTransform: 'uppercase', // Convertir el texto a mayúsculas
    '& .MuiAccordionSummary-content': {
        justifyContent: 'center', // Centrar el contenido dentro de AccordionSummary
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
        justifyContent: 'center', // Centrar el icono de expansión (si es necesario)
    },
}));

// Estilos personalizados para AccordionDetails
const CustomAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2), // Padding para los detalles del acordeón
    backgroundColor: 'transparent', // Color de fondo para los detalles del acordeón
    color: 'black', // Color del texto
    borderRadius: '12px', // Bordes redondeados solo en la parte inferior
}));

const CategoryAccordion = ({ onProductClick }) => {
    // Usamos useQuery para cargar las categorías
    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'], // queryKey debe ser un array
        queryFn: getAllCategories, // queryFn es la función que realiza la consulta
    });

    // Usamos useQuery para cargar los productos
    const { data: products = [], isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'], // queryKey para los productos
        queryFn: getAllProducts, // queryFn es la función que realiza la consulta
    });

    const [expanded, setExpanded] = useState(false);
    const accordionRefs = useRef({});

    // Controlar la expansión del acordeón
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

    // Filtrar productos que son "Plato del Día"
    const dailyDishes = products.filter((product) => product.plato_del_dia === 1);

    return (
        <div>
            {/* Mostrar la categoría "Plato del Día" si hay productos */}
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
                                    sm: '1.5rem', // Tamaño de fuente en pantallas pequeñas
                                    md: '1.7rem', // Tamaño de fuente en pantallas medianas y mayores
                                },
                            }}
                        >
                            Plato del Día
                        </Typography>
                    </CustomAccordionSummary>
                    <CustomAccordionDetails>
                        {/* Mostrar los productos que son "Plato del Día" usando ProductList */}
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
                                    sm: '1.5rem', // Tamaño de fuente en pantallas pequeñas
                                    md: '1.7rem', // Tamaño de fuente en pantallas medianas y mayores
                                },
                            }}
                        >
                            {category.nombre}
                        </Typography>
                    </CustomAccordionSummary>
                    <CustomAccordionDetails>
                        {/* Mostrar SubcategoryAccordion si hay subcategorías */}
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
