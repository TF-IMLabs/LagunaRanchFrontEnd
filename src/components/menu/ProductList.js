import React, { useState, useMemo } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import vegetarianoIcon from '../../assets/vegetariano.png';
import celiacoIcon from '../../assets/celiaco.png';
import veganoIcon from '../../assets/vegano.png';
import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '../../services/menuService';
import ProductDialog from '../dialogs/ProductDialog';

// Estilo para la etiqueta de "Plato del Día"
const BlinkText = styled(Typography)(({ theme }) => ({
    color: '#DD98AD', // Color principal
    fontSize: '0.9rem', // Tamaño de fuente ajustado para mejorar la legibilidad
    marginLeft: theme.spacing(1), // Espacio más equilibrado a la izquierda
    animation: 'blink-animation 1.5s ease-in-out infinite', // Animación más suave
    padding: theme.spacing(0.3, 0.8), // Espaciado interno más balanceado
    border: '1px solid rgba(0, 0, 0, 0.2)', // Borde negro más suave
    borderRadius: '8px', // Bordes redondeados más suaves
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo más suave para resaltar el texto
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra más profesional y suave
    textTransform: 'uppercase', // Mayúsculas para dar estilo
    fontWeight: 'bold', // Texto más destacado
    letterSpacing: '0.05em', // Espaciado entre letras para mejorar la legibilidad
    display: 'inline-block', // Asegura que se ajusta al contenido sin ocupar demasiado espacio
    '@keyframes blink-animation': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.3 }, // Más suave en el parpadeo
        '100%': { opacity: 1 },
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.8rem', // Tamaño de fuente más pequeño en dispositivos móviles
        padding: theme.spacing(0.2, 0.5), // Espaciado reducido en pantallas pequeñas
    },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    backgroundColor: '#9b8c8d',
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1), // Mayor espacio en pantallas pequeñas
    },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    '& .MuiListItemText-primary': {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        [theme.breakpoints.down('sm')]: {
            fontSize: '1rem', // Reducir tamaño de fuente en móviles
        },
    },
    '& .MuiListItemText-secondary': {
        display: 'flex',
        justifyContent: 'space-between',
        color: '#000000',
        fontWeight: 'bold',
        width: '100%',
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.9rem', // Reducir tamaño de fuente en móviles
        },
    },
}));

const ProductList = React.memo(({ subcategoryId, products, onAddToCart }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: allProducts = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: getAllProducts,
    });

    const productList = useMemo(() => {
        if (products && products.length > 0) {
            return products.filter(product => product.stock > 0);  // Solo productos con stock
        } else if (subcategoryId && allProducts.length > 0) {
            return allProducts
                .filter(product => product.id_subcategoria === subcategoryId && product.stock > 0);  // Filtrar también por stock en subcategoría
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
        return (
            <div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
                {product.vegetariano === 1 && <img src={vegetarianoIcon} alt="Vegetariano" style={{ width: 20, height: 20, marginRight: 4 }} />}
                {product.vegano === 1 && <img src={veganoIcon} alt="Vegano" style={{ width: 20, height: 20, marginRight: 4 }} />}
                {product.celiaco === 1 && <img src={celiacoIcon} alt="Celiaco" style={{ width: 20, height: 20, marginRight: 4 }} />}
            </div>
        );
    };

    if (isLoading) {
        return <Typography>Cargando productos...</Typography>;
    }

    return (
        <>
            <List>
                {productList.length > 0 ? (
                    productList.map((product) => (
                        <StyledListItem key={product.id_producto} onClick={() => handleClick(product)}>
                            <StyledListItemText
                                primary={
                                    <Typography component="span" variant="body1" style={{ display: 'flex', alignItems: 'center' }}>
                                        {renderIcons(product)}
                                        <span style={{ marginLeft: 8 }}>{product.nombre}</span>
                                        {product.plato_del_dia === 1 && <BlinkText>Plato del Día!</BlinkText>} {/* Etiqueta después del nombre */}
                                    </Typography>
                                }
                                secondary={
                                    <Typography component="span" variant="body2" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <span></span>
                                        <span>${product.precio}</span>
                                    </Typography>
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
                    onAddToCart={onAddToCart} // Usar la función que viene de MenuPage
                />
            )}
        </>
    );
});

export default ProductList;
