import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Chip,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PeopleIcon from '@material-ui/icons/People';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import BlockIcon from '@material-ui/icons/Block';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import SchoolIcon from '@material-ui/icons/School';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  format,
  subDays,
  subMonths,
  subQuarters,
  subYears,
  parseISO,
  isAfter,
} from 'date-fns';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { get, search } from '../../utils/ajax';
import {
  localRoutes,
  remoteRoutes,
  appPermissions,
} from '../../data/constants';
import { IReport } from './types';
import { IState } from '../../data/types';
import Toast from '../../utils/Toast';
import { hasAnyRole } from '../../data/appRoles';

const CORAL = '#E72C6C';
const ORANGE = '#fe8c45';
const GREEN = '#10b981';
const BLUE = '#3b82f6';
const AMBER = '#f59e0b';
const PURPLE = '#8b5cf6';
const DARK = '#1f2025';

const CHART_PALETTE = [
  CORAL,
  BLUE,
  AMBER,
  GREEN,
  PURPLE,
  '#06b6d4',
  ORANGE,
  '#ec4899',
];

const DATE_RANGES = [
  { label: 'All Time', key: 'all' },
  { label: 'This Year', key: 'year' },
  { label: 'This Quarter', key: 'quarter' },
  { label: 'This Month', key: 'month' },
  { label: 'This Week', key: 'week' },
];

const useStyles = makeStyles((_theme: Theme) => ({
  root: { minHeight: '100%' },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap' as any,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: 800, color: DARK },
  subtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  filterChips: { display: 'flex', gap: 6, flexWrap: 'wrap' as any },
  chip: { fontWeight: 600, fontSize: 12, cursor: 'pointer' },
  chipActive: {
    background: CORAL,
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
  },

  printBtn: {
    background: '#f3f4f6',
    color: '#374151',
    borderRadius: 8,
    fontWeight: 600,
    textTransform: 'none' as any,
    fontSize: 13,
    padding: '7px 16px',
    '&:hover': { background: '#e5e7eb' },
  },

  // ── KPI row ────────────────────────────────────────────────────────────────
  kpiCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    width: '100%',
    boxSizing: 'border-box' as any,
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
  kpiNum: { fontSize: 24, fontWeight: 800, color: DARK, lineHeight: 1 },
  kpiLabel: { fontSize: 11, color: '#9ca3af', marginTop: 3, fontWeight: 600 },
  kpiSub: { fontSize: 11, fontWeight: 700, marginTop: 2 },

  // ── Chart cards ────────────────────────────────────────────────────────────
  chartCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '18px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    height: '100%',
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 16,
  },

  // ── Section heading ────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 12,
    marginTop: 28,
  },

  // ── Table-style rows ───────────────────────────────────────────────────────
  card: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '0 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 0',
    borderBottom: '1px solid #f5f5f5',
    '&:last-child': { borderBottom: 'none' },
  },
  rowDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  rowName: { fontSize: 13, fontWeight: 600, color: DARK, flex: 1 },
  rowNum: {
    fontSize: 13,
    fontWeight: 800,
    color: DARK,
    minWidth: 36,
    textAlign: 'right' as any,
  },
  rowMeta: {
    fontSize: 11,
    color: '#9ca3af',
    minWidth: 64,
    textAlign: 'right' as any,
  },
  rowGreen: {
    fontSize: 11,
    color: GREEN,
    fontWeight: 600,
    minWidth: 64,
    textAlign: 'right' as any,
  },
  rowCoral: {
    fontSize: 11,
    color: CORAL,
    fontWeight: 600,
    minWidth: 64,
    textAlign: 'right' as any,
  },
  bar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f3f4f6',
    flex: 1,
    minWidth: 60,
  },
  barFill: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 2,
  },
  barFillGreen: { background: GREEN, borderRadius: 2 },

  // ── Report forms ───────────────────────────────────────────────────────────
  reportItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
    '&:last-child': { borderBottom: 'none' },
  },

  // ── Print styles ───────────────────────────────────────────────────────────
  '@global': {
    '@media print': {
      '.no-print': { display: 'none !important' },
      body: { background: '#fff' },
    },
  },
}));

// ─────────────────────────────────────────────────────────────────────────────

const cutoffDate = (rangeKey: string): Date | null => {
  const now = new Date();
  if (rangeKey === 'week') return subDays(now, 7);
  if (rangeKey === 'month') return subMonths(now, 1);
  if (rangeKey === 'quarter') return subQuarters(now, 1);
  if (rangeKey === 'year') return subYears(now, 1);
  return null;
};

const ReportList: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);

  const [reports, setReports] = useState<IReport[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    get(
      remoteRoutes.reports,
      (response: any) => setReports(response.reports ?? []),
      () => Toast.error('Failed to fetch reports'),
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

    search(
      remoteRoutes.dashboardStats,
      {},
      (data: any) => {
        if (data?.todayAttendance) setTodayAttendance(data.todayAttendance);
      },
      undefined,
      undefined,
    );
  }, []);

  // ── Filter students by selected date range ────────────────────────────────
  const filteredStudents = useMemo(() => {
    const cutoff = cutoffDate(dateRange);
    if (!cutoff) return allStudents;
    return allStudents.filter((s) => {
      if (!s.registeredAt) return false;
      return isAfter(parseISO(s.registeredAt), cutoff);
    });
  }, [allStudents, dateRange]);

  // ── KPI numbers ────────────────────────────────────────────────────────────
  const total = filteredStudents.length;
  const active = filteredStudents.filter(
    (s) => (s.status || '').toLowerCase() === 'active',
  ).length;
  const inactive = total - active;
  const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
  const absentRate = 100 - activeRate;

  // ── Hub breakdown ─────────────────────────────────────────────────────────
  const hubBreakdown = useMemo(() => {
    const map: Record<
      string,
      {
        hub: string;
        name: string;
        total: number;
        active: number;
        completed: number;
      }
    > = {};
    filteredStudents.forEach((s) => {
      const key = s.hub || 'unknown';
      if (!map[key]) {
        map[key] = {
          hub: key,
          name: s.hubName || key.charAt(0).toUpperCase() + key.slice(1),
          total: 0,
          active: 0,
          completed: 0,
        };
      }
      map[key].total++;
      const st = (s.status || '').toLowerCase();
      if (st === 'active') map[key].active++;
      if (st === 'completed') map[key].completed++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredStudents]);

  // ── Course breakdown ──────────────────────────────────────────────────────
  const courseBreakdown = useMemo(() => {
    const map: Record<
      string,
      { course: string; total: number; active: number; completed: number }
    > = {};
    filteredStudents.forEach((s) => {
      const key = s.course || 'Uncategorised';
      if (!map[key])
        map[key] = { course: key, total: 0, active: 0, completed: 0 };
      map[key].total++;
      const st = (s.status || '').toLowerCase();
      if (st === 'active') map[key].active++;
      if (st === 'completed') map[key].completed++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredStudents]);

  // ── Gender breakdown ──────────────────────────────────────────────────────
  const genderData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredStudents.forEach((s) => {
      const g = s.gender || 'Not Specified';
      map[g] = (map[g] || 0) + 1;
    });
    const labels = Object.keys(map);
    return {
      labels,
      datasets: [
        {
          data: labels.map((l) => map[l]),
          backgroundColor: CHART_PALETTE,
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  }, [filteredStudents]);

  // ── Age group breakdown ───────────────────────────────────────────────────
  const ageData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredStudents.forEach((s) => {
      const a = s.ageGroup || 'Unknown';
      map[a] = (map[a] || 0) + 1;
    });
    const labels = Object.keys(map);
    return {
      labels,
      datasets: [
        {
          label: 'Students',
          data: labels.map((l) => map[l]),
          backgroundColor: CHART_PALETTE,
          borderRadius: 5,
        },
      ],
    };
  }, [filteredStudents]);

  // ── Enrollment growth (by month of registeredAt) ──────────────────────────
  const growthData = useMemo(() => {
    const map: Record<string, number> = {};
    // Build last 12 months skeleton
    for (let i = 11; i >= 0; i--) {
      const key = format(subMonths(new Date(), i), 'MMM yy');
      map[key] = 0;
    }
    filteredStudents.forEach((s) => {
      if (!s.registeredAt) return;
      try {
        const key = format(parseISO(s.registeredAt), 'MMM yy');
        if (key in map) map[key] = (map[key] || 0) + 1;
      } catch {}
    });
    const labels = Object.keys(map);
    return {
      labels,
      datasets: [
        {
          label: 'New Registrations',
          data: labels.map((l) => map[l]),
          borderColor: CORAL,
          backgroundColor: 'rgba(231,44,108,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: CORAL,
        },
      ],
    };
  }, [filteredStudents]);

  // ── Student status donut ──────────────────────────────────────────────────
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredStudents.forEach((s) => {
      const st = s.status
        ? s.status.charAt(0).toUpperCase() + s.status.slice(1).toLowerCase()
        : 'Unknown';
      map[st] = (map[st] || 0) + 1;
    });
    const labels = Object.keys(map);
    const colors: Record<string, string> = {
      Active: GREEN,
      Inactive: '#94a3b8',
      Completed: BLUE,
      Pending: AMBER,
      Suspended: CORAL,
    };
    return {
      labels,
      datasets: [
        {
          data: labels.map((l) => map[l]),
          backgroundColor: labels.map((l) => colors[l] || '#94a3b8'),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  }, [filteredStudents]);

  const doughnutOpts = {
    responsive: true,
    cutoutPercentage: 65,
    legend: { position: 'bottom', labels: { padding: 14, fontSize: 11 } },
  };
  const barOpts = {
    responsive: true,
    legend: { display: false },
    scales: {
      yAxes: [
        {
          ticks: { beginAtZero: true, stepSize: 1 },
          gridLines: { color: '#f3f4f6' },
        },
      ],
      xAxes: [{ gridLines: { display: false }, ticks: { fontSize: 11 } }],
    },
  };
  const lineOpts = {
    responsive: true,
    legend: { display: false },
    scales: {
      yAxes: [
        {
          ticks: { beginAtZero: true, stepSize: 1 },
          gridLines: { color: '#f3f4f6' },
        },
      ],
      xAxes: [{ gridLines: { display: false }, ticks: { fontSize: 10 } }],
    },
  };

  const handleViewSubmissions = (report: IReport) =>
    history.push(`${localRoutes.reports}/${report.id}/submissions`);
  const handleSubmitReport = (report: IReport) =>
    history.push(`${localRoutes.reports}/${report.id}/submit`);

  return (
    <Layout>
      <div className={classes.root}>
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className={classes.header}>
          <div>
            <div className={classes.title}>Reports & Analytics</div>
            <div className={classes.subtitle}>
              Programme performance overview ·{' '}
              {format(new Date(), 'MMMM d, yyyy')}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {/* Date range filter */}
            <div className={`${classes.filterChips} no-print`}>
              {DATE_RANGES.map((r) => (
                <Chip
                  key={r.key}
                  label={r.label}
                  size="small"
                  onClick={() => setDateRange(r.key)}
                  className={
                    dateRange === r.key ? classes.chipActive : classes.chip
                  }
                  style={
                    dateRange === r.key
                      ? { background: CORAL, color: '#fff' }
                      : {}
                  }
                />
              ))}
            </div>
            <Button
              className={`${classes.printBtn} no-print`}
              startIcon={<PrintIcon style={{ fontSize: 16 }} />}
              onClick={() => window.print()}
            >
              Print / Export
            </Button>
          </div>
        </div>

        {/* ── Impact KPIs ───────────────────────────────────────────────── */}
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
              sub: `${activeRate}% active`,
              subColor: GREEN,
            },
            {
              label: 'Inactive / Absent',
              value: inactive,
              Icon: BlockIcon,
              color: CORAL,
              bg: 'rgba(231,44,108,0.06)',
              sub: `${absentRate}% absent`,
              subColor: CORAL,
            },
            {
              label: 'Attendance Today',
              value: todayAttendance,
              Icon: HowToRegIcon,
              color: AMBER,
              bg: 'rgba(245,158,11,0.08)',
            },
            {
              label: 'Hubs',
              value: hubBreakdown.length,
              Icon: SchoolIcon,
              color: PURPLE,
              bg: 'rgba(139,92,246,0.08)',
            },
          ].map(({ label, value, Icon, color, bg, sub, subColor }: any) => (
            <Grid
              item
              xs={6}
              sm={4}
              md={2}
              key={label}
              style={{ display: 'flex' }}
            >
              <div className={classes.kpiCard}>
                <div className={classes.kpiIcon} style={{ background: bg }}>
                  <Icon style={{ fontSize: 19, color }} />
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

        {/* ── Enrollment Growth (line) + Student Status (donut) ─────────── */}
        <Grid container spacing={2} style={{ marginTop: 20 }}>
          <Grid item xs={12} md={8}>
            <div className={classes.chartCard}>
              <div className={classes.chartTitle}>
                Attendance Growth — Last 12 Months
              </div>
              <Line data={growthData} options={lineOpts} height={80} />
            </div>
          </Grid>
          <Grid item xs={12} md={4}>
            <div className={classes.chartCard}>
              <div className={classes.chartTitle}>Students by Status</div>
              <Doughnut data={statusData} options={doughnutOpts} />
            </div>
          </Grid>
        </Grid>

        {/* ── Gender + Age Group ────────────────────────────────────────── */}
        <Grid container spacing={2} style={{ marginTop: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <div className={classes.chartCard}>
              <div className={classes.chartTitle}>Gender Breakdown</div>
              <Doughnut data={genderData} options={doughnutOpts} />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <div className={classes.chartCard}>
              <div className={classes.chartTitle}>Age Group Distribution</div>
              <Bar data={ageData} options={barOpts} height={110} />
            </div>
          </Grid>
        </Grid>

        {/* ── Hub Comparison ────────────────────────────────────────────── */}
        <div className={classes.sectionLabel}>Hub Comparison</div>
        <div className={classes.card}>
          {/* Table header */}
          <div
            style={{
              display: 'flex',
              padding: '10px 0 6px',
              borderBottom: '2px solid #f3f4f6',
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              HUB
            </span>
            <span
              style={{
                minWidth: 64,
                textAlign: 'right',
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              TOTAL
            </span>
            <span
              style={{
                minWidth: 64,
                textAlign: 'right',
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              ACTIVE
            </span>
            <span
              style={{
                minWidth: 72,
                textAlign: 'right',
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              COMPLETED
            </span>
            <span
              style={{
                minWidth: 72,
                textAlign: 'right',
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              ABSENT %
            </span>
          </div>
          {hubBreakdown.length === 0 ? (
            <Typography
              style={{
                fontSize: 13,
                color: '#c0c4ce',
                textAlign: 'center',
                padding: '20px 0',
              }}
            >
              No data
            </Typography>
          ) : (
            hubBreakdown.map((h) => {
              const ar =
                h.total > 0 ? Math.round((h.active / h.total) * 100) : 0;
              return (
                <div key={h.hub} className={classes.tableRow}>
                  <span
                    className={classes.rowDot}
                    style={{ background: CORAL }}
                  />
                  <span className={classes.rowName}>{h.name} Hub</span>
                  <span className={classes.rowNum}>{h.total}</span>
                  <span className={classes.rowGreen}>{h.active}</span>
                  <span className={classes.rowMeta}>{h.completed}</span>
                  <span className={classes.rowCoral}>{100 - ar}%</span>
                </div>
              );
            })
          )}
        </div>

        {/* ── Course Breakdown ──────────────────────────────────────────── */}
        <div className={classes.sectionLabel}>Course Breakdown</div>
        <div className={classes.card}>
          <div
            style={{
              display: 'flex',
              padding: '10px 0 6px',
              borderBottom: '2px solid #f3f4f6',
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              COURSE
            </span>
            <span
              style={{
                minWidth: 64,
                textAlign: 'right',
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              ENROLLED
            </span>
            <span
              style={{
                minWidth: 64,
                textAlign: 'right',
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              ACTIVE
            </span>
            <span
              style={{
                minWidth: 80,
                textAlign: 'right',
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              COMPLETED
            </span>
            <span
              style={{
                minWidth: 80,
                textAlign: 'right',
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
              }}
            >
              COMPLETION%
            </span>
          </div>
          {courseBreakdown.length === 0 ? (
            <Typography
              style={{
                fontSize: 13,
                color: '#c0c4ce',
                textAlign: 'center',
                padding: '20px 0',
              }}
            >
              No data
            </Typography>
          ) : (
            courseBreakdown.map((c, i) => {
              const cr =
                c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
              return (
                <div key={c.course || i} className={classes.tableRow}>
                  <span className={classes.rowName}>{c.course}</span>
                  <span className={classes.rowNum}>{c.total}</span>
                  <span className={classes.rowGreen}>{c.active}</span>
                  <span className={classes.rowMeta}>{c.completed}</span>
                  <span
                    style={{
                      minWidth: 80,
                      textAlign: 'right',
                      fontSize: 12,
                      fontWeight: 700,
                      color: cr >= 50 ? GREEN : AMBER,
                    }}
                  >
                    {cr}%
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            HUB COMPARISON
        ══════════════════════════════════════════════════════════════════ */}
        {hubBreakdown.length > 0 && (
          <div
            style={{
              marginTop: 40,
              paddingTop: 32,
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 20,
                  borderRadius: 2,
                  background: CORAL,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 16, fontWeight: 800, color: DARK }}>
                Hub Comparison
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 18 }}>
              Student enrollment and activity across all hubs
            </div>
            <Grid container spacing={2} alignItems="stretch">
              <Grid item xs={12} md={8} style={{ display: 'flex' }}>
                <div className={classes.chartCard} style={{ width: '100%' }}>
                  <div className={classes.chartTitle}>
                    Enrolled vs Active — per hub
                  </div>
                  <Bar
                    data={{
                      labels: hubBreakdown.map((h) => h.name),
                      datasets: [
                        {
                          label: 'Enrolled',
                          data: hubBreakdown.map((h) => h.total),
                          backgroundColor: CORAL,
                          borderRadius: 4,
                        },
                        {
                          label: 'Active',
                          data: hubBreakdown.map((h) => h.active),
                          backgroundColor: GREEN,
                          borderRadius: 4,
                        },
                      ],
                    }}
                    options={
                      {
                        responsive: true,
                        legend: {
                          position: 'top',
                          labels: {
                            fontSize: 11,
                            padding: 14,
                            usePointStyle: true,
                          },
                        },
                        scales: {
                          yAxes: [
                            {
                              ticks: { beginAtZero: true, precision: 0 },
                              gridLines: { color: '#f3f4f6' },
                            },
                          ],
                          xAxes: [
                            {
                              gridLines: { display: false },
                              ticks: { fontSize: 12 },
                            },
                          ],
                        },
                      } as any
                    }
                    height={110}
                  />
                </div>
              </Grid>
              <Grid item xs={12} md={4} style={{ display: 'flex' }}>
                <div className={classes.chartCard} style={{ width: '100%' }}>
                  <div className={classes.chartTitle}>
                    Share of total students
                  </div>
                  <Doughnut
                    data={{
                      labels: hubBreakdown.map((h) => h.name),
                      datasets: [
                        {
                          data: hubBreakdown.map((h) => h.total),
                          backgroundColor: [
                            CORAL,
                            GREEN,
                            '#f59e0b',
                            '#6366f1',
                            '#8b5cf6',
                            '#06b6d4',
                          ],
                          borderWidth: 2,
                          borderColor: '#fff',
                        },
                      ],
                    }}
                    options={doughnutOpts}
                  />
                </div>
              </Grid>
            </Grid>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            COURSE COMPARISON
        ══════════════════════════════════════════════════════════════════ */}
        {courseBreakdown.length > 0 && (
          <div
            style={{
              marginTop: 40,
              paddingTop: 32,
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 20,
                  borderRadius: 2,
                  background: GREEN,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 16, fontWeight: 800, color: DARK }}>
                Course Comparison
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 18 }}>
              Enrollment and active student breakdown per course
            </div>
            <div className={classes.chartCard}>
              <div className={classes.chartTitle}>
                Enrolled vs Active — per course
              </div>
              <Bar
                data={{
                  labels: courseBreakdown.map((c) => c.course),
                  datasets: [
                    {
                      label: 'Enrolled',
                      data: courseBreakdown.map((c) => c.total),
                      backgroundColor: CORAL,
                      borderRadius: 4,
                    },
                    {
                      label: 'Active',
                      data: courseBreakdown.map((c) => c.active),
                      backgroundColor: GREEN,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={
                  {
                    responsive: true,
                    legend: {
                      position: 'top',
                      labels: {
                        fontSize: 11,
                        padding: 14,
                        usePointStyle: true,
                      },
                    },
                    scales: {
                      yAxes: [
                        {
                          ticks: { beginAtZero: true, precision: 0 },
                          gridLines: { color: '#f3f4f6' },
                        },
                      ],
                      xAxes: [
                        {
                          gridLines: { display: false },
                          ticks: { fontSize: 12 },
                        },
                      ],
                    },
                  } as any
                }
                height={100}
              />
            </div>
          </div>
        )}

        {/* ── Report Forms ──────────────────────────────────────────────── */}
        <div className={`${classes.sectionLabel} no-print`}>Report Forms</div>
        <Paper
          className="no-print"
          style={{
            padding: '0 20px',
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.07)',
          }}
          elevation={0}
        >
          {reports.length === 0 ? (
            <Typography
              style={{ fontSize: 13, color: '#9ca3af', padding: '20px 0' }}
            >
              No report forms available.
            </Typography>
          ) : (
            <List disablePadding>
              {reports.map((report) => (
                <ListItem
                  key={report.id}
                  className={classes.reportItem}
                  disableGutters
                >
                  <ListItemText
                    primary={report.name}
                    primaryTypographyProps={{
                      style: { fontWeight: 600, color: DARK, fontSize: 13 },
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    {report.fieldCount && report.fieldCount > 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        style={{
                          borderColor: CORAL,
                          color: CORAL,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: 12,
                          borderRadius: 6,
                        }}
                        onClick={() => handleSubmitReport(report)}
                      >
                        Submit
                      </Button>
                    )}
                    {hasAnyRole(user, [
                      appPermissions.roleReportViewSubmissions,
                    ]) && (
                      <IconButton
                        size="small"
                        onClick={() => handleViewSubmissions(report)}
                      >
                        <VisibilityIcon
                          style={{ fontSize: 18, color: '#9ca3af' }}
                        />
                      </IconButton>
                    )}
                  </div>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>

        <div style={{ height: 32 }} />
      </div>
    </Layout>
  );
};

export default ReportList;
