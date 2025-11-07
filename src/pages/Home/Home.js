import React from 'react';
import { Container, Box } from '@mui/material';
import { styled } from '@mui/system';
import { alpha } from '@mui/material/styles';
import Slider from 'react-slick';
import images from '../../utils/imageLoader'; 
import logo from '../../assets/logoranch.png'; 
import background from '../../assets/backgroundandi2.png'; 


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


const MainContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.palette.neutral.main,
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
    filter: 'blur(2px)',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const ContentWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.85),
  width: '250px', 
  height: '250px', 
  borderRadius: '50%',
  display: 'flex', 
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)', 
}));

const LogoImage = styled('img')({
  width: '250px', 
  height: '250px', 
  borderRadius: '50%', 
  objectFit: 'cover', 
  display: 'block',
});



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
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ContentWrapper
        sx={{
          mt: { xs: 1, md: -1 },
          mb: { xs: 1, md: 4 },
          '@media (min-width:1024px)': {
            mt: -2,
            mb: 5,
          },
        }}
      >
        <LogoContainer>
          <LogoImage src={logo} alt="Andi Restaurante Logo" />
        </LogoContainer>
      </ContentWrapper>
      <CarouselContainer
        sx={{
          mt: { xs: 4, md: 6 },
          '@media (min-width:1024px)': {
            mt: 9,
          },
        }}
      >
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
