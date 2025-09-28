import { createTheme } from '@mui/material/styles';

// Define your custom color palette
const theme = createTheme({
  palette: {
    mode: 'light', // Can be 'light' or 'dark'
    primary: {
      main: '#1976d2', // A professional blue
    },
    secondary: {
      main: '#f57c00', // An energetic orange for accents
    },
    background: {
      default: '#f4f6f8', // A very light grey background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Softer, rounded corners for components
  },
  components: {
    // Override styles for specific components
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // More readable buttons
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // A subtle shadow for depth
            }
        }
    }
  },
});

export default theme;