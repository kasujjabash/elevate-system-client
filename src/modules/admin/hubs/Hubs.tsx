import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import PeopleIcon from '@material-ui/icons/People';
import SchoolIcon from '@material-ui/icons/School';
import ComputerIcon from '@material-ui/icons/Computer';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PersonIcon from '@material-ui/icons/Person';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import EventSeatIcon from '@material-ui/icons/EventSeat';
import Layout from '../../../components/layout/Layout';
import { get, post, handleError } from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';
import { IState } from '../../../data/types';

const useStyles = makeStyles((_theme: Theme) =>
  createStyles({
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: 16,
    },
    card: {
      background: '#fff',
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'box-shadow 0.15s',
      '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.10)' },
    },
    cardTop: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
    },
    hubName: { fontSize: 16, fontWeight: 700, color: '#1f2025' },
    hubCode: {
      fontSize: 11,
      fontWeight: 700,
      color: '#8a8f99',
      background: '#f4f5f7',
      borderRadius: 6,
      padding: '2px 8px',
      display: 'inline-block',
      marginTop: 3,
      letterSpacing: '0.04em',
    },
    meta: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 13,
      color: '#6b7280',
    },
    manager: {
      background: '#f8f9ff',
      borderRadius: 8,
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    },
    managerLabel: {
      fontSize: 10,
      fontWeight: 700,
      color: '#8a8f99',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    },
    managerName: { fontSize: 13, fontWeight: 600, color: '#374151' },
    managerContact: { fontSize: 12, color: '#6b7280' },
    statsRow: {
      display: 'flex',
      gap: 12,
      paddingTop: 8,
      borderTop: '1px solid #f3f4f6',
    },
    statBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 13,
      color: '#374151',
      fontWeight: 600,
      background: '#f4f5f7',
      borderRadius: 8,
      padding: '5px 10px',
      cursor: 'pointer',
      border: 'none',
      transition: 'background 0.12s',
      '&:hover': { background: '#e9eaec' },
    },
    resourceRow: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap' as any,
    },
    resource: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 12,
      color: '#6b7280',
      background: '#f4f5f7',
      borderRadius: 6,
      padding: '3px 8px',
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 4,
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#9ca3af',
    },
    // Detail dialog
    detailSection: { marginBottom: 20 },
    detailLabel: {
      fontSize: 10,
      fontWeight: 700,
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: 8,
    },
    studentRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #f3f4f6',
      '&:last-child': { borderBottom: 'none' },
    },
    statCard: {
      background: '#f8f9ff',
      borderRadius: 10,
      padding: '12px 16px',
      textAlign: 'center',
    },
    statValue: { fontSize: 24, fontWeight: 800, color: '#1f2025' },
    statLabel: { fontSize: 11, color: '#8a8f99', fontWeight: 600 },
  }),
);

const EMPTY_FORM = {
  name: '',
  code: '',
  location: '',
  description: '',
  address: '',
  managerName: '',
  managerPhone: '',
  managerEmail: '',
  computers: '',
  projectors: '',
  capacity: '',
  notes: '',
};

const TOKEN_KEY = '__elevate__academy__token';

const patchHub = (id: number, body: any) =>
  fetch(`${remoteRoutes.hubs}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
    },
    body: JSON.stringify(body),
  });

const deleteHub = (id: number) =>
  fetch(`${remoteRoutes.hubs}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` },
  });

const Hubs = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const isSuperAdmin = user?.roles?.some((r: string) =>
    r.toLowerCase().includes('admin'),
  );

  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [detailHub, setDetailHub] = useState<any>(null);

  const loadHubs = () => {
    setLoading(true);
    get(
      remoteRoutes.hubs,
      (data) => setHubs(Array.isArray(data) ? data : []),
      undefined,
      () => setLoading(false),
    );
  };

  useEffect(() => {
    loadHubs();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setDialog(true);
  };

  const openEdit = (hub: any) => {
    setEditing(hub);
    setForm({
      name: hub.name || '',
      code: hub.code || '',
      location: hub.location || '',
      description: hub.description || '',
      address: hub.address || '',
      managerName: hub.managerName || '',
      managerPhone: hub.managerPhone || '',
      managerEmail: hub.managerEmail || '',
      computers: hub.computers != null ? String(hub.computers) : '',
      projectors: hub.projectors != null ? String(hub.projectors) : '',
      capacity: hub.capacity != null ? String(hub.capacity) : '',
      notes: hub.notes || '',
    });
    setDialog(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim() || !form.location.trim()) return;
    setSaving(true);

    const payload: any = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      location: form.location.trim(),
      description: form.description.trim() || undefined,
      address: form.address.trim() || undefined,
      managerName: form.managerName.trim() || undefined,
      managerPhone: form.managerPhone.trim() || undefined,
      managerEmail: form.managerEmail.trim() || undefined,
      computers: form.computers !== '' ? Number(form.computers) : undefined,
      projectors: form.projectors !== '' ? Number(form.projectors) : undefined,
      capacity: form.capacity !== '' ? Number(form.capacity) : undefined,
      notes: form.notes.trim() || undefined,
    };

    const onDone = () => {
      setSaving(false);
      setDialog(false);
      loadHubs();
    };
    const onErr = () => setSaving(false);

    if (editing) {
      patchHub(editing.id, payload).then(onDone).catch(onErr);
    } else {
      post(remoteRoutes.hubs, payload, () => onDone(), handleError, onErr);
    }
  };

  const handleToggleActive = (hub: any) => {
    const newValue = !hub.isActive;
    setHubs((prev) =>
      prev.map((h) => (h.id === hub.id ? { ...h, isActive: newValue } : h)),
    );
    patchHub(hub.id, { isActive: newValue }).catch(() =>
      setHubs((prev) =>
        prev.map((h) =>
          h.id === hub.id ? { ...h, isActive: hub.isActive } : h,
        ),
      ),
    );
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteHub(deleteConfirm.id).then(() => {
      setDeleteConfirm(null);
      loadHubs();
    });
  };

  const field = (key: keyof typeof EMPTY_FORM) => ({
    value: form[key],
    onChange: (e: any) => setForm({ ...form, [key]: e.target.value }),
  });

  // ─── Detail dialog helpers ───────────────────────────────────────
  const activeStudents = (hub: any) =>
    (hub.students || []).filter((s: any) => s.status === 'Active');

  return (
    <Layout>
      <Box>
        <div className={classes.header}>
          <div>
            <Typography
              variant="h6"
              style={{ fontWeight: 700, color: '#1f2025' }}
            >
              Hub Management
            </Typography>
            <Typography
              variant="body2"
              style={{ color: '#6b7280', marginTop: 2 }}
            >
              Manage physical training locations, resources and staff
            </Typography>
          </div>
          {isSuperAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={openNew}
              style={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Add Hub
            </Button>
          )}
        </div>

        {loading ? (
          <Box display="flex" justifyContent="center" pt={6}>
            <CircularProgress />
          </Box>
        ) : hubs.length === 0 ? (
          <div className={classes.emptyState}>
            <LocationOnIcon
              style={{ fontSize: 48, marginBottom: 8, opacity: 0.3 }}
            />
            <Typography>No hubs yet. Add your first hub.</Typography>
          </div>
        ) : (
          <div className={classes.grid}>
            {hubs.map((hub) => {
              const activeCount = activeStudents(hub).length;
              return (
                <div
                  key={hub.id}
                  className={classes.card}
                  style={{ opacity: hub.isActive ? 1 : 0.55 }}
                >
                  {/* Top row */}
                  <div className={classes.cardTop}>
                    <div>
                      <div className={classes.hubName}>{hub.name}</div>
                      <span className={classes.hubCode}>{hub.code}</span>
                    </div>
                    <Chip
                      label={hub.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      style={{
                        background: hub.isActive ? '#dcfce7' : '#f3f4f6',
                        color: hub.isActive ? '#166534' : '#6b7280',
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    />
                  </div>

                  {/* Location */}
                  <div className={classes.meta}>
                    <LocationOnIcon style={{ fontSize: 14 }} />
                    <span>
                      {hub.location}
                      {hub.address ? ` · ${hub.address}` : ''}
                    </span>
                  </div>

                  {/* Manager */}
                  {hub.managerName ? (
                    <div className={classes.manager}>
                      <span className={classes.managerLabel}>Hub Manager</span>
                      <span className={classes.managerName}>
                        {hub.managerName}
                      </span>
                      {(hub.managerPhone || hub.managerEmail) && (
                        <span className={classes.managerContact}>
                          {hub.managerPhone}
                          {hub.managerPhone && hub.managerEmail ? ' · ' : ''}
                          {hub.managerEmail}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div
                      className={classes.manager}
                      style={{ background: '#fff8f8' }}
                    >
                      <span className={classes.managerLabel}>Hub Manager</span>
                      <span style={{ fontSize: 12, color: '#ef4444' }}>
                        Not assigned
                      </span>
                    </div>
                  )}

                  {/* Resources */}
                  {(hub.computers > 0 ||
                    hub.projectors > 0 ||
                    hub.capacity > 0) && (
                    <div className={classes.resourceRow}>
                      {hub.computers > 0 && (
                        <span className={classes.resource}>
                          <ComputerIcon style={{ fontSize: 13 }} />
                          {hub.computers} Computers
                        </span>
                      )}
                      {hub.projectors > 0 && (
                        <span className={classes.resource}>
                          <SchoolIcon style={{ fontSize: 13 }} />
                          {hub.projectors} Projectors
                        </span>
                      )}
                      {hub.capacity > 0 && (
                        <span className={classes.resource}>
                          <EventSeatIcon style={{ fontSize: 13 }} />
                          {hub.capacity} Seats
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats — clickable */}
                  <div className={classes.statsRow}>
                    <button
                      className={classes.statBtn}
                      onClick={() => setDetailHub(hub)}
                    >
                      <PeopleIcon style={{ fontSize: 15, color: '#6366f1' }} />
                      {activeCount} Active Students
                    </button>
                    <button
                      className={classes.statBtn}
                      onClick={() => setDetailHub(hub)}
                    >
                      <SchoolIcon style={{ fontSize: 15, color: '#0ea5e9' }} />
                      {hub.courses?.length ?? 0} Courses
                    </button>
                  </div>

                  {/* Actions */}
                  <div className={classes.actions}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Typography
                        variant="caption"
                        style={{ color: '#6b7280', fontSize: 11 }}
                      >
                        {hub.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                      {isSuperAdmin && (
                        <Switch
                          size="small"
                          checked={!!hub.isActive}
                          onChange={() => handleToggleActive(hub)}
                          color="primary"
                        />
                      )}
                    </div>
                    {isSuperAdmin && (
                      <div>
                        <Tooltip title="Edit hub">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(hub)}
                          >
                            <EditIcon style={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete hub">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteConfirm(hub)}
                          >
                            <DeleteIcon
                              style={{ fontSize: 18, color: '#ef4444' }}
                            />
                          </IconButton>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Create / Edit dialog ─────────────────────────────── */}
        <Dialog
          open={dialog}
          onClose={() => setDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle style={{ fontWeight: 700 }}>
            {editing ? 'Edit Hub' : 'Add New Hub'}
          </DialogTitle>
          <DialogContent dividers>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Typography
                variant="caption"
                style={{
                  fontWeight: 700,
                  color: '#8a8f99',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Hub Info
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
                    label="Hub Name *"
                    {...field('name')}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="e.g. Katanga Hub"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Code *"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase() })
                    }
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="KTG"
                    helperText="Unique short code"
                  />
                </Grid>
              </Grid>
              <TextField
                label="Location *"
                {...field('location')}
                variant="outlined"
                size="small"
                fullWidth
                placeholder="e.g. Katanga, Kampala"
              />
              <TextField
                label="Address"
                {...field('address')}
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Full street address"
              />
              <TextField
                label="Description"
                {...field('description')}
                variant="outlined"
                size="small"
                fullWidth
                multiline
                minRows={2}
              />

              <Divider style={{ margin: '4px 0' }} />
              <Typography
                variant="caption"
                style={{
                  fontWeight: 700,
                  color: '#8a8f99',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Hub Manager
              </Typography>
              <TextField
                label="Manager Name"
                {...field('managerName')}
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Full name"
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Manager Phone"
                    {...field('managerPhone')}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="+256 700 000 000"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Manager Email"
                    {...field('managerEmail')}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="manager@example.com"
                  />
                </Grid>
              </Grid>

              <Divider style={{ margin: '4px 0' }} />
              <Typography
                variant="caption"
                style={{
                  fontWeight: 700,
                  color: '#8a8f99',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Resources & Capacity
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    label="Computers"
                    {...field('computers')}
                    type="number"
                    variant="outlined"
                    size="small"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Projectors"
                    {...field('projectors')}
                    type="number"
                    variant="outlined"
                    size="small"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Seat Capacity"
                    {...field('capacity')}
                    type="number"
                    variant="outlined"
                    size="small"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Notes"
                {...field('notes')}
                variant="outlined"
                size="small"
                fullWidth
                multiline
                minRows={2}
                placeholder="Any additional notes about this hub"
              />
            </Box>
          </DialogContent>
          <DialogActions style={{ padding: '12px 24px' }}>
            <Button
              onClick={() => setDialog(false)}
              style={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={
                saving ||
                !form.name.trim() ||
                !form.code.trim() ||
                !form.location.trim()
              }
              style={{ textTransform: 'none', fontWeight: 600 }}
            >
              {saving ? (
                <CircularProgress size={18} />
              ) : editing ? (
                'Save Changes'
              ) : (
                'Create Hub'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Delete confirmation ──────────────────────────────── */}
        <Dialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle style={{ fontWeight: 700 }}>Delete Hub</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete{' '}
              <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions style={{ padding: '12px 24px' }}>
            <Button
              onClick={() => setDeleteConfirm(null)}
              style={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleDelete}
              style={{
                background: '#ef4444',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Hub Detail dialog ────────────────────────────────── */}
        <Dialog
          open={!!detailHub}
          onClose={() => setDetailHub(null)}
          fullWidth
          maxWidth="md"
        >
          {detailHub && (
            <>
              <DialogTitle
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700 }}>{detailHub.name}</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#8a8f99',
                      marginLeft: 10,
                      background: '#f4f5f7',
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {detailHub.code}
                  </span>
                </div>
                <IconButton size="small" onClick={() => setDetailHub(null)}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                {/* Summary stats */}
                <Grid container spacing={2} style={{ marginBottom: 20 }}>
                  {[
                    {
                      label: 'Active Students',
                      value: activeStudents(detailHub).length,
                      color: '#6366f1',
                    },
                    {
                      label: 'Total Students',
                      value: detailHub.students?.length ?? 0,
                      color: '#0ea5e9',
                    },
                    {
                      label: 'Courses',
                      value: detailHub.courses?.length ?? 0,
                      color: '#10b981',
                    },
                    {
                      label: 'Instructors',
                      value: detailHub.instructors?.length ?? 0,
                      color: '#f59e0b',
                    },
                  ].map((s) => (
                    <Grid item xs={6} sm={3} key={s.label}>
                      <div className={classes.statCard}>
                        <div
                          className={classes.statValue}
                          style={{ color: s.color }}
                        >
                          {s.value}
                        </div>
                        <div className={classes.statLabel}>{s.label}</div>
                      </div>
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={3}>
                  {/* Left column */}
                  <Grid item xs={12} sm={6}>
                    {/* Location */}
                    <div className={classes.detailSection}>
                      <div className={classes.detailLabel}>Location</div>
                      <div className={classes.meta} style={{ marginBottom: 4 }}>
                        <LocationOnIcon style={{ fontSize: 15 }} />
                        {detailHub.location}
                      </div>
                      {detailHub.address && (
                        <Typography
                          variant="body2"
                          style={{ color: '#6b7280', marginLeft: 20 }}
                        >
                          {detailHub.address}
                        </Typography>
                      )}
                    </div>

                    {/* Manager */}
                    <div className={classes.detailSection}>
                      <div className={classes.detailLabel}>Hub Manager</div>
                      {detailHub.managerName ? (
                        <Box
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                          }}
                        >
                          <div className={classes.meta}>
                            <PersonIcon style={{ fontSize: 15 }} />
                            {detailHub.managerName}
                          </div>
                          {detailHub.managerPhone && (
                            <div className={classes.meta}>
                              <PhoneIcon style={{ fontSize: 15 }} />
                              {detailHub.managerPhone}
                            </div>
                          )}
                          {detailHub.managerEmail && (
                            <div className={classes.meta}>
                              <EmailIcon style={{ fontSize: 15 }} />
                              {detailHub.managerEmail}
                            </div>
                          )}
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          style={{ color: '#ef4444' }}
                        >
                          Not assigned
                        </Typography>
                      )}
                    </div>

                    {/* Resources */}
                    <div className={classes.detailSection}>
                      <div className={classes.detailLabel}>Resources</div>
                      <Box
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div className={classes.meta}>
                          <ComputerIcon style={{ fontSize: 15 }} />
                          {detailHub.computers ?? 0} Computers
                        </div>
                        <div className={classes.meta}>
                          <SchoolIcon style={{ fontSize: 15 }} />
                          {detailHub.projectors ?? 0} Projectors
                        </div>
                        <div className={classes.meta}>
                          <EventSeatIcon style={{ fontSize: 15 }} />
                          {detailHub.capacity ?? '—'} Seat capacity
                        </div>
                      </Box>
                    </div>

                    {/* Notes */}
                    {detailHub.notes && (
                      <div className={classes.detailSection}>
                        <div className={classes.detailLabel}>Notes</div>
                        <Typography
                          variant="body2"
                          style={{ color: '#374151', whiteSpace: 'pre-line' }}
                        >
                          {detailHub.notes}
                        </Typography>
                      </div>
                    )}
                  </Grid>

                  {/* Right column */}
                  <Grid item xs={12} sm={6}>
                    {/* Active students list */}
                    <div className={classes.detailSection}>
                      <div className={classes.detailLabel}>
                        Active Students ({activeStudents(detailHub).length})
                      </div>
                      {activeStudents(detailHub).length === 0 ? (
                        <Typography
                          variant="body2"
                          style={{ color: '#9ca3af' }}
                        >
                          No active students
                        </Typography>
                      ) : (
                        <Box style={{ maxHeight: 220, overflowY: 'auto' }}>
                          {activeStudents(detailHub).map((s: any) => {
                            const name = s.contact?.person
                              ? `${s.contact.person.firstName} ${s.contact.person.lastName}`
                              : s.studentId;
                            return (
                              <div key={s.id} className={classes.studentRow}>
                                <Typography
                                  variant="body2"
                                  style={{ fontWeight: 500 }}
                                >
                                  {name}
                                </Typography>
                                <Chip
                                  label={s.studentId}
                                  size="small"
                                  style={{ fontSize: 10 }}
                                />
                              </div>
                            );
                          })}
                        </Box>
                      )}
                    </div>

                    {/* Courses */}
                    <div className={classes.detailSection}>
                      <div className={classes.detailLabel}>
                        Courses ({detailHub.courses?.length ?? 0})
                      </div>
                      {!detailHub.courses || detailHub.courses.length === 0 ? (
                        <Typography
                          variant="body2"
                          style={{ color: '#9ca3af' }}
                        >
                          No courses assigned
                        </Typography>
                      ) : (
                        <Box style={{ maxHeight: 160, overflowY: 'auto' }}>
                          {detailHub.courses.map((c: any) => (
                            <div key={c.id} className={classes.studentRow}>
                              <Typography
                                variant="body2"
                                style={{ fontWeight: 500 }}
                              >
                                {c.name}
                              </Typography>
                              <Chip
                                label={c.isActive ? 'Active' : 'Inactive'}
                                size="small"
                                style={{
                                  fontSize: 10,
                                  background: c.isActive
                                    ? '#dcfce7'
                                    : '#f3f4f6',
                                  color: c.isActive ? '#166534' : '#6b7280',
                                }}
                              />
                            </div>
                          ))}
                        </Box>
                      )}
                    </div>
                  </Grid>
                </Grid>
              </DialogContent>
              {isSuperAdmin && (
                <DialogActions style={{ padding: '12px 24px' }}>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setDetailHub(null);
                      openEdit(detailHub);
                    }}
                    style={{ textTransform: 'none' }}
                  >
                    Edit Hub
                  </Button>
                </DialogActions>
              )}
            </>
          )}
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Hubs;
