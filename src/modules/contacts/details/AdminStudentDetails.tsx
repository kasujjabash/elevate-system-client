import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter, useHistory } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  Grid,
  LinearProgress,
  Tab,
  Tabs,
  TextField,
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
import BlockIcon from '@material-ui/icons/Block';
import CakeIcon from '@material-ui/icons/Cake';
import WcIcon from '@material-ui/icons/Wc';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import EventIcon from '@material-ui/icons/Event';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import Layout from '../../../components/layout/Layout';
import { get, put } from '../../../utils/ajax';
import Toast from '../../../utils/Toast';
import { localRoutes, remoteRoutes } from '../../../data/constants';
import { getRouteParam } from '../../../utils/routHelpers';

const CORAL = '#E72C6C';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: 24,
    background: '#f7f8fa',
    minHeight: '100%',
    [theme.breakpoints.down('xs')]: { padding: 12 },
  },

  // ── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    background: `linear-gradient(120deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 16,
    padding: '28px 32px',
    marginBottom: 24,
    [theme.breakpoints.down('xs')]: { padding: '20px 16px' },
  },
  heroTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 20,
    flexWrap: 'wrap' as any,
  },
  avatar: {
    width: 80,
    height: 80,
    background: 'rgba(255,255,255,0.25)',
    fontSize: 28,
    fontWeight: 800,
    flexShrink: 0,
    border: '3px solid rgba(255,255,255,0.35)',
    color: '#fff',
  },
  heroInfo: { flex: 1, minWidth: 0 },
  heroName: {
    fontSize: 24,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.02em',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap' as any,
  },
  heroBadges: { display: 'flex', gap: 8, flexWrap: 'wrap' as any },
  badge: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    padding: '4px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  },
  heroActions: {
    display: 'flex',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap' as any,
  },
  actionBtn: {
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 8,
    textTransform: 'none' as any,
    padding: '6px 16px',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    background: 'rgba(255,255,255,0.08)',
    '&:hover': { background: 'rgba(255,255,255,0.14)' },
  },
  actionBtnDanger: {
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 8,
    textTransform: 'none' as any,
    padding: '6px 16px',
    border: '1px solid rgba(255,255,255,0.5)',
    color: '#fff',
    background: 'rgba(0,0,0,0.25)',
    '&:hover': { background: 'rgba(0,0,0,0.38)' },
  },

  // ── Stats strip ──────────────────────────────────────────────────────────
  statsStrip: {
    display: 'flex',
    gap: 14,
    marginBottom: 24,
    flexWrap: 'wrap' as any,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '14px 20px',
    flex: 1,
    minWidth: 100,
    textAlign: 'center' as any,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  statNum: { fontSize: 22, fontWeight: 800, color: DARK, lineHeight: 1 },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 5, fontWeight: 500 },

  // ── Tabs ─────────────────────────────────────────────────────────────────
  tabsRoot: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    marginBottom: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  tab: {
    textTransform: 'none' as any,
    fontWeight: 600,
    fontSize: 13,
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    minWidth: 100,
  },
  tabIndicator: { backgroundColor: CORAL, height: 3, borderRadius: 3 },

  // ── Cards ────────────────────────────────────────────────────────────────
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '18px 22px',
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '9px 0',
    borderBottom: '1px solid #f3f4f6',
    '&:last-child': { borderBottom: 'none' },
  },
  rowIcon: { fontSize: 15, color: '#d1d5db', flexShrink: 0, marginTop: 1 },
  rowLabel: { fontSize: 12, color: '#9ca3af', minWidth: 110, flexShrink: 0 },
  rowValue: { fontSize: 13, fontWeight: 600, color: DARK },

  // ── Course card ──────────────────────────────────────────────────────────
  courseCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '16px 20px',
    marginBottom: 12,
    transition: 'box-shadow 0.15s',
    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  courseTitle: { fontSize: 14, fontWeight: 700, color: DARK },
  courseInstructor: { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: { fontSize: 12, color: '#6b7280' },
  progressPct: { fontSize: 12, fontWeight: 700, color: CORAL },
  progressBar: { borderRadius: 4, height: 6 },

  // ── Attendance ───────────────────────────────────────────────────────────
  attendanceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
    '&:last-child': { borderBottom: 'none' },
  },
  attendanceDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },

  emptyBox: {
    textAlign: 'center' as any,
    padding: '48px 20px',
    color: '#9ca3af',
  },
}));

const statusColor: Record<string, { bg: string; color: string }> = {
  Enrolled: { bg: 'rgba(254,58,106,0.08)', color: CORAL },
  InProgress: { bg: 'rgba(59,130,246,0.08)', color: '#3b82f6' },
  Completed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  Dropped: { bg: 'rgba(156,163,175,0.12)', color: '#6b7280' },
  Pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
};

function initials(name: string) {
  return (name || '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function fmtDate(d: any) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

type Props = RouteComponentProps;

const AdminStudentDetails = (props: Props) => {
  const classes = useStyles();
  const history = useHistory();
  const studentId = getRouteParam(props, 'studentId');

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [attendance, setAttendance] = useState<any[]>([]);

  // deactivation confirmation
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmEmailError, setConfirmEmailError] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    get(
      `${remoteRoutes.students}/${studentId}`,
      (data) => {
        setStudent(data);
        // fetch attendance history
        get(
          `${remoteRoutes.studentAttendanceHistory}?contactId=${
            data.contactId || studentId
          }&limit=20`,
          (hist: any) =>
            setAttendance(Array.isArray(hist) ? hist : hist?.records || []),
          undefined,
          () => {},
        );
      },
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

  // ── Normalise data ────────────────────────────────────────────────────────
  const person = student.contact?.person || {};
  const fullName =
    [person.firstName, person.lastName].filter(Boolean).join(' ') ||
    student.fullName ||
    'Unknown Student';
  const email =
    student.contact?.email?.[0]?.value ||
    student.email ||
    student.loginEmail ||
    '';
  const phone = student.contact?.phone?.[0]?.value || student.phone || '';
  const hub = student.hub?.name || student.hubName || '—';
  const isActive = student.isActive !== false;
  const enrollments: any[] = student.enrollments || [];

  const completedCount = enrollments.filter(
    (e) => e.status === 'Completed',
  ).length;
  const activeCount = enrollments.filter(
    (e) => e.status === 'Enrolled' || e.status === 'InProgress',
  ).length;
  const avgProgress = enrollments.length
    ? Math.round(
        enrollments.reduce((s, e) => s + (e.progress || 0), 0) /
          enrollments.length,
      )
    : 0;

  const attendancePct =
    student.attendanceRate != null ? `${student.attendanceRate}%` : '—';

  const userId = student.userId || student.user?.id;

  function handleDeactivate() {
    if (confirmEmail !== email) {
      setConfirmEmailError('Email does not match. Please type it exactly.');
      return;
    }
    setDeactivating(true);
    const updated = { ...student, isActive: !isActive };
    put(
      `${remoteRoutes.users}/${userId}`,
      updated,
      () => {
        setStudent((prev: any) => ({ ...prev, isActive: !isActive }));
        Toast.success(
          `Account ${!isActive ? 'activated' : 'deactivated'} successfully`,
        );
        setDeactivateOpen(false);
        setConfirmEmail('');
      },
      undefined,
      () => setDeactivating(false),
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
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

        {/* ── Hero ── */}
        <div className={classes.hero}>
          <div className={classes.heroTop}>
            <Avatar className={classes.avatar}>{initials(fullName)}</Avatar>
            <div className={classes.heroInfo}>
              <div className={classes.heroName}>{fullName}</div>
              <div className={classes.heroSub}>
                {email && (
                  <>
                    <EmailIcon style={{ fontSize: 13 }} />
                    {email}
                  </>
                )}
                {phone && (
                  <>
                    <PhoneIcon style={{ fontSize: 13, marginLeft: 8 }} />
                    {phone}
                  </>
                )}
                {hub !== '—' && (
                  <>
                    <LocationOnIcon style={{ fontSize: 13, marginLeft: 8 }} />
                    {hub}
                  </>
                )}
              </div>
              <div className={classes.heroBadges}>
                <span
                  className={classes.badge}
                  style={
                    isActive
                      ? {
                          background: 'rgba(16,185,129,0.15)',
                          color: '#10b981',
                        }
                      : {
                          background: 'rgba(156,163,175,0.15)',
                          color: '#9ca3af',
                        }
                  }
                >
                  {isActive ? (
                    <>
                      <CheckCircleIcon style={{ fontSize: 12 }} /> Active
                    </>
                  ) : (
                    <>
                      <BlockIcon style={{ fontSize: 12 }} /> Inactive
                    </>
                  )}
                </span>
                {student.studentId && (
                  <span
                    className={classes.badge}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    ID: {student.studentId}
                  </span>
                )}
                {person.gender && (
                  <span
                    className={classes.badge}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {person.gender}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={classes.heroActions}>
            <Button className={classes.actionBtn} size="small">
              Edit Profile
            </Button>
            <Button
              className={classes.actionBtn}
              size="small"
              startIcon={<VpnKeyIcon style={{ fontSize: 14 }} />}
            >
              Reset Password
            </Button>
            <Button
              className={classes.actionBtnDanger}
              size="small"
              startIcon={
                isActive ? (
                  <BlockIcon style={{ fontSize: 14 }} />
                ) : (
                  <CheckCircleIcon style={{ fontSize: 14 }} />
                )
              }
              onClick={() => {
                setDeactivateOpen(true);
                setConfirmEmail('');
                setConfirmEmailError('');
              }}
            >
              {isActive ? 'Deactivate' : 'Activate'} Account
            </Button>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className={classes.statsStrip}>
          <div className={classes.statCard}>
            <div className={classes.statNum}>{enrollments.length}</div>
            <div className={classes.statLabel}>Total Courses</div>
          </div>
          <div className={classes.statCard}>
            <div className={classes.statNum}>{activeCount}</div>
            <div className={classes.statLabel}>Active Courses</div>
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
            <div className={classes.statNum}>{attendancePct}</div>
            <div className={classes.statLabel}>Attendance Rate</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={classes.tabsRoot}>
          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            TabIndicatorProps={{ className: classes.tabIndicator }}
          >
            <Tab label="Overview" className={classes.tab} />
            <Tab label="Courses" className={classes.tab} />
            <Tab label="Attendance" className={classes.tab} />
          </Tabs>
        </div>

        {/* ── TAB 0: Overview ── */}
        {tab === 0 && (
          <Grid container spacing={2}>
            {/* Bio data */}
            <Grid item xs={12} md={6}>
              <div className={classes.card}>
                <div className={classes.cardTitle}>
                  <PersonIcon style={{ fontSize: 14 }} /> Bio Data
                </div>
                <div className={classes.row}>
                  <PersonIcon className={classes.rowIcon} />
                  <span className={classes.rowLabel}>Full Name</span>
                  <span className={classes.rowValue}>{fullName}</span>
                </div>
                {person.dateOfBirth && (
                  <div className={classes.row}>
                    <CakeIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Date of Birth</span>
                    <span className={classes.rowValue}>
                      {fmtDate(person.dateOfBirth)}
                    </span>
                  </div>
                )}
                {person.gender && (
                  <div className={classes.row}>
                    <WcIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Gender</span>
                    <span className={classes.rowValue}>{person.gender}</span>
                  </div>
                )}
                {person.nationality && (
                  <div className={classes.row}>
                    <LocationOnIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Nationality</span>
                    <span className={classes.rowValue}>
                      {person.nationality}
                    </span>
                  </div>
                )}
                {(student.contact?.address?.[0]?.street || student.address) && (
                  <div className={classes.row}>
                    <LocationOnIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Address</span>
                    <span className={classes.rowValue}>
                      {student.contact?.address?.[0]?.street || student.address}
                    </span>
                  </div>
                )}
                {student.bio && (
                  <div className={classes.row}>
                    <PersonIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Bio</span>
                    <span
                      className={classes.rowValue}
                      style={{
                        fontWeight: 400,
                        fontSize: 12,
                        color: '#6b7280',
                      }}
                    >
                      {student.bio}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className={classes.card}>
                <div className={classes.cardTitle}>
                  <PhoneIcon style={{ fontSize: 14 }} /> Contact Info
                </div>
                {email && (
                  <div className={classes.row}>
                    <EmailIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Email</span>
                    <span className={classes.rowValue}>{email}</span>
                  </div>
                )}
                {phone && (
                  <div className={classes.row}>
                    <PhoneIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Phone</span>
                    <span className={classes.rowValue}>{phone}</span>
                  </div>
                )}
                {student.emergencyContact && (
                  <div className={classes.row}>
                    <PhoneIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Emergency</span>
                    <span className={classes.rowValue}>
                      {student.emergencyContact}
                    </span>
                  </div>
                )}
                <div className={classes.row}>
                  <LocationOnIcon className={classes.rowIcon} />
                  <span className={classes.rowLabel}>Hub</span>
                  <span className={classes.rowValue}>{hub}</span>
                </div>
              </div>
            </Grid>

            {/* Account / login info */}
            <Grid item xs={12} md={6}>
              <div className={classes.card}>
                <div className={classes.cardTitle}>
                  <VpnKeyIcon style={{ fontSize: 14 }} /> Account & Login
                </div>
                <div className={classes.row}>
                  <EmailIcon className={classes.rowIcon} />
                  <span className={classes.rowLabel}>Login Email</span>
                  <span className={classes.rowValue}>{email || '—'}</span>
                </div>
                {student.username && (
                  <div className={classes.row}>
                    <PersonIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Username</span>
                    <span className={classes.rowValue}>{student.username}</span>
                  </div>
                )}
                <div className={classes.row}>
                  <CheckCircleIcon className={classes.rowIcon} />
                  <span className={classes.rowLabel}>Status</span>
                  <span
                    className={classes.rowValue}
                    style={{ color: isActive ? '#10b981' : '#9ca3af' }}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {student.registeredAt && (
                  <div className={classes.row}>
                    <EventIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Joined</span>
                    <span className={classes.rowValue}>
                      {fmtDate(student.registeredAt)}
                    </span>
                  </div>
                )}
                {student.lastLogin && (
                  <div className={classes.row}>
                    <AccessTimeIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Last Login</span>
                    <span className={classes.rowValue}>
                      {fmtDate(student.lastLogin)}
                    </span>
                  </div>
                )}
                {student.mustChangePassword != null && (
                  <div className={classes.row}>
                    <VpnKeyIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Must Change Pwd</span>
                    <span className={classes.rowValue}>
                      {student.mustChangePassword ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                {student.role && (
                  <div className={classes.row}>
                    <PersonIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Role</span>
                    <span className={classes.rowValue}>{student.role}</span>
                  </div>
                )}
              </div>

              {/* Performance summary */}
              <div className={classes.card}>
                <div className={classes.cardTitle}>
                  <TrendingUpIcon style={{ fontSize: 14 }} /> Performance
                  Summary
                </div>
                <div className={classes.row}>
                  <SchoolIcon className={classes.rowIcon} />
                  <span className={classes.rowLabel}>Courses Enrolled</span>
                  <span className={classes.rowValue}>{enrollments.length}</span>
                </div>
                <div className={classes.row}>
                  <CheckCircleIcon className={classes.rowIcon} />
                  <span className={classes.rowLabel}>Completed</span>
                  <span className={classes.rowValue}>{completedCount}</span>
                </div>
                <div className={classes.row}>
                  <TrendingUpIcon className={classes.rowIcon} />
                  <span className={classes.rowLabel}>Avg Progress</span>
                  <span className={classes.rowValue} style={{ color: CORAL }}>
                    {avgProgress}%
                  </span>
                </div>
                <div className={classes.row}>
                  <HowToRegIcon className={classes.rowIcon} />
                  <span className={classes.rowLabel}>Attendance Rate</span>
                  <span className={classes.rowValue}>{attendancePct}</span>
                </div>
                {student.lastActivity && (
                  <div className={classes.row}>
                    <AccessTimeIcon className={classes.rowIcon} />
                    <span className={classes.rowLabel}>Last Active</span>
                    <span className={classes.rowValue}>
                      {fmtDate(student.lastActivity)}
                    </span>
                  </div>
                )}
              </div>
            </Grid>
          </Grid>
        )}

        {/* ── TAB 1: Courses ── */}
        {tab === 1 && (
          <>
            {enrollments.length === 0 ? (
              <div className={classes.emptyBox}>
                <SchoolIcon
                  style={{
                    fontSize: 44,
                    color: '#e0e0e0',
                    display: 'block',
                    margin: '0 auto 10px',
                  }}
                />
                <Typography style={{ fontWeight: 600, color: '#9ca3af' }}>
                  Not enrolled in any courses yet
                </Typography>
              </div>
            ) : (
              enrollments.map((en: any) => {
                const course = en.course || {};
                const title = course.title || course.name || 'Untitled Course';
                const instructor = course.instructor?.contact?.person
                  ? `${course.instructor.contact.person.firstName} ${course.instructor.contact.person.lastName}`
                  : course.instructorName || en.instructorName || '';
                const progress = en.progress || 0;
                const status: string = en.status || 'Enrolled';
                const sc = statusColor[status] || statusColor.Enrolled;
                return (
                  <div key={en.id} className={classes.courseCard}>
                    <div className={classes.courseHeader}>
                      <div className={classes.courseTitle}>{title}</div>
                      <Chip
                        label={status}
                        size="small"
                        style={{
                          background: sc.bg,
                          color: sc.color,
                          fontWeight: 700,
                          fontSize: 11,
                          height: 22,
                        }}
                      />
                    </div>
                    {instructor && (
                      <div className={classes.courseInstructor}>
                        By {instructor}
                      </div>
                    )}
                    {en.enrolledAt && (
                      <div
                        className={classes.courseInstructor}
                        style={{ marginBottom: 10 }}
                      >
                        Enrolled: {fmtDate(en.enrolledAt)}
                        {en.completedAt
                          ? ` · Completed: ${fmtDate(en.completedAt)}`
                          : ''}
                      </div>
                    )}
                    <div className={classes.progressRow}>
                      <span className={classes.progressLabel}>Progress</span>
                      <span className={classes.progressPct}>{progress}%</span>
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      className={classes.progressBar}
                      style={{ backgroundColor: '#f3f4f6' }}
                    />
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── TAB 2: Attendance ── */}
        {tab === 2 && (
          <div className={classes.card}>
            <div className={classes.cardTitle}>
              <HowToRegIcon style={{ fontSize: 14 }} /> Attendance History
            </div>
            {attendance.length === 0 ? (
              <div className={classes.emptyBox}>
                <HowToRegIcon
                  style={{
                    fontSize: 44,
                    color: '#e0e0e0',
                    display: 'block',
                    margin: '0 auto 10px',
                  }}
                />
                <Typography style={{ fontWeight: 600, color: '#9ca3af' }}>
                  No attendance records found
                </Typography>
              </div>
            ) : (
              attendance.map((rec: any, i: number) => (
                <div key={rec.id || i} className={classes.attendanceRow}>
                  <div
                    className={classes.attendanceDot}
                    style={{
                      background: rec.present !== false ? '#10b981' : '#ef4444',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>
                      {rec.sessionName ||
                        rec.courseName ||
                        rec.className ||
                        'Session'}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      {fmtDate(rec.date || rec.checkedInAt)}
                      {rec.checkedInAt &&
                        ` · Checked in: ${new Date(
                          rec.checkedInAt,
                        ).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`}
                    </div>
                  </div>
                  <Chip
                    label={
                      rec.method ||
                      (rec.present !== false ? 'Present' : 'Absent')
                    }
                    size="small"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      height: 20,
                      background:
                        rec.present !== false
                          ? 'rgba(16,185,129,0.1)'
                          : 'rgba(239,68,68,0.1)',
                      color: rec.present !== false ? '#10b981' : '#ef4444',
                    }}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Deactivation Confirmation Dialog ── */}
      <Dialog
        open={deactivateOpen}
        onClose={() => {
          setDeactivateOpen(false);
          setConfirmEmail('');
          setConfirmEmailError('');
        }}
        maxWidth="xs"
        fullWidth
      >
        <div style={{ padding: 28 }}>
          <Typography
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: DARK,
              marginBottom: 8,
            }}
          >
            {isActive ? 'Deactivate' : 'Activate'} Account
          </Typography>
          <Typography
            style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}
          >
            You are about to{' '}
            <strong>{isActive ? 'deactivate' : 'activate'}</strong> the account
            for <strong>{fullName}</strong>.
          </Typography>
          <Typography
            style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}
          >
            To confirm, type the student's email address:
            {email && (
              <span
                style={{
                  display: 'block',
                  fontWeight: 700,
                  color: DARK,
                  marginTop: 4,
                }}
              >
                {email}
              </span>
            )}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="Type email to confirm"
            value={confirmEmail}
            onChange={(e) => {
              setConfirmEmail(e.target.value);
              setConfirmEmailError('');
            }}
            onPaste={(e) => e.preventDefault()}
            error={!!confirmEmailError}
            helperText={
              confirmEmailError ||
              'Pasting is disabled — type the email manually'
            }
            inputProps={{ autoComplete: 'off' }}
          />
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 24,
              justifyContent: 'flex-end',
            }}
          >
            <Button
              style={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13,
                border: '1px solid #e5e7eb',
              }}
              onClick={() => {
                setDeactivateOpen(false);
                setConfirmEmail('');
                setConfirmEmailError('');
              }}
              disabled={deactivating}
            >
              Cancel
            </Button>
            <Button
              style={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13,
                background: isActive ? '#dc2626' : '#10b981',
                color: '#fff',
              }}
              onClick={handleDeactivate}
              disabled={deactivating || !confirmEmail}
            >
              {deactivating ? (
                <CircularProgress size={16} style={{ color: '#fff' }} />
              ) : isActive ? (
                'Deactivate'
              ) : (
                'Activate'
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </Layout>
  );
};

export default withRouter(AdminStudentDetails);
