import React, { Fragment } from 'react';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppsIcon from '@material-ui/icons/Apps';
import PeopleIcon from '@material-ui/icons/People';
import SettingsIcon from '@material-ui/icons/Settings';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import AssessmentIcon from '@material-ui/icons/Assessment';
import GradeIcon from '@material-ui/icons/Grade';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import EventIcon from '@material-ui/icons/Event';
import SchoolIcon from '@material-ui/icons/School';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import AssignmentIcon from '@material-ui/icons/Assignment';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import PersonIcon from '@material-ui/icons/Person';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import { useHistory, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import grey from '@material-ui/core/colors/grey';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { useSelector } from 'react-redux';
import { hasAnyRole, isStudent } from '../../data/appRoles';
import { navBackgroundColor } from './styles';
import { appPermissions, localRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { hasValue } from '../inputs/inputHelpers';

interface IAppRoute {
  requiredRoles?: string[];
  name: string;
  route?: string;
  icon?: any;
  items?: IAppRoute[];
}

const studentRoutes: IAppRoute[] = [
  {
    name: 'Dashboard',
    route: localRoutes.dashboard,
    icon: AppsIcon,
  },
  {
    name: 'Course Catalog',
    route: localRoutes.catalog,
    icon: LibraryBooksIcon,
  },
  {
    name: 'My Courses',
    route: localRoutes.myCourses,
    icon: SchoolIcon,
  },
  {
    name: 'My Classes',
    route: localRoutes.myClasses,
    icon: EventIcon,
  },
  {
    name: 'Assignments',
    route: localRoutes.myAssignments,
    icon: AssignmentIcon,
  },
  {
    name: 'My Progress',
    route: localRoutes.myProgress,
    icon: TrendingUpIcon,
  },
  {
    name: 'My Profile',
    route: localRoutes.myProfile,
    icon: PersonIcon,
  },
  {
    name: 'Help',
    route: localRoutes.help,
    icon: HelpOutlineIcon,
  },
];

const staffRoutes: IAppRoute[] = [
  {
    name: 'Dashboard',
    route: localRoutes.dashboard,
    icon: AppsIcon,
  },
  {
    requiredRoles: [
      appPermissions.roleStudentView,
      appPermissions.roleStudentEdit,
    ],
    name: 'Students',
    route: localRoutes.students,
    icon: PeopleIcon,
  },
  {
    requiredRoles: [
      appPermissions.roleCourseView,
      appPermissions.roleCourseEdit,
    ],
    name: 'Courses',
    route: localRoutes.adminCourses,
    icon: BubbleChartIcon,
  },
  {
    requiredRoles: [
      appPermissions.roleCourseEdit,
      appPermissions.roleCourseView,
    ],
    name: 'Announcements',
    route: localRoutes.adminAnnouncements,
    icon: NotificationsActiveIcon,
  },
  {
    requiredRoles: [appPermissions.roleReportView],
    name: 'Reports',
    route: localRoutes.reports,
    icon: AssessmentIcon,
  },
  {
    requiredRoles: [appPermissions.roleClassView, appPermissions.roleClassEdit],
    name: 'Attendance',
    route: localRoutes.attendance,
    icon: HowToRegIcon,
  },
  {
    requiredRoles: [appPermissions.roleClassView, appPermissions.roleClassEdit],
    name: 'Exams',
    route: localRoutes.exams,
    icon: GradeIcon,
  },
  {
    requiredRoles: [appPermissions.roleClassView, appPermissions.roleClassEdit],
    name: 'Assignments',
    route: localRoutes.teacherAssignments,
    icon: PlaylistAddCheckIcon,
  },
  {
    requiredRoles: [appPermissions.roleUserView, appPermissions.roleUserEdit],
    name: 'Admin',
    route: localRoutes.settings,
    icon: SettingsIcon,
    items: [
      { name: 'Manage Users', route: localRoutes.users },
      { name: 'Manage Courses', route: localRoutes.adminCourses },
      { name: 'Course Categories', route: localRoutes.courseCategories },
      { name: 'Class Categories', route: localRoutes.classCategories },
      { name: 'Class Fields', route: localRoutes.reportCategories },
      { name: 'Hub Management', route: localRoutes.hubs },
      { name: 'Settings', route: localRoutes.settings },
      { name: 'Manage Help', route: localRoutes.manageHelp },
    ],
  },
  {
    name: 'Help',
    route: localRoutes.help,
    icon: HelpOutlineIcon,
  },
];
const menBackgroundColor = 'rgba(255,255,255,0.08)';
const selectedColor = 'rgba(254,58,106,0.18)';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    logoHolder: {
      height: 100,
      padding: theme.spacing(0, 2),
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    logoText: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontWeight: 800,
      fontSize: '17px',
      color: 'white',
      letterSpacing: '-0.4px',
      lineHeight: 1.2,
      margin: 0,
    },
    logoAccent: {
      display: 'block',
      fontSize: '11px',
      fontWeight: 400,
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      marginTop: 2,
    },
    logoGradientBar: {
      width: 32,
      height: 3,
      borderRadius: 4,
      background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
      marginBottom: 8,
    },
    whiteText: {
      color: 'rgba(255,255,255,0.85)',
      '& span': {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 500,
        fontSize: '13px',
      },
    },
    selectedText: {
      color: '#ffffff',
      '& span': {
        fontWeight: 600,
      },
    },
    menuItem: {
      borderRadius: 8,
      margin: '2px 8px',
      width: 'calc(100% - 16px)',
      '&:hover': {
        backgroundColor: menBackgroundColor,
      },
    },
    selectedItem: {
      backgroundColor: `${selectedColor} !important`,
      borderRadius: 8,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    iconWrapper: {
      minWidth: 36,
      color: 'rgba(255,255,255,0.6)',
    },
    selectedIcon: {
      color: '#fe3a6a',
    },
  }),
);

const StyledListItem = withStyles({
  root: {
    '&$selected': {
      backgroundColor: selectedColor,
    },
    '&$selected:hover': {
      backgroundColor: selectedColor,
    },
  },
  selected: {},
})(ListItem);

const NavMenu = (props: any) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [open, setOpen] = React.useState<any>({});
  const user = useSelector((state: IState) => state.core.user);
  const handleMenuClick = (name: string) => () => {
    const menuData = { ...open, [name]: !open[name] };
    setOpen(menuData);
  };

  const onClick = (path: string) => () => {
    const { onClose } = props;
    history.push(path);
    if (onClose) onClose();
  };
  const pathMatches = (path: string, str: string) => path.indexOf(str) > -1;

  const isSelected = (pathStr: string): boolean => {
    const { pathname } = location;
    return pathMatches(pathname, pathStr);
  };

  const cleanRoutes = (r: IAppRoute[]) =>
    r.filter((it) => {
      let { items } = it;
      if (items && hasValue(items)) {
        items = cleanRoutes(items);
      }
      return it.requiredRoles ? hasAnyRole(user, it.requiredRoles) : true;
    });

  const activeRoutes = isStudent(user) ? studentRoutes : staffRoutes;
  const finalRoutes = cleanRoutes(activeRoutes);

  return (
    <div style={{ backgroundColor: '#1f2025', height: '100%' }}>
      {/* Logo */}
      <Grid
        className={classes.logoHolder}
        container
        spacing={0}
        alignContent="center"
        alignItems="center"
        style={{ padding: '0 20px' }}
      >
        <div>
          <div className={classes.logoGradientBar} />
          <p className={classes.logoText}>
            Elevate Academy
            <span className={classes.logoAccent}>Digital Skills Platform</span>
          </p>
        </div>
      </Grid>

      <List style={{ paddingTop: 8 }}>
        {finalRoutes.map((it) => {
          const Icon = it.icon;
          const selected = isSelected(it.route || it.name.toLowerCase());
          if (it.items) {
            return (
              <Fragment key={it.name}>
                <StyledListItem
                  button
                  onClick={handleMenuClick(it.name)}
                  className={classes.menuItem}
                >
                  <ListItemIcon
                    className={
                      selected ? classes.selectedIcon : classes.iconWrapper
                    }
                  >
                    <Icon style={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={it.name}
                    className={
                      selected ? classes.selectedText : classes.whiteText
                    }
                  />
                  {open[it.name] ? (
                    <ExpandLess
                      style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}
                    />
                  ) : (
                    <ExpandMore
                      style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }}
                    />
                  )}
                </StyledListItem>
                <Collapse
                  in={open[it.name] || isSelected(it.name.toLocaleLowerCase())}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {it.items.map((ch) => (
                      <StyledListItem
                        button
                        onClick={onClick(ch.route!)}
                        selected={isSelected(ch.route!)}
                        key={ch.name}
                        classes={{ selected: classes.selectedItem }}
                        style={{
                          borderRadius: 8,
                          margin: '2px 8px',
                          width: 'calc(100% - 16px)',
                        }}
                      >
                        <ListItemText
                          inset
                          primary={ch.name}
                          className={
                            isSelected(ch.route!)
                              ? classes.selectedText
                              : classes.whiteText
                          }
                        />
                      </StyledListItem>
                    ))}
                  </List>
                </Collapse>
              </Fragment>
            );
          }
          return (
            <StyledListItem
              button
              onClick={onClick(it.route!)}
              selected={selected}
              key={it.name}
              className={classes.menuItem}
              classes={{ selected: classes.selectedItem }}
            >
              <ListItemIcon
                className={
                  selected ? classes.selectedIcon : classes.iconWrapper
                }
              >
                <Icon style={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={it.name}
                className={selected ? classes.selectedText : classes.whiteText}
              />
            </StyledListItem>
          );
        })}
      </List>
    </div>
  );
};

export default NavMenu;
