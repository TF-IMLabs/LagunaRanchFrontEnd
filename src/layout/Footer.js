
import { Container, Typography, IconButton, Grid} from '@mui/material';
import { Facebook, Instagram, Phone, LocationOn } from '@mui/icons-material';
import { styled } from '@mui/system';

const FooterContainer = styled('footer')(({ theme }) => ({
  backgroundColor: 'black',
  color: '#c96b21',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(2),
  borderTop: `2px solid #c96b21`,
}));

const FooterContent = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#c96b21',
  marginBottom: theme.spacing(1),
}));

const InfoRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 4,
});

const SocialIcons = styled('div')({
  display: 'flex',
  gap: 16,
});

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#1a1a1a',
  border: `1px solid #c96b21`,
  transition: 'transform 0.3s ease, background-color 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: '#c96b21',
    color: 'black',
  },
  '& svg': {
    color: '#c96b21',
  },
}));

const Rights = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: 'center',
  fontSize: '0.8rem',
  color: '#888',
}));

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <SectionTitle variant="h6">Contáctanos</SectionTitle>
            <InfoRow>
              <StyledIconButton
                component="a"
                href="https://wa.me/5492364489575"
                target="_blank"
                aria-label="WhatsApp"
              >
                <Phone />
              </StyledIconButton>
              <Typography variant="body2">236 4444444</Typography>
            </InfoRow>
            <InfoRow>
              <StyledIconButton
                component="a"
                href="https://www.google.com.ar/maps/place/Le+Jardin+d'Amelie"
                target="_blank"
                aria-label="Ubicación"
              >
                <LocationOn />
              </StyledIconButton>
              <Typography variant="body2">Fake St. 123, Junín, BA</Typography>
            </InfoRow>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <SectionTitle variant="h6">Redes Sociales</SectionTitle>
            <SocialIcons>
              <StyledIconButton
                component="a"
                href="https://www.facebook.com/profile.php?id=100083276110577"
                target="_blank"
                aria-label="Facebook"
              >
                <Facebook />
              </StyledIconButton>
              <StyledIconButton
                component="a"
                href="https://www.instagram.com/le_jardin_d.amelie"
                target="_blank"
                aria-label="Instagram"
              >
                <Instagram />
              </StyledIconButton>
            </SocialIcons>
          </Grid>
        </Grid>

        <Rights>
          © {currentYear} AmelieApp. Todos los derechos reservados. Desarrollado por TF&IMLabs
        </Rights>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
