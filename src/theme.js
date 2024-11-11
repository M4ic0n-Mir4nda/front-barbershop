import { createTheme } from '@mui/material/styles';
import '@fontsource/manjari';
import '@fontsource/marcellus';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Manjari',
      'sans-serif',
      'Marcellus'
    ].join(','),
  },
});

export default theme;