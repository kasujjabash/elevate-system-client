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

const HOURS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
  grid: {
    display: 'grid',
    gridTemplateColumns: '72px repeat(7, 1fr)',
    minWidth: 640,
  },
  headerCell: {
    padding: '10px 6px',
    textAlign: 'center' as any,
    fontSize: 12,
    fontWeight: 700,
    color: '#8a8f99',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    background: '#fafafa',
  },
  timeCell: {
    padding: '8px 10px',
    fontSize: 11,
    color: '#8a8f99',
    borderRight: '1px solid rgba(0,0,0,0.06)',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    whiteSpace: 'nowrap' as any,
    height: 52,
    display: 'flex',
    alignItems: 'center',
  },
  dayCell: {
    borderRight: '1px solid rgba(0,0,0,0.05)',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    height: 52,
    padding: 4,
    position: 'relative' as any,
  },
  eventBlock: {
    background: 'rgba(254,58,106,0.10)',
    borderLeft: `3px solid ${CORAL}`,
    borderRadius: 4,
    padding: '3px 6px',
    fontSize: 11,
    color: CORAL,
    fontWeight: 600,
    lineHeight: 1.3,
    height: '100%',
    overflow: 'hidden',
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

const parseHour = (timeStr: string) => {
  if (!timeStr) return 8;
  const ampm = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    if (ampm[3].toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm[3].toUpperCase() === 'AM' && h === 12) h = 0;
    return h;
  }
  const h24 = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (h24) return parseInt(h24[1], 10);
  return 8;
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

  const gridMap: Record<number, Record<number, any>> = {};
  sessions.forEach((s) => {
    if (s.dayOfWeek != null) {
      const dayIdx = (Number(s.dayOfWeek) + 6) % 7;
      const hourIdx = parseHour(s.startTime) - 8;
      if (hourIdx >= 0 && hourIdx < HOURS.length) {
        if (!gridMap[dayIdx]) gridMap[dayIdx] = {};
        if (!gridMap[dayIdx][hourIdx]) gridMap[dayIdx][hourIdx] = s;
      }
      return;
    }
    const raw = s.startDate || s.date || s.sessionDate;
    if (!raw) return;
    try {
      const d = typeof raw === 'string' ? parseISO(raw) : new Date(raw);
      if (d >= weekStart && d <= weekEnd) {
        const dayIdx = (d.getDay() + 6) % 7;
        const hourIdx =
          (s.startTime ? parseHour(s.startTime) : d.getHours()) - 8;
        if (hourIdx >= 0 && hourIdx < HOURS.length) {
          if (!gridMap[dayIdx]) gridMap[dayIdx] = {};
          if (!gridMap[dayIdx][hourIdx]) gridMap[dayIdx][hourIdx] = s;
        }
      }
    } catch {
      /* ignore */
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
              <div className={classes.headerCell} />
              {DAYS.map((day, i) => (
                <div key={day} className={classes.headerCell}>
                  <div>{day}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>
                    {format(weekDates[i], 'd')}
                  </div>
                </div>
              ))}

              {HOURS.map((hour, hi) => (
                <React.Fragment key={hour}>
                  <div className={classes.timeCell}>{hour}</div>
                  {DAYS.map((_, di) => {
                    const ev = gridMap[di]?.[hi];
                    return (
                      <div key={di} className={classes.dayCell}>
                        {ev && (
                          <div className={classes.eventBlock}>
                            <div
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {ev.courseName ||
                                ev.moduleName ||
                                ev.name ||
                                ev.title ||
                                'Class'}
                            </div>
                            <div
                              style={{
                                fontWeight: 400,
                                color: '#8a4050',
                                fontSize: 10,
                              }}
                            >
                              {ev.room || ev.location || ev.hubName || ''}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
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
