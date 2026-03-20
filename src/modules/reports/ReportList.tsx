import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { ListItem, List, ListItemText } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import IconButton from '@material-ui/core/IconButton';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  localRoutes,
  remoteRoutes,
  appPermissions,
} from '../../data/constants';
import { get } from '../../utils/ajax';
import Layout from '../../components/layout/Layout';
import { IReport } from './types';
import Loading from '../../components/Loading';
import { IState } from '../../data/types';
import Toast from '../../utils/Toast';
import XBreadCrumbs from '../../components/XBreadCrumbs';
import { hasAnyRole } from '../../data/appRoles';

const STATUS_COLORS: Record<string, string> = {
  Active: '#22c55e',
  Inactive: '#94a3b8',
  Graduated: '#3b82f6',
  Suspended: '#ef4444',
  Enrolled: '#3b82f6',
  InProgress: '#f59e0b',
  Completed: '#22c55e',
  Dropped: '#ef4444',
  Pending: '#a78bfa',
};

const CHART_PALETTE = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#a78bfa',
  '#06b6d4',
  '#f97316',
  '#ec4899',
];

const useStyles = makeStyles((_theme: Theme) =>
  createStyles({
    root: { flexGrow: 1 },
    chartCard: {
      padding: 20,
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    },
    chartTitle: {
      fontWeight: 700,
      fontSize: 14,
      color: '#374151',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionHeader: {
      fontWeight: 700,
      fontSize: 16,
      color: '#111827',
      marginBottom: 12,
      paddingBottom: 6,
      borderBottom: '2px solid #e5e7eb',
    },
    reportItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #f3f4f6',
    },
    buttonContainer: {
      display: 'flex',
      gap: 8,
    },
  }),
);

interface ReportStat {
  status: string;
  count: number;
}
interface CourseStat {
  course: string;
  count: number;
}
interface HubStat {
  hub: string;
  count: number;
}
interface ReportStats {
  studentsByStatus: ReportStat[];
  enrollmentsByStatus: ReportStat[];
  enrollmentsByCourse: CourseStat[];
  studentsByHub: HubStat[];
}

const TOKEN_KEY = '__elevate__academy__token';

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const classes = useStyles();
  return (
    <Paper className={classes.chartCard}>
      <Typography className={classes.chartTitle}>{title}</Typography>
      {children}
    </Paper>
  );
};

const ReportList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<IReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers: HeadersInit = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    // Fetch reports list
    get(
      remoteRoutes.reports,
      (response: any) => setReports(response.reports ?? []),
      () => Toast.error('Failed to fetch reports'),
      () => setLoading(false),
    );

    // Fetch chart data
    fetch('/api/dashboard/report-stats', { headers })
      .then((r) => r.json())
      .then((data: ReportStats) => setStats(data))
      .catch(() => {});
  }, []);

  const handleSubmitReport = (report: IReport) => {
    history.push(`${localRoutes.reports}/${report.id}/submit`);
  };

  const handleViewSubmissions = (report: IReport) => {
    history.push(`${localRoutes.reports}/${report.id}/submissions`);
  };

  // Build chart data
  const studentStatusData = stats
    ? {
        labels: stats.studentsByStatus.map((s) => s.status),
        datasets: [
          {
            data: stats.studentsByStatus.map((s) => s.count),
            backgroundColor: stats.studentsByStatus.map(
              (s) => STATUS_COLORS[s.status] ?? '#94a3b8',
            ),
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      }
    : null;

  const enrollmentStatusData = stats
    ? {
        labels: stats.enrollmentsByStatus.map((s) => s.status),
        datasets: [
          {
            data: stats.enrollmentsByStatus.map((s) => s.count),
            backgroundColor: stats.enrollmentsByStatus.map(
              (s) => STATUS_COLORS[s.status] ?? '#94a3b8',
            ),
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      }
    : null;

  const courseEnrollmentData = stats
    ? {
        labels: stats.enrollmentsByCourse.map((c) =>
          c.course.length > 30 ? c.course.slice(0, 28) + '…' : c.course,
        ),
        datasets: [
          {
            label: 'Enrollments',
            data: stats.enrollmentsByCourse.map((c) => c.count),
            backgroundColor: CHART_PALETTE,
            borderRadius: 6,
          },
        ],
      }
    : null;

  const hubData = stats
    ? {
        labels: stats.studentsByHub.map((h) => h.hub),
        datasets: [
          {
            label: 'Students',
            data: stats.studentsByHub.map((h) => h.count),
            backgroundColor: CHART_PALETTE,
            borderRadius: 6,
          },
        ],
      }
    : null;

  const doughnutOptions = {
    responsive: true,
    cutoutPercentage: 65,
    legend: { position: 'bottom', labels: { padding: 16, fontSize: 12 } },
  };

  const barOptions = {
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

  if (loading) return <Loading />;

  return (
    <Layout title="Reports & Analytics">
      <Box className={classes.root}>
        <Box pb={2}>
          <XBreadCrumbs
            title="Reports & Analytics"
            paths={[{ path: localRoutes.home, label: 'Dashboard' }]}
          />
        </Box>

        {/* Charts Section */}
        {stats && (
          <Box mb={4}>
            <Grid container spacing={3}>
              {/* Student Status Doughnut */}
              <Grid item xs={12} sm={6} md={3}>
                <ChartCard title="Students by Status">
                  {studentStatusData && (
                    <Doughnut
                      data={studentStatusData}
                      options={doughnutOptions}
                    />
                  )}
                </ChartCard>
              </Grid>

              {/* Enrollment Status Doughnut */}
              <Grid item xs={12} sm={6} md={3}>
                <ChartCard title="Enrollments by Status">
                  {enrollmentStatusData && (
                    <Doughnut
                      data={enrollmentStatusData}
                      options={doughnutOptions}
                    />
                  )}
                </ChartCard>
              </Grid>

              {/* Students by Hub Bar */}
              <Grid item xs={12} sm={6} md={3}>
                <ChartCard title="Students by Hub">
                  {hubData && <Bar data={hubData} options={barOptions} />}
                </ChartCard>
              </Grid>

              {/* Top Courses Bar */}
              <Grid item xs={12} sm={6} md={3}>
                <ChartCard title="Top Courses by Enrollment">
                  {courseEnrollmentData && (
                    <Bar data={courseEnrollmentData} options={barOptions} />
                  )}
                </ChartCard>
              </Grid>
            </Grid>

            {/* Summary row */}
            <Box mt={3}>
              <Grid container spacing={2}>
                {[
                  {
                    label: 'Total Students',
                    value: stats.studentsByStatus.reduce(
                      (a, s) => a + s.count,
                      0,
                    ),
                    color: '#3b82f6',
                  },
                  {
                    label: 'Active Students',
                    value:
                      stats.studentsByStatus.find((s) => s.status === 'Active')
                        ?.count ?? 0,
                    color: '#22c55e',
                  },
                  {
                    label: 'Total Enrollments',
                    value: stats.enrollmentsByStatus.reduce(
                      (a, s) => a + s.count,
                      0,
                    ),
                    color: '#f59e0b',
                  },
                  {
                    label: 'Completed',
                    value:
                      stats.enrollmentsByStatus.find(
                        (s) => s.status === 'Completed',
                      )?.count ?? 0,
                    color: '#22c55e',
                  },
                ].map((kpi) => (
                  <Grid item xs={6} sm={3} key={kpi.label}>
                    <Paper
                      style={{
                        padding: '16px 20px',
                        borderRadius: 12,
                        borderLeft: `4px solid ${kpi.color}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}
                    >
                      <Typography
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: kpi.color,
                          lineHeight: 1,
                        }}
                      >
                        {kpi.value}
                      </Typography>
                      <Typography
                        style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}
                      >
                        {kpi.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}

        {/* Reports List */}
        <Paper
          style={{
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Typography className={classes.sectionHeader}>
            Report Forms
          </Typography>
          {reports.length === 0 ? (
            <Typography style={{ color: '#9ca3af', fontStyle: 'italic' }}>
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
                      style: { fontWeight: 600, color: '#111827' },
                    }}
                  />
                  <div className={classes.buttonContainer}>
                    {report.fieldCount && report.fieldCount > 0 && (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
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
                        color="primary"
                        aria-label="view submissions"
                        onClick={() => handleViewSubmissions(report)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    )}
                  </div>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Layout>
  );
};

export default ReportList;
