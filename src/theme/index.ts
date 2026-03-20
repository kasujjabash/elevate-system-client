import { createMuiTheme } from '@material-ui/core/styles';
import responsiveFontSizes from '@material-ui/core/styles/responsiveFontSizes';
import palette from './palette';

const theme = createMuiTheme({
  palette,
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.15,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.25,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '-0.005em',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '0.9375rem',
      fontWeight: 500,
      letterSpacing: '-0.005em',
      lineHeight: 1.55,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.9375rem',
      fontWeight: 400,
      letterSpacing: '-0.005em',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0',
      lineHeight: 1.57,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      lineHeight: 2,
      textTransform: 'uppercase',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 10,
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: 0,
        padding: '8px 20px',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(254,58,106,0.3)',
        },
      },
      containedPrimary: {
        background:
          'linear-gradient(90deg, #fe3a6a 0%, #ff4a39 50%, #fe8c45 100%)',
        '&:hover': {
          background:
            'linear-gradient(90deg, #d4183f 0%, #d93020 50%, #d4712e 100%)',
        },
        '&:disabled': {
          background: '#e0e0e0',
        },
      },
      outlined: {
        borderWidth: '1.5px',
        '&:hover': {
          borderWidth: '1.5px',
        },
      },
    },
    MuiOutlinedInput: {
      root: {
        borderRadius: 8,
        fontSize: '0.9375rem',
        '& $notchedOutline': {
          borderColor: 'rgba(0,0,0,0.15)',
        },
        '&:hover $notchedOutline': {
          borderColor: 'rgba(0,0,0,0.3)',
        },
      },
    },
    MuiInputLabel: {
      outlined: {
        fontSize: '0.9375rem',
      },
    },
    MuiCard: {
      root: {
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      },
      elevation2: {
        boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.06)',
      },
      elevation4: {
        boxShadow: '0 8px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
      },
    },
    MuiChip: {
      root: {
        borderRadius: 6,
        fontSize: '0.8125rem',
        fontWeight: 500,
        height: 28,
      },
    },
    MuiAppBar: {
      root: {
        boxShadow: '0 1px 0 rgba(0,0,0,0.08)',
      },
      colorDefault: {
        backgroundColor: '#ffffff',
        color: '#1f2025',
      },
    },
    MuiToolbar: {
      regular: {
        minHeight: 60,
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: 'rgba(0,0,0,0.07)',
      },
    },
    MuiTableHead: {
      root: {
        '& th': {
          fontWeight: 600,
          fontSize: '0.8125rem',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          color: '#5a5e6b',
          backgroundColor: '#f8f7f5',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '10px 16px',
        },
      },
    },
    MuiTableCell: {
      root: {
        fontSize: '0.9rem',
        padding: '12px 16px',
        borderColor: 'rgba(0,0,0,0.06)',
      },
    },
    MuiListItem: {
      button: {
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,0.04)',
        },
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        letterSpacing: 0,
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: '0.8125rem',
        borderRadius: 6,
        padding: '6px 10px',
      },
    },
  },
});

export default responsiveFontSizes(theme);
