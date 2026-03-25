import React, { SyntheticEvent, useState } from 'react';
import { Button, Checkbox, FormControlLabel } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Form, Formik, FormikHelpers } from 'formik';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';
import { useHistory } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import { handleLogin } from '../../data/coreActions';
import { post } from '../../utils/ajax';
import { localRoutes, remoteRoutes } from '../../data/constants';
import Toast from '../../utils/Toast';
import XTextInput from '../../components/inputs/XTextInput';
import { useLoginStyles } from './loginStyles';
import elevateLogo from '../../assets/images/elevate-logo.png';
import graduationPhoto from '../../assets/images/home-image.png';

function Login() {
  const classes = useLoginStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const [remember, setRemember] = useState(false);

  const schema = yup.object().shape({
    username: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required'),
  });

  const onSubmit = (data: any, actions: FormikHelpers<any>) => {
    post(
      remoteRoutes.login,
      { ...data, hubName: 'elevate' },
      (resp) => {
        dispatch(handleLogin(resp));
        Toast.success('Authentication success');
        history.push(localRoutes.dashboard);
      },
      () => {
        Toast.error('Authentication failed, invalid username/password');
        actions.setSubmitting(false);
      },
    );
  };

  function handleForgotPassword(e: SyntheticEvent<any>) {
    e.preventDefault();
    history.push(localRoutes.forgotPassword);
  }

  function handleRegister(e: SyntheticEvent<any>) {
    e.preventDefault();
    history.push(localRoutes.register);
  }

  return (
    <div className={classes.container}>
      <CssBaseline />

      {/* Left — form panel */}
      <div className={classes.leftPanel}>
        <div className={classes.formInner}>
          {/* Logo */}
          <div className={classes.logoWrap}>
            <img
              src={elevateLogo}
              alt="era92 elevate"
              className={classes.logoImg}
            />
          </div>

          {/* Brand text */}
          <div className={classes.heading}>era92 elevate</div>
          <div className={classes.subheading}>Student's Portal</div>

          <div className={classes.formLabel}>Enter your details to login</div>

          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={schema}
            onSubmit={onSubmit}
          >
            {(formState) => (
              <Form className={classes.form}>
                <XTextInput
                  type="email"
                  name="username"
                  label="email address"
                  autoComplete="off"
                  margin="normal"
                  variant="outlined"
                />
                <XTextInput
                  name="password"
                  label="Your password"
                  autoComplete="off"
                  margin="normal"
                  variant="outlined"
                  isPassword
                />

                <div className={classes.rememberRow}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        size="small"
                        style={{ color: '#5a6478', padding: '4px 8px 4px 0' }}
                      />
                    }
                    label={<span style={{ fontSize: 13 }}>Remember me</span>}
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className={classes.submit}
                  disabled={formState.isSubmitting}
                  disableElevation
                >
                  {formState.isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className={classes.linkRow}>
                  <Link className={classes.link} onClick={handleForgotPassword}>
                    Forgot password ?
                  </Link>
                </div>

                <Link className={classes.otherLink} onClick={handleRegister}>
                  Other Login User types
                </Link>
              </Form>
            )}
          </Formik>
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

export default Login;
