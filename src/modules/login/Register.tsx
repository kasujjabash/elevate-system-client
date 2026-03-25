import React, { SyntheticEvent, useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import { Alert } from '@material-ui/lab';
import { useHistory } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import RegisterForm from './RegisterForm';
import { localRoutes } from '../../data/constants';
import { useLoginStyles } from './loginStyles';
import elevateLogo from '../../assets/images/elevate-logo.png';
import graduationPhoto from '../../assets/images/home-image.png';

const registerTheme = createMuiTheme({
  palette: {
    primary: { main: '#90A1B9', contrastText: '#fff' },
  },
  overrides: {
    MuiButton: {
      containedPrimary: {
        boxShadow: 'none',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 14,
        padding: '10px 28px',
        '&:hover': { boxShadow: 'none', backgroundColor: '#7a8fa8' },
      },
    },
    MuiOutlinedInput: {
      root: {
        borderRadius: 8,
        fontSize: 13,
        backgroundColor: '#fff',
        '&:hover $notchedOutline': { borderColor: 'rgba(0,0,0,0.35)' },
        '&.Mui-focused $notchedOutline': {
          borderColor: '#90A1B9',
          borderWidth: 1,
        },
      },
      notchedOutline: { borderColor: 'rgba(0,0,0,0.18)' },
      input: { padding: '13px 14px', fontSize: 13 },
    },
    MuiInputLabel: {
      outlined: {
        fontSize: 13,
        transform: 'translate(14px, 14px) scale(1)',
        '&.MuiInputLabel-shrink': {
          transform: 'translate(14px, -6px) scale(0.85)',
        },
      },
    },
    MuiSelect: {
      outlined: { padding: '13px 14px', fontSize: 13 },
    },
  },
});

export default function Register() {
  const classes = useLoginStyles();
  const history = useHistory();
  const [done, setDone] = useState<boolean>(false);

  function handleDone() {
    setDone(true);
  }

  function handleLogin(e: SyntheticEvent<any>) {
    e.preventDefault();
    history.push(localRoutes.login);
  }

  return (
    <div className={classes.container}>
      <CssBaseline />

      {/* Left — form panel (scrollable for long form) */}
      <div
        className={classes.leftPanel}
        style={{ justifyContent: 'flex-start', paddingTop: 48 }}
      >
        <div className={classes.formInner}>
          {/* Logo */}
          <div className={classes.logoWrap}>
            <img
              src={elevateLogo}
              alt="era92 elevate"
              className={classes.logoImg}
            />
          </div>

          <div className={classes.heading}>era92 elevate</div>
          <div className={classes.subheading}>Student Registration</div>

          <div className={classes.formLabel}>Create your account</div>

          {done && (
            <Alert
              severity="success"
              style={{ marginBottom: 24, borderRadius: 10 }}
            >
              Application received! Check your email for login instructions.
            </Alert>
          )}

          <ThemeProvider theme={registerTheme}>
            <RegisterForm data={{}} done={handleDone} />
          </ThemeProvider>

          <div
            style={{ marginTop: 24, paddingBottom: 48, textAlign: 'center' }}
          >
            <Link className={classes.link} onClick={handleLogin}>
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right — graduation photo */}
      <div className={classes.rightPanel}>
        <img
          src={graduationPhoto}
          alt="Graduates"
          className={classes.rightPhoto}
        />
      </div>
    </div>
  );
}
