import { alpha, createTheme, responsiveFontSizes } from '@mui/material/styles';

const rawColors = {
  brand: '#c96b21',
  brandDark: '#a6561a',
  brandMuted: '#3e2d1f',
  brandMutedDark: '#5a4030',
  highlight: '#c78048',
  neutral: '#d9c9a3',
  ink: '#121212',
  paper: '#1e1e1e',
  onDark: '#ffffff',
  onDarkSecondary: '#cccccc',
};

let theme = createTheme({
  spacing: 8,
  typography: {
    fontFamily: '"Josefin Sans", "Georgia", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    h1: {
      fontWeight: 600,
      fontSize: 'clamp(2.5rem, 2.1rem + 1.2vw, 3.5rem)',
    },
    h2: {
      fontWeight: 600,
      fontSize: 'clamp(2.1rem, 1.8rem + 0.8vw, 2.8rem)',
    },
    h3: {
      fontWeight: 600,
      fontSize: 'clamp(1.9rem, 1.6rem + 0.6vw, 2.4rem)',
    },
    h4: {
      fontWeight: 500,
      color: rawColors.brand,
      fontSize: 'clamp(1.5rem, 1.3rem + 0.5vw, 2rem)',
    },
    h5: {
      fontWeight: 500,
      color: rawColors.brand,
      fontSize: 'clamp(1.2rem, 1.1rem + 0.4vw, 1.6rem)',
    },
    h6: {
      fontWeight: 500,
      color: rawColors.onDark,
      fontSize: 'clamp(1rem, 0.95rem + 0.2vw, 1.25rem)',
    },
    body1: {
      fontWeight: 400,
      fontSize: 'clamp(0.95rem, 0.9rem + 0.2vw, 1.05rem)',
      lineHeight: 1.5,
    },
    body2: {
      fontWeight: 400,
      fontSize: 'clamp(0.88rem, 0.82rem + 0.18vw, 0.98rem)',
      lineHeight: 1.45,
    },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: rawColors.brand,
      contrastText: rawColors.onDark,
    },
    secondary: {
      main: rawColors.brandMuted,
      contrastText: rawColors.onDark,
    },
    accent: {
      main: rawColors.highlight,
      contrastText: rawColors.onDark,
    },
    neutral: {
      main: rawColors.neutral,
      contrastText: rawColors.ink,
    },
    background: {
      default: rawColors.ink,
      paper: rawColors.paper,
    },
    text: {
      primary: rawColors.onDark,
      secondary: rawColors.onDarkSecondary,
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          backgroundColor: rawColors.paper,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: rawColors.ink,
          color: rawColors.brand,
          fontWeight: 'bold',
          height: 60,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: 24,
          color: rawColors.onDarkSecondary,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 24,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          minHeight: 'clamp(44px, 5vh, 52px)',
          paddingBlock: 'clamp(0.45rem, 1.5vh, 0.7rem)',
          paddingInline: 'clamp(1.1rem, 4vw, 1.6rem)',
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'transform 160ms ease, box-shadow 160ms ease',
        },
        contained: {
          backgroundColor: rawColors.brand,
          color: rawColors.onDark,
          borderColor: rawColors.brand,
          boxShadow: '0 8px 18px rgba(0, 0, 0, 0.28)',
          transition: 'background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease',
          '&:hover': {
            backgroundColor: rawColors.brandDark,
            borderColor: rawColors.brandDark,
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.32)',
          },
          '&:active': {
            backgroundColor: rawColors.brandMutedDark,
            borderColor: rawColors.brandMutedDark,
            transform: 'translateY(0)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.28)',
          },
        },
        outlined: {
          borderColor: alpha(rawColors.brand, 0.55),
          color: rawColors.onDark,
          '&:hover': {
            borderColor: rawColors.brand,
            backgroundColor: alpha(rawColors.brand, 0.12),
          },
          '&:active': {
            borderColor: rawColors.brandDark,
            backgroundColor: alpha(rawColors.brand, 0.2),
          },
        },
        text: {
          paddingInline: 'clamp(1rem, 3vw, 1.4rem)',
        },
      },
      variants: [
        {
          props: { variant: 'close' },
          style: {
            minWidth: 0,
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: rawColors.brandMuted,
            color: rawColors.onDark,
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: rawColors.brandMutedDark,
            },
            '&:active': {
              backgroundColor: rawColors.brandMutedDark,
              transform: 'translateY(0)',
            },
          },
        },
        {
          props: { variant: 'iconAction' },
          style: {
            minWidth: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: rawColors.brand,
            color: rawColors.onDark,
            fontWeight: 'bold',
            fontSize: '1.2rem',
            lineHeight: 1,
            padding: 0,
            '&:hover': {
              backgroundColor: rawColors.brandDark,
            },
            '&:active': {
              backgroundColor: rawColors.brandMutedDark,
            },
          },
        },
      ],
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          marginTop: 12,
          marginBottom: 12,
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: rawColors.brandMuted,
            },
            '&:hover fieldset': {
              borderColor: rawColors.brand,
            },
            '&.Mui-focused fieldset': {
              borderColor: rawColors.brand,
            },
          },
          '& .MuiInputAdornment-root': {
            color: rawColors.brand,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: rawColors.paper,
          color: rawColors.onDark,
          borderRadius: 8,
          paddingLeft: 4,
        },
        input: {
          padding: 12,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        body1: {
          color: rawColors.onDarkSecondary,
        },
        body2: {
          color: rawColors.onDarkSecondary,
        },
      },
    },
    MuiStack: {
      defaultProps: {
        spacing: 2,
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
