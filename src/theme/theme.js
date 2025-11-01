import { createTheme } from '@mui/material/styles';

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

const theme = createTheme({
  typography: {
    fontFamily: '"Josefin Sans", "Georgia", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h4: { fontWeight: 500, color: rawColors.brand },
    h5: { fontWeight: 500, color: rawColors.brand, fontSize: '1.4rem' },
    h6: { fontWeight: 500, color: rawColors.onDark, fontSize: '1.2rem' },
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
        contained: {
          backgroundColor: rawColors.brand,
          color: rawColors.onDark,
          borderColor: rawColors.brand,
          '&:hover': {
            backgroundColor: rawColors.brandDark,
            borderColor: rawColors.brandDark,
          },
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
          },
        },
      ],
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
        body2: {
          fontSize: '0.95rem',
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

export default theme;
