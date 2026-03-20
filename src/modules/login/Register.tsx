import React, { SyntheticEvent, useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import { useHistory } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import RegisterForm from './RegisterForm';
import { localRoutes } from '../../data/constants';
import { useLoginStyles } from './loginStyles';

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

      {/* Left — brand panel */}
      <div className={classes.rightPanel}>
        <div className={classes.gradientOrb1} />
        <div className={classes.gradientOrb2} />
        <div className={classes.rightContent}>
          <span className={classes.rightBadge}>Join Elevate Academy</span>
          <h2 className={classes.rightHeading}>
            Start your{' '}
            <span className={classes.rightHeadingAccent}>learning journey</span>
          </h2>
          <p className={classes.rightSubtitle}>
            Register today and gain access to world-class digital skills
            training across web development, design, video production and more.
            Hubs in Katanga, Kosovo, Jinja, Namayemba and Lyantode.
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
              <div className={classes.statNumber}>Free</div>
              <div className={classes.statLabel}>To Apply</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — form panel (scrollable for long form) */}
      <div
        className={classes.leftPanel}
        style={{
          overflowY: 'auto',
          justifyContent: 'flex-start',
          paddingTop: 48,
        }}
      >
        <div className={classes.logoMark}>
          <div className={classes.logoMarkInner} />
        </div>

        <h1 className={classes.heading}>Create your account</h1>
        <p className={classes.subheading}>
          Fill in your details to apply for Elevate Academy
        </p>

        {done && (
          <Alert
            severity="success"
            style={{ marginBottom: 24, borderRadius: 10 }}
          >
            Application received! Check your email for login instructions.
          </Alert>
        )}

        <RegisterForm data={{}} done={handleDone} />

        <div
          className={classes.linkRow}
          style={{ marginTop: 24, paddingBottom: 48 }}
        >
          <Link className={classes.link} onClick={handleLogin}>
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
