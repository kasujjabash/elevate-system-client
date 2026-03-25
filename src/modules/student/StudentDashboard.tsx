import React, { useEffect, useState } from 'react';
import { Card, IconButton, Typography, Chip } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import LiveTvIcon from '@material-ui/icons/LiveTv';
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
  isToday,
  subDays,
} from 'date-fns';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/Loading';
import { localRoutes, remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { get } from '../../utils/ajax';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    shell: {
      display: 'flex',
      gap: 24,
      minHeight: '100%',
      alignItems: 'flex-start',
      [theme.breakpoints.down('sm')]: { flexDirection: 'column' },
    },
    main: { flex: 1, minWidth: 0 },
    sidebar: {
      width: 280,
      flexShrink: 0,
      [theme.breakpoints.down('sm')]: { width: '100%' },
    },

    // ── Reminders banner ──────────────────────────────────────────
    reminderBanner: {
      borderRadius: 14,
      background: 'linear-gradient(120deg, #fe3a6a 0%, #fe6a45 100%)',
      padding: '20px 24px',
      marginBottom: 24,
      position: 'relative' as any,
      overflow: 'hidden',
      color: '#fff',
      minHeight: 100,
    },
    reminderTitle: {
      fontWeight: 700,
      fontSize: 16,
      color: '#fff',
      marginBottom: 6,
    },
    reminderText: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
      lineHeight: 1.5,
      maxWidth: '75%',
    },
    reminderDots: {
      display: 'flex',
      gap: 5,
      marginTop: 14,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.4)',
    },
    dotActive: {
      width: 18,
      height: 6,
      borderRadius: 3,
      background: '#fff',
    },
    bannerDecor: {
      position: 'absolute' as any,
      right: -10,
      top: -20,
      width: 140,
      height: 140,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.08)',
    },
    bannerDecor2: {
      position: 'absolute' as any,
      right: 60,
      bottom: -40,
      width: 100,
      height: 100,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.06)',
    },

    // ── Section titles ────────────────────────────────────────────
    sectionTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: '#1f2025',
      marginBottom: 14,
    },

    // ── Module cards ──────────────────────────────────────────────
    modulesRow: {
      display: 'flex',
      gap: 14,
      overflowX: 'auto' as any,
      paddingBottom: 6,
      '&::-webkit-scrollbar': { height: 4 },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(0,0,0,0.12)',
        borderRadius: 4,
      },
    },
    moduleCard: {
      flexShrink: 0,
      width: 200,
      borderRadius: 14,
      background: '#1f2025',
      cursor: 'pointer',
      padding: '18px 16px 16px',
      transition: 'transform 0.15s',
      '&:hover': { transform: 'translateY(-2px)' },
    },
    moduleIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: 'rgba(255,255,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    moduleName: {
      fontSize: 13,
      fontWeight: 700,
      color: '#ffffff',
      lineHeight: 1.3,
      marginBottom: 4,
    },
    moduleCode: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.5)',
    },
    emptyModules: {
      padding: '30px 0',
      textAlign: 'center' as any,
      color: '#b0b5bf',
      fontSize: 13,
    },

    // ── Attendance chart ──────────────────────────────────────────
    chartCard: {
      borderRadius: 14,
      border: '1px solid rgba(0,0,0,0.07)',
      padding: '18px 20px',
      marginTop: 24,
      boxShadow: 'none',
    },
    chartDateRange: {
      fontSize: 11,
      color: '#8a8f99',
      marginBottom: 16,
    },

    // ── Calendar ──────────────────────────────────────────────────
    calCard: {
      borderRadius: 14,
      border: '1px solid rgba(0,0,0,0.07)',
      overflow: 'hidden',
      boxShadow: 'none',
      marginBottom: 16,
    },
    calHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    },
    calMonthLabel: { fontSize: 14, fontWeight: 700, color: '#1f2025' },
    calNavBtn: { padding: 4, color: '#8a8f99' },
    calGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      padding: '10px 12px 8px',
      gap: 1,
    },
    calDayName: {
      textAlign: 'center' as any,
      fontSize: 10,
      fontWeight: 700,
      color: '#b0b5bf',
      letterSpacing: '0.04em',
      paddingBottom: 6,
    },
    calDayCell: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3px 0',
      cursor: 'pointer',
    },
    calDayNum: {
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      fontSize: 12,
      fontWeight: 500,
      color: '#1f2025',
      transition: 'background 0.1s',
      '&:hover': { background: 'rgba(0,0,0,0.05)' },
    },
    calDayToday: {
      background:
        'linear-gradient(135deg, #fe3a6a 0%, #fe8c45 100%) !important',
      color: '#fff !important',
      fontWeight: '700 !important' as any,
    },
    calDayOtherMonth: { opacity: 0.2 },

    // ── Today's Class ─────────────────────────────────────────────
    todayCard: {
      borderRadius: 14,
      border: '1px solid rgba(0,0,0,0.07)',
      padding: '16px',
      boxShadow: 'none',
    },
    todayTitle: {
      fontSize: 14,
      fontWeight: 700,
      color: '#1f2025',
      marginBottom: 12,
    },
    classItem: {
      display: 'flex',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      '&:last-child': { borderBottom: 'none', paddingBottom: 0 },
    },
    classAvatar: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #fe3a6a 0%, #fe8c45 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      flexShrink: 0,
    },
    className: {
      fontSize: 13,
      fontWeight: 600,
      color: '#1f2025',
      lineHeight: 1.3,
    },
    classTime: { fontSize: 11, color: '#8a8f99', marginTop: 2 },
    noClass: {
      fontSize: 12,
      color: '#b0b5bf',
      textAlign: 'center' as any,
      padding: '16px 0',
    },
  }),
);

const COURSE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

const StudentDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [attendanceDays, setAttendanceDays] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date());

  useEffect(() => {
    let done = 0;
    const finish = () => {
      done += 1;
      if (done >= 1) setLoading(false);
    };

    get(
      remoteRoutes.myCourses,
      (data) => setEnrollments(Array.isArray(data) ? data : []),
      undefined,
      finish,
    );

    // Timetable sessions
    if (user?.contactId) {
      get(
        `${remoteRoutes.timetable}?studentId=${user.contactId}`,
        (data: any) =>
          setSessions(Array.isArray(data) ? data : data?.sessions || []),
        undefined,
        undefined,
      );
    }

    // Attendance for last 7 days — uses student's own records
    get(
      `${remoteRoutes.attendanceSessions}?studentView=true&days=7`,
      (data: any) => {
        if (Array.isArray(data) && data.length) {
          const counts: number[] = data
            .slice(0, 7)
            .map((d: any) => d.count || 0);
          if (counts.length) setAttendanceDays(counts);
        }
      },
      undefined,
      undefined,
    );
  }, [user?.contactId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading)
    return (
      <Layout>
        <Loading />
      </Layout>
    );

  // Today's sessions
  const todayDow = new Date().getDay(); // 0=Sun
  const todaySessions = sessions.filter((s: any) => {
    const dow = typeof s.dayOfWeek === 'number' ? s.dayOfWeek : -1;
    return dow === todayDow;
  });

  // Calendar grid
  const monthStart = startOfMonth(calMonth);
  const monthEnd = endOfMonth(calMonth);
  const calDays: Date[] = [];
  let cur = startOfWeek(monthStart, { weekStartsOn: 1 });
  while (cur <= endOfWeek(monthEnd, { weekStartsOn: 1 })) {
    calDays.push(cur);
    cur = addDays(cur, 1);
  }

  // Last 7 day labels for chart
  const last7 = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), 'dd MMM'),
  );
  const chartFrom = format(subDays(new Date(), 6), 'do MMM yyyy');
  const chartTo = format(new Date(), 'do MMM yyyy');

  const barData = {
    labels: last7,
    datasets: [
      {
        label: 'Attendance',
        data: attendanceDays,
        backgroundColor: 'rgba(254,58,106,0.15)',
        borderColor: '#fe3a6a',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    legend: { display: false },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            stepSize: 20,
            max: 100,
            fontColor: '#8a8f99',
            fontSize: 11,
          },
          gridLines: { color: 'rgba(0,0,0,0.05)' },
        },
      ],
      xAxes: [
        {
          ticks: { fontColor: '#8a8f99', fontSize: 11 },
          gridLines: { display: false },
        },
      ],
    },
  };

  return (
    <Layout>
      <div className={classes.shell}>
        {/* ══ MAIN CONTENT ══════════════════════════════════════════════ */}
        <div className={classes.main}>
          {/* Reminders Banner */}
          <div className={classes.reminderBanner}>
            <div className={classes.bannerDecor} />
            <div className={classes.bannerDecor2} />
            <Typography className={classes.reminderTitle}>
              Class &amp; Assessment Reminders
            </Typography>
            <Typography className={classes.reminderText}>
              Stay on top of your schedule. Upcoming classes and exam dates are
              now highlighted in your dashboard to help you plan ahead.
            </Typography>
            <div className={classes.reminderDots}>
              <div className={classes.dotActive} />
              <div className={classes.dot} />
              <div className={classes.dot} />
            </div>
          </div>

          {/* My Modules */}
          <Typography className={classes.sectionTitle}>My Modules</Typography>
          {enrollments.length === 0 ? (
            <div className={classes.emptyModules}>No modules enrolled yet.</div>
          ) : (
            <div className={classes.modulesRow}>
              {enrollments.map((en: any, i: number) => (
                <div
                  key={en.id || i}
                  className={classes.moduleCard}
                  onClick={() =>
                    history.push(
                      `${localRoutes.myCourses}/${en.courseId || en.id}`,
                    )
                  }
                  style={{ background: i % 2 === 0 ? '#1f2025' : '#2a2d35' }}
                >
                  <div className={classes.moduleIconWrap}>
                    <MenuBookIcon
                      style={{
                        fontSize: 20,
                        color: COURSE_COLORS[i % COURSE_COLORS.length],
                      }}
                    />
                  </div>
                  <div className={classes.moduleName}>
                    {en.courseName || en.name || 'Module'}
                  </div>
                  <div className={classes.moduleCode}>
                    {en.courseCode || en.code || `${i + 1}.1 – ${i + 1}.4`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Attendance chart */}
          <Card className={classes.chartCard} elevation={0}>
            <Typography
              className={classes.sectionTitle}
              style={{ marginBottom: 4 }}
            >
              Class Attendance in last 7 days
            </Typography>
            <Typography className={classes.chartDateRange}>
              {chartFrom} – {chartTo}
            </Typography>
            <Bar data={barData} options={barOptions} height={90} />
          </Card>
        </div>

        {/* ══ RIGHT SIDEBAR ═════════════════════════════════════════════ */}
        <div className={classes.sidebar}>
          {/* Calendar */}
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

            <div className={classes.calGrid}>
              {DOW.map((dn) => (
                <div key={dn} className={classes.calDayName}>
                  {dn}
                </div>
              ))}
              {calDays.map((day, i) => {
                const otherMonth = !isSameMonth(day, calMonth);
                const todayDay = isToday(day);
                return (
                  <div
                    key={i}
                    className={`${classes.calDayCell} ${
                      otherMonth ? classes.calDayOtherMonth : ''
                    }`}
                  >
                    <span
                      className={`${classes.calDayNum} ${
                        todayDay ? classes.calDayToday : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Today's Class */}
          <Card className={classes.todayCard} elevation={0}>
            <Typography className={classes.todayTitle}>
              Today's Class
            </Typography>

            {todaySessions.length === 0 ? (
              <div className={classes.noClass}>
                You have no upcoming Lectures
              </div>
            ) : (
              todaySessions.map((s: any, i: number) => (
                <div key={i} className={classes.classItem}>
                  <div className={classes.classAvatar}>
                    <LiveTvIcon style={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <div className={classes.className}>
                      {s.courseName || s.subject || 'Class'}
                    </div>
                    <div className={classes.classTime}>
                      {s.startTime} – {s.endTime}
                    </div>
                    {s.isLive && (
                      <Chip
                        label="Live"
                        size="small"
                        style={{
                          backgroundColor: '#fe3a6a',
                          color: '#fff',
                          fontSize: 10,
                          height: 18,
                          marginTop: 4,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
