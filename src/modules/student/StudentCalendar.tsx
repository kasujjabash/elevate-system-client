import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Grid,
  Typography,
  makeStyles,
  Theme,
  CircularProgress,
} from '@material-ui/core';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import SchoolIcon from '@material-ui/icons/School';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { useSelector } from 'react-redux';
import { format, isToday, startOfWeek, addDays } from 'date-fns';
import Layout from '../../components/layout/Layout';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: theme.spacing(3) },
  pageTitle: {
    fontSize: '22px',
    fontWeight: 800,
    color: DARK,
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    letterSpacing: '-0.02em',
  },
  pageSub: {
    fontSize: 13,
    color: '#8a8f99',
    marginTop: 4,
    marginBottom: theme.spacing(3),
  },
  weekStrip: {
    display: 'flex',
    gap: 8,
    marginBottom: theme.spacing(3),
    overflowX: 'auto' as const,
    paddingBottom: 4,
  },
  dayPill: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: 12,
    minWidth: 60,
    cursor: 'default',
    border: '1px solid #f0f0f0',
    flexShrink: 0,
  },
  dayName: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  dayNum: { fontSize: 20, fontWeight: 800, lineHeight: 1.2 },
  sessionCard: {
    borderRadius: 12,
    border: '1px solid #f0f0f0',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    transition: 'box-shadow 0.2s',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: '12px 0 0 12px',
  },
  sessionTitle: {
    fontWeight: 700,
    fontSize: 14,
    color: DARK,
    fontFamily: '"Plus Jakarta Sans", sans-serif',
  },
  sessionMeta: {
    fontSize: 12,
    color: '#8a8f99',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  inProgressBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 700,
    color: '#22c55e',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 20,
    padding: '2px 8px',
  },
  upcomingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 700,
    color: '#f59e0b',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 20,
    padding: '2px 8px',
  },
  doneBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    color: '#8a8f99',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    borderRadius: 20,
    padding: '2px 8px',
  },
  nextClassBox: {
    borderRadius: 16,
    padding: theme.spacing(2.5),
    background: `linear-gradient(135deg, ${CORAL}15 0%, ${ORANGE}15 100%)`,
    border: `1px solid ${CORAL}30`,
    marginBottom: theme.spacing(3),
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: theme.spacing(8),
    color: '#8a8f99',
  },
  // Pulsing animation for in-progress
  '@keyframes pulse': {
    '0%': { opacity: 1, transform: 'scale(1)' },
    '50%': { opacity: 0.5, transform: 'scale(1.4)' },
    '100%': { opacity: 1, transform: 'scale(1)' },
  },
  pulseDot: {
    animation: '$pulse 1.4s ease-in-out infinite',
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#22c55e',
  },
}));

interface TimetableSession {
  id: number;
  courseId: number;
  courseName: string;
  hubName?: string;
  title: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  location?: string;
  instructor?: string;
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const isInProgress = (session: TimetableSession) => {
  const now = new Date();
  if (now.getDay() !== session.dayOfWeek) return false;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return (
    nowMin >= toMinutes(session.startTime) &&
    nowMin < toMinutes(session.endTime)
  );
};

const isPast = (session: TimetableSession) => {
  const now = new Date();
  const todayDay = now.getDay();
  if (session.dayOfWeek < todayDay) return true;
  if (session.dayOfWeek === todayDay) {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= toMinutes(session.endTime);
  }
  return false;
};

const formatTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const StudentCalendar = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);

  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const contactId = user?.contactId;
    if (!contactId) {
      setLoading(false);
      return;
    }
    get(
      `${remoteRoutes.timetable}?studentId=${contactId}`,
      (data: any) => {
        setSessions(Array.isArray(data) ? data : data?.sessions || []);
      },
      undefined,
      () => setLoading(false),
    );
  }, [user?.contactId]);

  // Build this week's days (Mon–Sun)
  const today = new Date();
  const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), 0); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Find next upcoming session
  const todayDay = today.getDay();
  const todayMin = today.getHours() * 60 + today.getMinutes();
  const inProgressSession = sessions.find(isInProgress);
  const nextSession = sessions
    .filter((s) => {
      if (s.dayOfWeek > todayDay) return true;
      if (s.dayOfWeek === todayDay && toMinutes(s.startTime) > todayMin)
        return true;
      return false;
    })
    .sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    })[0];

  const sessionsByDay: Record<number, TimetableSession[]> = {};
  sessions.forEach((s) => {
    if (!sessionsByDay[s.dayOfWeek]) sessionsByDay[s.dayOfWeek] = [];
    sessionsByDay[s.dayOfWeek].push(s);
  });

  const renderSessionCard = (s: TimetableSession) => {
    const inProg = isInProgress(s);
    const past = isPast(s);
    const barColor = inProg
      ? '#22c55e'
      : past
      ? '#e0e0e0'
      : `linear-gradient(180deg, ${CORAL} 0%, ${ORANGE} 100%)`;

    return (
      <Card
        key={s.id}
        className={classes.sessionCard}
        elevation={0}
        style={{
          boxShadow: inProg
            ? '0 0 0 2px #22c55e40, 0 4px 16px rgba(34,197,94,0.12)'
            : undefined,
        }}
      >
        <div className={classes.accentBar} style={{ background: barColor }} />
        <Box pl={1.5}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={0.5}
          >
            <span className={classes.sessionTitle}>{s.courseName}</span>
            {inProg && (
              <span className={classes.inProgressBadge}>
                <span className={classes.pulseDot} />
                In Progress
              </span>
            )}
            {!inProg && !past && (
              <span className={classes.upcomingBadge}>
                <AccessTimeIcon style={{ fontSize: 10 }} />
                Upcoming
              </span>
            )}
            {past && <span className={classes.doneBadge}>Done</span>}
          </Box>
          {s.title && s.title !== s.courseName && (
            <Typography
              style={{ fontSize: 12, color: '#5a5e6b', marginBottom: 4 }}
            >
              {s.title}
            </Typography>
          )}
          <Box
            display="flex"
            style={{ gap: 12, flexWrap: 'wrap', marginTop: 4 }}
          >
            <span className={classes.sessionMeta}>
              <AccessTimeIcon style={{ fontSize: 13 }} />
              {formatTime(s.startTime)} – {formatTime(s.endTime)}
            </span>
            {s.location && (
              <span className={classes.sessionMeta}>
                <LocationOnIcon style={{ fontSize: 13 }} />
                {s.location}
              </span>
            )}
            {s.hubName && (
              <span className={classes.sessionMeta}>
                <SchoolIcon style={{ fontSize: 13 }} />
                {s.hubName}
              </span>
            )}
          </Box>
        </Box>
      </Card>
    );
  };

  return (
    <Layout>
      <div className={classes.root}>
        <div
          style={{
            marginBottom: 4,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: CORAL,
            textTransform: 'uppercase',
          }}
        >
          My Timetable
        </div>
        <div className={classes.pageTitle}>Class Schedule</div>
        <div className={classes.pageSub}>
          {format(today, 'EEEE, d MMMM yyyy')}
          {sessions.length > 0 &&
            ` · ${sessions.length} class${
              sessions.length !== 1 ? 'es' : ''
            } this week`}
        </div>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress style={{ color: CORAL }} />
          </Box>
        ) : sessions.length === 0 ? (
          <Box className={classes.emptyState}>
            <SchoolIcon
              style={{ fontSize: 56, color: '#e0e0e0', marginBottom: 16 }}
            />
            <Typography
              variant="h6"
              style={{ fontWeight: 700, color: DARK, marginBottom: 8 }}
            >
              No schedule yet
            </Typography>
            <Typography
              style={{
                color: '#8a8f99',
                fontSize: 14,
                maxWidth: 360,
                margin: '0 auto',
              }}
            >
              Your class timetable will appear here once your hub coordinator
              adds your schedule.
            </Typography>
          </Box>
        ) : (
          <>
            {/* In-progress or Next class banner */}
            {(inProgressSession || nextSession) && (
              <div className={classes.nextClassBox}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: CORAL,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  {inProgressSession ? '🟢 Happening Now' : '⏭ Next Class'}
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: DARK,
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                  }}
                >
                  {(inProgressSession || nextSession)!.courseName}
                </div>
                <div style={{ fontSize: 13, color: '#5a5e6b', marginTop: 4 }}>
                  {
                    FULL_DAY_NAMES[
                      (inProgressSession || nextSession)!.dayOfWeek
                    ]
                  }{' '}
                  · {formatTime((inProgressSession || nextSession)!.startTime)}{' '}
                  – {formatTime((inProgressSession || nextSession)!.endTime)}
                  {(inProgressSession || nextSession)!.location &&
                    ` · ${(inProgressSession || nextSession)!.location}`}
                </div>
              </div>
            )}

            {/* Week day strip */}
            <div className={classes.weekStrip}>
              {weekDays.map((day, idx) => {
                const dayNum = day.getDay();
                const hasSessions = !!sessionsByDay[dayNum]?.length;
                const isCurrentDay = isToday(day);
                return (
                  <div
                    key={idx}
                    className={classes.dayPill}
                    style={{
                      background: isCurrentDay
                        ? `linear-gradient(135deg, ${CORAL} 0%, ${ORANGE} 100%)`
                        : '#f8f9fa',
                      border: isCurrentDay
                        ? 'none'
                        : hasSessions
                        ? `1px solid ${CORAL}40`
                        : '1px solid #f0f0f0',
                    }}
                  >
                    <span
                      className={classes.dayName}
                      style={{
                        color: isCurrentDay
                          ? 'rgba(255,255,255,0.8)'
                          : '#8a8f99',
                      }}
                    >
                      {DAY_NAMES[dayNum]}
                    </span>
                    <span
                      className={classes.dayNum}
                      style={{ color: isCurrentDay ? '#fff' : DARK }}
                    >
                      {format(day, 'd')}
                    </span>
                    {hasSessions && (
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          marginTop: 3,
                          backgroundColor: isCurrentDay
                            ? 'rgba(255,255,255,0.7)'
                            : CORAL,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sessions grouped by day */}
            {weekDays.map((day) => {
              const dayNum = day.getDay();
              const daySessions = (sessionsByDay[dayNum] || []).sort(
                (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
              );
              if (daySessions.length === 0) return null;
              const isCurrentDay = isToday(day);
              return (
                <Box key={dayNum} mb={3}>
                  <Box
                    display="flex"
                    alignItems="center"
                    style={{ gap: 8, marginBottom: 10 }}
                  >
                    <Typography
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: isCurrentDay ? CORAL : DARK,
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                      }}
                    >
                      {FULL_DAY_NAMES[dayNum]}
                    </Typography>
                    {isCurrentDay && (
                      <Chip
                        label="Today"
                        size="small"
                        style={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 700,
                          backgroundColor: `${CORAL}15`,
                          color: CORAL,
                          borderRadius: 4,
                        }}
                      />
                    )}
                    <div
                      style={{ flex: 1, height: 1, backgroundColor: '#f0f0f0' }}
                    />
                    <span style={{ fontSize: 11, color: '#c0c4ce' }}>
                      {daySessions.length} class
                      {daySessions.length !== 1 ? 'es' : ''}
                    </span>
                  </Box>
                  {daySessions.map(renderSessionCard)}
                </Box>
              );
            })}
          </>
        )}
      </div>
    </Layout>
  );
};

export default StudentCalendar;
