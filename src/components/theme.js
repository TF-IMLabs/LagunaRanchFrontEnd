import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: '"Cambria", "Roboto", "Helvetica", "Arial", sans-serif', // Define the main font as Cambria
        h1: {
            fontFamily: '"Cambria", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        h2: {
            fontFamily: '"Cambria", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        h4: {
            fontFamily: '"Cambria", "Roboto", "Helvetica", "Arial", sans-serif',
            color: '#DD98AD',
        },
        h5: {
            fontFamily: '"Cambria", "Roboto", "Helvetica", "Arial", sans-serif',
            color: '#DD98AD',
            fontSize: '1.4rem',
        },
        h5b: {
            fontFamily: '"Cambria", "Roboto", "Helvetica", "Arial", sans-serif',
            color: 'black',
            fontSize: '1.4rem',
        },
        h6: {
            fontFamily: '"Cambria", "Roboto", "Helvetica", "Arial", sans-serif',
            color: 'white',
            fontSize: '1.2rem',
        },
        h6b: {
            fontFamily: '"Cambria", "Roboto", "Helvetica", "Arial", sans-serif',
            color: 'black',
            fontSize: '1.2rem',
        },
    },
});

export default theme;
