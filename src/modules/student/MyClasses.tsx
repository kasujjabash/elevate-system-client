import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import EventIcon from '@material-ui/icons/Event';
import { isToday, isPast, format, parseISO } from 'date-fns';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/Loading';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { search } from '../../utils/ajax';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';

const useStyles = makeStyles(() => ({
  root: { padding: 24 },
  breadcrumb: { fontSize: 13, color: '#8a8f99', marginBottom: 6 },
  breadcrumbSep: { margin: '0 6px', color: '#c4c8d0' },
  breadcrumbActive: { color: CORAL },
  pageTitle: { fontSize: 24, fontWeight: 700, color: DARK, marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: DARK,
    marginBottom: 16,
  },

  classCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column' as any,
    height: '100%',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: CORAL,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  cardRight: {
    textAlign: 'right' as any,
    display: 'flex',
    flexDirection: 'column' as any,
    alignItems: 'flex-end',
    gap: 4,
  },
  liveBadge: {
    background: CORAL,
    color: '#fff',
    borderRadius: 6,
    padding: '2px 10px',
    fontSize: 11,
    fontWeight: 700,
  },
  moduleCode: { fontSize: 13, fontWeight: 700, color: DARK },
  instructorName: { fontSize: 12, color: '#8a8f99', marginBottom: 10 },
  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    fontSize: 12,
    color: '#5a5e6b',
    marginBottom: 5,
  },
  checkIcon: { fontSize: 14, color: CORAL, marginTop: 1, flexShrink: 0 },
  ongoingBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    fontSize: 13,
    marginTop: 'auto' as any,
    paddingTop: 10,
    paddingBottom: 10,
    '&:hover': { background: '#e02d5c' },
  },
  attendBtn: {
    border: `2px solid ${CORAL}`,
    color: CORAL,
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    fontSize: 13,
    marginTop: 'auto' as any,
    paddingTop: 8,
    paddingBottom: 8,
    '&:hover': { background: 'rgba(254,58,106,0.05)' },
  },

  timetableSection: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: 28,
    marginTop: 32,
  },
  viewAllBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    fontSize: 13,
    marginTop: 16,
    padding: '10px 28px',
    '&:hover': { background: '#e02d5c' },
  },

  emptyBox: {
    textAlign: 'center' as any,
    padding: '48px 0',
    color: '#8a8f99',
  },
}));

const getInitials = (name: string) => {
  if (!name) return 'AM';
  const parts = name.trim().split(' ');
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
};

const getSessionDate = (session: any): Date | null => {
  const raw = session.startDate || session.date || session.sessionDate;
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? parseISO(raw) : new Date(raw);
  } catch {
    return null;
  }
};

const ClassCard = ({ session, index }: { session: any; index: number }) => {
  const classes = useStyles();
  const date = getSessionDate(session);
  const ongoing = date ? isToday(date) : false;
  const past = date ? isPast(date) : false;

  const instructor =
    session.instructorName ||
    session.instructor?.name ||
    session.tutor?.name ||
    'Andrew Mukuye';
  const initials = getInitials(instructor);
  const code =
    session.moduleCode ||
    session.course?.code ||
    session.group?.code ||
    `1.${index + 1}`;
  const title =
    session.name || session.title || session.topic || 'Class Session';
  const timeStr =
    session.startTime && session.endTime
      ? `${session.startTime} to ${session.endTime}`
      : session.startTime || '08:00am to 11:00pm';
  const dateStr = date
    ? format(date, 'do MMMM yyyy')
    : session.dateLabel || '26th March 2026';
  const topic = session.topic || session.subject || title;

  return (
    <div className={classes.classCard}>
      <div className={classes.cardTop}>
        <div className={classes.avatar}>{initials}</div>
        <div className={classes.cardRight}>
          {ongoing && !past && <span className={classes.liveBadge}>Live</span>}
          <span className={classes.moduleCode}>{code}</span>
        </div>
      </div>

      <div className={classes.instructorName}>By {instructor}</div>

      <div className={classes.detailRow}>
        <CheckIcon className={classes.checkIcon} />
        <span>Date: {dateStr}</span>
      </div>
      <div className={classes.detailRow}>
        <CheckIcon className={classes.checkIcon} />
        <span>Time: {timeStr}</span>
      </div>
      <div className={classes.detailRow}>
        <CheckIcon className={classes.checkIcon} />
        <span>Topic: {topic}</span>
      </div>

      {ongoing && !past ? (
        <Button fullWidth variant="contained" className={classes.ongoingBtn}>
          Ongoing
        </Button>
      ) : (
        <Button fullWidth variant="outlined" className={classes.attendBtn}>
          Attend
        </Button>
      )}
    </div>
  );
};

const MyClasses = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.classes,
      { contactId: user.contactId, limit: 100 },
      (data) => setSessions(Array.isArray(data) ? data : data?.data || []),
      undefined,
      () => setLoading(false),
    );
  }, [user.contactId]);

  if (loading) {
    return (
      <Layout title="Live Classes">
        <Loading />
      </Layout>
    );
  }

  const upcoming = sessions.filter((s) => {
    const d = getSessionDate(s);
    return !d || !isPast(d) || isToday(d);
  });

  return (
    <Layout title="Live Classes">
      <div className={classes.root}>
        {/* Breadcrumb */}
        <div className={classes.breadcrumb}>
          <span>Home</span>
          <span className={classes.breadcrumbSep}>›</span>
          <span className={classes.breadcrumbActive}>Live Classes</span>
        </div>

        <div className={classes.pageTitle}>My classes</div>

        {/* Upcoming Classes */}
        <div className={classes.sectionTitle}>Upcoming Classes</div>

        {upcoming.length === 0 ? (
          <div className={classes.emptyBox}>
            <EventIcon
              style={{
                fontSize: 48,
                color: '#e0e0e0',
                display: 'block',
                margin: '0 auto 12px',
              }}
            />
            <Typography style={{ color: '#8a8f99', fontWeight: 500 }}>
              No upcoming classes scheduled
            </Typography>
            <Typography
              variant="body2"
              style={{ color: '#b0b5bf', marginTop: 4 }}
            >
              Your upcoming live classes will appear here
            </Typography>
          </div>
        ) : (
          <Grid container spacing={2}>
            {upcoming.map((s, i) => (
              <Grid item xs={12} sm={6} md={3} key={s.id || i}>
                <ClassCard session={s} index={i} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* All Class Time Table */}
        <div className={classes.timetableSection}>
          <div className={classes.sectionTitle} style={{ marginBottom: 8 }}>
            All Class Time Table
          </div>
          <Typography style={{ fontSize: 13, color: '#8a8f99' }}>
            To view all class including those you attended or missed already.
            Press the button below
          </Typography>
          <Button variant="contained" className={classes.viewAllBtn}>
            View All
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default MyClasses;
