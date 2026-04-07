import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Grid,
  LinearProgress,
  makeStyles,
  Theme,
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import PeopleIcon from '@material-ui/icons/People';
import AssignmentIcon from '@material-ui/icons/Assignment';
import HowToRegIcon from '@material-ui/icons/HowToReg';

import Layout from '../../components/layout/Layout';
import { search } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';
const GREEN = '#10b981';
const AMBER = '#f59e0b';
const BLUE = '#3b82f6';

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
    border: '1px solid rgba(0,0,0,0.12)',
    color: DARK,
    borderRadius: 8,
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'none' as any,
  },

  // Top stat cards
  statCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
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

  // Attendance bars
  attRow: { marginBottom: 10, '&:last-child': { marginBottom: 0 } },
  attLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  attName: { fontSize: 12, color: DARK, fontWeight: 500 },
  attBar: { height: 7, borderRadius: 4, backgroundColor: '#f3f4f6' },
  attFill: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 4,
  },

  // Grade distribution — CSS bar chart
  gradeRow: { marginBottom: 8, '&:last-child': { marginBottom: 0 } },
  gradeBarWrap: {
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
    background: '#f3f4f6',
    position: 'relative' as any,
  },
  gradeBarFill: {
    height: '100%',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    minWidth: 30,
    transition: 'width 0.4s ease',
  },
  gradeLegendRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap' as any,
    marginTop: 12,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: '#5a5e6b',
  },
  legendDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },

  // Submission bar chart (CSS)
  barChart: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
    height: 120,
    marginTop: 8,
    paddingBottom: 4,
  },
  barGroup: { flex: 1, display: 'flex', gap: 3, alignItems: 'flex-end' },
  bar: { flex: 1, borderRadius: '3px 3px 0 0', minWidth: 8 },
  barLabel: {
    fontSize: 10,
    color: '#8a8f99',
    textAlign: 'center' as any,
    marginTop: 5,
  },

  // Performance table
  tableCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
    padding: '10px 20px',
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
    gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
    padding: '13px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    alignItems: 'center',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: '#fafafa' },
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr 1fr', gap: 8 },
  },
  cellMain: { fontSize: 13, fontWeight: 600, color: DARK },
  cell: { fontSize: 13, color: '#5a5e6b' },
  statusBadge: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 20,
    padding: '2px 10px',
    background: 'rgba(16,185,129,0.1)',
    color: GREEN,
  },
}));

const GRADE_COLORS = [GREEN, BLUE, AMBER, CORAL];
const GRADE_LABELS = ['A (80–100%)', 'B (65–79%)', 'C (50–64%)', 'Below 50%'];
const GRADE_VALUES = [35, 40, 15, 10];

const COURSE_BAR_DATA = [
  { name: '2D Anim.', submitted: 85, graded: 70 },
  { name: 'UX Found.', submitted: 92, graded: 80 },
  { name: 'UX Design', submitted: 80, graded: 60 },
  { name: 'Think Dsgn', submitted: 75, graded: 50 },
];

const TrainerAnalytics = () => {
  const classes = useStyles();
  const [stats, setStats] = useState({
    activeStudents: 0,
    pendingSubmissions: 0,
    classesToday: 0,
    todayAttendance: 0,
  });
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    search(
      remoteRoutes.trainerStats,
      {},
      (data: any) => {
        if (data) setStats((prev) => ({ ...prev, ...data }));
      },
      undefined,
      undefined,
    );
    search(
      remoteRoutes.courses,
      { limit: 100 },
      (data: any) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setCourses(list);
      },
      undefined,
      undefined,
    );
  }, []);

  const attData =
    courses.length > 0
      ? courses
          .slice(0, 5)
          .map((c: any) => ({ name: c.title || c.name || 'Course', value: 0 }))
      : [
          { name: '2D Animation', value: 80 },
          { name: 'UX Foundation', value: 90 },
          { name: 'UX Design Framework', value: 75 },
          { name: 'Think like a Designer', value: 85 },
        ];

  const perfData =
    courses.length > 0
      ? courses.slice(0, 5).map((c: any) => ({
          name: c.title || c.name,
          attendance: '—',
          avgGrade: '—',
          submissions: '—',
        }))
      : [
          {
            name: '2D Animation',
            attendance: '80%',
            avgGrade: '72%',
            submissions: '85%',
          },
          {
            name: 'UX Foundation',
            attendance: '90%',
            avgGrade: '78%',
            submissions: '92%',
          },
          {
            name: 'UX Design Framework',
            attendance: '75%',
            avgGrade: '69%',
            submissions: '80%',
          },
        ];

  return (
    <Layout>
      <div className={classes.root}>
        <div className={classes.pageHeader}>
          <div>
            <div className={classes.pageTitle}>Reports &amp; Analytics</div>
            <div className={classes.pageSub}>
              Insights across all your classes and students
            </div>
          </div>
          <Button
            variant="outlined"
            className={classes.exportBtn}
            startIcon={<GetAppIcon />}
          >
            Export Report
          </Button>
        </div>

        {/* Top stat cards */}
        <Grid container spacing={2} style={{ marginBottom: 24 }}>
          {[
            {
              label: 'Avg. Attendance',
              value: '80%',
              Icon: HowToRegIcon,
              color: CORAL,
              bg: 'rgba(254,58,106,0.08)',
            },
            {
              label: 'Avg. Grade',
              value: '73%',
              Icon: TrendingUpIcon,
              color: BLUE,
              bg: 'rgba(59,130,246,0.08)',
            },
            {
              label: 'On-Time Submissions',
              value: `${stats.pendingSubmissions}`,
              Icon: AssignmentIcon,
              color: AMBER,
              bg: 'rgba(245,158,11,0.08)',
            },
            {
              label: 'Total Students',
              value: `${stats.activeStudents}`,
              Icon: PeopleIcon,
              color: GREEN,
              bg: 'rgba(16,185,129,0.08)',
            },
          ].map(({ label, value, Icon, color, bg }) => (
            <Grid item xs={6} sm={3} key={label}>
              <div className={classes.statCard}>
                <div className={classes.statIconBox} style={{ background: bg }}>
                  <Icon style={{ fontSize: 20, color }} />
                </div>
                <div>
                  <div className={classes.statValue} style={{ color }}>
                    {value}
                  </div>
                  <div className={classes.statLabel}>{label}</div>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>

        {/* Attendance trend + Grade distribution */}
        <Grid container spacing={2} style={{ marginBottom: 20 }}>
          <Grid item xs={12} md={6}>
            <div className={classes.card}>
              <div className={classes.cardTitle}>Attendance by Class</div>
              {attData.map((d, i) => (
                <div key={i} className={classes.attRow}>
                  <div className={classes.attLabelRow}>
                    <span className={classes.attName}>{d.name}</span>
                    <span
                      style={{ fontSize: 12, fontWeight: 700, color: CORAL }}
                    >
                      {d.value}%
                    </span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={d.value}
                    className={classes.attBar}
                    classes={{ bar: classes.attFill }}
                  />
                </div>
              ))}
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <div className={classes.card}>
              <div className={classes.cardTitle}>Grade Distribution</div>
              {GRADE_VALUES.map((v, i) => (
                <div key={i} className={classes.gradeRow}>
                  <div className={classes.gradeBarWrap}>
                    <div
                      className={classes.gradeBarFill}
                      style={{ width: `${v}%`, background: GRADE_COLORS[i] }}
                    >
                      {v}%
                    </div>
                  </div>
                </div>
              ))}
              <div className={classes.gradeLegendRow}>
                {GRADE_LABELS.map((label, i) => (
                  <div key={i} className={classes.legendItem}>
                    <div
                      className={classes.legendDot}
                      style={{ background: GRADE_COLORS[i] }}
                    />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </Grid>
        </Grid>

        {/* Assignment submission bar chart */}
        <Grid container spacing={2} style={{ marginBottom: 20 }}>
          <Grid item xs={12}>
            <div className={classes.card}>
              <div className={classes.cardTitle}>
                Assignment Submission Analytics
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                {[
                  { label: 'Submitted', color: CORAL },
                  { label: 'Graded', color: BLUE },
                ].map(({ label, color }) => (
                  <div key={label} className={classes.legendItem}>
                    <div
                      className={classes.legendDot}
                      style={{ background: color }}
                    />
                    {label}
                  </div>
                ))}
              </div>
              <div className={classes.barChart}>
                {COURSE_BAR_DATA.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 4,
                        alignItems: 'flex-end',
                        height: 110,
                        width: '100%',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '40%',
                          height: `${d.submitted}%`,
                          background: CORAL,
                          borderRadius: '3px 3px 0 0',
                          minWidth: 10,
                        }}
                      />
                      <div
                        style={{
                          width: '40%',
                          height: `${d.graded}%`,
                          background: BLUE,
                          borderRadius: '3px 3px 0 0',
                          minWidth: 10,
                        }}
                      />
                    </div>
                    <div className={classes.barLabel}>{d.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </Grid>
        </Grid>

        {/* Class Performance Overview */}
        <div className={classes.tableCard}>
          <div
            style={{
              padding: '16px 22px 10px',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <Typography style={{ fontSize: 13, fontWeight: 700, color: DARK }}>
              Class Performance Overview
            </Typography>
          </div>
          <div className={classes.tableHead}>
            {[
              'Class Name',
              'Attendance',
              'Avg. Grade',
              'Submissions',
              'Status',
            ].map((h) => (
              <div key={h} className={classes.tableHeadCell}>
                {h}
              </div>
            ))}
          </div>
          {perfData.map((row: any, i: number) => (
            <div key={i} className={classes.tableRow}>
              <div className={classes.cellMain}>{row.name}</div>
              <div className={classes.cell}>{row.attendance}</div>
              <div className={classes.cell}>{row.avgGrade}</div>
              <div className={classes.cell}>{row.submissions}</div>
              <div>
                <span className={classes.statusBadge}>Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default TrainerAnalytics;
