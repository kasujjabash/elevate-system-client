import React, { useEffect, useState } from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import EventIcon from '@material-ui/icons/Event';
import RoomIcon from '@material-ui/icons/Room';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/Loading';
import { localRoutes, remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { search } from '../../utils/ajax';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Parse "09:00" or "09:00 AM" → total minutes since midnight
const toMinutes = (t: string): number => {
  if (!t) return 0;
  const ampm = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    if (ampm[3].toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm[3].toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  const h24 = t.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) return parseInt(h24[1], 10) * 60 + parseInt(h24[2], 10);
  return 0;
};

const fmt12 = (t: string): string => {
  if (!t) return '';
  const mins = toMinutes(t);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

const getInitials = (name: string) => {
  if (!name) return '??';
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
};

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: 24, [theme.breakpoints.down('xs')]: { padding: 14 } },
  breadcrumb: { fontSize: 13, color: '#8a8f99', marginBottom: 6 },
  breadcrumbSep: { margin: '0 6px', color: '#c4c8d0' },
  breadcrumbActive: { color: CORAL },
  pageTitle: { fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#8a8f99',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.06em',
    marginBottom: 14,
    marginTop: 28,
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column' as any,
    height: '100%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.15s',
    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.09)' },
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${CORAL} 0%, #fe8c45 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  livePill: {
    background: CORAL,
    color: '#fff',
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#fff',
    animation: '$pulse 1.2s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%,100%': { opacity: 1 },
    '50%': { opacity: 0.3 },
  },
  upcomingPill: {
    background: 'rgba(99,102,241,0.1)',
    color: '#6366f1',
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 700,
  },
  courseName: {
    fontSize: 14,
    fontWeight: 700,
    color: DARK,
    lineHeight: 1.3,
    marginBottom: 4,
  },
  instructorName: { fontSize: 12, color: '#8a8f99', marginBottom: 12 },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#5a5e6b',
    marginBottom: 6,
  },
  metaIcon: { fontSize: 14, color: '#b0b5bf', flexShrink: 0 },
  joinBtn: {
    background: `linear-gradient(90deg, ${CORAL} 0%, #fe8c45 100%)`,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    fontSize: 13,
    marginTop: 'auto' as any,
    paddingTop: 10,
    paddingBottom: 10,
    boxShadow: 'none',
    '&:hover': { opacity: 0.9, boxShadow: 'none' },
  },
  upcomingBtn: {
    border: `1.5px solid ${CORAL}`,
    color: CORAL,
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    fontSize: 13,
    marginTop: 'auto' as any,
    paddingTop: 8,
    paddingBottom: 8,
    background: 'transparent',
    '&:hover': { background: 'rgba(254,58,106,0.04)' },
  },

  // ── Timetable section ─────────────────────────────────────────────────
  timetableSection: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: 24,
    marginTop: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap' as any,
  },
  viewAllBtn: {
    background: `linear-gradient(90deg, ${CORAL} 0%, #fe8c45 100%)`,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    fontSize: 13,
    padding: '10px 24px',
    boxShadow: 'none',
    flexShrink: 0,
    '&:hover': { opacity: 0.9, boxShadow: 'none' },
  },

  emptyBox: {
    textAlign: 'center' as any,
    padding: '48px 24px',
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.07)',
  },
}));

interface TimetableSession {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  courseName?: string;
  moduleCode?: string;
  room?: string;
  instructorName?: string;
  isLive?: boolean; // may be provided by backend
  isToday?: boolean;
}

const ClassCard = ({
  session,
  status,
}: {
  session: TimetableSession;
  status: 'live' | 'upcoming-today' | 'upcoming-week';
}) => {
  const classes = useStyles();
  const instructor = session.instructorName || 'Instructor';
  const dayLabel =
    status === 'upcoming-week' ? DAY_NAMES[session.dayOfWeek] : 'Today';

  return (
    <div className={classes.card}>
      <div className={classes.cardTop}>
        <div className={classes.avatar}>{getInitials(instructor)}</div>
        {status === 'live' ? (
          <div className={classes.livePill}>
            <div className={classes.liveDot} />
            Live
          </div>
        ) : status === 'upcoming-today' ? (
          <div className={classes.upcomingPill}>Today</div>
        ) : (
          <div className={classes.upcomingPill}>
            {DAY_SHORT[session.dayOfWeek]}
          </div>
        )}
      </div>

      <div className={classes.courseName}>{session.courseName || 'Class'}</div>
      <div className={classes.instructorName}>By {instructor}</div>

      <div className={classes.metaRow}>
        <AccessTimeIcon className={classes.metaIcon} />
        {fmt12(session.startTime)} – {fmt12(session.endTime)}
      </div>
      {session.room && (
        <div className={classes.metaRow}>
          <RoomIcon className={classes.metaIcon} />
          {session.room}
        </div>
      )}
      <div className={classes.metaRow}>
        <EventIcon className={classes.metaIcon} />
        {dayLabel}
      </div>

      {status === 'live' ? (
        <Button fullWidth variant="contained" className={classes.joinBtn}>
          Join Now
        </Button>
      ) : (
        <Button fullWidth variant="outlined" className={classes.upcomingBtn}>
          Upcoming
        </Button>
      )}
    </div>
  );
};

const MyClasses = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = user?.contactId || user?.id;
    if (!sid) {
      setLoading(false);
      return;
    }
    search(
      remoteRoutes.timetable,
      { studentId: sid, contactId: sid },
      (data: any) =>
        setSessions(Array.isArray(data) ? data : data?.sessions || []),
      undefined,
      () => setLoading(false),
    );
  }, [user?.contactId]);

  if (loading)
    return (
      <Layout title="Live Classes">
        <Loading />
      </Layout>
    );

  const now = new Date();
  const currentDow = now.getDay();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const isLive = (s: TimetableSession) => {
    if (s.isLive !== undefined) return s.isLive; // trust backend if provided
    return (
      s.dayOfWeek === currentDow &&
      toMinutes(s.startTime) <= currentMins &&
      toMinutes(s.endTime) >= currentMins
    );
  };

  const isUpcomingToday = (s: TimetableSession) =>
    s.dayOfWeek === currentDow && toMinutes(s.startTime) > currentMins;

  const isUpcomingWeek = (s: TimetableSession) => {
    // days later this week (Mon-based: wrap Sun correctly)
    const daysLeft = (s.dayOfWeek - currentDow + 7) % 7;
    return daysLeft > 0 && daysLeft <= 6;
  };

  const live = sessions.filter(isLive);
  const upcomingToday = sessions.filter(isUpcomingToday);
  const upcomingWeek = sessions.filter(isUpcomingWeek).sort((a, b) => {
    const dA = (a.dayOfWeek - currentDow + 7) % 7;
    const dB = (b.dayOfWeek - currentDow + 7) % 7;
    return dA !== dB
      ? dA - dB
      : toMinutes(a.startTime) - toMinutes(b.startTime);
  });

  const hasAnything =
    live.length + upcomingToday.length + upcomingWeek.length > 0;

  return (
    <Layout title="Live Classes">
      <div className={classes.root}>
        {/* Breadcrumb */}
        <div className={classes.breadcrumb}>
          <span>Home</span>
          <span className={classes.breadcrumbSep}>›</span>
          <span className={classes.breadcrumbActive}>Live Classes</span>
        </div>

        <div className={classes.pageTitle}>My Classes</div>

        {!hasAnything ? (
          <div className={classes.emptyBox}>
            <EventIcon
              style={{
                fontSize: 48,
                color: '#e0e0e0',
                display: 'block',
                margin: '0 auto 12px',
              }}
            />
            <Typography
              style={{ color: '#8a8f99', fontWeight: 600, fontSize: 15 }}
            >
              No classes scheduled
            </Typography>
            <Typography
              variant="body2"
              style={{ color: '#b0b5bf', marginTop: 4 }}
            >
              Your live and upcoming classes will appear here once your
              timetable is set
            </Typography>
          </div>
        ) : (
          <>
            {/* Live now */}
            {live.length > 0 && (
              <>
                <div className={classes.sectionLabel}>🔴 Happening Now</div>
                <Grid container spacing={2}>
                  {live.map((s, i) => (
                    <Grid item xs={12} sm={6} md={3} key={s.id || i}>
                      <ClassCard session={s} status="live" />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Upcoming today */}
            {upcomingToday.length > 0 && (
              <>
                <div className={classes.sectionLabel}>Upcoming Today</div>
                <Grid container spacing={2}>
                  {upcomingToday.map((s, i) => (
                    <Grid item xs={12} sm={6} md={3} key={s.id || i}>
                      <ClassCard session={s} status="upcoming-today" />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Later this week */}
            {upcomingWeek.length > 0 && (
              <>
                <div className={classes.sectionLabel}>Later This Week</div>
                <Grid container spacing={2}>
                  {upcomingWeek.map((s, i) => (
                    <Grid item xs={12} sm={6} md={3} key={s.id || i}>
                      <ClassCard session={s} status="upcoming-week" />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}

        {/* View full timetable */}
        <div className={classes.timetableSection}>
          <div>
            <Typography style={{ fontWeight: 700, fontSize: 15, color: DARK }}>
              Full Weekly Timetable
            </Typography>
            <Typography
              style={{ fontSize: 13, color: '#8a8f99', marginTop: 2 }}
            >
              View your complete schedule including all past and upcoming
              classes
            </Typography>
          </div>
          <Button
            variant="contained"
            className={classes.viewAllBtn}
            onClick={() => history.push(localRoutes.myTimetable)}
          >
            View Timetable
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default MyClasses;
