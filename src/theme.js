import { createTheme } from '@mui/material/styles';

// Custom Theme (Pantry-like)
const theme = createTheme({
    palette: {
      primary: {
        main: '#8B4513', // Saddle Brown (wood-like color)
      },
      secondary: {
        main: '#F4A460', // Sandy Brown
      },
      background: {
        default: '#FFF8DC', // Cornsilk (light, warm background)
        paper: '#FFFAF0', // Floral White (slightly off-white for containers)
      },
      text: {
        primary: '#3E2723', // Dark Brown
        secondary: '#5D4037', // Brown
      },
    },
    typography: {
      fontFamily: '"Roboto Slab", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0 3px 5px 2px rgba(139, 69, 19, .15)',
          },
        },
      },
    },
  });

  export default theme;