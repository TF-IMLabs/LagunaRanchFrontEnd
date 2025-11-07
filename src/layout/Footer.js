import { Container, Typography, IconButton, Box, Stack } from '@mui/material';
import { Instagram, LocationOn } from '@mui/icons-material';
import { styled } from '@mui/system';
import { alpha } from '@mui/material/styles';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const FooterContainer = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.primary.main,
  borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.45)}`,
  padding: theme.spacing(3, 2.5),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background:
      'linear-gradient(90deg, rgba(255, 140, 0, 0.4) 0%, rgba(255, 140, 0, 0.15) 50%, rgba(255, 140, 0, 0.4) 100%)',
    opacity: 0.9,
  },
}));

const FooterContent = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2.5),
  maxWidth: theme.breakpoints.values.sm,
  textAlign: 'center',
  padding: 0,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.95rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    display: 'none', // oculta títulos en móvil
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  lineHeight: 1.4,
  [theme.breakpoints.down('sm')]: {
    display: 'none', // oculta texto de contacto en móvil
  },
}));

const DividerLine = styled('span')(({ theme }) => ({
  display: 'block',
  width: '100%',
  height: 1,
  background: alpha(theme.palette.primary.main, 0.35),
  [theme.breakpoints.down('sm')]: {
    display: 'none', // sin líneas divisorias en móvil
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.75)}`,
  color: theme.palette.primary.main,
  transition: theme.transitions.create(['transform', 'color', 'border-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    transform: 'scale(1.1)',
  },
  [theme.breakpoints.down('sm')]: {
    width: 48,
    height: 48,
  },
}));

const Copyright = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: alpha(theme.palette.text.secondary, 0.85),
  letterSpacing: '0.04em',
  textAlign: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(1),
  },
}));

const MobileIconsRow = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(3),
    marginTop: theme.spacing(1),
  },
}));

const Footer = () => (
  <FooterContainer>
    <FooterContent disableGutters>
      {/* Desktop / Tablet version */}
      <Stack spacing={1.5} width="100%">
        <SectionTitle component="h6">Contactanos</SectionTitle>

        <InfoItem>
          <Typography
            component="a"
            href="https://wa.me/542364444444"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: '0.85rem',
              color: 'inherit',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              '&:hover': { color: '#25D366' },
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 18 }} />
            236 444 4444
          </Typography>
        </InfoItem>

        <InfoItem>
          <Typography
            component="a"
            href="https://www.google.com/maps/place/Hardbar/@-34.6582033,-61.0253525,21z"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: '0.85rem',
              color: 'inherit',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              '&:hover': { color: '#DB4437' },
            }}
          >
            <LocationOn sx={{ fontSize: 18 }} />
            Hardbar, Junín, Buenos Aires
          </Typography>
        </InfoItem>
      </Stack>

      <DividerLine />

      <Stack spacing={1.5} alignItems="center" width="100%">
        <SectionTitle component="h6">Redes sociales</SectionTitle>
        <InfoItem>
          <SocialButton
            component="a"
            href="https://www.instagram.com/lagunaranchjunin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            sx={{
              '&:hover': {
                background:
                  'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                color: '#fff',
                borderColor: 'transparent',
              },
            }}
          >
            <Instagram />
          </SocialButton>
        </InfoItem>
      </Stack>

      {/* Mobile-only version: solo los tres íconos */}
      <MobileIconsRow>
        <SocialButton
          component="a"
          href="https://wa.me/542364444444"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          sx={{
            '&:hover': { color: '#25D366', borderColor: '#25D366' },
          }}
        >
          <WhatsAppIcon />
        </SocialButton>

        <SocialButton
          component="a"
          href="https://www.google.com/maps/place/Hardbar/@-34.6582033,-61.0253525,21z"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ubicación"
          sx={{
            '&:hover': { color: '#DB4437', borderColor: '#DB4437' },
          }}
        >
          <LocationOn />
        </SocialButton>

        <SocialButton
          component="a"
          href="https://www.instagram.com/lagunaranchjunin"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          sx={{
            '&:hover': {
              background:
                'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
              color: '#fff',
              borderColor: 'transparent',
            },
          }}
        >
          <Instagram />
        </SocialButton>
      </MobileIconsRow>

      <DividerLine />

      <Copyright component="small">
        © 2025 Bar Laguna Ranch App. Desarrollado por TF&IMLabs.
      </Copyright>
    </FooterContent>
  </FooterContainer>
);

export default Footer;
