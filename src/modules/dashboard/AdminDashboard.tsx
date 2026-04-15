import React, { useEffect, useMemo, useState } from 'react';
import { Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/People';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import BlockIcon from '@material-ui/icons/Block';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { Bar } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { search } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import { IState } from '../../data/types';

const CORAL = '#E72C6C';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';
const GREEN = '#10b981';

const useStyles = makeStyles((theme: Theme) => ({
  root: { minHeight: '100%' },

  banner: {
    background: `linear-gradient(120deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 14,
    padding: '20px 28px',
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: { padding: '16px 18px' },
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 2,
  },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.82)' },

  // ── KPI cards — equal height via flex stretch ────────────────────────────
  kpiCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    width: '100%',
    boxSizing: 'border-box' as any,
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiNum: { fontSize: 26, fontWeight: 800, color: DARK, lineHeight: 1 },
  kpiLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4, fontWeight: 600 },
  kpiSub: { fontSize: 11, fontWeight: 700, marginTop: 2 },

  // ── Section label ────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 12,
    marginTop: 28,
  },

  // ── Hub cards ────────────────────────────────────────────────────────────
  hubCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s',
    width: '100%',
    boxSizing: 'border-box' as any,
    '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.1)' },
  },
  hubStripe: {
    height: 6,
    width: '100%',
  },
  hubBody: { padding: '14px 16px 16px' },
  hubName: { fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 10 },
  hubTotal: { fontSize: 32, fontWeight: 800, color: DARK, lineHeight: 1 },
  hubTotalLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 600,
    marginTop: 2,
    marginBottom: 12,
  },
  hubRow: { display: 'flex', justifyContent: 'space-between', marginTop: 6 },
  hubStat: { fontSize: 12, fontWeight: 700 },
  hubStatLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 600,
    marginTop: 1,
  },
  hubBar: { height: 3, borderRadius: 2, background: '#f3f4f6', marginTop: 12 },

  // ── Chart card ───────────────────────────────────────────────────────────
  chartCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '18px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    height: '100%',
    boxSizing: 'border-box' as any,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.06em',
    marginBottom: 16,
  },

  emptyText: {
    fontSize: 13,
    color: '#c0c4ce',
    textAlign: 'center' as any,
    padding: '24px 0',
  },
}));

const AdminDashboard = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);
  const firstName = user?.fullName?.split(' ')[0] || user?.username || 'Admin';
  const todayLabel = format(new Date(), 'EEEE, MMMM d');

  const [todayAttendance, setTodayAttendance] = useState(0);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);

  useEffect(() => {
    search(
      remoteRoutes.dashboardStats,
      {},
      (data: any) => {
        if (data?.todayAttendance) setTodayAttendance(data.todayAttendance);
      },
      undefined,
      undefined,
    );

    search(
      remoteRoutes.students,
      { limit: 10000, skip: 0 },
      (data: any) => {
        const list = data?.data || (Array.isArray(data) ? data : []);
        setAllStudents(list);
      },
      undefined,
      undefined,
    );

    // Attendance sessions for the past 30 days — used for the attendance chart
    search(
      remoteRoutes.attendanceSessions,
      { limit: 200 },
      (data: any) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setAttendanceSessions(list);
      },
      undefined,
      undefined,
    );
  }, []);

  // ── Derived KPI numbers ───────────────────────────────────────────────────
  const total = allStudents.length;
  const active = allStudents.filter(
    (s) => (s.status || '').toLowerCase() === 'active',
  ).length;
  const inactive = total - active;
  const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
  const absentRate = 100 - activeRate;

  // ── Hub breakdown ─────────────────────────────────────────────────────────
  const hubBreakdown = useMemo(() => {
    const map: Record<
      string,
      { hub: string; name: string; total: number; active: number }
    > = {};
    allStudents.forEach((s) => {
      const key = s.hub || 'unknown';
      if (!map[key]) {
        map[key] = {
          hub: key,
          name: s.hubName || key.charAt(0).toUpperCase() + key.slice(1),
          total: 0,
          active: 0,
        };
      }
      map[key].total++;
      if ((s.status || '').toLowerCase() === 'active') map[key].active++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [allStudents]);

  // ── Course breakdown ──────────────────────────────────────────────────────
  const courseBreakdown = useMemo(() => {
    const map: Record<
      string,
      { course: string; total: number; active: number }
    > = {};
    allStudents.forEach((s) => {
      const key = s.course || 'Uncategorised';
      if (!map[key]) map[key] = { course: key, total: 0, active: 0 };
      map[key].total++;
      if ((s.status || '').toLowerCase() === 'active') map[key].active++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [allStudents]);

  // ── Attendance chart: past 7 days grouped from sessions ──────────────────
  const attendanceChartData = useMemo(() => {
    // Build a map of the last 7 days (today → 6 days ago)
    const days: { label: string; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      days.push({ label: format(d, 'EEE'), date: format(d, 'yyyy-MM-dd') });
    }

    // Count attendances per day from sessions
    const countByDate: Record<string, number> = {};
    days.forEach((d) => (countByDate[d.date] = 0));
    attendanceSessions.forEach((s) => {
      const raw = s.date || s.sessionDate || s.createdAt || s.startTime || '';
      const dateStr = raw ? raw.slice(0, 10) : '';
      if (dateStr in countByDate) {
        // Each session has an attendanceCount, checkinCount, or count field
        const n = s.attendanceCount ?? s.checkinCount ?? s.count ?? 1;
        countByDate[dateStr] += Number(n);
      }
    });

    return {
      labels: days.map((d) => d.label),
      datasets: [
        {
          label: 'Check-ins',
          data: days.map((d) => countByDate[d.date]),
          backgroundColor: days.map((_, i) =>
            i === 6 ? CORAL : 'rgba(231,44,108,0.15)',
          ),
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [attendanceSessions]);

  const barOpts: any = {
    responsive: true,
    legend: { display: false },
    scales: {
      yAxes: [
        {
          ticks: { beginAtZero: true, precision: 0 },
          gridLines: { color: '#f3f4f6' },
        },
      ],
      xAxes: [{ gridLines: { display: false }, ticks: { fontSize: 11 } }],
    },
  };

  const maxCourse = courseBreakdown.reduce((m, c) => Math.max(m, c.total), 1);

  return (
    <Layout>
      <div className={classes.root}>
        {/* ── Banner ────────────────────────────────────────────────────── */}
        <div className={classes.banner}>
          <div>
            <div className={classes.bannerTitle}>Good morning, {firstName}</div>
            <div className={classes.bannerSub}>{todayLabel}</div>
          </div>
        </div>

        {/* ── KPI cards (equal height via alignItems=stretch + display:flex on item) */}
        <Grid container spacing={2} alignItems="stretch">
          {[
            {
              label: 'Total Students',
              value: total,
              Icon: PeopleIcon,
              color: CORAL,
              bg: 'rgba(231,44,108,0.08)',
            },
            {
              label: 'Active Students',
              value: active,
              Icon: CheckCircleOutlineIcon,
              color: GREEN,
              bg: 'rgba(16,185,129,0.08)',
              sub: `${activeRate}% of total`,
              subColor: GREEN,
            },
            {
              label: 'Inactive / Absent',
              value: inactive,
              Icon: BlockIcon,
              color: CORAL,
              bg: 'rgba(231,44,108,0.06)',
              sub: `${absentRate}% absent rate`,
              subColor: CORAL,
            },
            {
              label: 'Total Attendance Today',
              value: todayAttendance,
              Icon: HowToRegIcon,
              color: GREEN,
              bg: 'rgba(16,185,129,0.08)',
            },
          ].map(({ label, value, Icon, color, bg, sub, subColor }: any) => (
            <Grid
              item
              xs={6}
              sm={6}
              md={3}
              key={label}
              style={{ display: 'flex' }}
            >
              <div className={classes.kpiCard}>
                <div className={classes.kpiIcon} style={{ background: bg }}>
                  <Icon style={{ fontSize: 20, color }} />
                </div>
                <div>
                  <div className={classes.kpiNum}>{value}</div>
                  <div className={classes.kpiLabel}>{label}</div>
                  {sub && (
                    <div className={classes.kpiSub} style={{ color: subColor }}>
                      {sub}
                    </div>
                  )}
                </div>
              </div>
            </Grid>
          ))}
        </Grid>

        {/* ── Hub Cards ─────────────────────────────────────────────────── */}
        <div className={classes.sectionLabel}>Students by Hub</div>
        {hubBreakdown.length === 0 ? (
          <Typography className={classes.emptyText}>
            Loading hub data…
          </Typography>
        ) : (
          <Grid container spacing={2} alignItems="stretch">
            {hubBreakdown.map((h) => {
              const ar =
                h.total > 0 ? Math.round((h.active / h.total) * 100) : 0;
              const absent = 100 - ar;
              return (
                <Grid
                  item
                  xs={6}
                  sm={4}
                  md={2}
                  key={h.hub}
                  style={{ display: 'flex' }}
                >
                  <div
                    className={classes.hubCard}
                    onClick={() =>
                      history.push(
                        `${localRoutes.students}?hub=${encodeURIComponent(
                          h.hub,
                        )}`,
                      )
                    }
                  >
                    <div
                      className={classes.hubStripe}
                      style={{ background: CORAL }}
                    />
                    <div className={classes.hubBody}>
                      <div className={classes.hubName}>{h.name}</div>
                      <div className={classes.hubTotal}>{h.total}</div>
                      <div className={classes.hubTotalLabel}>
                        Total Students
                      </div>
                      <div className={classes.hubRow}>
                        <div>
                          <div
                            className={classes.hubStat}
                            style={{ color: GREEN }}
                          >
                            {h.active}
                          </div>
                          <div className={classes.hubStatLabel}>Active</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div
                            className={classes.hubStat}
                            style={{ color: CORAL }}
                          >
                            {absent}%
                          </div>
                          <div className={classes.hubStatLabel}>Absent</div>
                        </div>
                      </div>
                      <div className={classes.hubBar}>
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 2,
                            width: `${ar}%`,
                            background: GREEN,
                            transition: 'width 0.6s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* ── Course list + Attendance chart ────────────────────────────── */}
        <Grid
          container
          spacing={2}
          alignItems="stretch"
          style={{ marginTop: 4 }}
        >
          <Grid
            item
            xs={12}
            md={7}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div className={classes.sectionLabel}>Enrollment by Course</div>
            <div className={classes.chartCard} style={{ flex: 1 }}>
              {courseBreakdown.length === 0 ? (
                <Typography className={classes.emptyText}>Loading…</Typography>
              ) : (
                courseBreakdown.map((c) => {
                  const barWidth = Math.round((c.total / maxCourse) * 100);
                  const activePct =
                    c.total > 0 ? Math.round((c.active / c.total) * 100) : 0;
                  const inactivePct = 100 - activePct;
                  return (
                    <div
                      key={c.course}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 14,
                      }}
                    >
                      {/* Course name */}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: DARK,
                          minWidth: 130,
                          flexShrink: 0,
                        }}
                      >
                        {c.course}
                      </span>
                      {/* Stacked bar — scaled to max enrolled */}
                      <div
                        style={{
                          flex: 1,
                          height: 10,
                          borderRadius: 6,
                          background: '#f3f4f6',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: '100%',
                            display: 'flex',
                            borderRadius: 6,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${activePct}%`,
                              background: GREEN,
                              transition: 'width 0.5s ease',
                            }}
                          />
                          <div
                            style={{
                              width: `${inactivePct}%`,
                              background: 'rgba(231,44,108,0.18)',
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                      </div>
                      {/* Stats */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          minWidth: 72,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: DARK,
                            lineHeight: 1,
                          }}
                        >
                          {c.total}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: GREEN,
                            fontWeight: 700,
                            marginTop: 2,
                          }}
                        >
                          {activePct}% active
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              {/* Legend */}
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: '1px solid #f3f4f6',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    color: '#9ca3af',
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: GREEN,
                      display: 'inline-block',
                    }}
                  />
                  Active
                </span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    color: '#9ca3af',
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: 'rgba(231,44,108,0.25)',
                      display: 'inline-block',
                    }}
                  />
                  Inactive
                </span>
              </div>
            </div>
          </Grid>

          <Grid
            item
            xs={12}
            md={5}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div className={classes.sectionLabel}>Attendance — Past 7 Days</div>
            <div className={classes.chartCard} style={{ flex: 1 }}>
              <div className={classes.chartTitle}>
                Daily check-ins across all hubs
              </div>
              <Bar data={attendanceChartData} options={barOpts} height={120} />
            </div>
          </Grid>
        </Grid>

        <div style={{ height: 32 }} />
      </div>
    </Layout>
  );
};

export default AdminDashboard;
