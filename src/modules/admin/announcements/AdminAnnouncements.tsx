import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Chip,
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
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import PushPinIcon from '@material-ui/icons/BookmarkBorder';
import PinnedIcon from '@material-ui/icons/Bookmark';
import CampaignIcon from '@material-ui/icons/NotificationsActive';
import EventIcon from '@material-ui/icons/Event';
import CloseIcon from '@material-ui/icons/Close';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Layout from '../../../components/layout/Layout';
import { get, post } from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';
import Toast from '../../../utils/Toast';

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

const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  general: { label: 'General', color: '#6366f1' },
  class: { label: 'Class', color: '#0ea5e9' },
  holiday: { label: 'Holiday', color: '#10b981' },
  milestone: { label: 'Milestone', color: '#f59e0b' },
  deadline: { label: 'Deadline', color: CORAL },
};

const EMPTY_ANN = {
  title: '',
  body: '',
  type: 'info',
  pinned: false,
  expiresAt: '',
};
const EMPTY_EVT = {
  title: '',
  description: '',
  eventDate: '',
  endDate: '',
  location: '',
  type: 'general',
};

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
    textTransform: 'none',
    boxShadow: 'none',
  },
  tabs: { marginBottom: theme.spacing(3), borderBottom: '1px solid #ede8e3' },

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

  eventCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #ede8e3',
    padding: '14px 18px',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    transition: 'box-shadow 0.15s',
    '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.07)' },
  },
  dateBadge: {
    background: `linear-gradient(135deg, ${CORAL}, ${ORANGE})`,
    borderRadius: 10,
    padding: '6px 10px',
    textAlign: 'center' as any,
    flexShrink: 0,
    minWidth: 46,
  },
  dateDay: { fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 },
  dateMon: {
    fontSize: 10,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase' as any,
  },
  emptyBox: {
    textAlign: 'center' as any,
    padding: '50px 20px',
    color: '#9ca3af',
  },
}));

const TOKEN_KEY = '__elevate__academy__token';
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
});

const AdminAnnouncements = () => {
  const classes = useStyles();
  const [tab, setTab] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [openAnn, setOpenAnn] = useState(false);
  const [openEvt, setOpenEvt] = useState(false);
  const [annForm, setAnnForm] = useState(EMPTY_ANN);
  const [evtForm, setEvtForm] = useState(EMPTY_EVT);
  const [saving, setSaving] = useState(false);

  const loadAnnouncements = () =>
    get(
      `${remoteRoutes.announcements}?all=true`,
      (d) => setAnnouncements(Array.isArray(d) ? d : []),
      undefined,
      undefined,
    );

  const loadEvents = () =>
    get(
      `${remoteRoutes.calendarEvents}?all=true`,
      (d) => setEvents(Array.isArray(d) ? d : []),
      undefined,
      undefined,
    );

  useEffect(() => {
    loadAnnouncements();
    loadEvents();
  }, []);

  const handleCreateAnn = () => {
    if (!annForm.title || !annForm.body) {
      Toast.error('Title and message are required');
      return;
    }
    setSaving(true);
    post(
      remoteRoutes.announcements,
      { ...annForm, expiresAt: annForm.expiresAt || undefined },
      () => {
        Toast.success('Announcement sent to all students');
        setOpenAnn(false);
        setAnnForm(EMPTY_ANN);
        loadAnnouncements();
      },
      undefined,
      () => setSaving(false),
    );
  };

  const handleDeleteAnn = (id: number) => {
    if (!window.confirm('Delete this announcement?')) return;
    fetch(`${remoteRoutes.announcements}/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }).then(() => {
      Toast.success('Removed');
      loadAnnouncements();
    });
  };

  const handleToggleAnn = (ann: any) => {
    fetch(`${remoteRoutes.announcements}/${ann.id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ isActive: !ann.isActive }),
    }).then(() => loadAnnouncements());
  };

  const handleCreateEvt = () => {
    if (!evtForm.title || !evtForm.eventDate) {
      Toast.error('Title and date are required');
      return;
    }
    setSaving(true);
    post(
      remoteRoutes.calendarEvents,
      evtForm,
      () => {
        Toast.success('Event added');
        setOpenEvt(false);
        setEvtForm(EMPTY_EVT);
        loadEvents();
      },
      undefined,
      () => setSaving(false),
    );
  };

  const handleDeleteEvt = (id: number) => {
    if (!window.confirm('Remove this event?')) return;
    fetch(`${remoteRoutes.calendarEvents}/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }).then(() => {
      Toast.success('Removed');
      loadEvents();
    });
  };

  return (
    <Layout>
      <div className={classes.root}>
        <div className={classes.header}>
          <div>
            <div className={classes.pageTitle}>Announcements &amp; Events</div>
            <Typography
              style={{ fontSize: 13, color: '#8a8f99', marginTop: 2 }}
            >
              Post messages and calendar events visible to all students
            </Typography>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              variant="contained"
              startIcon={<EventIcon />}
              className={classes.addBtn}
              style={{ background: '#6366f1' }}
              onClick={() => setOpenEvt(true)}
            >
              Add Event
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              className={classes.addBtn}
              onClick={() => setOpenAnn(true)}
            >
              New Announcement
            </Button>
          </div>
        </div>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={`Announcements (${announcements.length})`}
            style={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label={`Calendar Events (${events.length})`}
            style={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>

        {/* ── Announcements tab ── */}
        {tab === 0 &&
          (announcements.length === 0 ? (
            <div className={classes.emptyBox}>
              <CampaignIcon
                style={{
                  fontSize: 48,
                  color: '#d1d5db',
                  display: 'block',
                  margin: '0 auto 8px',
                }}
              />
              <Typography>
                No announcements yet. Click "New Announcement" to post one.
              </Typography>
            </div>
          ) : (
            announcements.map((ann) => {
              const tc = TYPE_CONFIG[ann.type] || TYPE_CONFIG.info;
              return (
                <div
                  key={ann.id}
                  className={classes.card}
                  style={{ opacity: ann.isActive ? 1 : 0.5 }}
                >
                  <div
                    className={classes.cardIcon}
                    style={{ background: tc.bg }}
                  >
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
                        <PinnedIcon fontSize="small" />
                      ) : (
                        <PushPinIcon fontSize="small" />
                      )}
                    </IconButton>
                    <Switch
                      checked={ann.isActive}
                      onChange={() => handleToggleAnn(ann)}
                      size="small"
                      color="primary"
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAnn(ann.id)}
                      style={{ color: '#ef4444' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              );
            })
          ))}

        {/* ── Calendar Events tab ── */}
        {tab === 1 &&
          (events.length === 0 ? (
            <div className={classes.emptyBox}>
              <EventIcon
                style={{
                  fontSize: 48,
                  color: '#d1d5db',
                  display: 'block',
                  margin: '0 auto 8px',
                }}
              />
              <Typography>
                No events yet. Click "Add Event" to create one.
              </Typography>
            </div>
          ) : (
            events.map((evt) => {
              const d = new Date(evt.eventDate);
              const ec =
                EVENT_TYPE_CONFIG[evt.type] || EVENT_TYPE_CONFIG.general;
              return (
                <div key={evt.id} className={classes.eventCard}>
                  <div className={classes.dateBadge}>
                    <div className={classes.dateDay}>{d.getDate()}</div>
                    <div className={classes.dateMon}>
                      {d.toLocaleDateString('en-GB', { month: 'short' })}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <div className={classes.cardTitle}>{evt.title}</div>
                      <Chip
                        label={ec.label}
                        size="small"
                        style={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          background: `${ec.color}15`,
                          color: ec.color,
                          borderRadius: 5,
                        }}
                      />
                    </div>
                    {evt.description && (
                      <div className={classes.cardBody}>{evt.description}</div>
                    )}
                    <div className={classes.cardMeta}>
                      <span>
                        {d.toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      {evt.location && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <LocationOnIcon style={{ fontSize: 12 }} />
                          {evt.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteEvt(evt.id)}
                    style={{ color: '#ef4444' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              );
            })
          ))}
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
          <span style={{ fontWeight: 700 }}>New Announcement</span>
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
                helperText="Line breaks are preserved for students."
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
                    Pin to top of dashboard
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
            onClick={handleCreateAnn}
            variant="contained"
            color="primary"
            disableElevation
            disabled={saving}
            style={{ textTransform: 'none', fontWeight: 700, borderRadius: 8 }}
          >
            {saving ? 'Sending…' : 'Send to All Students'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── New Calendar Event Dialog ── */}
      <Dialog
        open={openEvt}
        onClose={() => setOpenEvt(false)}
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
          <span style={{ fontWeight: 700 }}>Add Calendar Event</span>
          <IconButton size="small" onClick={() => setOpenEvt(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent style={{ paddingTop: 20 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Event Title *"
                value={evtForm.title}
                onChange={(e) =>
                  setEvtForm({ ...evtForm, title: e.target.value })
                }
                variant="outlined"
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date *"
                type="date"
                value={evtForm.eventDate}
                onChange={(e) =>
                  setEvtForm({ ...evtForm, eventDate: e.target.value })
                }
                variant="outlined"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date (optional)"
                type="date"
                value={evtForm.endDate}
                onChange={(e) =>
                  setEvtForm({ ...evtForm, endDate: e.target.value })
                }
                variant="outlined"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Location (optional)"
                value={evtForm.location}
                onChange={(e) =>
                  setEvtForm({ ...evtForm, location: e.target.value })
                }
                variant="outlined"
                fullWidth
                size="small"
                placeholder="e.g. Katanga Hub — Room 2"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Type"
                value={evtForm.type}
                onChange={(e) =>
                  setEvtForm({ ...evtForm, type: e.target.value })
                }
                variant="outlined"
                fullWidth
                size="small"
              >
                {Object.entries(EVENT_TYPE_CONFIG).map(([val, cfg]) => (
                  <MenuItem key={val} value={val}>
                    {cfg.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description (optional)"
                value={evtForm.description}
                onChange={(e) =>
                  setEvtForm({ ...evtForm, description: e.target.value })
                }
                variant="outlined"
                fullWidth
                multiline
                minRows={3}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: '12px 24px' }}>
          <Button
            onClick={() => setOpenEvt(false)}
            disabled={saving}
            style={{ textTransform: 'none', color: '#8a8f99' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateEvt}
            variant="contained"
            disableElevation
            disabled={saving}
            style={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 8,
              background: '#6366f1',
              color: '#fff',
            }}
          >
            {saving ? 'Saving…' : 'Add Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminAnnouncements;
