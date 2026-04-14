import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Grid,
  LinearProgress,
  Typography,
  makeStyles,
  Theme,
} from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/People';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import SchoolIcon from '@material-ui/icons/School';
import ClassIcon from '@material-ui/icons/Class';
import BlockIcon from '@material-ui/icons/Block';
import DateRangeIcon from '@material-ui/icons/DateRange';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useHistory } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { search } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import { IState } from '../../data/types';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';
const GREEN = '#10b981';
const AMBER = '#f59e0b';
const BLUE = '#3b82f6';
const PURPLE = '#8b5cf6';

const COURSE_COLORS = [CORAL, BLUE, PURPLE, AMBER, GREEN, ORANGE];

const useStyles = makeStyles((theme: Theme) => ({
  root: { paddingBottom: 32 },

  banner: {
    background: `linear-gradient(120deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 14,
    padding: '22px 28px',
    marginBottom: 24,
    position: 'relative' as any,
    overflow: 'hidden',
    [theme.breakpoints.down('xs')]: { padding: '16px 18px' },
  },
  bannerInner: { position: 'relative' as any, zIndex: 1 },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    marginBottom: 16,
  },
  bannerCircle1: {
    position: 'absolute' as any,
    right: -30,
    top: -30,
    width: 130,
    height: 130,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
  },
  bannerCircle2: {
    position: 'absolute' as any,
    right: 60,
    bottom: -40,
    width: 90,
    height: 90,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
  },
  bannerStatsRow: { display: 'flex', gap: 20, flexWrap: 'wrap' as any },
  bannerStat: {
    background: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: '8px 16px',
    minWidth: 130,
  },
  bannerStatVal: {
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1,
  },
  bannerStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 3,
    fontWeight: 500,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: DARK,
    marginBottom: 10,
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  viewAllLink: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: 600,
    color: CORAL,
    cursor: 'pointer',
    '&:hover': { textDecoration: 'underline' },
  },

  card: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 14,
  },

  kpiRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap' as any,
  },
  kpiCard: {
    flex: '1 1 140px',
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '13px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  kpiIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiNum: { fontSize: 22, fontWeight: 800, color: DARK, lineHeight: 1 },
  kpiLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 3,
    fontWeight: 600,
    textTransform: 'uppercase' as any,
    letterSpacing: '0.04em',
  },
  kpiSubWarn: { fontSize: 10, color: CORAL, fontWeight: 700, marginTop: 2 },

  courseCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    marginBottom: 16,
  },
  courseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #f5f6f8',
    '&:last-child': { borderBottom: 'none' },
  },
  courseColorDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  courseInfo: { flex: 1, minWidth: 0 },
  courseName: { fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 5 },
  courseBarWrap: {
    height: 6,
    borderRadius: 3,
    background: '#f3f4f6',
    overflow: 'hidden',
  },
  courseBarFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.5s ease',
  },
  courseEnrolled: {
    fontSize: 12,
    fontWeight: 700,
    color: DARK,
    flexShrink: 0,
    minWidth: 30,
    textAlign: 'right' as any,
  },

  recentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 0',
    borderBottom: '1px solid #f9fafb',
    cursor: 'pointer',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { opacity: 0.75 },
  },
  recentName: { fontSize: 13, fontWeight: 600, color: DARK, flex: 1 },
  recentMeta: { fontSize: 11, color: '#9ca3af' },
  statusChip: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 6,
    textTransform: 'uppercase' as any,
  },
  emptyText: {
    fontSize: 13,
    color: '#c0c4ce',
    textAlign: 'center' as any,
    padding: '20px 0',
  },

  rightCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '14px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    marginBottom: 14,
  },
  rightCardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 10,
  },

  calHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calMonthLabel: { fontSize: 13, fontWeight: 700, color: DARK },
  calNavBtn: {
    width: 22,
    height: 22,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    color: '#8a8f99',
    '&:hover': { background: '#f5f5f5' },
  },
  calGrid: { display: 'flex', flexWrap: 'wrap' as any },
  calDayLabel: {
    width: '14.28%',
    textAlign: 'center' as any,
    fontSize: 10,
    fontWeight: 700,
    color: '#9ca3af',
    paddingBottom: 5,
  },
  calDayCell: {
    width: '14.28%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 3,
  },
  calDay: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 400,
    color: DARK,
    '&:hover': { background: '#f5f5f5' },
  },
  calToday: {
    background: `${CORAL} !important`,
    color: '#fff !important',
    fontWeight: '700 !important' as any,
  },

  shortcutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    marginBottom: 6,
    border: '1px solid rgba(0,0,0,0.08)',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left' as any,
    transition: 'background 0.15s',
    '&:hover': { background: '#fdf5f7', borderColor: 'rgba(254,58,106,0.2)' },
  },
  shortcutIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  shortcutLabel: { fontSize: 13, fontWeight: 600, color: DARK },
  shortcutSub: { fontSize: 11, color: '#9ca3af' },

  progressBar: { height: 5, borderRadius: 3, backgroundColor: '#f3f4f6' },
  progressFill: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 3,
  },
}));

const MiniCalendar: React.FC = () => {
  const classes = useStyles();
  const [month, setMonth] = useState(new Date());
  const today = new Date();
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1).getDay();
  const daysCount = new Date(year, monthIdx + 1, 0).getDate();
  const monthLabel = format(month, 'MMMM yyyy');

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysCount; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number | null) =>
    d !== null &&
    today.getDate() === d &&
    today.getMonth() === monthIdx &&
    today.getFullYear() === year;

  return (
    <div>
      <div className={classes.calHeader}>
        <span className={classes.calMonthLabel}>{monthLabel}</span>
        <div style={{ display: 'flex', gap: 2 }}>
          <button
            className={classes.calNavBtn}
            onClick={() =>
              setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
            }
          >
            <ChevronLeftIcon style={{ fontSize: 16 }} />
          </button>
          <button
            className={classes.calNavBtn}
            onClick={() =>
              setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
            }
          >
            <ChevronRightIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
      <div className={classes.calGrid}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
          <div key={i} className={classes.calDayLabel}>
            {d}
          </div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className={classes.calDayCell}>
            {d ? (
              <div
                className={`${classes.calDay} ${
                  isToday(d) ? classes.calToday : ''
                }`}
              >
                {d}
              </div>
            ) : (
              <div style={{ width: 26, height: 26 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface HubStats {
  hubId: number | null;
  hubName: string;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalCourses: number;
  classesToday: number;
  todayAttendance: number;
  courses: { id: number; name: string; enrolled: number }[];
  recentStudents: {
    id: number;
    name: string;
    status: string;
    course: string | null;
    enrolledAt: string;
  }[];
}

const HubManagerDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);
  const todayLabel = format(new Date(), 'EEEE, MMMM d');
  const firstName =
    user?.fullName?.split(' ')[0] || user?.username || 'Manager';

  const [stats, setStats] = useState<HubStats>({
    hubId: null,
    hubName: 'Your Hub',
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    totalCourses: 0,
    classesToday: 0,
    todayAttendance: 0,
    courses: [],
    recentStudents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.hubManagerStats,
      {},
      (data: any) => {
        setStats((prev) => ({
          ...prev,
          ...data,
          courses: data.courses || [],
          recentStudents: data.recentStudents || [],
        }));
        setLoading(false);
      },
      () => setLoading(false),
      undefined,
    );
  }, []);

  const activeRate =
    stats.totalStudents > 0
      ? Math.round((stats.activeStudents / stats.totalStudents) * 100)
      : 0;

  const maxEnrolled = (stats.courses || []).reduce(
    (m, c) => Math.max(m, c.enrolled),
    1,
  );

  const statusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return { background: '#d1fae5', color: '#065f46' };
    if (s === 'inactive') return { background: '#fee2e2', color: '#991b1b' };
    if (s === 'graduated') return { background: '#dbeafe', color: '#1e40af' };
    return { background: '#fef3c7', color: '#92400e' };
  };

  const shortcuts = [
    {
      label: 'Students',
      sub: `${stats.totalStudents} enrolled`,
      Icon: PeopleIcon,
      color: CORAL,
      bg: 'rgba(254,58,106,0.08)',
      route: localRoutes.students,
    },
    {
      label: 'Timetable',
      sub: 'View schedule',
      Icon: DateRangeIcon,
      color: BLUE,
      bg: 'rgba(59,130,246,0.08)',
      route: localRoutes.timetable,
    },
    {
      label: 'Attendance',
      sub: `${stats.todayAttendance} today`,
      Icon: HowToRegIcon,
      color: GREEN,
      bg: 'rgba(16,185,129,0.08)',
      route: localRoutes.attendance,
    },
    {
      label: 'Announcements',
      sub: 'Send to hub',
      Icon: NotificationsActiveIcon,
      color: AMBER,
      bg: 'rgba(245,158,11,0.08)',
      route: localRoutes.adminAnnouncements,
    },
  ];

  return (
    <Layout>
      <div className={classes.root}>
        {/* Banner */}
        <div className={classes.banner}>
          <div className={classes.bannerCircle1} />
          <div className={classes.bannerCircle2} />
          <div className={classes.bannerInner}>
            <div className={classes.bannerTitle}>Welcome, {firstName}</div>
            <div className={classes.bannerSub}>
              {todayLabel} · {stats.hubName} Hub Overview
            </div>
            <div className={classes.bannerStatsRow}>
              <div className={classes.bannerStat}>
                <div className={classes.bannerStatVal}>
                  {loading ? '…' : stats.totalStudents}
                </div>
                <div className={classes.bannerStatLabel}>Total Students</div>
              </div>
              <div className={classes.bannerStat}>
                <div className={classes.bannerStatVal}>
                  {loading ? '…' : stats.activeStudents}
                </div>
                <div className={classes.bannerStatLabel}>Active Students</div>
              </div>
              <div className={classes.bannerStat}>
                <div className={classes.bannerStatVal}>
                  {loading ? '…' : `${activeRate}%`}
                </div>
                <div className={classes.bannerStatLabel}>Engagement Rate</div>
              </div>
              <div className={classes.bannerStat}>
                <div className={classes.bannerStatVal}>
                  {loading ? '…' : stats.totalCourses}
                </div>
                <div className={classes.bannerStatLabel}>Active Courses</div>
              </div>
            </div>
          </div>
        </div>

        <Grid container spacing={3}>
          {/* LEFT COLUMN */}
          <Grid item xs={12} md={8}>
            {/* KPI Strip */}
            <div className={classes.kpiRow}>
              {[
                {
                  label: 'Inactive Students',
                  value: stats.inactiveStudents,
                  Icon: BlockIcon,
                  color: CORAL,
                  bg: 'rgba(254,58,106,0.08)',
                  sub: `${100 - activeRate}% inactive`,
                },
                {
                  label: 'Courses in Hub',
                  value: stats.totalCourses,
                  Icon: SchoolIcon,
                  color: PURPLE,
                  bg: 'rgba(139,92,246,0.08)',
                  sub: null,
                },
                {
                  label: "Today's Attendance",
                  value: stats.todayAttendance,
                  Icon: HowToRegIcon,
                  color: AMBER,
                  bg: 'rgba(245,158,11,0.08)',
                  sub: null,
                },
                {
                  label: "Today's Classes",
                  value: stats.classesToday,
                  Icon: ClassIcon,
                  color: BLUE,
                  bg: 'rgba(59,130,246,0.08)',
                  sub: null,
                },
              ].map(({ label, value, Icon, color, bg, sub }) => (
                <div key={label} className={classes.kpiCard}>
                  <div className={classes.kpiIcon} style={{ background: bg }}>
                    <Icon style={{ fontSize: 19, color }} />
                  </div>
                  <div>
                    <div className={classes.kpiNum}>
                      {loading ? '…' : value}
                    </div>
                    <div className={classes.kpiLabel}>{label}</div>
                    {sub && <div className={classes.kpiSubWarn}>{sub}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Course Breakdown */}
            <div className={classes.sectionLabel}>
              <SchoolIcon style={{ fontSize: 15, color: CORAL }} />
              Course Breakdown — {stats.hubName}
            </div>
            <div className={classes.courseCard}>
              <div className={classes.cardTitle}>
                Enrolled students per course
              </div>
              {loading ? (
                <LinearProgress
                  style={{ borderRadius: 4 }}
                  classes={{ bar: classes.progressFill }}
                />
              ) : (stats.courses || []).length === 0 ? (
                <Typography className={classes.emptyText}>
                  No courses in this hub yet
                </Typography>
              ) : (
                (stats.courses || []).map((c, i) => {
                  const pct = Math.round((c.enrolled / maxEnrolled) * 100);
                  const color = COURSE_COLORS[i % COURSE_COLORS.length];
                  return (
                    <div key={c.id} className={classes.courseRow}>
                      <div
                        className={classes.courseColorDot}
                        style={{ background: color }}
                      />
                      <div className={classes.courseInfo}>
                        <div className={classes.courseName}>{c.name}</div>
                        <div className={classes.courseBarWrap}>
                          <div
                            className={classes.courseBarFill}
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${color}99 0%, ${color} 100%)`,
                            }}
                          />
                        </div>
                      </div>
                      <div className={classes.courseEnrolled}>{c.enrolled}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Recent Students */}
            <div className={classes.sectionLabel}>
              <PeopleIcon style={{ fontSize: 15, color: CORAL }} />
              Recent Students
              <span
                className={classes.viewAllLink}
                onClick={() => history.push(localRoutes.students)}
              >
                View all →
              </span>
            </div>
            <div className={classes.card} style={{ padding: '4px 20px 8px' }}>
              {loading ? (
                <LinearProgress classes={{ bar: classes.progressFill }} />
              ) : (stats.recentStudents || []).length === 0 ? (
                <Typography className={classes.emptyText}>
                  No students yet
                </Typography>
              ) : (
                (stats.recentStudents || []).map((s, i) => (
                  <div
                    key={s.id || i}
                    className={classes.recentRow}
                    onClick={() =>
                      history.push(
                        localRoutes.studentsDetails.replace(
                          ':studentId',
                          String(s.id),
                        ),
                      )
                    }
                  >
                    <Avatar
                      style={{
                        width: 30,
                        height: 30,
                        fontSize: 12,
                        background: CORAL,
                      }}
                    >
                      {(s.name || '?').charAt(0).toUpperCase()}
                    </Avatar>
                    <span className={classes.recentName}>{s.name || '—'}</span>
                    <span className={classes.recentMeta}>
                      {s.course || '—'}
                    </span>
                    {s.enrolledAt && (
                      <span
                        className={classes.recentMeta}
                        style={{ minWidth: 72, textAlign: 'right' }}
                      >
                        {format(parseISO(s.enrolledAt), 'MMM d')}
                      </span>
                    )}
                    <span
                      className={classes.statusChip}
                      style={statusColor(s.status)}
                    >
                      {s.status || 'unknown'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={4}>
            <div className={classes.rightCard}>
              <div className={classes.rightCardTitle}>Calendar</div>
              <MiniCalendar />
            </div>

            <div className={classes.rightCard}>
              <div className={classes.rightCardTitle}>Quick Access</div>
              {shortcuts.map(({ label, sub, Icon, color, bg, route }) => (
                <button
                  key={label}
                  className={classes.shortcutBtn}
                  onClick={() => history.push(route)}
                >
                  <div
                    className={classes.shortcutIcon}
                    style={{ background: bg }}
                  >
                    <Icon style={{ fontSize: 17, color }} />
                  </div>
                  <div>
                    <div className={classes.shortcutLabel}>{label}</div>
                    <div className={classes.shortcutSub}>{sub}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className={classes.rightCard}>
              <div className={classes.rightCardTitle}>Hub Overview</div>
              {[
                {
                  label: 'Active Students',
                  value: stats.activeStudents,
                  total: stats.totalStudents,
                  color: GREEN,
                },
                {
                  label: 'Inactive Students',
                  value: stats.inactiveStudents,
                  total: stats.totalStudents,
                  color: CORAL,
                },
                {
                  label: "Today's Attendance",
                  value: stats.todayAttendance,
                  total: stats.totalStudents,
                  color: BLUE,
                },
              ].map(({ label, value, total, color }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{ fontSize: 12, color: DARK, fontWeight: 500 }}
                      >
                        {label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>
                        {loading ? '…' : `${value} (${pct}%)`}
                      </span>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={loading ? 0 : pct}
                      className={classes.progressBar}
                      classes={{ bar: classes.progressFill }}
                      style={{ backgroundColor: '#f3f4f6' }}
                    />
                  </div>
                );
              })}
            </div>
          </Grid>
        </Grid>

        <div style={{ height: 16 }} />
      </div>
    </Layout>
  );
};

export default HubManagerDashboard;
