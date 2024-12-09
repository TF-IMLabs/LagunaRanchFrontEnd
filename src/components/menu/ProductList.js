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
    animation: 'blink-animation 1.5s ease-in-out infinite', // Animación más suave
    padding: theme.spacing(0.3, 0.8), // Espaciado interno más balanceado
    border: '1px solid rgba(0, 0, 0, 0.2)', // Borde negro más suave
    borderRadius: '8px', // Bordes redondeados más suaves
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo más suave para resaltar el texto
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra más profesional y suave
    textTransform: 'uppercase', // Mayúsculas para dar estilo
    fontWeight: 'bold', // Texto más destacado
    letterSpacing: '0.05em', // Espaciado entre letras para mejorar la legibilidad
    display: 'inline-block', // Hace que el fondo se ajuste al tamaño del texto
    justifyContent: 'flex-end', // Alineación a la derecha
    marginLeft: 'auto', // Asegura que se coloque a la derecha sin ocupar espacio extra
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
        justifyContent: 'space-between', // Para separar iconos y nombre
        textAlign: 'justify', // Justifica el texto
        width: '100%', // Aseguramos que ocupe todo el ancho
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
        textAlign: 'justify', // Justificar la descripción
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
      <Typography
        component="span"
        variant="body1"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}
      >
        {/* Nombre del producto primero */}
        {product.nombre}

        {/* Ahora los iconos */}
        {renderIcons(product)} {/* Iconos alineados después del nombre */}

        {/* Condicional para mostrar "Plato del Día" */}
        {product.plato_del_dia === 1 && <BlinkText>Plato del Día!</BlinkText>}
      </Typography>
    }
    secondary={
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Descripción del producto */}
        <Typography
          variant="body2"
          style={{
            color: '#3b3b3bfa',
            marginBottom: 4,
            textAlign: 'justify', // Justifica la descripción
          }}
        >
          {product.descripcion || ''}
        </Typography>
        {/* Precio en negrita */}
        <Typography
          variant="body2"
          style={{
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'flex-end', // Alinea el precio a la derecha
          }}
        >
          <span>${product.precio}</span>
        </Typography>
      </div>
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
