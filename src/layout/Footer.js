import { Container, Typography, IconButton, Grid } from '@mui/material';
import { Facebook, Instagram, Phone, LocationOn } from '@mui/icons-material';
import { styled } from '@mui/system';
import { alpha } from '@mui/material/styles';

const FooterContainer = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.primary.main,
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(2),
  borderTop: `2px solid ${theme.palette.primary.main}`,
}));

const FooterContent = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

const InfoRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
}));

const SocialIcons = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  border: `1px solid ${theme.palette.primary.main}`,
  transition: 'transform 0.3s ease, background-color 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.default,
  },
  '& svg': {
    color: theme.palette.primary.main,
  },
}));

const Rights = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(4),
  textAlign: 'center',
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
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
              <Typography variant="body2" color="text.primary">
                236 4444444
              </Typography>
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
              <Typography variant="body2" color="text.primary">
                Fake St. 123, Junín, BA
              </Typography>
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
