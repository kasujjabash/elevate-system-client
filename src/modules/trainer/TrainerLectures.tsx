import React, { useEffect, useState } from 'react';
import { Typography, Button, makeStyles, Theme } from '@material-ui/core';
import RoomIcon from '@material-ui/icons/Room';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import AddIcon from '@material-ui/icons/Add';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { search } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';
const BLUE = '#3b82f6';

const useStyles = makeStyles((theme: Theme) => ({
  root: { paddingBottom: 32 },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap' as any,
    gap: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: 800, color: DARK },
  pageSub: { fontSize: 13, color: '#8a8f99', marginTop: 2 },
  addBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'none' as any,
    '&:hover': { background: '#d42360' },
  },
  tabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 20,
    borderBottom: '2px solid #f3f4f6',
  },
  tab: {
    fontSize: 13,
    fontWeight: 500,
    color: '#8a8f99',
    padding: '8px 16px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
  },
  tabActive: {
    color: CORAL,
    fontWeight: 700,
    borderBottom: `2px solid ${CORAL}`,
    marginBottom: -2,
  },
  lectureCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '18px 22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    [theme.breakpoints.down('sm')]: { flexWrap: 'wrap' },
  },
  lectureInfo: { flex: 1 },
  courseCodeBadge: {
    display: 'inline-block',
    background: 'rgba(231,44,108,0.08)',
    color: CORAL,
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 5,
    padding: '1px 7px',
    marginRight: 6,
  },
  upcomingBadge: {
    display: 'inline-block',
    background: 'rgba(59,130,246,0.1)',
    color: BLUE,
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 5,
    padding: '1px 7px',
    marginBottom: 6,
  },
  lectureTitle: { fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 4 },
  lectureCourseName: { fontSize: 12, color: '#8a8f99', marginBottom: 8 },
  lectureMeta: { display: 'flex', gap: 16, flexWrap: 'wrap' as any },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: '#5a5e6b',
  },
  actions: { display: 'flex', gap: 8, flexShrink: 0 },
  viewBtn: {
    background: CORAL,
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 8,
    padding: '6px 14px',
    textTransform: 'none' as any,
    '&:hover': { background: '#d42360' },
  },
  editBtn: {
    border: '1px solid rgba(0,0,0,0.12)',
    color: DARK,
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 8,
    padding: '6px 14px',
    textTransform: 'none' as any,
  },
  emptyText: {
    fontSize: 13,
    color: '#c0c4ce',
    textAlign: 'center' as any,
    padding: '48px 0',
  },
}));

const TABS = ['All Lectures', 'Upcoming', 'Completed'];

const TrainerLectures = () => {
  const classes = useStyles();
  const history = useHistory();
  const [tab, setTab] = useState(0);
  const [lectures, setLectures] = useState<any[]>([]);

  useEffect(() => {
    // Fetch trainer's timetable/classes as lectures
    search(
      remoteRoutes.timetable,
      { limit: 100 },
      (data: any) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setLectures(list);
      },
      undefined,
      undefined,
    );
  }, []);

  const filtered = lectures.filter((l: any) => {
    if (tab === 0) return true;
    const status = (l.status || '').toLowerCase();
    if (tab === 1)
      return status === 'upcoming' || status === 'scheduled' || !status;
    if (tab === 2) return status === 'completed' || status === 'done';
    return true;
  });

  return (
    <Layout>
      <div className={classes.root}>
        <div className={classes.pageHeader}>
          <div>
            <div className={classes.pageTitle}>Lectures</div>
            <div className={classes.pageSub}>
              Manage your lecture schedule and materials
            </div>
          </div>
          <Button
            variant="contained"
            className={classes.addBtn}
            startIcon={<AddIcon />}
            disableElevation
            onClick={() => history.push(localRoutes.timetable)}
          >
            Schedule Lecture
          </Button>
        </div>

        <div className={classes.tabs}>
          {TABS.map((t, i) => (
            <div
              key={t}
              className={`${classes.tab} ${tab === i ? classes.tabActive : ''}`}
              onClick={() => setTab(i)}
            >
              {t}
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Typography className={classes.emptyText}>
            No lectures found
          </Typography>
        ) : (
          filtered.map((l: any, i: number) => (
            <div key={l.id || i} className={classes.lectureCard}>
              <div className={classes.lectureInfo}>
                <div>
                  {l.courseCode && (
                    <span className={classes.courseCodeBadge}>
                      {l.courseCode}
                    </span>
                  )}
                  {l.isOnline && (
                    <span
                      style={{
                        ...{},
                        background: 'rgba(16,185,129,0.1)',
                        color: '#10b981',
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 5,
                        padding: '1px 7px',
                        marginRight: 6,
                      }}
                    >
                      Online
                    </span>
                  )}
                  <span className={classes.upcomingBadge}>Upcoming</span>
                </div>
                <div className={classes.lectureTitle}>
                  {l.title || l.name || 'Lecture'}
                </div>
                <div className={classes.lectureCourseName}>
                  {l.courseName || l.course?.title || ''}
                </div>
                <div className={classes.lectureMeta}>
                  {l.date && (
                    <span className={classes.metaItem}>
                      <CalendarTodayIcon style={{ fontSize: 13 }} />
                      {l.date}
                    </span>
                  )}
                  {(l.startTime || l.duration) && (
                    <span className={classes.metaItem}>
                      <AccessTimeIcon style={{ fontSize: 13 }} />
                      {l.startTime}
                      {l.duration ? ` · ${l.duration}` : ''}
                    </span>
                  )}
                  {l.room && (
                    <span className={classes.metaItem}>
                      <RoomIcon style={{ fontSize: 13 }} />
                      {l.room}
                    </span>
                  )}
                </div>
              </div>
              <div className={classes.actions}>
                <Button
                  variant="contained"
                  className={classes.viewBtn}
                  disableElevation
                  size="small"
                  onClick={() =>
                    l.id && history.push(`${localRoutes.classes}/${l.id}`)
                  }
                >
                  View Details
                </Button>
                <Button
                  variant="outlined"
                  className={classes.editBtn}
                  size="small"
                >
                  Edit
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default TrainerLectures;
