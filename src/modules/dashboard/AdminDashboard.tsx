import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/People';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import EventIcon from '@material-ui/icons/Event';
import AssignmentIcon from '@material-ui/icons/Assignment';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import StarIcon from '@material-ui/icons/Star';
import { useHistory } from 'react-router-dom';
import { localRoutes } from '../../data/constants';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { search } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  pageHeader: {
    marginBottom: theme.spacing(3),
  },
  greeting: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1f2025',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
  },
  subtitle: {
    fontSize: '14px',
    color: '#8a8f99',
    marginTop: 2,
  },
  statCard: {
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  statCardContent: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: theme.spacing(2.5),
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1f2025',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '13px',
    color: '#8a8f99',
    marginTop: 6,
    fontWeight: 500,
  },
  statTrend: {
    fontSize: '12px',
    color: '#22c55e',
    marginTop: 4,
    fontWeight: 600,
  },
  statAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  statAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1f2025',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    fontFamily: '"Plus Jakarta Sans", sans-serif',
  },
  hubCard: {
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    height: '100%',
    border: '1px solid #f0f0f0',
  },
  hubHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: theme.spacing(1.5),
  },
  hubDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  hubName: {
    fontWeight: 700,
    fontSize: '14px',
    color: '#1f2025',
  },
  hubStudentCount: {
    fontSize: '12px',
    color: '#8a8f99',
    marginLeft: 'auto',
  },
  classItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid #f5f5f5',
    '&:last-child': {
      borderBottom: 'none',
      paddingBottom: 0,
    },
  },
  classTime: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#8a8f99',
    minWidth: 70,
    paddingTop: 2,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1f2025',
  },
  classInstructor: {
    fontSize: '12px',
    color: '#8a8f99',
    marginTop: 1,
  },
  courseChip: {
    height: 22,
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: 6,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(2),
    color: '#8a8f99',
    fontSize: '13px',
  },
  tableCard: {
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
  },
  tableHead: {
    backgroundColor: '#f8f9fa',
  },
  tableHeadCell: {
    fontWeight: 700,
    fontSize: '12px',
    color: '#8a8f99',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '10px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  tableCell: {
    fontSize: '13px',
    color: '#1f2025',
    padding: '12px 16px',
    borderBottom: '1px solid #f8f8f8',
  },
  hubBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: '11px',
    fontWeight: 700,
    color: '#fff',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f0f0f0',
  },
  progressBarFill: {
    background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
    borderRadius: 3,
  },
}));

// Hub colour map
const HUB_COLORS: Record<string, string> = {
  Katanga: '#fe3a6a',
  Kosovo: '#6366f1',
  Jinja: '#f59e0b',
  Namayemba: '#10b981',
  Lyantode: '#3b82f6',
};

// Course colour map
const COURSE_COLORS: Record<string, string> = {
  'Graphic Design': '#8b5cf6',
  'Website Development': '#3b82f6',
  'Film & Photography': '#f59e0b',
  'ALX Course': '#10b981',
  'Video Production': '#fe3a6a',
  'UI/UX Design': '#ec4899',
};

// ─── SERVER ENDPOINT SPECIFICATION ─────────────────────────────────────────
// GET /api/dashboard/stats
//   Response: { totalStudents, newThisWeek, todayClasses, pendingExams }
//
// GET /api/dashboard/hub-stats
//   Response: [{ hub, studentCount, activeCount }]  — one entry per hub
//
// GET /api/dashboard/top-performers
//   Response: { topStudent: { name, hub, course, score }, topCourse: { name, enrolledCount, avgScore } }
// ────────────────────────────────────────────────────────────────────────────

// Fallback data shown while server is not yet connected
const FALLBACK_STATS = {
  totalStudents: 0,
  newThisWeek: 0,
  todayClasses: 0,
  pendingExams: 0,
  todayAttendance: 0,
};

const FALLBACK_HUBS = [
  {
    name: 'Katanga',
    studentCount: 0,
    todayClasses: [
      {
        time: '9:00 AM',
        course: 'Website Development',
        instructor: 'TBA',
        enrolled: 0,
      },
      {
        time: '2:00 PM',
        course: 'Graphic Design',
        instructor: 'TBA',
        enrolled: 0,
      },
    ],
  },
  {
    name: 'Kosovo',
    studentCount: 0,
    todayClasses: [
      {
        time: '10:00 AM',
        course: 'Film & Photography',
        instructor: 'TBA',
        enrolled: 0,
      },
    ],
  },
  {
    name: 'Jinja',
    studentCount: 0,
    todayClasses: [
      { time: '9:00 AM', course: 'ALX Course', instructor: 'TBA', enrolled: 0 },
    ],
  },
  {
    name: 'Namayemba',
    studentCount: 0,
    todayClasses: [],
  },
  {
    name: 'Lyantode',
    studentCount: 0,
    todayClasses: [
      {
        time: '11:00 AM',
        course: 'Graphic Design',
        instructor: 'TBA',
        enrolled: 0,
      },
    ],
  },
];

const COURSE_ENROLLMENT_FALLBACK = [
  { course: 'Website Development', enrolled: 0, capacity: 30, hub: 'Multiple' },
  { course: 'Graphic Design', enrolled: 0, capacity: 25, hub: 'Multiple' },
  {
    course: 'Film & Photography',
    enrolled: 0,
    capacity: 20,
    hub: 'Kosovo / Jinja',
  },
  { course: 'ALX Course', enrolled: 0, capacity: 40, hub: 'Jinja / Namayemba' },
];

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  trend?: string;
}) => {
  const classes = useStyles();
  return (
    <Card className={classes.statCard}>
      <div className={classes.statCardContent}>
        <div>
          <div className={classes.statNumber}>{value}</div>
          <div className={classes.statLabel}>{label}</div>
          {trend && <div className={classes.statTrend}>{trend}</div>}
        </div>
        <Avatar className={classes.statAvatar} style={{ background: color }}>
          <Icon style={{ fontSize: 22, color: '#fff' }} />
        </Avatar>
      </div>
      <div className={classes.statAccent} />
    </Card>
  );
};

const AdminDashboard = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const todayLabel = format(new Date(), 'EEEE, MMMM d');

  const [stats, setStats] = useState(FALLBACK_STATS);
  const [hubs, setHubs] = useState(FALLBACK_HUBS);
  const [courseEnrollments] = useState(COURSE_ENROLLMENT_FALLBACK);
  const [hubStudentCounts, setHubStudentCounts] = useState<
    Record<string, number>
  >({});
  const [topPerformer, setTopPerformer] = useState<{
    name: string;
    hub: string;
    course: string;
    score: number;
  } | null>(null);
  const [topCourse, setTopCourse] = useState<{
    name: string;
    enrolledCount: number;
    avgScore: number;
  } | null>(null);

  useEffect(() => {
    // GET /api/dashboard/stats → { totalStudents, newThisWeek, todayClasses, pendingExams }
    search(
      remoteRoutes.dashboardStats,
      {},
      (data: any) => {
        if (data) setStats((s) => ({ ...s, ...data }));
      },
      undefined,
      undefined,
    );

    // Fallback: count students directly if dashboardStats not available
    search(
      remoteRoutes.contacts,
      { limit: 1 },
      (data: any) => {
        const total = data?.total ?? data?.totalCount;
        const week = data?.weekCount ?? data?.newThisWeek;
        if (total !== undefined)
          setStats((s) => ({ ...s, totalStudents: total }));
        if (week !== undefined) setStats((s) => ({ ...s, newThisWeek: week }));
      },
      undefined,
      undefined,
    );

    // GET /api/dashboard/hub-stats → [{ hub, studentCount }]
    search(
      remoteRoutes.hubStats,
      {},
      (data: any[]) => {
        if (Array.isArray(data)) {
          const counts: Record<string, number> = {};
          data.forEach((row: any) => {
            counts[row.hub] = row.studentCount || 0;
          });
          setHubStudentCounts(counts);
          setHubs((prev) =>
            prev.map((h) => ({
              ...h,
              studentCount:
                counts[h.name] ??
                counts[h.name.toLowerCase()] ??
                h.studentCount,
            })),
          );
        }
      },
      undefined,
      undefined,
    );

    // GET /api/dashboard/top-performers → { topStudent, topCourse }
    search(
      `${remoteRoutes.dashboardStats}/top-performers`,
      {},
      (data: any) => {
        if (data?.topStudent) setTopPerformer(data.topStudent);
        if (data?.topCourse) setTopCourse(data.topCourse);
      },
      undefined,
      undefined,
    );

    // Fetch today's classes for timetable
    const today = format(new Date(), 'yyyy-MM-dd');
    search(
      remoteRoutes.events,
      { from: today, to: today, limit: 100 },
      (data: any[]) => {
        if (Array.isArray(data)) {
          setStats((s) => ({ ...s, todayClasses: data.length }));
          const hubMap: Record<string, any[]> = {};
          data.forEach((cls: any) => {
            const hub = cls.hubName || 'Unknown';
            if (!hubMap[hub]) hubMap[hub] = [];
            hubMap[hub].push({
              time: cls.startTime
                ? format(new Date(cls.startTime), 'h:mm a')
                : '',
              course: cls.courseName || cls.name || 'Class',
              instructor: cls.instructor || cls.instructorName || 'TBA',
              enrolled: cls.attendance || 0,
            });
          });
          setHubs((prev) =>
            prev.map((h) => ({
              ...h,
              todayClasses: hubMap[h.name] || h.todayClasses,
            })),
          );
        }
      },
      undefined,
      undefined,
    );
  }, []);

  const history = useHistory();
  const firstName = user?.fullName?.split(' ')[0] || user?.username || 'Admin';

  return (
    <Layout>
      <div className={classes.root}>
        {/* Page header */}
        <div className={classes.pageHeader}>
          <div className={classes.greeting}>Good morning, {firstName}</div>
          <div className={classes.subtitle}>
            {todayLabel} — Here's what's happening across all hubs today
          </div>
        </div>

        {/* Stats row */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <StatCard
              label="Total Students"
              value={stats.totalStudents}
              icon={PeopleIcon}
              color="#fe3a6a"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              label="Today's Attendance"
              value={stats.todayAttendance}
              icon={HowToRegIcon}
              color="#6366f1"
              trend={
                stats.todayAttendance > 0
                  ? `${stats.todayAttendance} checked in today`
                  : undefined
              }
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              label="Classes Today"
              value={stats.todayClasses}
              icon={EventIcon}
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              label="Pending Exams"
              value={stats.pendingExams}
              icon={AssignmentIcon}
              color="#10b981"
            />
          </Grid>
        </Grid>

        {/* Hub Timetable */}
        <Typography className={classes.sectionTitle}>
          Today's Hub Timetable — {todayLabel}
        </Typography>
        <Grid container spacing={2}>
          {hubs.map((hub) => (
            <Grid item xs={12} sm={6} md={4} key={hub.name}>
              <Card className={classes.hubCard}>
                <CardContent>
                  <div className={classes.hubHeader}>
                    <div
                      className={classes.hubDot}
                      style={{ background: HUB_COLORS[hub.name] || '#8a8f99' }}
                    />
                    <span className={classes.hubName}>{hub.name} Hub</span>
                    <span className={classes.hubStudentCount}>
                      <LocationOnIcon
                        style={{
                          fontSize: 12,
                          verticalAlign: 'middle',
                          marginRight: 2,
                        }}
                      />
                      {hub.studentCount} students
                    </span>
                  </div>
                  <Divider style={{ marginBottom: 12 }} />
                  {hub.todayClasses.length === 0 ? (
                    <div className={classes.emptyState}>No classes today</div>
                  ) : (
                    hub.todayClasses.map((cls, i) => (
                      <div className={classes.classItem} key={i}>
                        <div className={classes.classTime}>
                          <AccessTimeIcon
                            style={{
                              fontSize: 11,
                              verticalAlign: 'middle',
                              marginRight: 2,
                            }}
                          />
                          {cls.time}
                        </div>
                        <div className={classes.classInfo}>
                          <div className={classes.className}>
                            <Chip
                              label={cls.course}
                              size="small"
                              className={classes.courseChip}
                              style={{
                                backgroundColor: `${
                                  COURSE_COLORS[cls.course] || '#6366f1'
                                }18`,
                                color: COURSE_COLORS[cls.course] || '#6366f1',
                                border: `1px solid ${
                                  COURSE_COLORS[cls.course] || '#6366f1'
                                }30`,
                              }}
                            />
                          </div>
                          <div className={classes.classInstructor}>
                            {cls.instructor}
                            {cls.enrolled > 0 && ` · ${cls.enrolled} present`}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Course Enrollment Breakdown */}
        <Typography className={classes.sectionTitle}>
          Course Enrollment Overview
        </Typography>
        <Card className={classes.tableCard}>
          <Table>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell className={classes.tableHeadCell}>Course</TableCell>
                <TableCell className={classes.tableHeadCell}>Hub(s)</TableCell>
                <TableCell className={classes.tableHeadCell}>
                  Enrolled
                </TableCell>
                <TableCell
                  className={classes.tableHeadCell}
                  style={{ minWidth: 160 }}
                >
                  Fill Rate
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courseEnrollments.map((row) => {
                const pct =
                  row.capacity > 0
                    ? Math.round((row.enrolled / row.capacity) * 100)
                    : 0;
                return (
                  <TableRow key={row.course} hover>
                    <TableCell className={classes.tableCell}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: COURSE_COLORS[row.course] || '#8a8f99',
                            flexShrink: 0,
                          }}
                        />
                        <strong>{row.course}</strong>
                      </div>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <span style={{ color: '#8a8f99', fontSize: 12 }}>
                        {row.hub}
                      </span>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <strong>{row.enrolled}</strong>
                      <span style={{ color: '#8a8f99', fontSize: 12 }}>
                        /{row.capacity}
                      </span>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          className={classes.progressBar}
                          style={{ flex: 1 }}
                          classes={{ bar: classes.progressBarFill }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: '#8a8f99',
                            minWidth: 32,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Daily Learning Activity */}
        <Typography className={classes.sectionTitle}>
          Daily Learning Activity by Hub
        </Typography>
        <Grid container spacing={2}>
          {hubs.map((hub) => {
            const classesToday = hub.todayClasses.length;
            const totalStudentsInHub = hub.studentCount;
            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={2}
                key={`activity-${hub.name}`}
              >
                <Card
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <CardContent style={{ padding: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: HUB_COLORS[hub.name] || '#8a8f99',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LocationOnIcon
                          style={{ fontSize: 16, color: '#fff' }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: '#1f2025',
                          }}
                        >
                          {hub.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#8a8f99' }}>
                          Hub
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: '#1f2025',
                            lineHeight: 1,
                          }}
                        >
                          {classesToday}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#8a8f99',
                            marginTop: 2,
                          }}
                        >
                          Classes today
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: '#1f2025',
                            lineHeight: 1,
                          }}
                        >
                          {totalStudentsInHub}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#8a8f99',
                            marginTop: 2,
                          }}
                        >
                          Students
                        </div>
                      </div>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={classesToday > 0 ? 100 : 0}
                      style={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: '#f0f0f0',
                      }}
                      classes={{ bar: classes.progressBarFill }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Students by Hub */}
        <Typography className={classes.sectionTitle}>
          Students by Hub
        </Typography>
        <Grid container spacing={2}>
          {hubs.map((hub) => {
            const total = stats.totalStudents || 1;
            const count =
              hubStudentCounts[hub.name] ??
              hubStudentCounts[hub.name.toLowerCase()] ??
              hub.studentCount;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={`hub-students-${hub.name}`}>
                <Card
                  style={{
                    borderRadius: 12,
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    padding: 16,
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    history.push(
                      `${localRoutes.students}?hub=${hub.name.toLowerCase()}`,
                    )
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: HUB_COLORS[hub.name] || '#8a8f99',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#1f2025',
                        }}
                      >
                        {hub.name} Hub
                      </span>
                    </div>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 20,
                        color: '#1f2025',
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: `${
                          HUB_COLORS[hub.name] || '#8a8f99'
                        }20`,
                      }}
                      classes={{ bar: classes.progressBarFill }}
                    />
                    <span
                      style={{ fontSize: 12, color: '#8a8f99', minWidth: 36 }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#c0c4ce', marginTop: 6 }}>
                    Click to view students →
                  </div>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Top Performers */}
        <Typography className={classes.sectionTitle}>Top Performers</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card
              style={{
                borderRadius: 12,
                border: '1px solid #f0f0f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                padding: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StarIcon style={{ color: '#f59e0b', fontSize: 20 }} />
                </div>
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 13, color: '#1f2025' }}
                  >
                    Best Student
                  </div>
                  <div style={{ fontSize: 11, color: '#8a8f99' }}>
                    Highest overall score this term
                  </div>
                </div>
              </div>
              {topPerformer ? (
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 16, color: '#1f2025' }}
                  >
                    {topPerformer.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#8a8f99', marginTop: 3 }}>
                    {topPerformer.hub} Hub &middot; {topPerformer.course}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={topPerformer.score}
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#f0f0f0',
                      }}
                      classes={{ bar: classes.progressBarFill }}
                    />
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#fe3a6a',
                        minWidth: 40,
                      }}
                    >
                      {topPerformer.score}%
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    color: '#c0c4ce',
                    fontSize: 13,
                    textAlign: 'center',
                    padding: '12px 0',
                  }}
                >
                  Available once exam results are submitted
                </div>
              )}
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card
              style={{
                borderRadius: 12,
                border: '1px solid #f0f0f0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                padding: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StarIcon style={{ color: '#22c55e', fontSize: 20 }} />
                </div>
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 13, color: '#1f2025' }}
                  >
                    Best Performing Course
                  </div>
                  <div style={{ fontSize: 11, color: '#8a8f99' }}>
                    Highest average score across all hubs
                  </div>
                </div>
              </div>
              {topCourse ? (
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 16, color: '#1f2025' }}
                  >
                    {topCourse.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#8a8f99', marginTop: 3 }}>
                    {topCourse.enrolledCount} students enrolled
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={topCourse.avgScore}
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#f0f0f0',
                      }}
                      classes={{ bar: classes.progressBarFill }}
                    />
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#22c55e',
                        minWidth: 40,
                      }}
                    >
                      {topCourse.avgScore}%
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    color: '#c0c4ce',
                    fontSize: 13,
                    textAlign: 'center',
                    padding: '12px 0',
                  }}
                >
                  Available once exam results are submitted
                </div>
              )}
            </Card>
          </Grid>
        </Grid>

        <Box style={{ marginBottom: 24 }} />
      </div>
    </Layout>
  );
};

export default AdminDashboard;
