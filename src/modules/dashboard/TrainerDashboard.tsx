import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Button,
  LinearProgress,
  makeStyles,
  Theme,
} from '@material-ui/core';
import SchoolIcon from '@material-ui/icons/School';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { format } from 'date-fns';
import { useHistory } from 'react-router-dom';
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

const AVATAR_COLORS = [PURPLE, BLUE, GREEN, AMBER, CORAL];

const useStyles = makeStyles((theme: Theme) => ({
  root: { paddingBottom: 32 },

  banner: {
    background: `linear-gradient(120deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 14,
    padding: '20px 28px',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 5,
  },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', maxWidth: 540 },
  bannerCircle1: {
    position: 'absolute' as any,
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
  },
  bannerCircle2: {
    position: 'absolute' as any,
    right: 50,
    bottom: -40,
    width: 90,
    height: 90,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
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
  pendingBadge: {
    background: CORAL,
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 20,
    padding: '2px 9px',
  },

  card: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '16px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#8a8f99',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 12,
  },

  classRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 0',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    '&:last-child': { borderBottom: 'none' },
  },
  classTimeBlock: { minWidth: 88, flexShrink: 0 },
  classTime: { fontSize: 17, fontWeight: 800, color: CORAL, lineHeight: 1.1 },
  classAmPm: {
    fontSize: 10,
    color: CORAL,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  classInfo: { flex: 1, minWidth: 0 },
  className: { fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 2 },
  classCodeBadge: {
    display: 'inline-block',
    background: 'rgba(254,58,106,0.08)',
    color: CORAL,
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 4,
    padding: '1px 6px',
    marginRight: 5,
  },
  studentCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    background: '#f5f5f5',
    borderRadius: 20,
    padding: '3px 9px',
    fontSize: 12,
    color: '#8a8f99',
    fontWeight: 500,
    flexShrink: 0,
  },

  submissionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: '11px 0',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    '&:last-child': { borderBottom: 'none' },
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  subName: { fontSize: 13, fontWeight: 700, color: DARK },
  subDesc: { fontSize: 12, color: '#8a8f99', marginTop: 1 },
  subTime: { fontSize: 11, color: '#c4c8d0', marginTop: 2 },
  reviewBtn: {
    borderColor: GREEN,
    color: GREEN,
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 20,
    textTransform: 'none' as any,
    flexShrink: 0,
    '&:hover': { background: 'rgba(16,185,129,0.05)', borderColor: GREEN },
  },

  rightCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '14px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    marginBottom: 14,
  },
  rightCardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#8a8f99',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 10,
  },

  // Calendar
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

  actionBtnPrimary: {
    width: '100%',
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    padding: '8px 0',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'none' as any,
    marginBottom: 8,
    '&:hover': { background: '#e02d5c' },
  },
  actionBtnOutline: {
    width: '100%',
    border: '1px solid rgba(0,0,0,0.12)',
    color: DARK,
    borderRadius: 8,
    padding: '7px 0',
    fontSize: 13,
    fontWeight: 500,
    textTransform: 'none' as any,
    marginBottom: 8,
    '&:hover': { background: '#fafafa' },
  },

  attRow: { marginBottom: 8, '&:last-child': { marginBottom: 0 } },
  attLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  attName: { fontSize: 12, color: DARK, fontWeight: 500 },
  attPct: { fontSize: 12, fontWeight: 700, color: CORAL },
  attBar: { height: 5, borderRadius: 3, backgroundColor: '#f3f4f6' },
  attFill: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 3,
  },

  statStrip: {
    display: 'flex',
    gap: 14,
    marginTop: 4,
    [theme.breakpoints.down('sm')]: { flexWrap: 'wrap' },
  },
  statCard: {
    flex: 1,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    '&:hover': { borderColor: 'rgba(0,0,0,0.14)' },
    [theme.breakpoints.down('sm')]: { minWidth: 'calc(50% - 7px)' },
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statVal: { fontSize: 22, fontWeight: 800, color: DARK, lineHeight: 1 },
  statLbl: {
    fontSize: 10,
    color: '#8a8f99',
    marginTop: 3,
    fontWeight: 600,
    textTransform: 'uppercase' as any,
    letterSpacing: '0.04em',
  },

  emptyText: {
    fontSize: 13,
    color: '#c4c8d0',
    textAlign: 'center' as any,
    padding: '18px 0',
  },
}));

// ── Mini Calendar ─────────────────────────────────────────────────────────────
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

// ── Main Component ────────────────────────────────────────────────────────────
const TrainerDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user?.id && !user?.contactId) return;

    const sid = user?.contactId ?? user?.id;
    const userName = (user?.fullName || user?.username || '')
      .toLowerCase()
      .trim();

    // Phase 1: resolve instructor table ID — courses store an instructorId that
    // references the instructor table, NOT the user's contactId/userId
    search(
      remoteRoutes.courseInstructors,
      {},
      (iData: any) => {
        const instructors: any[] = Array.isArray(iData)
          ? iData
          : iData?.data || [];
        const myRecord = instructors.find((i: any) => {
          if (
            sid != null &&
            (String(i.id) === String(sid) ||
              String(i.contactId) === String(sid))
          )
            return true;
          if (userName && i.name && i.name.toLowerCase().trim() === userName)
            return true;
          return false;
        });
        const instructorId = myRecord?.id ?? sid;

        // Phase 2: fetch this trainer's courses with the resolved instructor ID
        search(
          remoteRoutes.courses,
          { instructorId, limit: 200 },
          (data: any) => {
            const courses = Array.isArray(data) ? data : data?.data || [];
            setMyCourses(courses);

            // Phase 3: fetch timetable and filter by trainer's courseIds + today's DOW
            const trainerCourseIds = new Set(
              courses
                .map((c: any) => String(c.id || c.courseId))
                .filter(Boolean),
            );
            const todayDow = new Date().getDay();

            search(
              remoteRoutes.timetable,
              { limit: 500 },
              (tdata: any) => {
                const all2 = Array.isArray(tdata)
                  ? tdata
                  : tdata?.sessions || tdata?.data || [];
                if (trainerCourseIds.size === 0) {
                  setTodayClasses([]);
                  return;
                }
                const forToday = all2.filter((t: any) => {
                  if (Number(t.dayOfWeek) !== todayDow) return false;
                  const cid = String(t.courseId ?? t.course?.id ?? '');
                  return cid && trainerCourseIds.has(cid);
                });
                setTodayClasses(forToday);
              },
              undefined,
              undefined,
            );
          },
          undefined,
          undefined,
        );
      },
      // Instructor list failed — use sid as fallback
      () => {
        search(
          remoteRoutes.courses,
          { instructorId: sid, limit: 200 },
          (data: any) => {
            const courses = Array.isArray(data) ? data : data?.data || [];
            setMyCourses(courses);
          },
          undefined,
          undefined,
        );
      },
    );

    // Assignment submissions scoped to this trainer
    search(
      remoteRoutes.assignmentSubmissions,
      { instructorId: user.contactId, limit: 5 },
      (data: any) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setRecentSubmissions(list);
        const pending = list.filter(
          (s: any) => !s.grade && (s.status || '').toLowerCase() !== 'graded',
        ).length;
        setPendingCount(pending);
      },
      undefined,
      undefined,
    );
  }, [user?.contactId]);

  // Derive attendance overview from courses
  const weekAttendanceData = myCourses.slice(0, 4).map((c: any) => ({
    courseName: c.title || c.name || 'Course',
    percentage: c.attendanceRate ?? c.attendance ?? 0,
  }));

  // Derive student count from course enrollments
  const totalStudents = myCourses.reduce(
    (sum, c) =>
      sum + (c.enrolledCount || c.studentCount || c.enrollments?.length || 0),
    0,
  );

  const activeClassesCount = myCourses.length;

  return (
    <Layout>
      <div className={classes.root}>
        {/* Banner */}
        <div className={classes.banner}>
          <div className={classes.bannerCircle1} />
          <div className={classes.bannerCircle2} />
          <div style={{ position: 'relative' }}>
            <div className={classes.bannerTitle}>
              Class &amp; Assessment Reminders
            </div>
            <div className={classes.bannerSub}>
              As top of your teaching schedule, upcoming classes and assessment
              deadlines are highlighted in your dashboard.
            </div>
          </div>
        </div>

        <Grid container spacing={3}>
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <Grid item xs={12} md={8}>
            {/* Today's Classes */}
            <div className={classes.sectionLabel}>
              <CalendarTodayIcon style={{ fontSize: 15, color: CORAL }} />
              Today's Classes
            </div>
            <div className={classes.card}>
              <div className={classes.cardTitle}>Scheduled for today</div>
              {todayClasses.length === 0 ? (
                <Typography className={classes.emptyText}>
                  No classes scheduled for today
                </Typography>
              ) : (
                todayClasses.map((cls: any, i: number) => {
                  const parts = (cls.startTime || cls.time || '').split(' ');
                  return (
                    <div key={cls.id || i} className={classes.classRow}>
                      <div className={classes.classTimeBlock}>
                        <div className={classes.classTime}>
                          {parts[0] || '—'}
                        </div>
                        <span className={classes.classAmPm}>
                          {parts[1] || ''}
                        </span>
                      </div>
                      <div className={classes.classInfo}>
                        <div className={classes.className}>
                          {cls.courseName || cls.title || 'Class'}
                        </div>
                        <div>
                          {cls.courseCode && (
                            <span className={classes.classCodeBadge}>
                              {cls.courseCode}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: '#8a8f99' }}>
                            {cls.hubName || ''}
                          </span>
                        </div>
                      </div>
                      <div className={classes.studentCount}>
                        <PersonIcon style={{ fontSize: 13 }} />
                        {cls.studentCount || cls.enrolledCount || 0} students
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Recent Submissions */}
            <div className={classes.sectionLabel}>
              <AssignmentIcon style={{ fontSize: 15, color: CORAL }} />
              Recent Submissions
              {pendingCount > 0 && (
                <span className={classes.pendingBadge}>
                  {pendingCount} pending
                </span>
              )}
            </div>
            <div className={classes.card}>
              <div className={classes.cardTitle}>Awaiting your review</div>
              {recentSubmissions.length === 0 ? (
                <Typography className={classes.emptyText}>
                  No pending submissions
                </Typography>
              ) : (
                recentSubmissions.map((sub: any, i: number) => {
                  const initials = (sub.studentName || sub.name || 'S')
                    .split(' ')
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  return (
                    <div key={sub.id || i} className={classes.submissionRow}>
                      <div
                        className={classes.avatar}
                        style={{
                          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={classes.subName}>
                          {sub.studentName || sub.name || 'Student'}
                        </div>
                        <div className={classes.subDesc}>
                          {sub.projectTitle ||
                            sub.assignmentTitle ||
                            sub.title ||
                            'Assignment'}
                        </div>
                        <div className={classes.subTime}>
                          {sub.timeAgo || sub.submittedAt || ''}
                        </div>
                      </div>
                      <Button
                        variant="outlined"
                        size="small"
                        className={classes.reviewBtn}
                        onClick={() =>
                          history.push(localRoutes.teacherAssignments)
                        }
                      >
                        Review
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </Grid>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
          <Grid item xs={12} md={4}>
            {/* Calendar */}
            <div className={classes.rightCard}>
              <MiniCalendar />
            </div>

            {/* Quick Actions */}
            <div className={classes.rightCard}>
              <div className={classes.rightCardTitle}>Quick Actions</div>
              <Button
                variant="contained"
                className={classes.actionBtnPrimary}
                disableElevation
                onClick={() => history.push(localRoutes.teacherAssignments)}
              >
                Create Assignment
              </Button>
              <Button
                variant="outlined"
                className={classes.actionBtnOutline}
                onClick={() => history.push(localRoutes.timetable)}
              >
                Schedule Class
              </Button>
              <Button
                variant="outlined"
                className={classes.actionBtnOutline}
                onClick={() => history.push(localRoutes.trainerResources)}
              >
                Upload Resources
              </Button>
            </div>

            {/* This Week's Attendance */}
            <div className={classes.rightCard}>
              <div className={classes.rightCardTitle}>
                This Week's Attendance
              </div>
              {weekAttendanceData.length === 0 ? (
                <Typography className={classes.emptyText}>
                  No data yet
                </Typography>
              ) : (
                weekAttendanceData.map((row: any, i: number) => (
                  <div key={i} className={classes.attRow}>
                    <div className={classes.attLabelRow}>
                      <span className={classes.attName}>{row.courseName}</span>
                      <span className={classes.attPct}>
                        {row.percentage ?? 0}%
                      </span>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={row.percentage ?? 0}
                      className={classes.attBar}
                      classes={{ bar: classes.attFill }}
                    />
                  </div>
                ))
              )}
            </div>
          </Grid>
        </Grid>

        {/* Bottom Stats */}
        <div className={classes.statStrip}>
          {[
            {
              label: 'Active Classes',
              value: activeClassesCount,
              Icon: SchoolIcon,
              color: CORAL,
              bg: 'rgba(254,58,106,0.08)',
              route: localRoutes.trainerCourses,
            },
            {
              label: 'Total Students',
              value: totalStudents,
              Icon: PeopleIcon,
              color: BLUE,
              bg: 'rgba(59,130,246,0.08)',
              route: null,
            },
            {
              label: 'Pending Grades',
              value: pendingCount,
              Icon: AssignmentIcon,
              color: AMBER,
              bg: 'rgba(245,158,11,0.08)',
              route: localRoutes.teacherAssignments,
            },
          ].map(({ label, value, Icon, color, bg, route }: any) => (
            <div
              key={label}
              className={classes.statCard}
              onClick={() => route && history.push(route)}
              style={{ cursor: route ? 'pointer' : 'default' }}
            >
              <div className={classes.statIconBox} style={{ background: bg }}>
                <Icon style={{ fontSize: 19, color }} />
              </div>
              <div>
                <div className={classes.statVal}>{value}</div>
                <div className={classes.statLbl}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default TrainerDashboard;
