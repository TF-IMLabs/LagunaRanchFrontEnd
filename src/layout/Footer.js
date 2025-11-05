import { Container, Typography, IconButton, Box, Stack } from '@mui/material';
import { Instagram, Phone, LocationOn } from '@mui/icons-material';
import { styled } from '@mui/system';
import { alpha } from '@mui/material/styles';

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
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  lineHeight: 1.4,
}));

const DividerLine = styled('span')(({ theme }) => ({
  display: 'block',
  width: '100%',
  height: 1,
  background: alpha(theme.palette.primary.main, 0.35),
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.75)}`,
  color: theme.palette.primary.main,
  transition: theme.transitions.create(['transform', 'background-color', 'border-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: alpha(theme.palette.primary.main, 0.16),
    borderColor: theme.palette.primary.main,
  },
}));

const Copyright = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: alpha(theme.palette.text.secondary, 0.85),
  letterSpacing: '0.04em',
}));

const Footer = () => (
  <FooterContainer>
    <FooterContent disableGutters>
      <Stack spacing={1.5} width="100%">
        <SectionTitle component="h6">Contactanos</SectionTitle>
        <InfoItem component="p">
          <Phone fontSize="small" />
          <Typography component="span" variant="body2" sx={{ fontSize: '0.85rem' }}>
            236 444 4444
          </Typography>
        </InfoItem>
        <InfoItem component="p">
          <LocationOn fontSize="small" />
          <Typography component="span" variant="body2" sx={{ fontSize: '0.85rem' }}>
            Hardbar, Junín, Buenos Aires
          </Typography>
        </InfoItem>
      </Stack>

      <DividerLine />

      <Stack spacing={1.5} alignItems="center" width="100%">
        <SectionTitle component="h6">Redes sociales</SectionTitle>
        <SocialButton
          component="a"
          href="https://www.instagram.com/lagunaranchjunin"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <Instagram />
        </SocialButton>
      </Stack>

      <DividerLine />

      <Copyright component="small">
        © 2025 Bar Laguna Ranch App. Desarrollado por TF&IMLabs.
      </Copyright>
    </FooterContent>
  </FooterContainer>
);

export default Footer;
