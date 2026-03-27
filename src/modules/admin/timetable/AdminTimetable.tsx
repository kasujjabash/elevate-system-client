import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Layout from '../../../components/layout/Layout';
import XBreadCrumbs from '../../../components/XBreadCrumbs';
import { localRoutes, remoteRoutes, apiBaseUrl } from '../../../data/constants';
import Toast from '../../../utils/Toast';

const TOKEN_KEY = '__elevate__academy__token';
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
  'Content-Type': 'application/json',
});

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

const DAY_LABEL: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon → Sun display order

const CORAL = '#fe3a6a';

const fmt12 = (t: string) => {
  if (!t) return '';
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${suffix}`;
};

const useStyles = makeStyles(() =>
  createStyles({
    root: { flexGrow: 1 },
    weekGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 12,
      marginBottom: 32,
    },
    dayCol: {
      background: '#fff',
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.07)',
      overflow: 'hidden',
    },
    dayHeader: {
      background: '#f8f9fa',
      padding: '8px 12px',
      borderBottom: '1px solid rgba(0,0,0,0.07)',
      fontWeight: 700,
      fontSize: 12,
      color: '#8a8f99',
      textTransform: 'uppercase' as any,
      letterSpacing: '0.04em',
    },
    dayHeaderToday: {
      background: `linear-gradient(90deg, ${CORAL} 0%, #fe8c45 100%)`,
      color: '#fff',
    },
    sessionBlock: {
      margin: '8px',
      borderRadius: 8,
      padding: '8px 10px',
      background: 'rgba(254,58,106,0.07)',
      borderLeft: `3px solid ${CORAL}`,
      cursor: 'pointer',
      '&:hover': { background: 'rgba(254,58,106,0.13)' },
    },
    sessionTime: {
      fontSize: 10,
      color: CORAL,
      fontWeight: 700,
      marginBottom: 2,
    },
    sessionCourse: {
      fontSize: 11,
      fontWeight: 700,
      color: '#1f2025',
      lineHeight: 1.3,
    },
    sessionRoom: { fontSize: 10, color: '#8a8f99', marginTop: 2 },
    emptyDay: {
      padding: '12px 10px',
      fontSize: 11,
      color: '#c4c8d0',
      textAlign: 'center' as any,
    },
    tableHeadCell: {
      fontWeight: 700,
      fontSize: 12,
      color: '#8a8f99',
      textTransform: 'uppercase' as any,
      letterSpacing: '0.04em',
      padding: '10px 16px',
      background: '#f8f9fa',
      borderBottom: '1px solid #f0f0f0',
    },
    tableCell: {
      fontSize: 13,
      color: '#1f2025',
      padding: '12px 16px',
      borderBottom: '1px solid #f8f8f8',
    },
  }),
);

interface TimetableSession {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  courseName?: string;
  courseId?: number;
  hubId?: number;
  hubName?: string;
  instructorName?: string;
  instructorId?: number;
  moduleCode?: string;
}

const emptyForm = {
  courseId: '',
  hubId: '',
  instructorName: '',
  dayOfWeek: '1',
  startTime: '09:00',
  endTime: '11:00',
  room: '',
};

const AdminTimetable: React.FC = () => {
  const classes = useStyles();
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);

  // Filters
  const [filterCourse, setFilterCourse] = useState('');
  const [filterHub, setFilterHub] = useState('');

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const todayDow = new Date().getDay();

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${remoteRoutes.timetable}`, {
        headers: authHeader(),
      });
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : data?.sessions ?? []);
    } catch {
      Toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(remoteRoutes.courses, { headers: authHeader() });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
  };

  const fetchHubs = async () => {
    try {
      const res = await fetch(remoteRoutes.hubs, { headers: authHeader() });
      const data = await res.json();
      setHubs(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
  };

  useEffect(() => {
    fetchSessions();
    fetchCourses();
    fetchHubs();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: TimetableSession) => {
    setEditingId(s.id);
    setForm({
      courseId: String(s.courseId || ''),
      hubId: String(s.hubId || ''),
      instructorName: s.instructorName || '',
      dayOfWeek: String(s.dayOfWeek),
      startTime: s.startTime || '09:00',
      endTime: s.endTime || '11:00',
      room: s.room || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.courseId || !form.dayOfWeek || !form.startTime || !form.endTime) {
      Toast.error('Please fill in course, day, start time and end time');
      return;
    }
    setSubmitting(true);
    try {
      const body: any = {
        courseId: parseInt(form.courseId),
        dayOfWeek: parseInt(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
      };
      if (form.hubId) body.hubId = parseInt(form.hubId);
      if (form.instructorName) body.instructorName = form.instructorName;
      if (form.room) body.room = form.room;

      const url = editingId
        ? `${apiBaseUrl}/api/timetable/${editingId}`
        : `${apiBaseUrl}/api/timetable`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();

      Toast.success(editingId ? 'Session updated' : 'Session added');
      setDialogOpen(false);
      fetchSessions();
    } catch {
      Toast.error('Failed to save session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`${apiBaseUrl}/api/timetable/${deleteId}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      Toast.success('Session removed');
      setDeleteOpen(false);
      setDeleteId(null);
      fetchSessions();
    } catch {
      Toast.error('Failed to delete session');
    }
  };

  const filtered = sessions.filter((s) => {
    const matchCourse = !filterCourse || String(s.courseId) === filterCourse;
    const matchHub = !filterHub || String(s.hubId) === filterHub;
    return matchCourse && matchHub;
  });

  // Group by day for the weekly grid
  const byDay: Record<number, TimetableSession[]> = {};
  DAY_ORDER.forEach((d) => {
    byDay[d] = [];
  });
  filtered.forEach((s) => {
    if (byDay[s.dayOfWeek]) byDay[s.dayOfWeek].push(s);
    else byDay[s.dayOfWeek] = [s];
  });

  return (
    <Layout title="Timetable">
      <Box className={classes.root}>
        {/* Header */}
        <Box
          pb={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <XBreadCrumbs
            title="Timetable"
            paths={[{ path: localRoutes.home, label: 'Dashboard' }]}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openCreate}
            style={{ borderRadius: 8 }}
          >
            Add Session
          </Button>
        </Box>

        {/* Filters */}
        <Paper
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 20,
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Filter by Course"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
              >
                <MenuItem value="">All Courses</MenuItem>
                {courses.map((c: any) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.title || c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Filter by Hub"
                value={filterHub}
                onChange={(e) => setFilterHub(e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
              >
                <MenuItem value="">All Hubs</MenuItem>
                {hubs.map((h: any) => (
                  <MenuItem key={h.id} value={String(h.id)}>
                    {h.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              {(filterCourse || filterHub) && (
                <Button
                  size="small"
                  onClick={() => {
                    setFilterCourse('');
                    setFilterHub('');
                  }}
                  style={{ color: '#6b7280' }}
                >
                  Clear Filters
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Weekly Grid */}
        <Typography
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: '#374151',
            marginBottom: 14,
          }}
        >
          Weekly Overview
        </Typography>
        {loading ? (
          <Typography style={{ color: '#9ca3af', fontSize: 13 }}>
            Loading timetable…
          </Typography>
        ) : (
          <div className={classes.weekGrid}>
            {DAY_ORDER.map((dow) => {
              const isToday = dow === todayDow;
              const daySessions = (byDay[dow] || []).sort((a, b) =>
                a.startTime.localeCompare(b.startTime),
              );
              return (
                <div key={dow} className={classes.dayCol}>
                  <div
                    className={`${classes.dayHeader} ${
                      isToday ? classes.dayHeaderToday : ''
                    }`}
                  >
                    {DAY_LABEL[dow]}
                  </div>
                  {daySessions.length === 0 ? (
                    <div className={classes.emptyDay}>No class</div>
                  ) : (
                    daySessions.map((s) => (
                      <div
                        key={s.id}
                        className={classes.sessionBlock}
                        onClick={() => openEdit(s)}
                      >
                        <div className={classes.sessionTime}>
                          {fmt12(s.startTime)} – {fmt12(s.endTime)}
                        </div>
                        <div className={classes.sessionCourse}>
                          {s.courseName || `Course #${s.courseId}`}
                        </div>
                        {s.room && (
                          <div className={classes.sessionRoom}>{s.room}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Sessions Table */}
        <Typography
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: '#374151',
            marginBottom: 14,
          }}
        >
          All Sessions ({filtered.length})
        </Typography>
        <Paper
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHeadCell}>Day</TableCell>
                <TableCell className={classes.tableHeadCell}>Time</TableCell>
                <TableCell className={classes.tableHeadCell}>Course</TableCell>
                <TableCell className={classes.tableHeadCell}>Hub</TableCell>
                <TableCell className={classes.tableHeadCell}>
                  Instructor
                </TableCell>
                <TableCell className={classes.tableHeadCell}>Room</TableCell>
                <TableCell className={classes.tableHeadCell} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      padding: 32,
                      color: '#9ca3af',
                      fontSize: 13,
                    }}
                  >
                    No timetable sessions yet. Click "Add Session" to get
                    started.
                  </TableCell>
                </TableRow>
              ) : (
                [...filtered]
                  .sort((a, b) => {
                    const dA = DAY_ORDER.indexOf(a.dayOfWeek);
                    const dB = DAY_ORDER.indexOf(b.dayOfWeek);
                    return dA !== dB
                      ? dA - dB
                      : a.startTime.localeCompare(b.startTime);
                  })
                  .map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell className={classes.tableCell}>
                        <Chip
                          label={DAY_LABEL[s.dayOfWeek]}
                          size="small"
                          style={{
                            background:
                              s.dayOfWeek === todayDow
                                ? 'rgba(254,58,106,0.1)'
                                : '#f3f4f6',
                            color: s.dayOfWeek === todayDow ? CORAL : '#374151',
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        className={classes.tableCell}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {fmt12(s.startTime)} – {fmt12(s.endTime)}
                      </TableCell>
                      <TableCell
                        className={classes.tableCell}
                        style={{ fontWeight: 600 }}
                      >
                        {s.courseName || `Course #${s.courseId}`}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {s.hubName || (s.hubId ? `Hub #${s.hubId}` : '—')}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {s.instructorName || '—'}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {s.room || '—'}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <Box display="flex" style={{ gap: 4 }}>
                          <Tooltip title="Edit session">
                            <IconButton
                              size="small"
                              onClick={() => openEdit(s)}
                            >
                              <EditIcon
                                style={{ fontSize: 16, color: '#3b82f6' }}
                              />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove session">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDeleteId(s.id);
                                setDeleteOpen(true);
                              }}
                            >
                              <DeleteIcon
                                style={{ fontSize: 16, color: '#ef4444' }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* ── Add / Edit Dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle style={{ fontWeight: 700 }}>
          {editingId ? 'Edit Timetable Session' : 'Add Timetable Session'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" style={{ gap: 16 }} mt={1}>
            <TextField
              select
              label="Course *"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              variant="outlined"
              size="small"
              fullWidth
            >
              <MenuItem value="">Select a course</MenuItem>
              {courses.map((c: any) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.title || c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Hub"
              value={form.hubId}
              onChange={(e) => setForm({ ...form, hubId: e.target.value })}
              variant="outlined"
              size="small"
              fullWidth
            >
              <MenuItem value="">Select a hub (optional)</MenuItem>
              {hubs.map((h: any) => (
                <MenuItem key={h.id} value={String(h.id)}>
                  {h.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Day of Week *"
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
              variant="outlined"
              size="small"
              fullWidth
            >
              {DAYS.map((d) => (
                <MenuItem key={d.value} value={String(d.value)}>
                  {d.label}
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Start Time *"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="09:00"
                  helperText="24h format, e.g. 09:00"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End Time *"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="11:00"
                  helperText="24h format, e.g. 11:00"
                />
              </Grid>
            </Grid>

            <TextField
              label="Instructor Name"
              value={form.instructorName}
              onChange={(e) =>
                setForm({ ...form, instructorName: e.target.value })
              }
              variant="outlined"
              size="small"
              fullWidth
              placeholder="e.g. Andrew Mukuye"
            />

            <TextField
              label="Room / Location"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              variant="outlined"
              size="small"
              fullWidth
              placeholder="e.g. Hub 102"
            />
          </Box>
        </DialogContent>
        <DialogActions style={{ padding: '12px 24px' }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={submitting}
            style={{ borderRadius: 8 }}
          >
            {submitting
              ? 'Saving…'
              : editingId
              ? 'Save Changes'
              : 'Add Session'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ─────────────────────────────────────────────────── */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle style={{ fontWeight: 700 }}>Remove Session?</DialogTitle>
        <DialogContent>
          <Typography style={{ fontSize: 14, color: '#374151' }}>
            This will remove the session from the timetable. Students will no
            longer see it in their schedule.
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '12px 24px' }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            style={{ background: '#ef4444', color: '#fff', borderRadius: 8 }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminTimetable;
