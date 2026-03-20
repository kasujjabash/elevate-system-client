import React, { SyntheticEvent } from 'react';
import { Button } from '@material-ui/core';
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

function Login() {
  const classes = useLoginStyles();
  const dispatch = useDispatch();
  const history = useHistory();
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

      {/* Left — brand panel */}
      <div className={classes.rightPanel}>
        <div className={classes.gradientOrb1} />
        <div className={classes.gradientOrb2} />
        <div className={classes.rightContent}>
          <span className={classes.rightBadge}>Digital Skills Platform</span>
          <h2 className={classes.rightHeading}>
            Build skills that{' '}
            <span className={classes.rightHeadingAccent}>
              shape your future
            </span>
          </h2>
          <p className={classes.rightSubtitle}>
            Join thousands of learners across our hubs in Katanga, Kosovo,
            Jinja, Namayemba and Lyantode. Learn web development, design, video
            production and more.
          </p>
          <div className={classes.statsRow}>
            <div className={classes.statItem}>
              <div className={classes.statNumber}>5</div>
              <div className={classes.statLabel}>Hub Locations</div>
            </div>
            <div className={classes.statDivider} />
            <div className={classes.statItem}>
              <div className={classes.statNumber}>4+</div>
              <div className={classes.statLabel}>Courses</div>
            </div>
            <div className={classes.statDivider} />
            <div className={classes.statItem}>
              <div className={classes.statNumber}>100%</div>
              <div className={classes.statLabel}>Hands-on</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className={classes.leftPanel}>
        <div className={classes.logoMark}>
          <div className={classes.logoMarkInner} />
        </div>

        <h1 className={classes.heading}>Welcome back</h1>
        <p className={classes.subheading}>
          Sign in to your Elevate Academy account
        </p>

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
                label="Email address"
                autoComplete="off"
                margin="normal"
              />
              <XTextInput
                name="password"
                label="Password"
                autoComplete="off"
                margin="normal"
                isPassword
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className={classes.submit}
                disabled={formState.isSubmitting}
                disableElevation
              >
                {formState.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
              <div className={classes.linkRow}>
                <Link className={classes.link} onClick={handleForgotPassword}>
                  Forgot password?
                </Link>
                <Link className={classes.link} onClick={handleRegister}>
                  Create account
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;
