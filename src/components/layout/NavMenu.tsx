import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppsIcon from '@material-ui/icons/Apps';
import PeopleIcon from '@material-ui/icons/People';
import SettingsIcon from '@material-ui/icons/Settings';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import AssessmentIcon from '@material-ui/icons/Assessment';

import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';

import HomeIcon from '@material-ui/icons/Home';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import LiveTvIcon from '@material-ui/icons/LiveTv';
import DateRangeIcon from '@material-ui/icons/DateRange';
import ForumIcon from '@material-ui/icons/Forum';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import BusinessIcon from '@material-ui/icons/Business';
import BarChartIcon from '@material-ui/icons/BarChart';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import Divider from '@material-ui/core/Divider';
import { useHistory, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import {
  hasAnyRole,
  isStudent,
  isHubManager,
  isTrainer,
} from '../../data/appRoles';
import { appPermissions, localRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { handleLogout } from '../../data/coreActions';
import elevateLogo from '../../assets/images/elevate-logo.png';

interface IAppRoute {
  requiredRoles?: string[];
  name: string;
  route?: string;
  icon?: any;
}

const studentRoutes: IAppRoute[] = [
  { name: 'Home', route: localRoutes.dashboard, icon: HomeIcon },
  { name: 'My Courses', route: localRoutes.myCourses, icon: MenuBookIcon },
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
    requiredRoles: [appPermissions.roleClassView, appPermissions.roleClassEdit],
    name: 'Timetable',
    route: localRoutes.timetable,
    icon: DateRangeIcon,
  },
  {
    requiredRoles: [appPermissions.roleClassView, appPermissions.roleClassEdit],
    name: 'Assignments',
    route: localRoutes.teacherAssignments,
    icon: PlaylistAddCheckIcon,
  },
  {
    requiredRoles: [
      appPermissions.roleCourseView,
      appPermissions.roleCourseEdit,
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
    requiredRoles: [appPermissions.roleUserView, appPermissions.roleUserEdit],
    name: 'Users & Roles',
    route: localRoutes.users,
    icon: SupervisorAccountIcon,
  },
  {
    requiredRoles: [appPermissions.roleUserView, appPermissions.roleUserEdit],
    name: 'Hubs',
    route: localRoutes.hubs,
    icon: BusinessIcon,
  },
];

// ── Hub Manager: own-hub students, timetable, attendance, announcements ──────
const hubManagerRoutes: IAppRoute[] = [
  { name: 'Dashboard', route: localRoutes.dashboard, icon: AppsIcon },
  { name: 'Students', route: localRoutes.students, icon: PeopleIcon },
  { name: 'Timetable', route: localRoutes.timetable, icon: DateRangeIcon },
  { name: 'Attendance', route: localRoutes.attendance, icon: AssessmentIcon },
  {
    name: 'Announcements',
    route: localRoutes.adminAnnouncements,
    icon: NotificationsActiveIcon,
  },
  { name: 'Reports', route: localRoutes.hubReports, icon: BarChartIcon },
];

// ── Trainer: instructor portal nav ───────────────────────────────────────────
const trainerRoutes: IAppRoute[] = [
  { name: 'Home', route: localRoutes.dashboard, icon: HomeIcon },
  {
    name: 'My Classes',
    route: localRoutes.trainerCourses,
    icon: BubbleChartIcon,
  },
  { name: 'Lectures', route: localRoutes.trainerLectures, icon: MenuBookIcon },
  { name: 'My Schedule', route: localRoutes.myTimetable, icon: DateRangeIcon },
  {
    name: 'Assessments',
    route: localRoutes.teacherAssignments,
    icon: PlaylistAddCheckIcon,
  },
  { name: 'Students', route: localRoutes.trainerStudents, icon: PeopleIcon },
  {
    name: 'Reports & Analytics',
    route: localRoutes.trainerAnalytics,
    icon: BarChartIcon,
  },
  {
    name: 'Chats / Inquiries',
    route: localRoutes.chatsInquiries,
    icon: ForumIcon,
  },
  {
    name: 'Resources',
    route: localRoutes.trainerResources,
    icon: FolderOpenIcon,
  },
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
  const user = useSelector((state: IState) => state.core.user);
  const student = isStudent(user);
  const hubManager = isHubManager(user);
  const trainer = isTrainer(user);

  const onClick = (path: string) => () => {
    history.push(path);
    if (props.onClose) props.onClose();
  };

  const doLogout = () => dispatch(handleLogout());

  const isSelected = (pathStr: string) =>
    location.pathname.indexOf(pathStr) > -1;

  const cleanRoutes = (r: IAppRoute[]) =>
    r.filter((it) =>
      it.requiredRoles ? hasAnyRole(user, it.requiredRoles) : true,
    );

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

  // Helper: render a simple (no permission check) route list
  const renderRouteList = (routes: IAppRoute[]) =>
    routes.map((it) => {
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
    });

  const BottomActions = (
    <>
      {(() => {
        const selected = isSelected(localRoutes.settings);
        return (
          <StyledListItem
            button
            onClick={onClick(localRoutes.settings)}
            selected={selected}
            className={classes.item}
            classes={{ selected: classes.selectedItem }}
          >
            <ListItemIcon
              className={selected ? classes.iconSelected : classes.icon}
            >
              <SettingsIcon style={{ fontSize: 19 }} />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              className={selected ? classes.textSelected : classes.text}
            />
          </StyledListItem>
        );
      })()}
      <StyledListItem button onClick={doLogout} className={classes.item}>
        <ListItemIcon className={classes.icon}>
          <ExitToAppIcon style={{ fontSize: 19 }} />
        </ListItemIcon>
        <ListItemText primary="Logout" className={classes.text} />
      </StyledListItem>
    </>
  );

  // ── Hub Manager sidebar ──────────────────────────────────────────────────
  if (hubManager) {
    return (
      <div className={classes.root}>
        {Logo}
        <List className={classes.list}>
          {renderRouteList(hubManagerRoutes)}
        </List>
        <Divider style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />
        <List className={classes.bottomList}>{BottomActions}</List>
      </div>
    );
  }

  // ── Trainer sidebar ──────────────────────────────────────────────────────
  if (trainer) {
    return (
      <div className={classes.root}>
        {Logo}
        <div
          style={{
            padding: '8px 20px 10px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Instructor Portal
          </span>
        </div>
        <List className={classes.list}>{renderRouteList(trainerRoutes)}</List>
        <Divider style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />
        <List className={classes.bottomList}>{BottomActions}</List>
      </div>
    );
  }

  // ── Super Admin / Admin sidebar ──────────────────────────────────────────
  const finalRoutes = cleanRoutes(staffRoutes);

  return (
    <div className={classes.root}>
      {Logo}
      <List className={classes.list}>{renderRouteList(finalRoutes)}</List>
      <Divider style={{ backgroundColor: 'rgba(0,0,0,0.06)' }} />
      <List className={classes.bottomList}>{BottomActions}</List>
    </div>
  );
};

export default NavMenu;
