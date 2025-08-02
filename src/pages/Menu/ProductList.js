import React, { useState, useMemo } from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import vegetarianoIcon from '../../assets/vegetariano.png';
import celiacoIcon from '../../assets/celiaco.png';
import veganoIcon from '../../assets/vegano.png';
import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '../../services/menuService';
import ProductDialog from './ProductDialog';


const BlinkText = styled(Typography)(({ theme }) => ({
    color: '#c96b21', 
    fontSize: '0.9rem', 
    animation: 'blink-animation 1.5s ease-in-out infinite', 
    padding: theme.spacing(0.3, 0.8), 
    border: '1px solid rgba(0, 0, 0, 0.2)',
    borderRadius: '8px', 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
    textTransform: 'uppercase', 
    fontWeight: 'bold', 
    letterSpacing: '0.05em',
    display: 'inline-block', 
    justifyContent: 'flex-end',
    marginLeft: 'auto', 
    '@keyframes blink-animation': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.3 }, 
        '100%': { opacity: 1 },
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.8rem', 
        padding: theme.spacing(0.2, 0.5), 
    },
}));


const StyledListItem = styled(ListItem)(({ theme }) => ({
    backgroundColor: '#c78048',
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1), 
    },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    '& .MuiListItemText-primary': {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        display: 'flex',
        justifyContent: 'space-between', 
        textAlign: 'justify', 
        width: '100%', 
        [theme.breakpoints.down('sm')]: {
            fontSize: '1rem', 
        },
    },
    '& .MuiListItemText-secondary': {
        display: 'flex',
        justifyContent: 'space-between',
        color: '#000000',
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'justify', 
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.9rem', 
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
            return products.filter(product => product.stock > 0); 
        } else if (subcategoryId && allProducts.length > 0) {
            return allProducts
                .filter(product => product.id_subcategoria === subcategoryId && product.stock > 0);  
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
      translate="no"
  >
      
      {product.nombre}
  
      
      {renderIcons(product)} 
  
     
      {product.plato_del_dia === 1 && <BlinkText>Plato del Día!</BlinkText>}
  </Typography>
    }
    secondary={
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
       
        <Typography
          variant="body2"
          style={{
            color: '#3b3b3bfa',
            marginBottom: 4,
            textAlign: 'justify', 
          }}
        >
          {product.descripcion || ''}
        </Typography>
        
        <Typography
          variant="body2"
          color="black"
          style={{
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'flex-end', 
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
                    onAddToCart={onAddToCart} 
                />
            )}
        </>
    );
});

export default ProductList;
