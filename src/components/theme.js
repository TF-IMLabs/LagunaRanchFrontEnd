import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: ' "Roboto","Verdana"', 
        h1: {
            fontFamily: ' "Roboto","Verdana"',
        },
        h2: {
            fontFamily: ' "Roboto","Verdana"',
        },
        h4: {
            fontFamily: ' "Roboto","Verdana"',
            color: '#DD98AD',
        },
        h5: {
            fontFamily: ' "Roboto", "Verdana"',
            color: '#DD98AD',
            fontSize: '1.4rem',
        },
        h5b: {
            fontFamily: ' "Roboto","Verdana"',
            color: 'black',
            fontSize: '1.4rem',
        },
        h6: {
            fontFamily: ' "Roboto","Verdana"',
            color: 'white',
            fontSize: '1.2rem',
        },
        h6b: {
            fontFamily: ' "Roboto","Verdana"',
            color: 'black',
            fontSize: '1.2rem',
        },
    },
});

export default theme;
