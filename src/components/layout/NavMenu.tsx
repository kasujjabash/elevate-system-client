import React, { Fragment } from 'react';
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
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import HomeIcon from '@material-ui/icons/Home';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import LiveTvIcon from '@material-ui/icons/LiveTv';
import DateRangeIcon from '@material-ui/icons/DateRange';
import ForumIcon from '@material-ui/icons/Forum';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { useHistory, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { hasAnyRole, isStudent } from '../../data/appRoles';
import { appPermissions, localRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { hasValue } from '../inputs/inputHelpers';
import { handleLogout } from '../../data/coreActions';
import elevateLogo from '../../assets/images/elevate-logo.png';

interface IAppRoute {
  requiredRoles?: string[];
  name: string;
  route?: string;
  icon?: any;
  items?: IAppRoute[];
}

const studentRoutes: IAppRoute[] = [
  { name: 'Home', route: localRoutes.dashboard, icon: HomeIcon },
  { name: 'My Modules', route: localRoutes.myCourses, icon: MenuBookIcon },
  {
    name: 'Courses',
    route: localRoutes.studentCourses,
    icon: LibraryBooksIcon,
  },
  { name: 'Live Classes', route: localRoutes.myClasses, icon: LiveTvIcon },
  { name: 'My Timetable', route: localRoutes.myTimetable, icon: DateRangeIcon },
  {
    name: 'Assessments',
    route: localRoutes.myAssessments,
    icon: AssessmentIcon,
  },
  {
    name: 'Chats / Inquiries',
    route: localRoutes.chatsInquiries,
    icon: ForumIcon,
  },
  {
    name: 'Requests & Applications',
    route: localRoutes.myRequests,
    icon: AssignmentTurnedInIcon,
  },
  {
    name: 'Workshops & Podcasts',
    route: localRoutes.workshops,
    icon: PlayCircleOutlineIcon,
  },
];

const staffRoutes: IAppRoute[] = [
  { name: 'Dashboard', route: localRoutes.dashboard, icon: AppsIcon },
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
  { name: 'Help', route: localRoutes.help, icon: HelpOutlineIcon },
];

const selectedBg = 'rgba(254,58,106,0.07)';

const useStyles = makeStyles((_theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: '#ffffff',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(0,0,0,0.06)',
    },
    logoHolder: {
      height: 80,
      padding: '0 20px',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
    },
    logoImg: { height: 34, objectFit: 'contain' as const },
    list: { flex: 1, paddingTop: 8, overflowY: 'auto' as const },
    bottomList: { paddingBottom: 8 },
    item: {
      borderRadius: 6,
      margin: '1px 10px',
      width: 'calc(100% - 20px)',
      padding: '9px 10px',
      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
    },
    selectedItem: {
      backgroundColor: `${selectedBg} !important`,
      borderLeft: '3px solid #fe3a6a',
      borderRadius: '0 6px 6px 0',
      marginLeft: 0,
      paddingLeft: 17,
      width: 'calc(100% - 10px)',
    },
    icon: { minWidth: 34, color: '#8a8f99' },
    iconSelected: { minWidth: 34, color: '#fe3a6a' },
    text: {
      color: '#5a5e6b',
      '& span': {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 500,
        fontSize: '13px',
      },
    },
    textSelected: {
      color: '#fe3a6a',
      '& span': { fontWeight: 600 },
    },
    nestedItem: {
      borderRadius: 6,
      margin: '1px 10px 1px 22px',
      width: 'calc(100% - 32px)',
      padding: '8px 10px',
      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
    },
  }),
);

const StyledListItem = withStyles({
  root: {
    '&$selected': { backgroundColor: selectedBg },
    '&$selected:hover': { backgroundColor: selectedBg },
  },
  selected: {},
})(ListItem);

const NavMenu = (props: any) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState<any>({});
  const user = useSelector((state: IState) => state.core.user);
  const student = isStudent(user);

  const handleMenuClick = (name: string) => () =>
    setOpen({ ...open, [name]: !open[name] });

  const onClick = (path: string) => () => {
    history.push(path);
    if (props.onClose) props.onClose();
  };

  const doLogout = () => dispatch(handleLogout());

  const isSelected = (pathStr: string) =>
    location.pathname.indexOf(pathStr) > -1;

  const cleanRoutes = (r: IAppRoute[]) =>
    r.filter((it) => {
      let { items } = it;
      if (items && hasValue(items)) items = cleanRoutes(items);
      return it.requiredRoles ? hasAnyRole(user, it.requiredRoles) : true;
    });

  const Logo = (
    <div className={classes.logoHolder}>
      <img src={elevateLogo} alt="era92 elevate" className={classes.logoImg} />
    </div>
  );

  // ── Student sidebar ──────────────────────────────────────────────────────
  if (student) {
    return (
      <div className={classes.root}>
        {Logo}
        <List className={classes.list}>
          {studentRoutes.map((it) => {
            const Icon = it.icon;
            const selected = isSelected(it.route!);
            return (
              <StyledListItem
                button
                key={it.name}
                onClick={onClick(it.route!)}
                selected={selected}
                className={classes.item}
                classes={{ selected: classes.selectedItem }}
              >
                <ListItemIcon
                  className={selected ? classes.iconSelected : classes.icon}
                >
                  <Icon style={{ fontSize: 19 }} />
                </ListItemIcon>
                <ListItemText
                  primary={it.name}
                  className={selected ? classes.textSelected : classes.text}
                />
              </StyledListItem>
            );
          })}
        </List>

        <Divider style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />

        <List className={classes.bottomList}>
          {[
            {
              name: 'Settings',
              route: localRoutes.settings,
              Icon: SettingsIcon,
            },
          ].map(({ name, route, Icon }) => {
            const selected = isSelected(route);
            return (
              <StyledListItem
                button
                key={name}
                onClick={onClick(route)}
                selected={selected}
                className={classes.item}
                classes={{ selected: classes.selectedItem }}
              >
                <ListItemIcon
                  className={selected ? classes.iconSelected : classes.icon}
                >
                  <Icon style={{ fontSize: 19 }} />
                </ListItemIcon>
                <ListItemText
                  primary={name}
                  className={selected ? classes.textSelected : classes.text}
                />
              </StyledListItem>
            );
          })}
          <StyledListItem button onClick={doLogout} className={classes.item}>
            <ListItemIcon className={classes.icon}>
              <ExitToAppIcon style={{ fontSize: 19 }} />
            </ListItemIcon>
            <ListItemText primary="Logout" className={classes.text} />
          </StyledListItem>
        </List>
      </div>
    );
  }

  // ── Staff sidebar ──────────────────────────────────────────────────────────
  const finalRoutes = cleanRoutes(staffRoutes);

  return (
    <div className={classes.root}>
      {Logo}
      <List className={classes.list}>
        {finalRoutes.map((it) => {
          const Icon = it.icon;
          const selected = isSelected(it.route || it.name.toLowerCase());
          if (it.items) {
            return (
              <Fragment key={it.name}>
                <StyledListItem
                  button
                  onClick={handleMenuClick(it.name)}
                  className={classes.item}
                  selected={selected}
                  classes={{ selected: classes.selectedItem }}
                >
                  <ListItemIcon
                    className={selected ? classes.iconSelected : classes.icon}
                  >
                    <Icon style={{ fontSize: 19 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={it.name}
                    className={selected ? classes.textSelected : classes.text}
                  />
                  {open[it.name] ? (
                    <ExpandLess style={{ color: '#8a8f99', fontSize: 18 }} />
                  ) : (
                    <ExpandMore style={{ color: '#8a8f99', fontSize: 18 }} />
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
                        className={classes.nestedItem}
                        classes={{ selected: classes.selectedItem }}
                      >
                        <ListItemText
                          primary={ch.name}
                          className={
                            isSelected(ch.route!)
                              ? classes.textSelected
                              : classes.text
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
              className={classes.item}
              classes={{ selected: classes.selectedItem }}
            >
              <ListItemIcon
                className={selected ? classes.iconSelected : classes.icon}
              >
                <Icon style={{ fontSize: 19 }} />
              </ListItemIcon>
              <ListItemText
                primary={it.name}
                className={selected ? classes.textSelected : classes.text}
              />
            </StyledListItem>
          );
        })}
      </List>

      <Divider style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />

      <List className={classes.bottomList}>
        <StyledListItem button onClick={doLogout} className={classes.item}>
          <ListItemIcon className={classes.icon}>
            <ExitToAppIcon style={{ fontSize: 19 }} />
          </ListItemIcon>
          <ListItemText primary="Logout" className={classes.text} />
        </StyledListItem>
      </List>
    </div>
  );
};

export default NavMenu;
