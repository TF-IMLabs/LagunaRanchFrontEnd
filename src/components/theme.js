import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: ' "Roboto", "Helvetica", "Arial", sans-serif', // Define the main font as Cambria
        h1: {
            fontFamily: ' "Roboto", "Helvetica", "Arial", sans-serif',
        },
        h2: {
            fontFamily: ' "Roboto", "Helvetica", "Arial", sans-serif',
        },
        h4: {
            fontFamily: ' "Roboto", "Helvetica", "Arial", sans-serif',
            color: '#DD98AD',
        },
        h5: {
            fontFamily: ' "Roboto", "Helvetica", "Arial", sans-serif',
            color: '#DD98AD',
            fontSize: '1.4rem',
        },
        h5b: {
            fontFamily: ' "Roboto", "Helvetica", "Arial", sans-serif',
            color: 'black',
            fontSize: '1.4rem',
        },
        h6: {
            fontFamily: ' "Roboto", "Helvetica", "Arial", sans-serif',
            color: 'white',
            fontSize: '1.2rem',
        },
        h6b: {
            fontFamily: ' "Roboto", "Helvetica", "Arial", sans-serif',
            color: 'black',
            fontSize: '1.2rem',
        },
    },
});

export default theme;
