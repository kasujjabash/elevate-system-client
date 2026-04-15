import React, { useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  parseISO,
} from 'date-fns';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { isTrainer } from '../../data/appRoles';
import { search } from '../../utils/ajax';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';

const START_HOUR = 8; // 8 AM
const END_HOUR = 20; // 8 PM
const PX_PER_HOUR = 64;
const GRID_HEIGHT = (END_HOUR - START_HOUR) * PX_PER_HOUR; // 768 px

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Build time-label rows (one per hour)
const TIME_LABELS: { label: string; top: number }[] = [];
for (let h = START_HOUR; h <= END_HOUR; h++) {
  const top = (h - START_HOUR) * PX_PER_HOUR;
  const label =
    h === 0
      ? '12:00 AM'
      : h < 12
      ? `${h}:00 AM`
      : h === 12
      ? '12:00 PM'
      : `${h - 12}:00 PM`;
  TIME_LABELS.push({ label, top });
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: 24,
    [theme.breakpoints.down('xs')]: { padding: 12 },
  },
  breadcrumb: { fontSize: 13, color: '#8a8f99', marginBottom: 6 },
  breadcrumbSep: { margin: '0 6px', color: '#c4c8d0' },
  breadcrumbActive: { color: CORAL },

  banner: {
    background: `linear-gradient(120deg, ${CORAL} 0%, #fe8c45 100%)`,
    borderRadius: 14,
    padding: '24px 32px',
    color: '#fff',
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative' as any,
    [theme.breakpoints.down('xs')]: { padding: '16px 20px' },
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    [theme.breakpoints.down('xs')]: { fontSize: 16 },
  },
  bannerDesc: {
    fontSize: 13,
    opacity: 0.9,
    maxWidth: 420,
    [theme.breakpoints.down('xs')]: { fontSize: 12 },
  },
  bannerDeco: {
    position: 'absolute' as any,
    right: 24,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 16px',
    display: 'flex',
    flexDirection: 'column' as any,
    gap: 4,
    [theme.breakpoints.down('sm')]: { display: 'none' },
  },
  decoLine: {
    height: 8,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },

  weekNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap' as any,
    [theme.breakpoints.down('xs')]: { gap: 8 },
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: DARK,
    flex: 1,
    [theme.breakpoints.down('xs')]: { fontSize: 12, width: '100%' },
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': { background: '#f5f5f5' },
  },
  changeWeekBtn: {
    fontSize: 12,
    color: CORAL,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  layout: {
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',
    [theme.breakpoints.down('sm')]: { flexDirection: 'column' as any },
  },
  gridWrap: {
    flex: 1,
    minWidth: 0,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    overflowX: 'auto' as any,
    [theme.breakpoints.down('sm')]: { width: '100%' },
  },
  // Outer grid: header row + body row
  grid: {
    display: 'grid',
    gridTemplateColumns: '68px repeat(7, 1fr)',
    gridTemplateRows: 'auto 1fr',
    minWidth: 600,
  },
  headerCell: {
    padding: '10px 6px',
    textAlign: 'center' as any,
    fontSize: 12,
    fontWeight: 700,
    color: '#8a8f99',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    background: '#fafafa',
    position: 'sticky' as any,
    top: 0,
    zIndex: 1,
  },
  // Time-label column
  timeCol: {
    position: 'relative' as any,
    height: GRID_HEIGHT,
    borderRight: '1px solid rgba(0,0,0,0.07)',
    background: '#fafafa',
  },
  timeLabel: {
    position: 'absolute' as any,
    right: 8,
    fontSize: 10,
    color: '#9ca3af',
    transform: 'translateY(-50%)',
    whiteSpace: 'nowrap' as any,
  },
  // Each day column
  dayCol: {
    position: 'relative' as any,
    height: GRID_HEIGHT,
    borderRight: '1px solid rgba(0,0,0,0.05)',
  },
  // Horizontal hour guide lines
  hourLine: {
    position: 'absolute' as any,
    left: 0,
    right: 0,
    borderTop: '1px solid rgba(0,0,0,0.05)',
    pointerEvents: 'none' as any,
  },
  // Event block — absolutely positioned, spans actual duration
  eventBlock: {
    position: 'absolute' as any,
    left: 4,
    right: 4,
    background: 'rgba(254,58,106,0.10)',
    borderLeft: `3px solid ${CORAL}`,
    borderRadius: 5,
    padding: '4px 7px',
    fontSize: 11,
    color: CORAL,
    fontWeight: 600,
    lineHeight: 1.35,
    overflow: 'hidden',
    boxSizing: 'border-box' as any,
    cursor: 'default',
    '&:hover': { background: 'rgba(254,58,106,0.16)' },
  },

  sidebar: {
    width: 240,
    flexShrink: 0,
    [theme.breakpoints.down('sm')]: { width: '100%' },
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: DARK,
    marginBottom: 14,
  },
  eventCard: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 10,
  },
  eventLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: CORAL,
    textTransform: 'uppercase' as any,
    marginBottom: 4,
  },
  eventTitle: { fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 4 },
  eventMeta: { fontSize: 11, color: '#8a8f99', lineHeight: 1.5 },
}));

// Returns fractional hours (e.g. 9.5 for 9:30 AM)
const parseTime = (timeStr: string): number => {
  if (!timeStr) return START_HOUR;
  const ampm = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    if (ampm[3].toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm[3].toUpperCase() === 'AM' && h === 12) h = 0;
    return h + m / 60;
  }
  const h24 = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (h24) return parseInt(h24[1], 10) + parseInt(h24[2], 10) / 60;
  return START_HOUR;
};

const MyTimetable = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const [sessions, setSessions] = useState<any[]>([]);
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  useEffect(() => {
    const sid = user?.contactId || user?.id;
    if (!sid) return;

    const trainer = isTrainer(user!);

    // Step 2 — fetch timetable and scope to the resolved course IDs
    // strict=true → only include sessions that have a matching courseId (used for trainers)
    // strict=false → also pass through sessions with no courseId (used for students)
    const loadTimetable = (courseIds: Set<string>, strict: boolean = false) => {
      search(
        remoteRoutes.timetable,
        { limit: 500 },
        (data: any) => {
          const all: any[] = Array.isArray(data)
            ? data
            : data?.sessions || data?.data || [];
          const scoped =
            courseIds.size > 0
              ? all.filter((s: any) => {
                  const cid = String(s.courseId ?? s.course?.id ?? '');
                  if (strict) return cid && courseIds.has(cid);
                  return !cid || courseIds.has(cid);
                })
              : all;
          setSessions(scoped);
        },
        undefined,
        () => {},
      );
    };

    if (trainer) {
      const userName = (user?.fullName || user?.username || '')
        .toLowerCase()
        .trim();

      // Phase 1: resolve instructor table ID (courses store instructorId from
      // the instructor table, NOT the user's contactId/id)
      search(
        remoteRoutes.courseInstructors,
        {},
        (iData: any) => {
          const instructors: any[] = Array.isArray(iData)
            ? iData
            : iData?.data || [];
          const myRecord = instructors.find((i: any) => {
            if (
              sid != null &&
              (String(i.id) === String(sid) ||
                String(i.contactId) === String(sid))
            )
              return true;
            if (userName && i.name && i.name.toLowerCase().trim() === userName)
              return true;
            return false;
          });
          const instructorId = myRecord?.id ?? sid;

          // Phase 2: fetch this trainer's courses with the resolved instructor ID
          search(
            remoteRoutes.courses,
            { instructorId, limit: 200 },
            (courseData: any) => {
              const courses: any[] = Array.isArray(courseData)
                ? courseData
                : courseData?.data || [];
              const courseIds = new Set(
                courses
                  .map((c: any) => String(c.id || c.courseId))
                  .filter(Boolean),
              );

              // Phase 3: fetch all timetable and filter strictly by courseIds
              search(
                remoteRoutes.timetable,
                { limit: 500 },
                (data: any) => {
                  const all: any[] = Array.isArray(data)
                    ? data
                    : data?.sessions || data?.data || [];
                  if (courseIds.size === 0) {
                    setSessions([]);
                    return;
                  }
                  const filtered = all.filter((s: any) => {
                    const cid = String(s.courseId ?? s.course?.id ?? '');
                    return cid && courseIds.has(cid);
                  });
                  setSessions(filtered);
                },
                undefined,
                () => {},
              );
            },
            undefined,
            () => {},
          );
        },
        // Instructor list failed — show nothing for trainer rather than all sessions
        () => {
          setSessions([]);
        },
      );
    } else {
      // Students: scope to courses they're enrolled in
      search(
        remoteRoutes.myCourses,
        {},
        (courseData: any) => {
          const list: any[] = Array.isArray(courseData)
            ? courseData
            : courseData?.data || [];
          const ids = new Set(
            list.map((c: any) => String(c.id || c.courseId)).filter(Boolean),
          );
          loadTimetable(ids);
        },
        () => loadTimetable(new Set()),
        undefined,
      );
    }
  }, [user?.contactId]);

  const weekEnd = addDays(weekStart, 6);
  const weekDates = DAYS.map((_, i) => addDays(weekStart, i));

  // Group sessions by day index (Mon=0 … Sun=6) for this week
  const daySessions: Record<number, any[]> = {};
  sessions.forEach((s) => {
    let dayIdx: number | null = null;
    if (s.dayOfWeek != null) {
      dayIdx = (Number(s.dayOfWeek) + 6) % 7;
    } else {
      const raw = s.startDate || s.date || s.sessionDate;
      if (!raw) return;
      try {
        const d = typeof raw === 'string' ? parseISO(raw) : new Date(raw);
        if (d >= weekStart && d <= weekEnd) dayIdx = (d.getDay() + 6) % 7;
      } catch {
        return;
      }
    }
    if (dayIdx !== null) {
      if (!daySessions[dayIdx]) daySessions[dayIdx] = [];
      daySessions[dayIdx].push(s);
    }
  });

  const weekSessions = sessions.filter((s) => {
    if (s.dayOfWeek != null) return true;
    const raw = s.startDate || s.date || s.sessionDate;
    if (!raw) return false;
    try {
      const d = typeof raw === 'string' ? parseISO(raw) : new Date(raw);
      return d >= weekStart && d <= weekEnd;
    } catch {
      return false;
    }
  });

  const fmt = (d: Date) => format(d, 'd MMM yyyy');

  const isTrainerUser = isTrainer(user!);

  return (
    <Layout title="My Timetable">
      <div className={classes.root}>
        {/* Breadcrumb */}
        <div className={classes.breadcrumb}>
          <span>Home</span>
          <span className={classes.breadcrumbSep}>›</span>
          <span className={classes.breadcrumbActive}>
            {isTrainerUser ? 'My Schedule' : 'My Timetable'}
          </span>
        </div>

        {/* Banner */}
        <div className={classes.banner}>
          <div>
            <div className={classes.bannerTitle}>Weekly Schedule Overview</div>
            <div className={classes.bannerDesc}>
              {isTrainerUser
                ? 'Your teaching schedule for the week — all sessions across your courses.'
                : 'Stay on top of your week with a clear overview of all your upcoming classes and activities.'}
            </div>
          </div>
          <div className={classes.bannerDeco}>
            {[80, 60, 90, 50].map((w, i) => (
              <div
                key={i}
                className={classes.decoLine}
                style={{ width: w, opacity: 0.5 + i * 0.1 }}
              />
            ))}
          </div>
        </div>

        {/* Week navigation */}
        <div className={classes.weekNav}>
          <span className={classes.weekLabel}>
            {fmt(weekStart)} – {fmt(weekEnd)}
          </span>
          <div
            className={classes.navBtn}
            onClick={() => setWeekStart((w) => subWeeks(w, 1))}
          >
            <ChevronLeftIcon style={{ fontSize: 18 }} />
          </div>
          <div
            className={classes.navBtn}
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
          >
            <ChevronRightIcon style={{ fontSize: 18 }} />
          </div>
          <span
            className={classes.changeWeekBtn}
            onClick={() =>
              setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
            }
          >
            Change Week
          </span>
        </div>

        <div className={classes.layout}>
          {/* Grid */}
          <div className={classes.gridWrap}>
            <div className={classes.grid}>
              {/* ── Header row ── */}
              <div className={classes.headerCell} />
              {DAYS.map((day, i) => (
                <div key={day} className={classes.headerCell}>
                  <div>{day}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>
                    {format(weekDates[i], 'd')}
                  </div>
                </div>
              ))}

              {/* ── Time-label column ── */}
              <div className={classes.timeCol}>
                {TIME_LABELS.map(({ label, top }) => (
                  <div
                    key={label}
                    className={classes.timeLabel}
                    style={{ top }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* ── Day columns ── */}
              {DAYS.map((_, di) => (
                <div key={di} className={classes.dayCol}>
                  {/* Hour guide lines */}
                  {TIME_LABELS.map(({ top }, li) => (
                    <div
                      key={li}
                      className={classes.hourLine}
                      style={{ top }}
                    />
                  ))}

                  {/* Events — positioned by actual start/end time */}
                  {(daySessions[di] || []).map((s: any, si: number) => {
                    const startH = Math.max(parseTime(s.startTime), START_HOUR);
                    const endH = s.endTime
                      ? Math.min(parseTime(s.endTime), END_HOUR)
                      : Math.min(startH + 1, END_HOUR);
                    const top = (startH - START_HOUR) * PX_PER_HOUR;
                    const height = Math.max((endH - startH) * PX_PER_HOUR, 28);
                    return (
                      <div
                        key={si}
                        className={classes.eventBlock}
                        style={{ top, height }}
                      >
                        <div
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {s.courseName ||
                            s.moduleName ||
                            s.name ||
                            s.title ||
                            'Class'}
                        </div>
                        {height >= 42 && (
                          <div
                            style={{
                              fontSize: 10,
                              opacity: 0.75,
                              marginTop: 2,
                            }}
                          >
                            {s.startTime}
                            {s.endTime ? ` – ${s.endTime}` : ''}
                          </div>
                        )}
                        {height >= 58 &&
                          (s.room || s.location || s.hubName) && (
                            <div
                              style={{
                                fontSize: 10,
                                opacity: 0.65,
                                marginTop: 1,
                              }}
                            >
                              {s.room || s.location || s.hubName}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className={classes.sidebar}>
            <div className={classes.sidebarTitle}>Events This Week</div>
            {weekSessions.length === 0 ? (
              <Typography style={{ fontSize: 13, color: '#8a8f99' }}>
                No sessions scheduled for this week.
                <br />
                <span
                  style={{
                    fontSize: 11,
                    color: '#c0c4ce',
                    marginTop: 6,
                    display: 'block',
                  }}
                >
                  {isTrainerUser
                    ? 'Sessions appear here once the hub manager adds timetable entries for your courses.'
                    : 'Sessions appear here once your admin adds timetable entries for your enrolled courses.'}
                </span>
              </Typography>
            ) : (
              weekSessions.slice(0, 6).map((s, i) => {
                let dateLabel = '—';
                if (s.dayOfWeek != null) {
                  const dayInWeek = weekDates[(Number(s.dayOfWeek) + 6) % 7];
                  dateLabel = format(dayInWeek, 'do MMM yyyy');
                } else {
                  const raw = s.startDate || s.date;
                  if (raw) {
                    try {
                      const d =
                        typeof raw === 'string' ? parseISO(raw) : new Date(raw);
                      dateLabel = format(d, 'do MMM yyyy');
                    } catch {
                      /* ignore */
                    }
                  }
                }
                return (
                  <div key={s.id || i} className={classes.eventCard}>
                    <div className={classes.eventLabel}>Module</div>
                    <div className={classes.eventTitle}>
                      {s.moduleName ||
                        s.courseName ||
                        s.name ||
                        s.title ||
                        'Class'}
                    </div>
                    <div className={classes.eventMeta}>
                      {dateLabel}
                      <br />
                      {s.startTime && s.endTime
                        ? `${s.startTime} – ${s.endTime}`
                        : s.startTime || '—'}
                      <br />
                      {s.instructorName || s.instructor?.name
                        ? `By ${s.instructorName || s.instructor?.name}`
                        : ''}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyTimetable;
