import React, { useEffect, useState } from 'react';
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import CampaignIcon from '@material-ui/icons/NotificationsActive';
import CloseIcon from '@material-ui/icons/Close';
import Layout from '../../components/layout/Layout';
import { get, post } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import Toast from '../../utils/Toast';
import { useSelector } from 'react-redux';
import { IState } from '../../data/types';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';

const TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  info: { label: 'Info', bg: '#eff6ff', color: '#3b82f6' },
  warning: { label: 'Warning', bg: '#fff7ed', color: '#f59e0b' },
  event: { label: 'Event', bg: '#f0fdf4', color: '#22c55e' },
  success: { label: 'Success', bg: '#f5f3ff', color: '#8b5cf6' },
};

const EMPTY_ANN = {
  title: '',
  body: '',
  type: 'info',
  pinned: false,
  expiresAt: '',
  courseId: '',
};

const TOKEN_KEY = '__elevate__academy__token';
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
});

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: theme.spacing(3), background: '#f8f7f5', minHeight: '100%' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: DARK,
    letterSpacing: '-0.02em',
  },
  addBtn: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    boxShadow: 'none',
    '&:hover': { opacity: 0.9, boxShadow: 'none' },
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #ede8e3',
    padding: '16px 20px',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    transition: 'box-shadow 0.15s',
    '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.07)' },
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 3 },
  cardBody: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap' as any,
  },
  cardMeta: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as any,
  },
  actions: { marginLeft: 'auto', display: 'flex', gap: 4, flexShrink: 0 },
  emptyBox: {
    textAlign: 'center' as any,
    padding: '60px 20px',
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #ede8e3',
  },
}));

const TrainerAnnouncements = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [openAnn, setOpenAnn] = useState(false);
  const [annForm, setAnnForm] = useState(EMPTY_ANN);
  const [saving, setSaving] = useState(false);

  const loadAnnouncements = () =>
    get(
      `${remoteRoutes.announcements}?instructorId=${user?.id || ''}`,
      (d: any) => setAnnouncements(Array.isArray(d) ? d : d?.data || []),
      undefined,
      undefined,
    );

  useEffect(() => {
    loadAnnouncements();
    get(
      remoteRoutes.courses,
      (data: any) => setCourses(Array.isArray(data) ? data : data?.data || []),
      undefined,
      undefined,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = () => {
    if (!annForm.title.trim() || !annForm.body.trim()) {
      Toast.error('Title and message are required');
      return;
    }
    setSaving(true);
    post(
      remoteRoutes.announcements,
      {
        title: annForm.title,
        body: annForm.body,
        type: annForm.type,
        pinned: annForm.pinned,
        expiresAt: annForm.expiresAt || undefined,
        courseId: annForm.courseId ? Number(annForm.courseId) : undefined,
        instructorId: user?.id,
      },
      () => {
        Toast.success('Announcement sent to your students');
        setOpenAnn(false);
        setAnnForm(EMPTY_ANN);
        loadAnnouncements();
        setSaving(false);
      },
      () => {
        Toast.error('Failed to send announcement');
        setSaving(false);
      },
      undefined,
    );
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this announcement?')) return;
    fetch(`${remoteRoutes.announcements}/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }).then(() => {
      Toast.success('Removed');
      loadAnnouncements();
    });
  };

  const handleToggle = (ann: any) => {
    fetch(`${remoteRoutes.announcements}/${ann.id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ isActive: !ann.isActive }),
    }).then(() => loadAnnouncements());
  };

  return (
    <Layout>
      <div className={classes.root}>
        <div className={classes.header}>
          <div>
            <div className={classes.pageTitle}>Announcements</div>
            <Typography
              style={{ fontSize: 13, color: '#8a8f99', marginTop: 2 }}
            >
              Post messages to students enrolled in your courses
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className={classes.addBtn}
            disableElevation
            onClick={() => setOpenAnn(true)}
          >
            New Announcement
          </Button>
        </div>

        {announcements.length === 0 ? (
          <div className={classes.emptyBox}>
            <CampaignIcon
              style={{
                fontSize: 48,
                color: '#d1d5db',
                display: 'block',
                margin: '0 auto 10px',
              }}
            />
            <Typography
              style={{ fontWeight: 600, color: '#6b7280', fontSize: 15 }}
            >
              No announcements yet
            </Typography>
            <Typography
              variant="body2"
              style={{ color: '#9ca3af', marginTop: 6 }}
            >
              Click "New Announcement" to send a message to your students.
            </Typography>
          </div>
        ) : (
          announcements.map((ann: any) => {
            const tc = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
            return (
              <div
                key={ann.id}
                className={classes.card}
                style={{ opacity: ann.isActive ? 1 : 0.55 }}
              >
                <div className={classes.cardIcon} style={{ background: tc.bg }}>
                  <CampaignIcon style={{ fontSize: 20, color: tc.color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <div className={classes.cardTitle}>{ann.title}</div>
                    <Chip
                      label={tc.label}
                      size="small"
                      style={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        background: tc.bg,
                        color: tc.color,
                        borderRadius: 5,
                      }}
                    />
                    {ann.pinned && (
                      <Chip
                        label="Pinned"
                        size="small"
                        style={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          background: '#fef3c7',
                          color: '#d97706',
                          borderRadius: 5,
                        }}
                      />
                    )}
                    {ann.courseName && (
                      <Chip
                        label={ann.courseName}
                        size="small"
                        style={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          background: 'rgba(254,58,106,0.08)',
                          color: CORAL,
                          borderRadius: 5,
                        }}
                      />
                    )}
                    {!ann.isActive && (
                      <Chip
                        label="Hidden"
                        size="small"
                        style={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          background: '#f3f4f6',
                          color: '#9ca3af',
                          borderRadius: 5,
                        }}
                      />
                    )}
                  </div>
                  <div className={classes.cardBody}>{ann.body}</div>
                  <div className={classes.cardMeta}>
                    <span>
                      Posted{' '}
                      {new Date(ann.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {ann.expiresAt && (
                      <span>
                        Expires{' '}
                        {new Date(ann.expiresAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className={classes.actions}>
                  <IconButton
                    size="small"
                    title={ann.pinned ? 'Pinned' : 'Pin'}
                    style={{ color: ann.pinned ? '#d97706' : '#c9c4bf' }}
                  >
                    {ann.pinned ? (
                      <BookmarkIcon fontSize="small" />
                    ) : (
                      <BookmarkBorderIcon fontSize="small" />
                    )}
                  </IconButton>
                  <Switch
                    checked={!!ann.isActive}
                    onChange={() => handleToggle(ann)}
                    size="small"
                    color="primary"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(ann.id)}
                    style={{ color: '#ef4444' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── New Announcement Dialog ── */}
      <Dialog
        open={openAnn}
        onClose={() => setOpenAnn(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 16, color: DARK }}>
            New Announcement
          </span>
          <IconButton size="small" onClick={() => setOpenAnn(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent style={{ paddingTop: 20 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title *"
                value={annForm.title}
                onChange={(e) =>
                  setAnnForm({ ...annForm, title: e.target.value })
                }
                variant="outlined"
                fullWidth
                size="small"
              />
            </Grid>

            {courses.length > 0 && (
              <Grid item xs={12}>
                <TextField
                  select
                  label="Target Course"
                  value={annForm.courseId}
                  onChange={(e) =>
                    setAnnForm({ ...annForm, courseId: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  helperText="Leave blank to target all students in your courses"
                >
                  <MenuItem value="">— All my students —</MenuItem>
                  {courses.map((c: any) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.title || c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Type"
                value={annForm.type}
                onChange={(e) =>
                  setAnnForm({ ...annForm, type: e.target.value })
                }
                variant="outlined"
                fullWidth
                size="small"
              >
                {Object.entries(TYPE_CONFIG).map(([val, cfg]) => (
                  <MenuItem key={val} value={val}>
                    {cfg.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Expires On (optional)"
                type="date"
                value={annForm.expiresAt}
                onChange={(e) =>
                  setAnnForm({ ...annForm, expiresAt: e.target.value })
                }
                variant="outlined"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Message *"
                value={annForm.body}
                onChange={(e) =>
                  setAnnForm({ ...annForm, body: e.target.value })
                }
                variant="outlined"
                fullWidth
                multiline
                minRows={4}
                size="small"
                helperText="Line breaks are preserved when students read this."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={annForm.pinned}
                    onChange={(e) =>
                      setAnnForm({ ...annForm, pinned: e.target.checked })
                    }
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    Pin to top of student dashboard
                  </span>
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: '12px 24px' }}>
          <Button
            onClick={() => setOpenAnn(false)}
            disabled={saving}
            style={{ textTransform: 'none', color: '#8a8f99' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disableElevation
            disabled={saving}
            style={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 8,
              background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
              color: '#fff',
              padding: '7px 20px',
            }}
          >
            {saving ? (
              <CircularProgress size={14} style={{ color: '#fff' }} />
            ) : (
              'Send to Students'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default TrainerAnnouncements;
