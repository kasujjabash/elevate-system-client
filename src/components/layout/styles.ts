import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { themeBackground } from '../../theme/custom-colors';

export const drawerWidth = 240;
export const navBackgroundColor = '#ffffff';
export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      height: '100%',
      width: '100%',
    },
    drawer: {
      backgroundColor: navBackgroundColor,
      [theme.breakpoints.up('md')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    appBar: {
      [theme.breakpoints.up('md')]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
      },
      backgroundColor: themeBackground,
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      boxShadow: 'none',
    },
    title: {
      flexGrow: 1,
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontWeight: 600,
      fontSize: '15px',
      color: '#1f2025',
      letterSpacing: '-0.01em',
    },
    menuButton: {
      color: '#5a5e6b',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    toolbar: {
      minHeight: 60,
    },
    drawerPaper: {
      width: drawerWidth,
      backgroundColor: 'transparent',
      borderRight: 'none',
    },
    content: {
      flexGrow: 1,
      height: '100%',
      minWidth: 0, // prevents flex children from overflowing
    },
    body: {
      backgroundColor: '#f7f8fa',
      padding: theme.spacing(3),
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
      },
      [theme.breakpoints.only('xs')]: {
        padding: theme.spacing(1.5),
      },
      height: 'calc(100% - 60px)',
      overflow: 'auto',
      borderRadius: 0,
      boxShadow: 'none',
    },
    bodyPadded: {
      backgroundColor: '#f5f4f2',
      padding: theme.spacing(3),
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
      },
      [theme.breakpoints.only('xs')]: {
        padding: theme.spacing(1.5),
      },
      height: 'calc(100% - 60px)',
      overflow: 'auto',
      borderRadius: 0,
      boxShadow: 'none',
    },
    logoHolder: {
      flexGrow: 1,
    },
    menu: {
      color: '#5a5e6b',
    },
    drawerOpen: {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: theme.spacing(7) + 1,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1,
      },
    },
  }),
);
