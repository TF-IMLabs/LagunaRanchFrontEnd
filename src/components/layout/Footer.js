import React from 'react';
import { Container, Typography, IconButton, Grid } from '@mui/material';
import { Facebook, Instagram, Phone, LocationOn } from '@mui/icons-material';
import { styled } from '@mui/system';


const FooterContainer = styled('footer')(({ theme }) => ({
  backgroundColor: 'black',
  padding: '10px 0',
  color: '#DD98AD',
  textAlign: 'center',
}));

const FooterContent = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}));

const Section = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', 
  marginBottom: '10px', 
  [theme.breakpoints.up('sm')]: {
    marginBottom: '0',
  },
}));

const SocialIcons = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column', 
  alignItems: 'center',
  '& svg': {
    color: '#DD98AD',
    fontSize: '2rem', 
    margin: '10px 0', 
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row', 
    '& svg': {
      margin: '0 5px', 
    },
  },
}));

const ContactInfo = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& a': {
    color: '#DD98AD',
    textDecoration: 'none',
    marginLeft: '3px', 
  },
  '& svg': {
    color: '#DD98AD',
  },
}));

const Rights = styled('div')(({ theme }) => ({
  fontSize: '0.75rem', 
}));

const Footer = () => {
  const currentYear = new Date().getFullYear(); 

  return (
    <FooterContainer data-test="footer-container">
      <FooterContent data-test="footer-content">
        <Section item xs={12} sm={6} data-test="contact-section">
          <Typography variant="h6" gutterBottom data-test="contact-title">
            Contáctanos!
          </Typography>
          <ContactInfo data-test="contact-info">
            <Typography variant="body1" data-test="contact-phone">
              <IconButton 
                component="a" 
                href="https://wa.me/2364489575" 
                target="_blank" 
                aria-label="WhatsApp" 
                data-test="whatsapp-icon"
              >
                <Phone />
              </IconButton>
              <a 
                href="https://wa.me/5492364489575" 
                target="_blank" 
                rel="noopener noreferrer" 
                data-test="whatsapp-link"
              >
                236 448 9575
              </a>
            </Typography>
          
            <Typography variant="body2" data-test="contact-address">
              <IconButton 
                component="a" 
                href="https://www.google.com.ar/maps/place/Le+Jardin+d'Amelie/@-34.593099,-60.943487,21z/data=!4m6!3m5!1s0x95b8ebd66e611deb:0x8437bfc19a75a9ed!8m2!3d-34.5930772!4d-60.9435899!16s%2Fg%2F11pvb5gnh3?entry=ttu&g_ep=EgoyMDI0MTEyNC4xIKXMDSoASAFQAw%3D%3D" 
                target="_blank" 
                aria-label="Address" 
                data-test="address-icon"
              >
                <LocationOn />
              </IconButton>
              <a 
                href="https://www.google.com.ar/maps/place/Le+Jardin+d'Amelie/@-34.593099,-60.943487,21z/data=!4m6!3m5!1s0x95b8ebd66e611deb:0x8437bfc19a75a9ed!8m2!3d-34.5930772!4d-60.9435899!16s%2Fg%2F11pvb5gnh3?entry=ttu&g_ep=EgoyMDI0MTEyNC4xIKXMDSoASAFQAw%3D%3D" 
                target="_blank" 
                rel="noopener noreferrer" 
                data-test="address-link"
              >
                Narbondo 34. Junín BA
              </a>
            </Typography>
          </ContactInfo>
        </Section>
        
        <Section item xs={12} sm={6} data-test="social-media-section">
          <Typography variant="h6" gutterBottom data-test="social-title">
            Redes Sociales
          </Typography>
          <SocialIcons data-test="social-icons">
            <IconButton 
              component="a" 
              href="https://www.facebook.com/profile.php?id=100083276110577" 
              target="_blank" 
              aria-label="Facebook" 
              data-test="facebook-icon"
            >
              <Facebook />
            </IconButton>
            <IconButton 
              component="a" 
              href="https://www.instagram.com/le_jardin_d.amelie" 
              target="_blank" 
              aria-label="Instagram" 
              data-test="instagram-icon"
            >
              <Instagram />
            </IconButton>
          </SocialIcons>
        </Section>
        
        <Rights item xs={12} data-test="rights-section">
          <Typography variant="caption" data-test="rights-text">
            © {currentYear} AmelieApp. Todos los derechos reservados. Developed by TF&IMLabs
          </Typography>
        </Rights>
      </FooterContent>
    </FooterContainer>
  );
  
};

export default Footer;
