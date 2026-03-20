import { makeStyles, Theme } from '@material-ui/core';
import createStyles from '@material-ui/core/styles/createStyles';

export const useLoginStyles = makeStyles((theme: Theme) =>
  createStyles({
    // Outer wrapper — full viewport, two columns
    container: {
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
    },

    // Left panel — form side
    leftPanel: {
      flex: '0 0 480px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: theme.spacing(6, 7),
      backgroundColor: '#ffffff',
      [theme.breakpoints.down('sm')]: {
        flex: 1,
        padding: theme.spacing(4, 3),
      },
    },

    // Right panel — brand/visual side
    rightPanel: {
      flex: 1,
      background: 'linear-gradient(135deg, #1f2025 0%, #2d2f38 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(6),
      position: 'relative',
      overflow: 'hidden',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },

    gradientOrb1: {
      position: 'absolute',
      width: 400,
      height: 400,
      borderRadius: '50%',
      background:
        'radial-gradient(circle, rgba(254,58,106,0.25) 0%, transparent 70%)',
      top: '-100px',
      right: '-100px',
      pointerEvents: 'none',
    },
    gradientOrb2: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: '50%',
      background:
        'radial-gradient(circle, rgba(254,140,69,0.2) 0%, transparent 70%)',
      bottom: '-80px',
      left: '-80px',
      pointerEvents: 'none',
    },

    rightContent: {
      position: 'relative',
      zIndex: 1,
      textAlign: 'center',
      maxWidth: 480,
    },

    rightBadge: {
      display: 'inline-block',
      background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
      color: '#fff',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      padding: '6px 16px',
      borderRadius: 40,
      marginBottom: theme.spacing(3),
    },

    rightHeading: {
      color: '#ffffff',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '40px',
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: '-0.5px',
      marginBottom: theme.spacing(2),
    },

    rightHeadingAccent: {
      background: 'linear-gradient(90deg, #fe3a6a, #fe8c45)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },

    rightSubtitle: {
      color: 'rgba(255,255,255,0.55)',
      fontSize: '15px',
      lineHeight: 1.7,
      marginBottom: theme.spacing(5),
    },

    statsRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: theme.spacing(4),
      marginTop: theme.spacing(4),
    },

    statItem: {
      textAlign: 'center',
    },

    statNumber: {
      color: '#ffffff',
      fontSize: '28px',
      fontWeight: 700,
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      lineHeight: 1,
    },

    statLabel: {
      color: 'rgba(255,255,255,0.45)',
      fontSize: '12px',
      marginTop: 4,
      letterSpacing: '0.3px',
    },

    statDivider: {
      width: 1,
      backgroundColor: 'rgba(255,255,255,0.1)',
      alignSelf: 'stretch',
    },

    // Left panel internals
    logoMark: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing(4),
    },

    logoMarkInner: {
      width: 16,
      height: 16,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.9)',
    },

    heading: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '28px',
      fontWeight: 700,
      color: '#1f2025',
      letterSpacing: '-0.5px',
      marginBottom: theme.spacing(0.5),
    },

    subheading: {
      fontSize: '14px',
      color: '#8a8f99',
      marginBottom: theme.spacing(4),
      fontWeight: 400,
    },

    demoBox: {
      backgroundColor: '#f8f7f5',
      border: '1px solid #ece9e4',
      borderRadius: 10,
      padding: theme.spacing(1.5, 2),
      marginBottom: theme.spacing(3),
    },

    demoTitle: {
      fontSize: '11px',
      fontWeight: 700,
      color: '#8a8f99',
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      marginBottom: 6,
    },

    demoRow: {
      fontSize: '12px',
      color: '#5a5e6b',
      lineHeight: 1.8,
    },

    form: {
      width: '100%',
    },

    fieldLabel: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#1f2025',
      marginBottom: 6,
      display: 'block',
    },

    submit: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
      padding: theme.spacing(1.5),
      fontSize: '15px',
      fontWeight: 700,
      borderRadius: 10,
      background:
        'linear-gradient(90deg, #fe3a6a 0%, #ff4a39 50%, #fe8c45 100%)',
      color: '#fff',
      boxShadow: 'none',
      '&:hover': {
        background:
          'linear-gradient(90deg, #d4183f 0%, #d93020 50%, #d4712e 100%)',
        boxShadow: '0 4px 20px rgba(254,58,106,0.35)',
      },
      '&:disabled': {
        background: '#e0e0e0',
        color: '#aaa',
      },
    },

    linkRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: theme.spacing(3),
      marginTop: theme.spacing(1),
    },

    link: {
      color: '#fe3a6a',
      fontSize: '13px',
      fontWeight: 500,
      textDecoration: 'none',
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline',
      },
    },

    // keep these for compat with other login pages
    main: { display: 'block' },
    paper: { display: 'block' },
    avatar: { display: 'none' },
    title: { display: 'none' },
    subtitle: { display: 'none' },
  }),
);
