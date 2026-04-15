import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import Toolbar from '@material-ui/core/Toolbar';
import { Typography } from '@material-ui/core';
import { BarView } from '../Profile';
import { useStyles } from './styles';
import NavMenu from './NavMenu';
import NotificationBell from './NotificationBell';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IState } from '../../data/types';
import { isStudent, isTrainer } from '../../data/appRoles';
import { localRoutes } from '../../data/constants';

interface IProps {
  title?: string;
  children?: any;
  mobilePadding?: boolean;
}

function Layout(props: IProps) {
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const user = useSelector((state: IState) => state.core.user);
  const student = isStudent(user);
  const trainer = isTrainer(user);
  const history = useHistory();

  function handleDrawerToggle() {
    setMobileOpen(!mobileOpen);
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar} color="default">
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>

          {student ? (
            <div style={{ flexGrow: 1 }}>
              <Typography
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#1f2025',
                  lineHeight: 1.2,
                }}
              >
                {user?.fullName}
              </Typography>
              <Typography
                style={{ fontSize: 11, color: '#8a8f99', lineHeight: 1 }}
              >
                Student Portal
              </Typography>
            </div>
          ) : trainer ? (
            <div style={{ flexGrow: 1 }}>
              <Typography
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#1f2025',
                  lineHeight: 1.2,
                }}
              >
                {user?.fullName}
              </Typography>
              <Typography
                style={{ fontSize: 11, color: '#8a8f99', lineHeight: 1 }}
              >
                {user?.contactId ? `ID: ${user.contactId} · ` : ''}Instructor
              </Typography>
            </div>
          ) : (
            <Typography variant="h6" noWrap className={classes.title}>
              {props.title}
            </Typography>
          )}

          <NotificationBell />

          {!student && !trainer && (
            <IconButton
              size="small"
              style={{ color: '#8a8f99', marginRight: 4 }}
              onClick={() => history.push(localRoutes.attendance)}
              title="Attendance"
            >
              <HowToRegIcon style={{ fontSize: 22 }} />
            </IconButton>
          )}

          <BarView />
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{ paper: classes.drawerPaper }}
            ModalProps={{ keepMounted: true }}
          >
            <NavMenu onClose={handleDrawerToggle} />
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            classes={{ paper: classes.drawerPaper }}
            variant="permanent"
            open={false}
          >
            <NavMenu />
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <div className={classes.body}>{props.children}</div>
      </main>
    </div>
  );
}

export default Layout;
