import React, { useEffect, useState } from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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

const useStyles = makeStyles(() => ({
  root: { padding: 24 },
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
  },
  bannerTitle: { fontSize: 20, fontWeight: 700, marginBottom: 8 },
  bannerDesc: { fontSize: 13, opacity: 0.9, maxWidth: 420 },
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
  },
  weekLabel: { fontSize: 14, fontWeight: 600, color: DARK, flex: 1 },
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
  },
  gridWrap: {
    flex: 1,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '72px repeat(7, 1fr)',
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
    cursor: 'pointer',
  },

  sidebar: {
    width: 240,
    flexShrink: 0,
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
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 8;
  let h = parseInt(m[1], 10);
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return h;
};

const MyTimetable = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const [sessions, setSessions] = useState<any[]>([]);
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );

  useEffect(() => {
    if (!user?.contactId) return;
    search(
      remoteRoutes.timetable,
      { studentId: user.contactId, contactId: user.contactId },
      (data: any) =>
        setSessions(Array.isArray(data) ? data : data?.sessions || []),
      undefined,
      () => {},
    );
  }, [user?.contactId]);

  const weekEnd = addDays(weekStart, 6);
  const weekDates = DAYS.map((_, i) => addDays(weekStart, i));

  // Filter sessions in this week
  const weekSessions = sessions.filter((s) => {
    const raw = s.startDate || s.date || s.sessionDate;
    if (!raw) return false;
    try {
      const d = typeof raw === 'string' ? parseISO(raw) : new Date(raw);
      return d >= weekStart && d <= weekEnd;
    } catch {
      return false;
    }
  });

  // Build grid lookup: dayIndex -> hourIndex -> session
  const gridMap: Record<number, Record<number, any>> = {};
  weekSessions.forEach((s) => {
    const raw = s.startDate || s.date || s.sessionDate;
    if (!raw) return;
    try {
      const d = typeof raw === 'string' ? parseISO(raw) : new Date(raw);
      const dayIdx = (d.getDay() + 6) % 7; // Mon=0
      const hour = s.startTime ? parseHour(s.startTime) : d.getHours();
      const hourIdx = hour - 8;
      if (hourIdx >= 0 && hourIdx < HOURS.length) {
        if (!gridMap[dayIdx]) gridMap[dayIdx] = {};
        gridMap[dayIdx][hourIdx] = s;
      }
    } catch {
      // ignore
    }
  });

  const fmt = (d: Date) => format(d, 'd MMM yyyy');

  return (
    <Layout title="My Timetable">
      <div className={classes.root}>
        {/* Breadcrumb */}
        <div className={classes.breadcrumb}>
          <span>Home</span>
          <span className={classes.breadcrumbSep}>›</span>
          <span className={classes.breadcrumbActive}>My Time Table</span>
        </div>

        {/* Banner */}
        <div className={classes.banner}>
          <div>
            <div className={classes.bannerTitle}>Weekly Schedule Overview</div>
            <div className={classes.bannerDesc}>
              Stay on top of your week with a clear overview of all your
              upcoming classes, events, and activities. Everything you need to
              plan your time effectively is right here at a glance.
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
              {/* Header row */}
              <div className={classes.headerCell} />
              {DAYS.map((day, i) => (
                <div key={day} className={classes.headerCell}>
                  <div>{day}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>
                    {format(weekDates[i], 'd')}
                  </div>
                </div>
              ))}

              {/* Hour rows */}
              {HOURS.map((hour, hi) => (
                <React.Fragment key={hour}>
                  <div className={classes.timeCell}>{hour}</div>
                  {DAYS.map((_, di) => {
                    const ev = gridMap[di]?.[hi];
                    return (
                      <div key={di} className={classes.dayCell}>
                        {ev && (
                          <div className={classes.eventBlock}>
                            <div>
                              {ev.moduleCode ||
                                ev.course?.code ||
                                ev.code ||
                                '1.1'}
                            </div>
                            <div style={{ fontWeight: 400, color: '#8a4050' }}>
                              {ev.room || ev.location || 'Hub 102'}
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
                No events scheduled for this week.
              </Typography>
            ) : (
              weekSessions.slice(0, 6).map((s, i) => {
                const raw = s.startDate || s.date;
                const d = raw
                  ? typeof raw === 'string'
                    ? parseISO(raw)
                    : new Date(raw)
                  : null;
                return (
                  <div key={s.id || i} className={classes.eventCard}>
                    <div className={classes.eventLabel}>Module</div>
                    <div className={classes.eventTitle}>
                      {s.moduleName || s.name || s.title || 'UX Foundation'}
                    </div>
                    <div className={classes.eventMeta}>
                      {d ? format(d, 'do MMM yyyy') : '—'}
                      <br />
                      {s.startTime && s.endTime
                        ? `${s.startTime} - ${s.endTime}`
                        : s.startTime || '08:00AM - 11:00AM'}
                      <br />
                      By{' '}
                      {s.instructorName ||
                        s.instructor?.name ||
                        'Andrew Mukuye'}
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
