import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  makeStyles,
  Theme,
} from '@material-ui/core';
import RoomIcon from '@material-ui/icons/Room';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import AddIcon from '@material-ui/icons/Add';
import VideocamIcon from '@material-ui/icons/Videocam';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { search, put } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';
const BLUE = '#3b82f6';
const GREEN = '#10b981';

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
  liveBadge: {
    display: 'inline-block',
    background: 'rgba(16,185,129,0.12)',
    color: GREEN,
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
  actions: {
    display: 'flex',
    flexDirection: 'column' as any,
    gap: 8,
    flexShrink: 0,
    alignItems: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'row' as any,
      alignItems: 'center',
    },
  },
  liveBtn: {
    background: GREEN,
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 8,
    padding: '7px 16px',
    textTransform: 'none' as any,
    whiteSpace: 'nowrap' as any,
    '&:hover': { background: '#059669' },
  },
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
  // dialog
  dlgTitle: { fontSize: 16, fontWeight: 700, color: DARK },
  dlgSub: { fontSize: 12, color: '#8a8f99', marginTop: 4 },
  dlgSaveBtn: {
    background: GREEN,
    color: '#fff',
    fontWeight: 700,
    borderRadius: 8,
    textTransform: 'none' as any,
    '&:hover': { background: '#059669' },
  },
  dlgCancelBtn: {
    color: '#8a8f99',
    fontWeight: 600,
    borderRadius: 8,
    textTransform: 'none' as any,
  },
}));

const TABS = ['All Lectures', 'Upcoming', 'Completed'];

const TrainerLectures = () => {
  const classes = useStyles();
  const history = useHistory();
  const [tab, setTab] = useState(0);
  const [lectures, setLectures] = useState<any[]>([]);

  // "Start Live" dialog state
  const [liveDialog, setLiveDialog] = useState<any | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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

  // Resolve meeting URL from various possible field names
  const getMeetingUrl = (l: any): string | null =>
    l.meetingUrl ||
    l.meetingLink ||
    l.joinUrl ||
    l.zoomLink ||
    l.googleMeetLink ||
    l.liveUrl ||
    null;

  const handleStartLive = (lecture: any) => {
    const url = getMeetingUrl(lecture);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setLinkInput('');
      setLiveDialog(lecture);
    }
  };

  const handleSaveAndStart = () => {
    const url = linkInput.trim();
    if (!url || !liveDialog) return;
    setSaving(true);

    // Save the link to the class record then open it
    const updated = { ...liveDialog, meetingUrl: url };
    put(
      `${remoteRoutes.timetable}/${liveDialog.id}`,
      updated,
      () => {
        setSaving(false);
        setLectures((prev) =>
          prev.map((l) =>
            l.id === liveDialog.id ? { ...l, meetingUrl: url } : l,
          ),
        );
        setLiveDialog(null);
        window.open(url, '_blank', 'noopener,noreferrer');
      },
      undefined,
      () => {
        setSaving(false);
        // Even if save failed, still open the link
        setLiveDialog(null);
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    );
  };

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
          filtered.map((l: any, i: number) => {
            const hasLink = !!getMeetingUrl(l);
            return (
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
                          background: 'rgba(16,185,129,0.1)',
                          color: GREEN,
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
                    {hasLink ? (
                      <span className={classes.liveBadge}>Live Ready</span>
                    ) : (
                      <span className={classes.upcomingBadge}>Upcoming</span>
                    )}
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
                  {/* Start Live Class — primary CTA */}
                  <Button
                    variant="contained"
                    className={classes.liveBtn}
                    disableElevation
                    size="small"
                    startIcon={<VideocamIcon style={{ fontSize: 15 }} />}
                    onClick={() => handleStartLive(l)}
                  >
                    {hasLink ? 'Start Live Class' : 'Set Up & Go Live'}
                  </Button>

                  <div style={{ display: 'flex', gap: 8 }}>
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
              </div>
            );
          })
        )}
      </div>

      {/* ── Start Live Class dialog ── */}
      <Dialog
        open={!!liveDialog}
        onClose={() => setLiveDialog(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { borderRadius: 14 } }}
      >
        <DialogTitle disableTypography style={{ paddingBottom: 4 }}>
          <div className={classes.dlgTitle}>Start Live Class</div>
          <div className={classes.dlgSub}>
            {liveDialog?.title || liveDialog?.name || 'Lecture'}
          </div>
        </DialogTitle>
        <DialogContent>
          <Typography
            style={{ fontSize: 13, color: '#5a5e6b', marginBottom: 16 }}
          >
            Paste your meeting link below (Zoom, Google Meet, Microsoft Teams,
            etc.) and students will be able to join from their dashboard.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            size="small"
            label="Meeting link"
            placeholder="https://zoom.us/j/..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveAndStart()}
            inputProps={{ style: { fontSize: 13 } }}
          />
        </DialogContent>
        <DialogActions style={{ padding: '12px 20px 20px' }}>
          <Button
            className={classes.dlgCancelBtn}
            onClick={() => setLiveDialog(null)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            className={classes.dlgSaveBtn}
            disableElevation
            disabled={!linkInput.trim() || saving}
            startIcon={<VideocamIcon style={{ fontSize: 15 }} />}
            onClick={handleSaveAndStart}
          >
            {saving ? 'Saving…' : 'Save & Go Live'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default TrainerLectures;
