import { makeStyles, Theme } from '@material-ui/core';
import createStyles from '@material-ui/core/styles/createStyles';

export const useLoginStyles = makeStyles((theme: Theme) =>
  createStyles({
    // Outer wrapper — full viewport, two columns
    container: {
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '"Inter", "Plus Jakarta Sans", sans-serif',
    },

    // Left panel — form side (50% width), centers a max-width inner column
    leftPanel: {
      flex: '0 0 50%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(6, 4),
      backgroundColor: '#ffffff',
      overflowY: 'auto',
      [theme.breakpoints.down('sm')]: {
        flex: 1,
        padding: theme.spacing(4, 3),
      },
    },

    // Inner wrapper — constrains form width and adds side breathing room
    formInner: {
      width: '100%',
      maxWidth: 400,
    },

    // Right panel — graduation photo (50% width)
    rightPanel: {
      flex: '0 0 50%',
      position: 'relative',
      overflow: 'hidden',
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },

    // Photo fills the right panel
    rightPhoto: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover' as any,
      objectPosition: 'center top',
    },

    // Logo at top of form panel
    logoWrap: {
      marginBottom: theme.spacing(4),
    },
    logoImg: {
      height: 56,
    },

    // "era92 elevate" heading
    heading: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '20px',
      fontWeight: 700,
      color: '#1f2025',
      marginBottom: 4,
      letterSpacing: '-0.2px',
    },

    subheading: {
      fontSize: '13px',
      color: '#8a8f99',
      marginBottom: theme.spacing(4),
      fontWeight: 400,
    },

    // "Enter your details to login"
    formLabel: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#1f2025',
      marginBottom: theme.spacing(2.5),
    },

    form: {
      width: '100%',
      '& .MuiOutlinedInput-root': {
        borderRadius: 8,
        fontSize: 13,
        backgroundColor: '#fff',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0,0,0,0.18)',
      },
      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0,0,0,0.35)',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#90A1B9',
        borderWidth: 1,
      },
      // Keep label centred in the field until focused/filled
      '& .MuiInputLabel-outlined': {
        fontSize: 13,
        transform: 'translate(14px, 14px) scale(1)',
      },
      '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
        transform: 'translate(14px, -6px) scale(0.85)',
      },
      // Uniform input height & vertically centred text
      '& .MuiInputBase-input': {
        fontSize: 13,
        padding: '13px 14px',
      },
    },

    // Checkbox row
    rememberRow: {
      display: 'flex',
      alignItems: 'center',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2),
      fontSize: 13,
      color: '#5a5e6b',
    },

    submit: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2),
      padding: theme.spacing(1.4),
      fontSize: '14px',
      fontWeight: 600,
      borderRadius: 8,
      background: '#90A1B9',
      color: '#fff',
      boxShadow: 'none',
      letterSpacing: '0.3px',
      '&:hover': {
        background: '#7a8fa8',
        boxShadow: 'none',
      },
      '&:disabled': {
        background: '#c0c4cc',
        color: '#fff',
      },
    },

    // Override XForm's primary button + field borders on register page
    registerFormWrap: {
      // Submit button
      '& .MuiButton-containedPrimary': {
        backgroundColor: '#90A1B9 !important',
        boxShadow: 'none !important',
        borderRadius: '8px !important',
        fontWeight: 600,
        fontSize: 14,
        padding: '10px 28px',
        color: '#fff !important',
        '&:hover': {
          backgroundColor: '#7a8fa8 !important',
          boxShadow: 'none !important',
        },
        '&.Mui-disabled': {
          backgroundColor: '#c0c4cc !important',
        },
      },
      // Outlined input fields — uniform border + radius
      '& .MuiOutlinedInput-root': {
        borderRadius: 8,
        fontSize: 13,
        backgroundColor: '#fff',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0,0,0,0.18)',
      },
      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0,0,0,0.35)',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#90A1B9',
        borderWidth: 1,
      },
      '& .MuiInputLabel-outlined': {
        fontSize: 13,
        transform: 'translate(14px, 14px) scale(1)',
      },
      '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
        transform: 'translate(14px, -6px) scale(0.85)',
      },
      '& .MuiInputBase-input': {
        fontSize: 13,
        padding: '13px 14px',
      },
      '& .MuiSelect-outlined.MuiSelect-outlined': {
        padding: '13px 14px',
        fontSize: 13,
      },
      // Section divider labels
      '& .MuiTypography-caption': {
        fontSize: 11,
        fontWeight: 700,
        color: '#8a8f99',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      },
    },

    linkRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: theme.spacing(3),
      marginTop: theme.spacing(0.5),
    },

    link: {
      color: '#5a6478',
      fontSize: '13px',
      fontWeight: 500,
      textDecoration: 'none',
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline',
      },
    },

    otherLink: {
      color: '#b0b5bf',
      fontSize: '12px',
      fontWeight: 400,
      textDecoration: 'none',
      cursor: 'pointer',
      textAlign: 'center' as any,
      marginTop: theme.spacing(2),
      display: 'block',
      '&:hover': { textDecoration: 'underline' },
    },

    // ── Compat stubs (keep to avoid breaking other login-related pages) ──
    gradientOrb1: { display: 'none' },
    gradientOrb2: { display: 'none' },
    rightContent: { display: 'none' },
    rightBadge: { display: 'none' },
    rightHeading: { display: 'none' },
    rightHeadingAccent: {},
    rightSubtitle: { display: 'none' },
    statsRow: { display: 'none' },
    statItem: {},
    statNumber: {},
    statLabel: {},
    statDivider: {},
    logoMark: { display: 'none' },
    logoMarkInner: {},
    demoBox: { display: 'none' },
    demoTitle: {},
    demoRow: {},
    fieldLabel: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#1f2025',
    },
    main: { display: 'block' },
    paper: { display: 'block' },
    avatar: { display: 'none' },
    title: { display: 'none' },
    subtitle: { display: 'none' },
  }),
);
