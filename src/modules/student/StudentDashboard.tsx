import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import EventNoteIcon from '@material-ui/icons/EventNote';
import SchoolIcon from '@material-ui/icons/School';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/Loading';
import { localRoutes, remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { get, search } from '../../utils/ajax';

const CAL_WIDTH = 280;
const COURSE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const formatTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};
const isSessionInProgress = (s: any) => {
  const now = new Date();
  if (now.getDay() !== s.dayOfWeek) return false;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= toMinutes(s.startTime) && nowMin < toMinutes(s.endTime);
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    shell: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 24,
      minHeight: '100%',
      [theme.breakpoints.down('sm')]: { flexDirection: 'column' },
    },
    calPanel: {
      width: CAL_WIDTH,
      flexShrink: 0,
      position: 'sticky' as any,
      top: 0,
      [theme.breakpoints.down('sm')]: {
        width: '100%',
        position: 'static' as any,
      },
    },
    calCard: {
      borderRadius: 14,
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    },
    calHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    },
    calMonthLabel: { fontSize: 14, fontWeight: 700, color: '#1f2025' },
    calNavBtn: {
      padding: 4,
      color: '#8a8f99',
      '&:hover': { color: '#1f2025' },
    },
    calGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      padding: '10px 12px 6px',
      gap: 1,
    },
    calDayName: {
      textAlign: 'center' as any,
      fontSize: 10,
      fontWeight: 700,
      color: '#b0b5bf',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as any,
      paddingBottom: 6,
    },
    calDayCell: {
      display: 'flex',
      flexDirection: 'column' as any,
      alignItems: 'center',
      padding: '2px 0',
      cursor: 'pointer',
      borderRadius: 8,
      '&:hover $calDayNum': { background: 'rgba(0,0,0,0.05)' },
    },
    calDayNum: {
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      fontSize: 13,
      fontWeight: 500,
      color: '#1f2025',
      transition: 'background 0.1s',
    },
    calDayToday: {
      background:
        'linear-gradient(135deg, #fe3a6a 0%, #fe8c45 100%) !important',
      color: '#fff !important',
      fontWeight: '700 !important' as any,
    },
    calDaySelected: {
      background: 'rgba(254,58,106,0.12)',
      color: '#fe3a6a',
      fontWeight: 700,
    },
    calDayOtherMonth: { opacity: 0.25 },
    dotsRow: { display: 'flex', gap: 2, marginTop: 2 },
    dotClass: {
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: '#6366f1',
    },
    dotAssign: {
      width: 4,
      height: 4,
      borderRadius: '50%',
      background: '#fe3a6a',
    },

    dayPanel: {
      background: '#fafafa',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      padding: '12px 16px 14px',
    },
    dayPanelLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: '#8a8f99',
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as any,
      marginBottom: 8,
    },
    dayEventRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      padding: '6px 0',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      '&:last-child': { borderBottom: 'none', paddingBottom: 0 },
    },
    dayEventDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      marginTop: 4,
      flexShrink: 0,
    },
    dayEventTitle: {
      fontSize: 12,
      fontWeight: 600,
      color: '#1f2025',
      lineHeight: 1.3,
    },
    dayEventSub: { fontSize: 11, color: '#8a8f99' },
    noEvents: {
      fontSize: 12,
      color: '#c4c9d4',
      textAlign: 'center' as any,
      padding: '6px 0',
    },

    content: { flex: 1, minWidth: 0, order: 1 },
    welcome: {
      fontSize: 22,
      fontWeight: 700,
      color: '#1f2025',
      letterSpacing: '-0.02em',
    },
    welcomeSub: {
      fontSize: 13,
      color: '#8a8f99',
      marginTop: 2,
      marginBottom: theme.spacing(2),
    },

    // Next-class banner
    nextClassBanner: {
      borderRadius: 14,
      padding: theme.spacing(2),
      marginBottom: theme.spacing(2.5),
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    },
    pulseRing: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      position: 'relative' as any,
    },
    '@keyframes ripple': {
      '0%': { transform: 'scale(1)', opacity: 0.6 },
      '100%': { transform: 'scale(2.2)', opacity: 0 },
    },
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    ripple: {
      position: 'absolute' as any,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: '$ripple 1.4s ease-out infinite',
    },
    pulseDot: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      animation: '$pulse 1.2s ease-in-out infinite',
      display: 'inline-block',
    },

    statCard: {
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: 'none',
      textAlign: 'center',
      padding: theme.spacing(2),
    },
    statIcon: { fontSize: 32, marginBottom: 4 },
    statValue: {
      fontSize: 26,
      fontWeight: 800,
      letterSpacing: '-0.04em',
      color: '#1f2025',
    },
    statLabel: { fontSize: 11, color: '#8a8f99', marginTop: 2 },
    sectionTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: '#1f2025',
      letterSpacing: '-0.01em',
      margin: theme.spacing(3, 0, 1.5),
    },
    courseCard: {
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: 'none',
      cursor: 'pointer',
      height: '100%',
      transition: 'box-shadow 0.15s',
      '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.09)' },
    },
    progressRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    emptyText: { color: '#b0b5bf', fontSize: 13 },
  }),
);

const StudentDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]); // timetable
  const [loading, setLoading] = useState(true);

  const [calMonth, setCalMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  // Refresh in-progress status every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let done = 0;
    const finish = () => {
      done += 1;
      if (done === 2) setLoading(false);
    };

    get(
      remoteRoutes.myCourses,
      (data) => setEnrollments(Array.isArray(data) ? data : []),
      undefined,
      finish,
    );

    search(
      remoteRoutes.studentSchedule,
      {
        from: format(startOfMonth(calMonth), 'yyyy-MM-dd'),
        to: format(endOfMonth(calMonth), 'yyyy-MM-dd'),
      },
      (data) => setAssignments(data.assignments || []),
      undefined,
      finish,
    );

    // Timetable — gracefully ignore if endpoint not yet live
    if (user.contactId) {
      get(
        `${remoteRoutes.timetable}?studentId=${user.contactId}`,
        (data: any) =>
          setSessions(Array.isArray(data) ? data : data?.sessions || []),
        undefined,
        undefined,
      );
    }
  }, [user.contactId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading)
    return (
      <Layout>
        <Loading />
      </Layout>
    );

  const completedCount = enrollments.filter(
    (e) => e.status === 'completed',
  ).length;

  // ── Next-class / in-progress detection ──────────────────────
  const now = new Date();
  const todayDow = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const inProgressSession = sessions.find(isSessionInProgress);

  const nextSession = sessions
    .filter((s) => {
      if (s.dayOfWeek > todayDow) return true;
      if (s.dayOfWeek === todayDow && toMinutes(s.startTime) > nowMin)
        return true;
      return false;
    })
    .sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    })[0];

  const bannerSession = inProgressSession || nextSession;
  const isLive = !!inProgressSession;
  const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // ── Calendar dots: sessions (indigo) + assignments (coral) ──
  const assignDueDates = new Set(
    assignments.map((a) => format(parseISO(a.date), 'yyyy-MM-dd')),
  );

  // sessions appear on every matching dayOfWeek in the current month
  const sessionDates = new Set<string>();
  const monthStart = startOfMonth(calMonth);
  const monthEnd = endOfMonth(calMonth);
  let d = monthStart;
  while (d <= monthEnd) {
    if (sessions.some((s) => s.dayOfWeek === d.getDay())) {
      sessionDates.add(format(d, 'yyyy-MM-dd'));
    }
    d = addDays(d, 1);
  }

  // ── Selected-day events ──────────────────────────────────────
  const selectedDayStr = format(selectedDay, 'yyyy-MM-dd');
  const selectedDayAssignments = assignments.filter(
    (a) => format(parseISO(a.date), 'yyyy-MM-dd') === selectedDayStr,
  );
  const selectedDayDow = selectedDay.getDay();
  const selectedDaySessions = sessions
    .filter((s) => s.dayOfWeek === selectedDayDow)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  // ── Calendar grid ────────────────────────────────────────────
  const calDays: Date[] = [];
  let cur = startOfWeek(monthStart);
  while (cur <= endOfWeek(monthEnd)) {
    calDays.push(cur);
    cur = addDays(cur, 1);
  }

  const weeklyClassCount = sessions.length; // all recurring sessions = weekly classes

  return (
    <Layout>
      <div className={classes.shell}>
        {/* ══════════ RIGHT: Calendar panel ══════════ */}
        <div className={classes.calPanel} style={{ order: 2 }}>
          <Card className={classes.calCard} elevation={0}>
            <div className={classes.calHeader}>
              <IconButton
                size="small"
                className={classes.calNavBtn}
                onClick={() => setCalMonth(subMonths(calMonth, 1))}
              >
                <ChevronLeftIcon style={{ fontSize: 18 }} />
              </IconButton>
              <span className={classes.calMonthLabel}>
                {format(calMonth, 'MMMM yyyy')}
              </span>
              <IconButton
                size="small"
                className={classes.calNavBtn}
                onClick={() => setCalMonth(addMonths(calMonth, 1))}
              >
                <ChevronRightIcon style={{ fontSize: 18 }} />
              </IconButton>
            </div>

            {/* Legend */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                padding: '6px 16px 0',
                fontSize: 10,
                color: '#8a8f99',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#6366f1',
                    display: 'inline-block',
                  }}
                />
                Class
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#fe3a6a',
                    display: 'inline-block',
                  }}
                />
                Assignment due
              </span>
            </div>

            <div className={classes.calGrid}>
              {DOW.map((dn) => (
                <div key={dn} className={classes.calDayName}>
                  {dn}
                </div>
              ))}
              {calDays.map((day, i) => {
                const ds = format(day, 'yyyy-MM-dd');
                const hasClass = sessionDates.has(ds);
                const hasAssign = assignDueDates.has(ds);
                const otherMonth = !isSameMonth(day, calMonth);
                const selected = isSameDay(day, selectedDay);
                const todayDay = isToday(day);
                return (
                  <div
                    key={i}
                    className={`${classes.calDayCell} ${
                      otherMonth ? classes.calDayOtherMonth : ''
                    }`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span
                      className={`${classes.calDayNum} ${
                        todayDay
                          ? classes.calDayToday
                          : selected
                          ? classes.calDaySelected
                          : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {!otherMonth && (hasClass || hasAssign) && (
                      <div className={classes.dotsRow}>
                        {hasClass && <div className={classes.dotClass} />}
                        {hasAssign && <div className={classes.dotAssign} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected-day panel */}
            <div className={classes.dayPanel}>
              <div className={classes.dayPanelLabel}>
                {format(selectedDay, 'EEE, dd MMM')}
              </div>

              {selectedDaySessions.length === 0 &&
                selectedDayAssignments.length === 0 && (
                  <div className={classes.noEvents}>Nothing scheduled</div>
                )}

              {selectedDaySessions.map((s: any) => {
                const live = isSessionInProgress(s) && isToday(selectedDay);
                return (
                  <div key={`s-${s.id}`} className={classes.dayEventRow}>
                    <div
                      className={classes.dayEventDot}
                      style={{
                        background: live ? '#22c55e' : '#6366f1',
                        boxShadow: live
                          ? '0 0 0 3px rgba(34,197,94,0.25)'
                          : undefined,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className={classes.dayEventTitle}>
                        {s.courseName}
                        {live && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#22c55e',
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: 10,
                              padding: '1px 6px',
                            }}
                          >
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className={classes.dayEventSub}>
                        {formatTime(s.startTime)} – {formatTime(s.endTime)}
                        {s.location && ` · ${s.location}`}
                      </div>
                    </div>
                  </div>
                );
              })}

              {selectedDayAssignments.map((ev: any) => (
                <div key={`a-${ev.id}`} className={classes.dayEventRow}>
                  <div
                    className={classes.dayEventDot}
                    style={{ background: '#fe3a6a' }}
                  />
                  <div>
                    <div className={classes.dayEventTitle}>{ev.title}</div>
                    <div className={classes.dayEventSub}>
                      Due · {ev.courseTitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ══════════ LEFT: Main content ══════════ */}
        <div className={classes.content}>
          <div className={classes.welcome}>
            Welcome back, {user.fullName?.split(' ')[0] || 'Student'}!
          </div>
          <div className={classes.welcomeSub}>
            {format(now, 'EEEE, MMMM d')} · Your learning overview
          </div>

          {/* ── Next class / In-progress banner ── */}
          {bannerSession && (
            <div
              className={classes.nextClassBanner}
              style={{
                background: isLive
                  ? 'linear-gradient(135deg, rgba(34,197,94,0.10) 0%, rgba(16,185,129,0.06) 100%)'
                  : 'linear-gradient(135deg, rgba(254,58,106,0.08) 0%, rgba(254,140,69,0.06) 100%)',
                border: isLive
                  ? '1px solid rgba(34,197,94,0.25)'
                  : '1px solid rgba(254,58,106,0.18)',
              }}
            >
              {/* Pulsing ring */}
              <div
                className={classes.pulseRing}
                style={{
                  background: isLive
                    ? 'rgba(34,197,94,0.12)'
                    : 'rgba(254,58,106,0.10)',
                }}
              >
                <div
                  className={classes.ripple}
                  style={{
                    background: isLive
                      ? 'rgba(34,197,94,0.25)'
                      : 'rgba(254,58,106,0.2)',
                  }}
                />
                <EventNoteIcon
                  style={{
                    fontSize: 22,
                    color: isLive ? '#22c55e' : '#fe3a6a',
                    position: 'relative',
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isLive ? '#22c55e' : '#fe3a6a',
                    marginBottom: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isLive ? (
                    <>
                      <span
                        className={classes.pulseDot}
                        style={{ backgroundColor: '#22c55e' }}
                      />
                      Class in Progress
                    </>
                  ) : (
                    'Next Class'
                  )}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#1f2025',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {bannerSession.courseName}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#5a5e6b',
                    marginTop: 2,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <span
                    style={{ display: 'flex', alignItems: 'center', gap: 3 }}
                  >
                    <AccessTimeIcon style={{ fontSize: 12 }} />
                    {DAY_NAMES[bannerSession.dayOfWeek]} ·{' '}
                    {formatTime(bannerSession.startTime)} –{' '}
                    {formatTime(bannerSession.endTime)}
                  </span>
                  {bannerSession.location && (
                    <span
                      style={{ display: 'flex', alignItems: 'center', gap: 3 }}
                    >
                      <LocationOnIcon style={{ fontSize: 12 }} />
                      {bannerSession.location}
                    </span>
                  )}
                </div>
              </div>

              {isLive && (
                <Chip
                  label="LIVE"
                  size="small"
                  style={{
                    fontWeight: 800,
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    backgroundColor: '#22c55e',
                    color: '#fff',
                    borderRadius: 6,
                    height: 22,
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          )}

          {/* Stats */}
          <Grid container spacing={2}>
            {[
              {
                label: 'Enrolled',
                value: enrollments.length,
                icon: SchoolIcon,
                color: '#6366f1',
              },
              {
                label: 'Due This Month',
                value: assignments.length,
                icon: AssignmentIcon,
                color: '#fe3a6a',
              },
              {
                label: 'Completed',
                value: completedCount,
                icon: CheckCircleIcon,
                color: '#10b981',
              },
              {
                label: 'Classes / Week',
                value: weeklyClassCount,
                icon: EventNoteIcon,
                color: '#f59e0b',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Grid item xs={6} sm={3} key={s.label}>
                  <Card className={classes.statCard} elevation={0}>
                    <Icon
                      className={classes.statIcon}
                      style={{ color: s.color }}
                    />
                    <div className={classes.statValue}>{s.value}</div>
                    <div className={classes.statLabel}>{s.label}</div>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* My Courses */}
          <div className={classes.sectionTitle}>My Courses</div>
          {enrollments.length === 0 ? (
            <Typography className={classes.emptyText}>
              No courses yet.{' '}
              <span
                style={{
                  color: '#fe3a6a',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={() => history.push(localRoutes.catalog)}
              >
                Browse the catalog
              </span>
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {enrollments.slice(0, 6).map((enrollment: any, idx: number) => {
                const course = enrollment.group || enrollment.course || {};
                const progress = enrollment.progress || 0;
                const accent = COURSE_COLORS[idx % COURSE_COLORS.length];
                return (
                  <Grid item xs={12} sm={6} key={enrollment.id}>
                    <Card
                      className={classes.courseCard}
                      elevation={0}
                      onClick={() => {
                        const id = enrollment.courseId || course.id;
                        if (id) history.push(`/my-courses/${id}`);
                      }}
                    >
                      <div
                        style={{
                          height: 4,
                          background: accent,
                          borderRadius: '12px 12px 0 0',
                        }}
                      />
                      <CardContent style={{ paddingBottom: 16 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={1}
                        >
                          <Typography
                            variant="subtitle2"
                            style={{ fontWeight: 700, fontSize: 13 }}
                          >
                            {course.name || course.title || 'Course'}
                          </Typography>
                          <Chip
                            label={enrollment.status || 'Active'}
                            size="small"
                            style={{
                              fontSize: 10,
                              height: 20,
                              fontWeight: 700,
                              background:
                                enrollment.status === 'completed'
                                  ? 'rgba(16,185,129,0.1)'
                                  : 'rgba(99,102,241,0.1)',
                              color:
                                enrollment.status === 'completed'
                                  ? '#10b981'
                                  : '#6366f1',
                            }}
                          />
                        </Box>
                        <div className={classes.progressRow}>
                          <Typography
                            variant="caption"
                            style={{ color: '#8a8f99' }}
                          >
                            Progress
                          </Typography>
                          <Typography
                            variant="caption"
                            style={{ fontWeight: 700, color: accent }}
                          >
                            {progress}%
                          </Typography>
                        </div>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          style={{
                            height: 5,
                            borderRadius: 4,
                            background: 'rgba(0,0,0,0.06)',
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Upcoming assignments */}
          {assignments.length > 0 && (
            <>
              <div className={classes.sectionTitle}>Upcoming Assignments</div>
              <Grid container spacing={2}>
                {assignments.slice(0, 4).map((a: any) => (
                  <Grid item xs={12} sm={6} key={a.id}>
                    <Card
                      elevation={0}
                      style={{
                        borderRadius: 12,
                        border: '1px solid rgba(0,0,0,0.07)',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: 'rgba(254,58,106,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <AssignmentIcon
                          style={{ fontSize: 18, color: '#fe3a6a' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#1f2025',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {a.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#8a8f99' }}>
                          {a.courseTitle} · Due{' '}
                          {format(parseISO(a.date), 'dd MMM')}
                        </div>
                      </div>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
