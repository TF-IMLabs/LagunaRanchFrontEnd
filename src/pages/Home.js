import React from 'react';
import { Container, Box } from '@mui/material';
import { styled } from '@mui/system';
import Slider from 'react-slick';
import images from '../assets/imageLoader'; // Ajusta esta ruta según la estructura de tu proyecto
import logo from '../assets/amelie-logo-rosa.png'; // Ajusta esta ruta según la estructura de tu proyecto
import background from '../assets/background5.jpg'; // Importa la imagen de fondo

// Configuración del carrusel
const settings = {
  dots: false,
  infinite: true,
  speed: 1500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        arrows: false,
      },
    },
  ],
};

// Estilos personalizados
const MainContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: '#d9c9a3',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2.5),
  minHeight: '100vh',
  boxSizing: 'border-box',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.25),
  },
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'blur(6px)',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(5),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(155, 140, 141, 0.9)', // Gris traslúcido
  width: '250px', // Tamaño del contenedor igual al logo
  height: '250px', // Tamaño igual al ancho para mantener circularidad
  borderRadius: '50%', // Contenedor circular
  display: 'flex', // Centra el logo dentro del contenedor
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)', // Sombra
}));

const LogoImage = styled('img')({
  width: '250px', // El tamaño del logo coincide exactamente con el contenedor
  height: '250px', // Igual al contenedor para evitar bordes visibles
  borderRadius: '50%', // Hace que el logo también sea circular
  objectFit: 'cover', // Ajusta el logo para cubrir todo el contenedor
  display: 'block',
});


// Modificaciones para las imágenes del carrusel
const CarouselContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  height: '400px',
  overflow: 'hidden',
  '& .slick-slide': {
    height: '100%',
    padding: '0 10px',
  },
  '& .slick-track': {
    display: 'flex',
  },
  [theme.breakpoints.down('sm')]: {
    height: '300px',
  },
}));

const CarouselImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '350px',
  objectFit: 'cover',
  borderRadius: '8px',
  boxSizing: 'border-box',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  [theme.breakpoints.down('sm')]: {
    height: '250px',
  },
}));

const Home = () => (
  <MainContainer>
    <Container>
      <ContentWrapper>
        <LogoContainer>
          <LogoImage src={logo} alt="Andi Restaurante Logo" />
        </LogoContainer>
      </ContentWrapper>
      <CarouselContainer>
        <Slider {...settings}>
          {Object.values(images).map((src, index) => (
            <div key={index}>
              <CarouselImage src={src} alt={`Imagen ${index + 1}`} />
            </div>
          ))}
        </Slider>
      </CarouselContainer>
    </Container>
  </MainContainer>
);

export default Home;
