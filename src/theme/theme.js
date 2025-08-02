import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Josefin Sans", "Georgia", "Arial", sans-serif',
    h1: { fontFamily: 'inherit' },
    h2: { fontFamily: 'inherit' },
    h4: { fontFamily: 'inherit', color: '#c96b21' },
    h5: { fontFamily: 'inherit', color: '#c96b21', fontSize: '1.4rem' },
    h5b: { fontFamily: 'inherit', color: 'white', fontSize: '1.4rem' },
    h6: { fontFamily: 'inherit', color: 'white', fontSize: '1.2rem' },
    h6b: { fontFamily: 'inherit', color: 'white', fontSize: '1.2rem' },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#c96b21',
    },
    secondary: {
      main: '#3e2d1f',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
          color: '#c96b21',
          fontWeight: 'bold',
          height: '60px',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          color: '#ddd',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#fff',
          backgroundColor: '#000',
          borderColor: '#3e2d1f',
          '&:hover': {
            backgroundColor: '#3e2d1f',
            borderColor: '#c78048',
          },
        },
      },
      variants: [
        {
          props: { variant: 'close' },
          style: {
            minWidth: 0,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#3e2d1f',
            color: '#fff',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#5a4030',
            },
          },
        },
        {
          props: { variant: 'iconAction' },
          style: {
            minWidth: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#c96b21',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            lineHeight: 1,
            padding: 0,
            '&:hover': {
              backgroundColor: '#a6561a',
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
          marginTop: '12px',
          marginBottom: '12px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#3e2d1f',
            },
            '&:hover fieldset': {
              borderColor: '#c96b21',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#c96b21',
            },
          },
          '& .MuiInputAdornment-root': {
            color: '#c96b21',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          color: 'white',
          borderRadius: 8,
          paddingLeft: '4px',
        },
        input: {
          padding: '12px',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        body2: {
          fontSize: '0.95rem',
          color: '#cccccc',
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
