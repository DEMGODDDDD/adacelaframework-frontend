import { createTheme } from '@mui/material/styles';

const aquaticsTheme = createTheme({
  palette: {
    primary: {
      main: '#0B3C65',
      light: '#1A9CC8',
      dark: '#07294A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1A9CC8',
      light: '#27AED2',
      dark: '#137BA3',
      contrastText: '#FFFFFF',
    },
    accent: {
      main: '#27AED2',
      light: '#AFE4F6',
      dark: '#1D8BAE',
      contrastText: '#0B3C65',
    },
    background: {
      default: '#F0F8FC',
      paper: '#FFFFFF',
      gradient: 'linear-gradient(135deg, #0B3C65 0%, #1A9CC8 55%, #27AED2 100%)',
      gradientLight: 'linear-gradient(135deg, #FFFFFF 0%, #F0F8FC 42%, #AFE4F6 100%)',
      gradientDark: 'linear-gradient(135deg, #07294A 0%, #0B3C65 60%, #137BA3 100%)',
      underwater: 'linear-gradient(135deg, #0B3C65 0%, #1A9CC8 48%, #27AED2 78%, #AFE4F6 100%)',
    },
    text: {
      primary: '#0B3C65',
      secondary: '#476B7F',
      disabled: '#8DB9C8',
    },
    divider: '#B8E2EE',
    action: {
      hover: 'rgba(26, 156, 200, 0.08)',
      selected: 'rgba(26, 156, 200, 0.16)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      lineHeight: 1.1,
      color: '#0B3C65',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#0B3C65',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#0B3C65',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#0B3C65',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#0B3C65',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#0B3C65',
    },
    subtitle1: {
      fontSize: '1.125rem',
      color: '#476B7F',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#0B3C65',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#476B7F',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.9375rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(11, 60, 101, 0.08)',
    '0 8px 24px rgba(11, 60, 101, 0.10)',
    '0 12px 32px rgba(11, 60, 101, 0.13)',
    '0 16px 40px rgba(11, 60, 101, 0.16)',
    '0 20px 56px rgba(11, 60, 101, 0.18)',
    ...Array(19).fill('0 20px 56px rgba(11, 60, 101, 0.18)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 22px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 18px rgba(11, 60, 101, 0.18)',
          },
          transition: 'background-color 0.18s ease, box-shadow 0.18s ease',
        },
        containedPrimary: {
          background: '#0B3C65',
          '&:hover': {
            background: '#07294A',
          },
        },
        containedSecondary: {
          background: '#1A9CC8',
          '&:hover': {
            background: '#137BA3',
          },
        },
        outlinedPrimary: {
          borderWidth: 1,
          borderColor: '#A9DDEB',
          color: '#0B3C65',
          '&:hover': {
            borderWidth: 1,
            backgroundColor: '#F0F8FC',
          },
        },
        sizeSmall: {
          padding: '8px 20px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '16px 36px',
          fontSize: '1.0625rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#A9DDEB',
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: '#1A9CC8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0B3C65',
              borderWidth: 1,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#476B7F',
            '&.Mui-focused': {
              color: '#0B3C65',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #B8E2EE',
          boxShadow: '0 8px 24px rgba(11, 60, 101, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(11, 60, 101, 0.08)',
        },
        elevation3: {
          boxShadow: '0 12px 32px rgba(11, 60, 101, 0.12)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          minHeight: 48,
          color: '#476B7F',
          '&.Mui-selected': {
            color: '#0B3C65',
            fontWeight: 700,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 4,
          borderRadius: '4px 4px 0 0',
          background: '#1A9CC8',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: '#E7F8FC',
          color: '#0B3C65',
        },
        standardError: {
          backgroundColor: '#FEF2F2',
          color: '#B91C1C',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '1px solid #B8E2EE',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          padding: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #B8E2EE',
          background: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#0B3C65',
          boxShadow: '0 4px 16px rgba(11, 60, 101, 0.14)',
        },
      },
    },
  },
});

export default aquaticsTheme;
