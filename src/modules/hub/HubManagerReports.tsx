import React, { useEffect, useMemo, useState } from 'react';
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
import BlockIcon from '@material-ui/icons/Block';
import SchoolIcon from '@material-ui/icons/School';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import GetAppIcon from '@material-ui/icons/GetApp';
import {
  format,
  parseISO,
  subDays,
  subMonths,
  subQuarters,
  subYears,
  isAfter,
} from 'date-fns';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { search } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';
const GREEN = '#10b981';
const AMBER = '#f59e0b';
const BLUE = '#3b82f6';
const PURPLE = '#8b5cf6';

const COURSE_COLORS = [
  CORAL,
  BLUE,
  PURPLE,
  AMBER,
  GREEN,
  ORANGE,
  '#06b6d4',
  '#ec4899',
];

const DATE_RANGES = [
  { label: 'All Time', key: 'all' },
  { label: 'This Year', key: 'year' },
  { label: 'This Quarter', key: 'quarter' },
  { label: 'This Month', key: 'month' },
  { label: 'This Week', key: 'week' },
];

const useStyles = makeStyles((theme: Theme) => ({
  root: { paddingBottom: 32 },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap' as any,
    gap: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: 800, color: DARK },
  pageSub: { fontSize: 13, color: '#8a8f99', marginTop: 2 },

  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid rgba(0,0,0,0.12)',
    color: DARK,
    borderRadius: 8,
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 600,
    background: '#fff',
    cursor: 'pointer',
    '&:hover': { background: '#fafafa' },
  },

  // Date range filter chips
  filterRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap' as any,
  },
  chip: {
    padding: '5px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#fff',
    color: '#5a5e6b',
    transition: 'all 0.15s',
    '&:hover': { borderColor: CORAL, color: CORAL },
  },
  chipActive: {
    background: `linear-gradient(135deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    color: '#fff',
    border: '1px solid transparent',
  },

  // KPI stat cards
  statCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    height: '100%',
    boxSizing: 'border-box' as any,
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statValue: { fontSize: 26, fontWeight: 800, color: DARK, lineHeight: 1 },
  statLabel: {
    fontSize: 10,
    color: '#8a8f99',
    marginTop: 3,
    fontWeight: 600,
    textTransform: 'uppercase' as any,
    letterSpacing: '0.04em',
  },
  statSub: { fontSize: 11, marginTop: 2, fontWeight: 600 },

  // Section cards
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '18px 22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    height: '100%',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: DARK,
    marginBottom: 16,
  },
  cardSub: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: 500,
    marginBottom: 16,
  },

  // Course enrollment bars
  courseRow: {
    marginBottom: 12,
    '&:last-child': { marginBottom: 0 },
  },
  courseLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  courseName: { fontSize: 12, fontWeight: 600, color: DARK },
  courseCount: { fontSize: 12, fontWeight: 700 },
  courseBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  courseBarFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.5s ease',
  },

  // Status breakdown
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    '&:last-child': { marginBottom: 0 },
  },
  statusDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  statusLabel: { fontSize: 12, color: DARK, flex: 1, fontWeight: 500 },
  statusCount: { fontSize: 13, fontWeight: 700, color: DARK },
  statusPct: {
    fontSize: 11,
    color: '#9ca3af',
    minWidth: 36,
    textAlign: 'right' as any,
  },
  // Monthly registrations bar chart
  monthChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 6,
    height: 120,
    marginTop: 8,
    paddingBottom: 4,
  },
  monthBar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    background: `linear-gradient(180deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    minWidth: 12,
    transition: 'height 0.4s ease',
    position: 'relative' as any,
    cursor: 'default',
    '&:hover': { opacity: 0.85 },
  },
  monthLabel: {
    fontSize: 9,
    color: '#8a8f99',
    textAlign: 'center' as any,
    marginTop: 5,
  },
  monthTooltip: {
    position: 'absolute' as any,
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: DARK,
    color: '#fff',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    whiteSpace: 'nowrap' as any,
    marginBottom: 4,
    pointerEvents: 'none' as any,
  },

  // Student table
  tableCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    marginTop: 20,
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 22px 12px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  tableTitle: { fontSize: 13, fontWeight: 700, color: DARK },
  tableCount: { fontSize: 12, color: '#9ca3af', fontWeight: 500 },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
    padding: '10px 22px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    background: '#fafafa',
    [theme.breakpoints.down('sm')]: { display: 'none' },
  },
  tableHeadCell: {
    fontSize: 10,
    fontWeight: 700,
    color: '#8a8f99',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.05em',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
    padding: '12px 22px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    alignItems: 'center',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: '#fafafa' },
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr 1fr', gap: 8 },
  },
  cellMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    fontWeight: 600,
    color: DARK,
  },
  cell: { fontSize: 13, color: '#5a5e6b' },
  statusBadge: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 20,
    padding: '2px 10px',
    display: 'inline-block',
  },
  emptyState: {
    padding: '40px 22px',
    textAlign: 'center' as any,
    color: '#c0c4ce',
    fontSize: 13,
  },

  progressBar: { height: 5, borderRadius: 3, backgroundColor: '#f3f4f6' },
  progressFill: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 3,
  },
}));

function getDateCutoff(rangeKey: string): Date | null {
  const now = new Date();
  if (rangeKey === 'week') return subDays(now, 7);
  if (rangeKey === 'month') return subMonths(now, 1);
  if (rangeKey === 'quarter') return subQuarters(now, 1);
  if (rangeKey === 'year') return subYears(now, 1);
  return null;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> =
  {
    active: { bg: 'rgba(16,185,129,0.1)', text: '#065f46', dot: GREEN },
    pending: { bg: 'rgba(245,158,11,0.1)', text: '#92400e', dot: AMBER },
    inactive: { bg: 'rgba(254,58,106,0.1)', text: '#991b1b', dot: CORAL },
  };

function getStatusStyle(status: string) {
  return (
    statusColors[(status || '').toLowerCase()] || {
      bg: '#f3f4f6',
      text: '#5a5e6b',
      dot: '#9ca3af',
    }
  );
}

// ── Last 6 months label helper ────────────────────────────────────────────────
function last6Months() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    months.push({
      label: format(d, 'MMM'),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

const HubManagerReports = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  const fetchStudents = (hubSlug: string) => {
    const params: any = { limit: 10000, skip: 0 };
    if (hubSlug) params.hub = hubSlug;
    search(
      remoteRoutes.students,
      params,
      (data: any) => {
        setStudents(data?.data || (Array.isArray(data) ? data : []));
        setLoading(false);
      },
      () => setLoading(false),
      undefined,
    );
  };

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);

    // Step 1 — find the hub this manager owns by matching their email
    search(
      remoteRoutes.hubs,
      {},
      (hubData: any) => {
        const hubs: any[] = Array.isArray(hubData)
          ? hubData
          : hubData?.data || [];
        const myHub = hubs.find(
          (h: any) =>
            (h.managerEmail || '').toLowerCase() ===
            (user.email || '').toLowerCase(),
        );
        const hubSlug = myHub
          ? (myHub.code || myHub.name || '').toLowerCase()
          : '';
        // Step 2 — fetch students scoped to this hub
        fetchStudents(hubSlug);
      },
      // If hub lookup fails, still fetch (backend may scope by JWT)
      () => fetchStudents(''),
      undefined,
    );
  }, [user?.email]);

  // Filter students by date range
  const filteredStudents = useMemo(() => {
    const cutoff = getDateCutoff(dateRange);
    if (!cutoff) return students;
    return students.filter((s) => {
      if (!s.registeredAt) return false;
      try {
        return isAfter(parseISO(s.registeredAt), cutoff);
      } catch {
        return false;
      }
    });
  }, [students, dateRange]);

  // KPIs
  const total = filteredStudents.length;
  const active = filteredStudents.filter(
    (s) => (s.status || '').toLowerCase() === 'active',
  ).length;
  const pending = filteredStudents.filter(
    (s) => (s.status || '').toLowerCase() === 'pending',
  ).length;
  const inactive = filteredStudents.filter(
    (s) => (s.status || '').toLowerCase() === 'inactive',
  ).length;
  const engagementRate = total > 0 ? Math.round((active / total) * 100) : 0;

  // Course breakdown
  const courseBreakdown = useMemo(() => {
    const map: Record<
      string,
      { course: string; total: number; active: number }
    > = {};
    filteredStudents.forEach((s) => {
      const key = s.course || 'Uncategorised';
      if (!map[key]) map[key] = { course: key, total: 0, active: 0 };
      map[key].total++;
      if ((s.status || '').toLowerCase() === 'active') map[key].active++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredStudents]);

  // Monthly registrations (last 6 months, based on all students regardless of date filter)
  const monthBuckets = useMemo(() => {
    const months = last6Months();
    return months.map((m) => ({
      ...m,
      count: students.filter((s) => {
        if (!s.registeredAt) return false;
        try {
          const d = parseISO(s.registeredAt);
          return d.getFullYear() === m.year && d.getMonth() === m.month;
        } catch {
          return false;
        }
      }).length,
    }));
  }, [students]);

  // Hub name
  const hubName = useMemo(() => {
    const s = students[0];
    if (!s) return 'Hub';
    return (
      s.hubName ||
      (s.hub ? s.hub.charAt(0).toUpperCase() + s.hub.slice(1) : 'Hub')
    );
  }, [students]);

  // Sorted student table
  const sortedStudents = useMemo(
    () =>
      [...filteredStudents].sort((a, b) => {
        const da = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
        const db = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
        return db - da;
      }),
    [filteredStudents],
  );

  const handleExport = () => {
    const headers = ['Name', 'Course', 'Status', 'Registered At'];
    const rows = sortedStudents.map((s) => [
      s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
      s.course || '—',
      s.status || '—',
      s.registeredAt ? format(parseISO(s.registeredAt), 'yyyy-MM-dd') : '—',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hubName.toLowerCase()}-hub-students.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className={classes.root}>
        {/* ── Page header ──────────────────────────────────────────── */}
        <div className={classes.pageHeader}>
          <div>
            <div className={classes.pageTitle}>Hub Reports</div>
            <div className={classes.pageSub}>
              {hubName} Hub · Student insights and analytics
            </div>
          </div>
          <button className={classes.exportBtn} onClick={handleExport}>
            <GetAppIcon style={{ fontSize: 16 }} />
            Export CSV
          </button>
        </div>

        {/* ── Date range filter ─────────────────────────────────────── */}
        <div className={classes.filterRow}>
          {DATE_RANGES.map((r) => (
            <button
              key={r.key}
              className={`${classes.chip} ${
                dateRange === r.key ? classes.chipActive : ''
              }`}
              onClick={() => setDateRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* ── KPI stat cards ────────────────────────────────────────── */}
        <Grid container spacing={1} style={{ marginBottom: 16 }}>
          {[
            {
              label: 'Total Students',
              value: loading ? '…' : total,
              Icon: PeopleIcon,
              color: CORAL,
              bg: 'rgba(254,58,106,0.08)',
              sub: null,
            },
            {
              label: 'Active Students',
              value: loading ? '…' : active,
              Icon: HowToRegIcon,
              color: GREEN,
              bg: 'rgba(16,185,129,0.08)',
              sub: total > 0 ? `${engagementRate}% engagement` : null,
            },
            {
              label: 'Inactive / Absent',
              value: loading ? '…' : inactive,
              Icon: BlockIcon,
              color: CORAL,
              bg: 'rgba(254,58,106,0.08)',
              sub: total > 0 ? `${100 - engagementRate}% of total` : null,
            },
            {
              label: 'Courses Active',
              value: loading ? '…' : courseBreakdown.length,
              Icon: SchoolIcon,
              color: PURPLE,
              bg: 'rgba(139,92,246,0.08)',
              sub: null,
            },
            {
              label: 'Engagement Rate',
              value: loading ? '…' : `${engagementRate}%`,
              Icon: TrendingUpIcon,
              color: BLUE,
              bg: 'rgba(59,130,246,0.08)',
              sub: null,
            },
          ].map(({ label, value, Icon, color, bg, sub }) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={true}
              key={label}
              style={{ display: 'flex' }}
            >
              <div className={classes.statCard}>
                <div className={classes.statIconBox} style={{ background: bg }}>
                  <Icon style={{ fontSize: 20, color }} />
                </div>
                <div>
                  <div className={classes.statValue} style={{ color }}>
                    {value}
                  </div>
                  <div className={classes.statLabel}>{label}</div>
                  {/* always render sub slot so all cards are equal height */}
                  <div
                    className={classes.statSub}
                    style={{ color, minHeight: 16 }}
                  >
                    {sub || ''}
                  </div>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>

        {/* ── Enrollment by Course — vertical columns ──────────────── */}
        <div className={classes.card} style={{ marginBottom: 12 }}>
          <div className={classes.cardTitle}>Enrollment by Course</div>
          <div className={classes.cardSub}>
            Students enrolled per course — {hubName} Hub
          </div>
          {loading ? (
            <LinearProgress
              style={{ borderRadius: 4 }}
              classes={{ bar: classes.progressFill }}
            />
          ) : courseBreakdown.length === 0 ? (
            <Typography
              style={{
                color: '#c0c4ce',
                fontSize: 13,
                textAlign: 'center',
                padding: '20px 0',
              }}
            >
              No students enrolled yet
            </Typography>
          ) : (
            <div style={{ position: 'relative', height: 220 }}>
              <Bar
                data={{
                  labels: courseBreakdown.map((c) => c.course),
                  datasets: [
                    {
                      label: 'Students',
                      data: courseBreakdown.map((c) => c.total),
                      backgroundColor: courseBreakdown.map(
                        (_, i) => COURSE_COLORS[i % COURSE_COLORS.length],
                      ),
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  legend: { display: false },
                  scales: {
                    yAxes: [
                      {
                        ticks: {
                          beginAtZero: true,
                          stepSize: 1,
                          fontSize: 11,
                          fontColor: '#9ca3af',
                        },
                        gridLines: { color: '#f3f4f6' },
                      },
                    ],
                    xAxes: [
                      {
                        gridLines: { display: false },
                        ticks: { fontSize: 10, fontColor: '#5a5e6b' },
                      },
                    ],
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* ── Attendance by Class — vertical columns ────────────────── */}
        <div className={classes.card} style={{ marginBottom: 12 }}>
          <div className={classes.cardTitle}>Attendance by Class</div>
          <div className={classes.cardSub}>
            Active student rate per course — {hubName} Hub
          </div>
          {loading ? (
            <LinearProgress
              style={{ borderRadius: 4 }}
              classes={{ bar: classes.progressFill }}
            />
          ) : courseBreakdown.length === 0 ? (
            <Typography
              style={{
                color: '#c0c4ce',
                fontSize: 13,
                textAlign: 'center',
                padding: '20px 0',
              }}
            >
              No data yet
            </Typography>
          ) : (
            <div style={{ position: 'relative', height: 220 }}>
              <Bar
                data={{
                  labels: courseBreakdown.map((c) => c.course),
                  datasets: [
                    {
                      label: 'Active %',
                      data: courseBreakdown.map((c) =>
                        c.total > 0
                          ? Math.round((c.active / c.total) * 100)
                          : 0,
                      ),
                      backgroundColor: CORAL,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  legend: { display: false },
                  scales: {
                    yAxes: [
                      {
                        ticks: {
                          beginAtZero: true,
                          max: 100,
                          stepSize: 20,
                          fontSize: 11,
                          fontColor: '#9ca3af',
                          callback: (v: any) => `${v}%`,
                        },
                        gridLines: { color: '#f3f4f6' },
                      },
                    ],
                    xAxes: [
                      {
                        gridLines: { display: false },
                        ticks: { fontSize: 10, fontColor: '#5a5e6b' },
                      },
                    ],
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* ── Student Status Breakdown ──────────────────────────────── */}
        <div className={classes.card} style={{ marginBottom: 12 }}>
          <div className={classes.cardTitle}>Student Status Breakdown</div>
          <div className={classes.cardSub}>
            Distribution across status categories
          </div>
          {loading ? (
            <LinearProgress
              style={{ borderRadius: 4 }}
              classes={{ bar: classes.progressFill }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                gap: 24,
                alignItems: 'center',
                flexWrap: 'wrap' as any,
              }}
            >
              {/* Doughnut chart */}
              <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                <Doughnut
                  data={{
                    labels: ['Active', 'Pending', 'Inactive'],
                    datasets: [
                      {
                        data: [active, pending, inactive],
                        backgroundColor: [GREEN, AMBER, CORAL],
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    cutoutPercentage: 68,
                    legend: { display: false },
                    tooltips: {
                      callbacks: {
                        label: (item: any, data: any) => {
                          const val = data.datasets[0].data[item.index];
                          const pct =
                            total > 0 ? Math.round((val / total) * 100) : 0;
                          return ` ${
                            data.labels[item.index]
                          }: ${val} (${pct}%)`;
                        },
                      },
                    },
                  }}
                />
              </div>
              {/* Legend + counts */}
              <div style={{ flex: 1, minWidth: 160 }}>
                {[
                  { label: 'Active', count: active, color: GREEN },
                  { label: 'Pending', count: pending, color: AMBER },
                  { label: 'Inactive', count: inactive, color: CORAL },
                ].map(({ label, count, color }) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 5,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: DARK,
                            fontWeight: 600,
                            flex: 1,
                          }}
                        >
                          {label}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color }}>
                          {count}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: '#9ca3af',
                            minWidth: 36,
                            textAlign: 'right' as any,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#f3f4f6',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: color,
                            borderRadius: 3,
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Monthly registrations ─────────────────────────────────── */}
        <Grid container spacing={2} style={{ marginBottom: 12 }}>
          <Grid item xs={12}>
            <div className={classes.card}>
              <div className={classes.cardTitle}>
                New Student Registrations — Last 6 Months
              </div>
              <div className={classes.cardSub}>
                Count of students registered each month across all time
              </div>
              {loading ? (
                <LinearProgress
                  style={{ borderRadius: 4 }}
                  classes={{ bar: classes.progressFill }}
                />
              ) : (
                <div style={{ position: 'relative', height: 200 }}>
                  <Bar
                    data={{
                      labels: monthBuckets.map((m) => m.label),
                      datasets: [
                        {
                          label: 'Registrations',
                          data: monthBuckets.map((m) => m.count),
                          backgroundColor: CORAL,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      legend: { display: false },
                      scales: {
                        yAxes: [
                          {
                            ticks: {
                              beginAtZero: true,
                              stepSize: 1,
                              fontSize: 11,
                              fontColor: '#9ca3af',
                            },
                            gridLines: { color: '#f3f4f6' },
                          },
                        ],
                        xAxes: [
                          {
                            gridLines: { display: false },
                            ticks: { fontSize: 11, fontColor: '#5a5e6b' },
                          },
                        ],
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </Grid>
        </Grid>

        {/* ── Student table ─────────────────────────────────────────── */}
        <div className={classes.tableCard}>
          <div className={classes.tableHeader}>
            <div className={classes.tableTitle}>
              {hubName} Hub Students —{' '}
              {DATE_RANGES.find((r) => r.key === dateRange)?.label}
            </div>
            <div className={classes.tableCount}>
              {loading ? '…' : `${total} student${total !== 1 ? 's' : ''}`}
            </div>
          </div>

          <div className={classes.tableHead}>
            {['Student', 'Course', 'Status', 'Registered'].map((h) => (
              <div key={h} className={classes.tableHeadCell}>
                {h}
              </div>
            ))}
          </div>

          {loading ? (
            <LinearProgress
              style={{ borderRadius: 0 }}
              classes={{ bar: classes.progressFill }}
            />
          ) : sortedStudents.length === 0 ? (
            <div className={classes.emptyState}>
              No students found for this time range
            </div>
          ) : (
            sortedStudents.slice(0, 50).map((s, i) => {
              const name =
                s.name ||
                `${s.firstName || ''} ${s.lastName || ''}`.trim() ||
                '—';
              const status = (s.status || 'unknown').toLowerCase();
              const style = getStatusStyle(status);
              return (
                <div key={s.id || i} className={classes.tableRow}>
                  <div className={classes.cellMain}>
                    <Avatar
                      src={s.avatar || undefined}
                      style={{
                        width: 28,
                        height: 28,
                        fontSize: 11,
                        background: CORAL,
                        flexShrink: 0,
                      }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name}
                    </span>
                  </div>
                  <div className={classes.cell}>{s.course || '—'}</div>
                  <div>
                    <span
                      className={classes.statusBadge}
                      style={{ background: style.bg, color: style.text }}
                    >
                      {status}
                    </span>
                  </div>
                  <div className={classes.cell}>
                    {s.registeredAt
                      ? format(parseISO(s.registeredAt), 'MMM d, yyyy')
                      : '—'}
                  </div>
                </div>
              );
            })
          )}
          {!loading && sortedStudents.length > 50 && (
            <div
              style={{
                padding: '12px 22px',
                fontSize: 12,
                color: '#9ca3af',
                textAlign: 'center',
                borderTop: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              Showing first 50 of {sortedStudents.length} students. Export CSV
              to see all.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HubManagerReports;
