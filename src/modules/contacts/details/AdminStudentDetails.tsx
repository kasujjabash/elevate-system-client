import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter, useHistory } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import PhoneIcon from '@material-ui/icons/Phone';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import SchoolIcon from '@material-ui/icons/School';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import Layout from '../../../components/layout/Layout';
import { get } from '../../../utils/ajax';
import { localRoutes, remoteRoutes } from '../../../data/constants';
import { getRouteParam } from '../../../utils/routHelpers';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: theme.spacing(3), background: '#f8f7f5', minHeight: '100%' },

  // ── Hero banner ────────────────────────────────────────────────
  heroBanner: {
    background: `linear-gradient(135deg, ${DARK} 0%, #2d2f36 100%)`,
    borderRadius: 16,
    padding: '28px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap' as any,
  },
  avatar: {
    width: 72,
    height: 72,
    background: `linear-gradient(135deg, ${CORAL}, ${ORANGE})`,
    fontSize: 26,
    fontWeight: 800,
    flexShrink: 0,
    border: '3px solid rgba(255,255,255,0.15)',
  },
  heroName: {
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  heroMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap' as any,
  },
  heroMetaItem: { display: 'flex', alignItems: 'center', gap: 5 },
  statusBadge: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    padding: '4px 12px',
    marginTop: 10,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  },

  // ── Cards ──────────────────────────────────────────────────────
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #ede8e3',
    padding: '18px 22px',
    marginBottom: theme.spacing(2),
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#8a8f99',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.06em',
    marginBottom: 14,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '7px 0',
    borderBottom: '1px solid #f3ede9',
    '&:last-child': { borderBottom: 'none' },
  },
  infoIcon: { fontSize: 16, color: '#c9c4bf', flexShrink: 0 },
  infoLabel: { fontSize: 12, color: '#9ca3af', minWidth: 80 },
  infoValue: { fontSize: 13, fontWeight: 600, color: DARK },

  // ── Course card ────────────────────────────────────────────────
  courseCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #ede8e3',
    padding: '16px 20px',
    marginBottom: 12,
    transition: 'box-shadow 0.15s',
    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  },
  courseTitle: { fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 4 },
  courseInstructor: { fontSize: 12, color: '#9ca3af', marginBottom: 12 },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: { fontSize: 12, color: '#6b7280' },
  progressValue: { fontSize: 12, fontWeight: 700, color: CORAL },
  progressBar: { borderRadius: 4, height: 6, backgroundColor: '#f3ede9' },
  enrolledBadge: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    padding: '2px 10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },

  // ── Stats row ──────────────────────────────────────────────────
  statsRow: {
    display: 'flex',
    gap: 16,
    marginBottom: theme.spacing(2.5),
    flexWrap: 'wrap' as any,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #ede8e3',
    padding: '14px 20px',
    flex: 1,
    minWidth: 110,
    textAlign: 'center' as any,
  },
  statNum: { fontSize: 24, fontWeight: 800, color: DARK, lineHeight: 1 },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4 },

  emptyBox: {
    textAlign: 'center' as any,
    padding: '40px 20px',
    color: '#9ca3af',
  },
}));

function nameInitials(name: string) {
  return (name || '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

type Props = RouteComponentProps;

const AdminStudentDetails = (props: Props) => {
  const classes = useStyles();
  const history = useHistory();
  const studentId = getRouteParam(props, 'studentId');

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    get(
      `${remoteRoutes.students}/${studentId}`,
      (data) => setStudent(data),
      undefined,
      () => setLoading(false),
    );
  }, [studentId]);

  if (loading) {
    return (
      <Layout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={300}
        >
          <CircularProgress style={{ color: CORAL }} />
        </Box>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <Box p={4} textAlign="center">
          <Typography variant="h6" color="textSecondary">
            Student not found
          </Typography>
          <Button
            onClick={() => history.push(localRoutes.students)}
            style={{ marginTop: 12 }}
          >
            Back to Students
          </Button>
        </Box>
      </Layout>
    );
  }

  // Normalise data shapes from the server
  const person = student.contact?.person || {};
  const fullName =
    [person.firstName, person.lastName].filter(Boolean).join(' ') ||
    'Unknown Student';
  const email = student.contact?.email?.[0]?.value || student.email || '';
  const phone = student.contact?.phone?.[0]?.value || student.phone || '';
  const hub = student.hub?.name || student.hubName || '—';
  const isActive = student.isActive !== false;
  const enrollments: any[] = student.enrollments || [];

  const completedCount = enrollments.filter(
    (e: any) => e.status === 'Completed',
  ).length;
  const avgProgress = enrollments.length
    ? Math.round(
        enrollments.reduce((s: number, e: any) => s + (e.progress || 0), 0) /
          enrollments.length,
      )
    : 0;

  return (
    <Layout>
      <div className={classes.root}>
        {/* Back */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => history.push(localRoutes.students)}
          style={{
            marginBottom: 16,
            textTransform: 'none',
            color: '#6b7280',
            fontWeight: 600,
          }}
        >
          Back to Students
        </Button>

        {/* Hero */}
        <div className={classes.heroBanner}>
          <Avatar className={classes.avatar}>{nameInitials(fullName)}</Avatar>
          <div style={{ flex: 1 }}>
            <div className={classes.heroName}>{fullName}</div>
            <div className={classes.heroMeta}>
              {email && (
                <span className={classes.heroMetaItem}>
                  <EmailIcon style={{ fontSize: 13 }} /> {email}
                </span>
              )}
              {phone && (
                <span className={classes.heroMetaItem}>
                  <PhoneIcon style={{ fontSize: 13 }} /> {phone}
                </span>
              )}
              {hub !== '—' && (
                <span className={classes.heroMetaItem}>
                  <LocationOnIcon style={{ fontSize: 13 }} /> {hub}
                </span>
              )}
            </div>
            <div>
              <span
                className={classes.statusBadge}
                style={
                  isActive
                    ? { background: 'rgba(16,185,129,0.15)', color: '#10b981' }
                    : { background: 'rgba(156,163,175,0.15)', color: '#6b7280' }
                }
              >
                {isActive ? (
                  <>
                    <CheckCircleIcon style={{ fontSize: 13 }} /> Active Student
                  </>
                ) : (
                  <>
                    <WatchLaterIcon style={{ fontSize: 13 }} /> Inactive
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={classes.statsRow}>
          <div className={classes.statCard}>
            <div className={classes.statNum}>{enrollments.length}</div>
            <div className={classes.statLabel}>Courses Enrolled</div>
          </div>
          <div className={classes.statCard}>
            <div className={classes.statNum}>{completedCount}</div>
            <div className={classes.statLabel}>Completed</div>
          </div>
          <div className={classes.statCard}>
            <div className={classes.statNum}>{avgProgress}%</div>
            <div className={classes.statLabel}>Avg Progress</div>
          </div>
          <div className={classes.statCard}>
            <div className={classes.statNum}>
              {
                enrollments.filter(
                  (e: any) =>
                    e.status === 'Enrolled' || e.status === 'InProgress',
                ).length
              }
            </div>
            <div className={classes.statLabel}>Active Courses</div>
          </div>
        </div>

        <Grid container spacing={2}>
          {/* Left: personal info */}
          <Grid item xs={12} md={4}>
            <div className={classes.card}>
              <div className={classes.cardTitle}>Personal Info</div>
              <div className={classes.infoRow}>
                <PersonIcon className={classes.infoIcon} />
                <span className={classes.infoLabel}>Full name</span>
                <span className={classes.infoValue}>{fullName}</span>
              </div>
              {email && (
                <div className={classes.infoRow}>
                  <EmailIcon className={classes.infoIcon} />
                  <span className={classes.infoLabel}>Email</span>
                  <span className={classes.infoValue}>{email}</span>
                </div>
              )}
              {phone && (
                <div className={classes.infoRow}>
                  <PhoneIcon className={classes.infoIcon} />
                  <span className={classes.infoLabel}>Phone</span>
                  <span className={classes.infoValue}>{phone}</span>
                </div>
              )}
              <div className={classes.infoRow}>
                <LocationOnIcon className={classes.infoIcon} />
                <span className={classes.infoLabel}>Hub</span>
                <span className={classes.infoValue}>{hub}</span>
              </div>
              {person.gender && (
                <div className={classes.infoRow}>
                  <PersonIcon className={classes.infoIcon} />
                  <span className={classes.infoLabel}>Gender</span>
                  <span className={classes.infoValue}>{person.gender}</span>
                </div>
              )}
              <div className={classes.infoRow}>
                <CheckCircleIcon className={classes.infoIcon} />
                <span className={classes.infoLabel}>Status</span>
                <span
                  className={classes.infoValue}
                  style={{ color: isActive ? '#10b981' : '#6b7280' }}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {student.registeredAt && (
                <div className={classes.infoRow}>
                  <WatchLaterIcon className={classes.infoIcon} />
                  <span className={classes.infoLabel}>Joined</span>
                  <span className={classes.infoValue}>
                    {new Date(student.registeredAt).toLocaleDateString(
                      'en-GB',
                      { day: 'numeric', month: 'short', year: 'numeric' },
                    )}
                  </span>
                </div>
              )}
            </div>
          </Grid>

          {/* Right: courses */}
          <Grid item xs={12} md={8}>
            <div style={{ marginBottom: 8 }}>
              <Typography
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: DARK,
                  marginBottom: 12,
                }}
              >
                <SchoolIcon
                  style={{
                    fontSize: 16,
                    marginRight: 6,
                    verticalAlign: 'middle',
                    color: CORAL,
                  }}
                />
                Enrolled Courses
              </Typography>
              {enrollments.length === 0 ? (
                <div className={classes.emptyBox}>
                  <SchoolIcon
                    style={{
                      fontSize: 40,
                      color: '#d1d5db',
                      marginBottom: 8,
                      display: 'block',
                      margin: '0 auto 8px',
                    }}
                  />
                  <Typography>Not enrolled in any courses yet</Typography>
                </div>
              ) : (
                enrollments.map((enrollment: any) => {
                  const course = enrollment.course || {};
                  const title =
                    course.title || course.name || 'Untitled Course';
                  const instructor = course.instructor?.contact?.person
                    ? `${course.instructor.contact.person.firstName} ${course.instructor.contact.person.lastName}`
                    : course.instructorName || '';
                  const progress = enrollment.progress || 0;
                  const status: string = enrollment.status || 'Enrolled';
                  const statusColor: Record<
                    string,
                    { bg: string; color: string }
                  > = {
                    Enrolled: { bg: 'rgba(254,58,106,0.08)', color: CORAL },
                    InProgress: {
                      bg: 'rgba(59,130,246,0.08)',
                      color: '#3b82f6',
                    },
                    Completed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
                    Dropped: { bg: 'rgba(156,163,175,0.12)', color: '#6b7280' },
                    Pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
                  };
                  const sc = statusColor[status] || statusColor.Enrolled;
                  return (
                    <div key={enrollment.id} className={classes.courseCard}>
                      <div className={classes.courseTitle}>{title}</div>
                      {instructor && (
                        <div className={classes.courseInstructor}>
                          Instructor: {instructor}
                        </div>
                      )}
                      <div className={classes.progressRow}>
                        <span className={classes.progressLabel}>Progress</span>
                        <span className={classes.progressValue}>
                          {progress}%
                        </span>
                      </div>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        classes={{ root: classes.progressBar }}
                        style={{ backgroundColor: '#f3ede9' }}
                      />
                      <span
                        className={classes.enrolledBadge}
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Grid>
        </Grid>
      </div>
    </Layout>
  );
};

export default withRouter(AdminStudentDetails);
