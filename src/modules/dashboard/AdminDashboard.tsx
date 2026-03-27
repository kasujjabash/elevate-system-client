import React, { useEffect, useState } from 'react';
import {
  Grid,
  LinearProgress,
  Typography,
  makeStyles,
  Theme,
} from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/People';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import EventIcon from '@material-ui/icons/Event';
import SchoolIcon from '@material-ui/icons/School';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import StarIcon from '@material-ui/icons/Star';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { search } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import { IState } from '../../data/types';

const CORAL = '#E72C6C';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: '100%',
  },

  // ── Banner ────────────────────────────────────────────────────────────────
  banner: {
    background: `linear-gradient(120deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 14,
    padding: '24px 32px',
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative' as any,
    [theme.breakpoints.down('xs')]: { padding: '18px 20px' },
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 4,
    [theme.breakpoints.down('xs')]: { fontSize: 16 },
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  bannerDeco: {
    position: 'absolute' as any,
    right: 28,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 16px',
    display: 'flex',
    flexDirection: 'column' as any,
    gap: 4,
    [theme.breakpoints.down('sm')]: { display: 'none' },
  },
  decoLine: {
    height: 8,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.55)',
  },

  // ── Stat cards ────────────────────────────────────────────────────────────
  statCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    height: '100%',
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'rgba(231,44,108,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statNum: {
    fontSize: 26,
    fontWeight: 800,
    color: DARK,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontWeight: 500,
  },
  statTrend: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: 700,
    marginTop: 3,
  },

  // ── Section title ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: DARK,
    marginBottom: 14,
    marginTop: 28,
  },

  // ── Generic card ─────────────────────────────────────────────────────────
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '18px 22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    height: '100%',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 16,
  },

  // ── Hub rows ──────────────────────────────────────────────────────────────
  hubRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 0',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { opacity: 0.8 },
  },
  hubDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  hubName: { fontSize: 13, fontWeight: 600, color: DARK, flex: 1 },
  hubCount: { fontSize: 13, fontWeight: 700, color: DARK },

  // ── Course rows ───────────────────────────────────────────────────────────
  courseRow: {
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
    '&:last-child': { borderBottom: 'none' },
  },
  courseRowTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  courseName: { fontSize: 13, fontWeight: 600, color: DARK },
  courseCount: { fontSize: 12, fontWeight: 700, color: CORAL },
  progressBar: { height: 5, borderRadius: 3, backgroundColor: '#f3f4f6' },
  progressFill: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 3,
  },

  // ── Top performer ─────────────────────────────────────────────────────────
  performerCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '18px 22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  performerLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  performerName: {
    fontSize: 16,
    fontWeight: 800,
    color: DARK,
    marginBottom: 6,
  },
  performerMeta: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },

  emptyText: {
    fontSize: 13,
    color: '#c0c4ce',
    textAlign: 'center' as any,
    padding: '20px 0',
  },
}));

const HUB_COLORS = [
  '#E72C6C',
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
];

const AdminDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);
  const todayLabel = format(new Date(), 'EEEE, MMMM d');
  const firstName = user?.fullName?.split(' ')[0] || user?.username || 'Admin';

  const [stats, setStats] = useState({
    totalStudents: 0,
    newThisWeek: 0,
    todayClasses: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    todayAttendance: 0,
  });
  const [hubStats, setHubStats] = useState<any[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<any[]>([]);
  const [topStudent, setTopStudent] = useState<any>(null);
  const [topCourse, setTopCourse] = useState<any>(null);

  useEffect(() => {
    // Overall stats
    search(
      remoteRoutes.dashboardStats,
      {},
      (data: any) => {
        if (data) setStats((s) => ({ ...s, ...data }));
      },
      undefined,
      undefined,
    );

    // Hub breakdown
    search(
      remoteRoutes.hubStats,
      {},
      (data: any[]) => {
        if (Array.isArray(data)) setHubStats(data);
      },
      undefined,
      undefined,
    );

    // Report stats — enrollment by course (dedupe by course name, sum counts)
    search(
      remoteRoutes.dashboardReportStats,
      {},
      (data: any) => {
        if (data?.enrollmentsByCourse) {
          const map: Record<string, number> = {};
          data.enrollmentsByCourse.forEach((c: any) => {
            const name = c.course || c.name || 'Unknown';
            map[name] = (map[name] || 0) + (c.count || 0);
          });
          setCourseEnrollments(
            Object.entries(map).map(([course, count]) => ({ course, count })),
          );
        }
      },
      undefined,
      undefined,
    );

    // Top performers
    search(
      `${remoteRoutes.dashboardStats}/top-performers`,
      {},
      (data: any) => {
        if (data?.topStudent) setTopStudent(data.topStudent);
        if (data?.topCourse) setTopCourse(data.topCourse);
      },
      undefined,
      undefined,
    );
  }, []);

  const maxCourseEnroll = courseEnrollments.reduce(
    (m, c) => Math.max(m, c.count || 0),
    1,
  );

  return (
    <Layout>
      <div className={classes.root}>
        {/* Banner */}
        <div className={classes.banner}>
          <div>
            <div className={classes.bannerTitle}>Good morning, {firstName}</div>
            <div className={classes.bannerSub}>
              {todayLabel} — Here's your academy overview
            </div>
          </div>
          <div className={classes.bannerDeco}>
            {[80, 55, 90, 45].map((w, i) => (
              <div
                key={i}
                className={classes.decoLine}
                style={{ width: w, opacity: 0.4 + i * 0.1 }}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <Grid container spacing={2}>
          {[
            {
              label: 'Total Students',
              value: stats.totalStudents,
              Icon: PeopleIcon,
            },
            {
              label: 'New This Week',
              value: stats.newThisWeek,
              Icon: PersonAddIcon,
              trend:
                stats.newThisWeek > 0
                  ? `+${stats.newThisWeek} joined`
                  : undefined,
            },
            {
              label: 'Classes Today',
              value: stats.todayClasses,
              Icon: EventIcon,
            },
            {
              label: "Today's Attendance",
              value: stats.todayAttendance,
              Icon: HowToRegIcon,
            },
            {
              label: 'Total Courses',
              value: stats.totalCourses,
              Icon: SchoolIcon,
            },
            {
              label: 'Active Enrollments',
              value: stats.activeEnrollments,
              Icon: TrendingUpIcon,
            },
          ].map(({ label, value, Icon, trend }: any) => (
            <Grid item xs={6} sm={4} md={2} key={label}>
              <div className={classes.statCard}>
                <div className={classes.statIconWrap}>
                  <Icon style={{ fontSize: 20, color: CORAL }} />
                </div>
                <div>
                  <div className={classes.statNum}>{value}</div>
                  <div className={classes.statLabel}>{label}</div>
                  {trend && <div className={classes.statTrend}>{trend}</div>}
                </div>
              </div>
            </Grid>
          ))}
        </Grid>

        {/* Hub breakdown + Course enrollment */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <div className={classes.sectionTitle}>Students by Hub</div>
            <div className={classes.card}>
              <div className={classes.cardTitle}>
                <LocationOnIcon
                  style={{
                    fontSize: 12,
                    verticalAlign: 'middle',
                    marginRight: 4,
                  }}
                />
                Hub Breakdown
              </div>
              {hubStats.length === 0 ? (
                <Typography className={classes.emptyText}>
                  Loading hub data…
                </Typography>
              ) : (
                hubStats.map((h, i) => {
                  const total =
                    hubStats.reduce((s, x) => s + (x.studentCount || 0), 0) ||
                    1;
                  const pct = Math.round(((h.studentCount || 0) / total) * 100);
                  return (
                    <div
                      key={h.hub || i}
                      className={classes.hubRow}
                      onClick={() =>
                        history.push(
                          `${localRoutes.students}?hub=${encodeURIComponent(
                            h.hub || '',
                          )}`,
                        )
                      }
                    >
                      <div
                        className={classes.hubDot}
                        style={{
                          background: HUB_COLORS[i % HUB_COLORS.length],
                        }}
                      />
                      <span className={classes.hubName}>
                        {h.hub || h.hubName} Hub
                      </span>
                      <span className={classes.hubCount}>
                        {h.studentCount || 0}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#c0c4ce',
                          minWidth: 32,
                          textAlign: 'right',
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Grid>

          <Grid item xs={12} md={7}>
            <div className={classes.sectionTitle}>Enrollment by Course</div>
            <div className={classes.card}>
              <div className={classes.cardTitle}>
                <SchoolIcon
                  style={{
                    fontSize: 12,
                    verticalAlign: 'middle',
                    marginRight: 4,
                  }}
                />
                Course Enrollment
              </div>
              {courseEnrollments.length === 0 ? (
                <Typography className={classes.emptyText}>
                  Loading course data…
                </Typography>
              ) : (
                courseEnrollments.map((c, i) => {
                  const pct =
                    maxCourseEnroll > 0
                      ? Math.round(((c.count || 0) / maxCourseEnroll) * 100)
                      : 0;
                  return (
                    <div key={c.course || i} className={classes.courseRow}>
                      <div className={classes.courseRowTop}>
                        <span className={classes.courseName}>{c.course}</span>
                        <span className={classes.courseCount}>
                          {c.count || 0} enrolled
                        </span>
                      </div>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        className={classes.progressBar}
                        classes={{ bar: classes.progressFill }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </Grid>
        </Grid>

        {/* Top performers */}
        <div
          style={{
            marginTop: 48,
            borderTop: '1px solid rgba(0,0,0,0.06)',
            paddingTop: 32,
          }}
        >
          <div className={classes.sectionTitle}>Top Performers</div>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <div className={classes.performerCard}>
                <div className={classes.performerLabel}>
                  <StarIcon style={{ fontSize: 13, color: '#f59e0b' }} /> Best
                  Student This Term
                </div>
                {topStudent ? (
                  <>
                    <div className={classes.performerName}>
                      {topStudent.name}
                    </div>
                    <div className={classes.performerMeta}>
                      {topStudent.hub} Hub · {topStudent.course}
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={topStudent.score || 0}
                        className={classes.progressBar}
                        style={{ flex: 1 }}
                        classes={{ bar: classes.progressFill }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: CORAL,
                          minWidth: 38,
                        }}
                      >
                        {topStudent.score}%
                      </span>
                    </div>
                  </>
                ) : (
                  <Typography className={classes.emptyText}>
                    Available once exam results are submitted
                  </Typography>
                )}
              </div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <div className={classes.performerCard}>
                <div className={classes.performerLabel}>
                  <StarIcon style={{ fontSize: 13, color: '#10b981' }} /> Best
                  Performing Course
                </div>
                {topCourse ? (
                  <>
                    <div className={classes.performerName}>
                      {topCourse.name}
                    </div>
                    <div className={classes.performerMeta}>
                      {topCourse.enrolledCount} students enrolled
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={topCourse.avgScore || 0}
                        className={classes.progressBar}
                        style={{ flex: 1 }}
                        classes={{ bar: classes.progressFill }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: '#10b981',
                          minWidth: 38,
                        }}
                      >
                        {topCourse.avgScore}%
                      </span>
                    </div>
                  </>
                ) : (
                  <Typography className={classes.emptyText}>
                    Available once exam results are submitted
                  </Typography>
                )}
              </div>
            </Grid>
          </Grid>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </Layout>
  );
};

export default AdminDashboard;
