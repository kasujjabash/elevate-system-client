import React, { useEffect, useRef, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import { QRCodeSVG } from 'qrcode.react';
import AddIcon from '@material-ui/icons/Add';
import VisibilityIcon from '@material-ui/icons/Visibility';
import StopIcon from '@material-ui/icons/Stop';
import PeopleIcon from '@material-ui/icons/People';
import Layout from '../../../components/layout/Layout';
import XBreadCrumbs from '../../../components/XBreadCrumbs';
import XTable from '../../../components/table/XTable';
import { XHeadCell } from '../../../components/table/XTableHead';
import { localRoutes, remoteRoutes, apiBaseUrl } from '../../../data/constants';
import Toast from '../../../utils/Toast';

const TOKEN_KEY = '__elevate__academy__token';
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
  'Content-Type': 'application/json',
});

const useStyles = makeStyles(() =>
  createStyles({
    root: { flexGrow: 1 },
    sessionCard: {
      padding: 20,
      borderRadius: 12,
      boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
      marginBottom: 16,
    },
    qrWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 24px',
      background: 'linear-gradient(135deg, #1f2025 0%, #2d2f36 100%)',
      borderRadius: 16,
      marginBottom: 16,
    },
    qrLabel: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 13,
      marginTop: 16,
      textAlign: 'center',
    },
    qrTitle: {
      color: '#fff',
      fontWeight: 700,
      fontSize: 18,
      marginBottom: 4,
      textAlign: 'center',
    },
    checkinRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #f3f4f6',
      gap: 12,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #fe3a6a, #fe8c45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700,
      fontSize: 14,
      flexShrink: 0,
    },
  }),
);

interface Session {
  id: number;
  token: string;
  shortCode: string;
  label?: string;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  course?: { id: number; title: string };
  hub?: { id: number; name: string };
  _count: { records: number };
}

interface CheckinRecord {
  id: number;
  checkedInAt: string;
  method: string;
  student: {
    studentId: string;
    contact: { person: { firstName: string; lastName: string } };
  };
}

interface FullSession extends Session {
  records: CheckinRecord[];
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const initials = (r: CheckinRecord) => {
  const p = r.student?.contact?.person;
  return p ? `${p.firstName[0]}${p.lastName[0]}`.toUpperCase() : 'S';
};

const fullName = (r: CheckinRecord) => {
  const p = r.student?.contact?.person;
  return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
};

const AdminAttendance: React.FC = () => {
  const classes = useStyles();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailSession, setDetailSession] = useState<FullSession | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [liveSession, setLiveSession] = useState<FullSession | null>(null);
  const pollRef = useRef<any>(null);

  // Form state
  const [form, setForm] = useState({
    label: '',
    durationMinutes: '30',
    courseId: '',
    hubId: '',
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [codeFilter, setCodeFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/attendance/sessions?limit=50`,
        {
          headers: authHeader(),
        },
      );
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch {
      Toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${remoteRoutes.courses}`, {
        headers: authHeader(),
      });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data.data ?? []);
    } catch {}
  };

  const fetchHubs = async () => {
    try {
      const res = await fetch(`${remoteRoutes.hubs}`, {
        headers: authHeader(),
      });
      const data = await res.json();
      setHubs(Array.isArray(data) ? data : data.data ?? []);
    } catch {}
  };

  useEffect(() => {
    fetchSessions();
    fetchCourses();
    fetchHubs();
  }, []);

  // Poll live session every 5s
  const startPolling = (session: FullSession) => {
    setLiveSession(session);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/attendance/sessions/${session.id}`,
          {
            headers: authHeader(),
          },
        );
        const updated: FullSession = await res.json();
        setLiveSession(updated);
        if (!updated.isActive) stopPolling();
      } catch {}
    }, 5000);
  };

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  useEffect(() => () => stopPolling(), []);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const body: any = {
        durationMinutes: parseInt(form.durationMinutes),
      };
      if (form.label) body.label = form.label;
      if (form.courseId) body.courseId = parseInt(form.courseId);
      if (form.hubId) body.hubId = parseInt(form.hubId);

      const res = await fetch(`${apiBaseUrl}/api/attendance/sessions`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const session: FullSession = await res.json();
      session.records = session.records ?? [];
      setCreateOpen(false);
      setForm({ label: '', durationMinutes: '30', courseId: '', hubId: '' });
      await fetchSessions();
      startPolling(session);
      Toast.success('Session created — QR code is now live!');
    } catch {
      Toast.error('Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (sessionId: number) => {
    try {
      await fetch(`${apiBaseUrl}/api/attendance/sessions/${sessionId}/close`, {
        method: 'PATCH',
        headers: authHeader(),
      });
      stopPolling();
      setLiveSession(null);
      await fetchSessions();
      Toast.success('Session closed');
    } catch {
      Toast.error('Failed to close session');
    }
  };

  const handleViewDetails = async (session: Session) => {
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/attendance/sessions/${session.id}`,
        {
          headers: authHeader(),
        },
      );
      const data: FullSession = await res.json();
      setDetailSession(data);
      setDetailOpen(true);
    } catch {
      Toast.error('Failed to load session details');
    }
  };

  const checkinUrl = (token: string) =>
    `${window.location.origin}/attend/${token}`;

  const isExpired = (s: Session) => new Date() > new Date(s.expiresAt);

  return (
    <Layout title="Attendance">
      <Box className={classes.root}>
        <Box
          pb={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <XBreadCrumbs
            title="Attendance"
            paths={[{ path: localRoutes.home, label: 'Dashboard' }]}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            style={{ borderRadius: 8 }}
          >
            New Session
          </Button>
        </Box>

        {/* Live QR Panel */}
        {liveSession && liveSession.isActive && !isExpired(liveSession) && (
          <Paper
            style={{ marginBottom: 24, borderRadius: 16, overflow: 'hidden' }}
          >
            <Grid container>
              {/* QR Side */}
              <Grid
                item
                xs={12}
                md={5}
                style={{ background: '#1f2025', padding: 32 }}
              >
                <div className={classes.qrTitle}>
                  {liveSession.label || 'Attendance Session'}
                </div>
                <Typography
                  className={classes.qrLabel}
                  style={{ marginBottom: 20 }}
                >
                  {liveSession.course?.title &&
                    `${liveSession.course.title} · `}
                  Expires at {fmt(liveSession.expiresAt)}
                </Typography>
                <Box display="flex" justifyContent="center">
                  <Box
                    style={{
                      background: '#fff',
                      padding: 16,
                      borderRadius: 12,
                      display: 'inline-block',
                    }}
                  >
                    <QRCodeSVG
                      value={checkinUrl(liveSession.token)}
                      size={200}
                      level="H"
                    />
                  </Box>
                </Box>
                <Typography
                  className={classes.qrLabel}
                  style={{ marginTop: 16 }}
                >
                  Scan QR · or type the code below
                </Typography>

                {/* Short code display */}
                <Box
                  mt={2}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '12px 24px',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: 11,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}
                  >
                    Session Code
                  </Typography>
                  <Typography
                    style={{
                      color: '#fff',
                      fontSize: 32,
                      fontWeight: 800,
                      letterSpacing: 8,
                      fontFamily: 'monospace',
                    }}
                  >
                    {liveSession.shortCode}
                  </Typography>
                  <Typography
                    style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    Students go to{' '}
                    <strong style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {window.location.origin}/attend
                    </strong>
                  </Typography>
                </Box>
                <Box mt={2} display="flex" justifyContent="center">
                  <Button
                    variant="outlined"
                    startIcon={<StopIcon />}
                    style={{
                      color: '#ef4444',
                      borderColor: '#ef4444',
                      borderRadius: 8,
                    }}
                    onClick={() => handleClose(liveSession.id)}
                  >
                    Close Session
                  </Button>
                </Box>
              </Grid>

              {/* Live check-ins side */}
              <Grid item xs={12} md={7} style={{ padding: 24 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <PeopleIcon style={{ color: '#fe3a6a', marginRight: 8 }} />
                  <Typography style={{ fontWeight: 700, fontSize: 16 }}>
                    Live Check-ins
                  </Typography>
                  <Chip
                    label={liveSession.records?.length ?? 0}
                    size="small"
                    style={{
                      marginLeft: 10,
                      background: '#fe3a6a',
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  />
                </Box>

                <Box style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {(liveSession.records ?? []).length === 0 ? (
                    <Typography
                      style={{
                        color: '#9ca3af',
                        fontStyle: 'italic',
                        padding: '16px 0',
                      }}
                    >
                      Waiting for students to scan…
                    </Typography>
                  ) : (
                    (liveSession.records ?? []).map((r) => (
                      <div key={r.id} className={classes.checkinRow}>
                        <div className={classes.avatar}>{initials(r)}</div>
                        <div style={{ flex: 1 }}>
                          <Typography
                            style={{
                              fontWeight: 600,
                              fontSize: 14,
                              lineHeight: 1.2,
                            }}
                          >
                            {fullName(r)}
                          </Typography>
                          <Typography
                            style={{ fontSize: 12, color: '#6b7280' }}
                          >
                            {r.student?.studentId}
                          </Typography>
                        </div>
                        <Typography style={{ fontSize: 12, color: '#9ca3af' }}>
                          {fmt(r.checkedInAt)}
                        </Typography>
                      </div>
                    ))
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Session History */}
        <Typography
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: '#374151',
            marginBottom: 12,
          }}
        >
          Session History
        </Typography>

        {/* Filters */}
        <Paper
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 12,
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                placeholder="Search by session code…"
                value={codeFilter}
                onChange={(e) =>
                  setCodeFilter(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                  )
                }
                variant="outlined"
                size="small"
                fullWidth
                inputProps={{
                  style: {
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: 3,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                select
                label="Filter by course"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
              >
                <MenuItem value="">All courses</MenuItem>
                {courses.map((c: any) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              {(codeFilter || courseFilter) && (
                <Button
                  size="small"
                  onClick={() => {
                    setCodeFilter('');
                    setCourseFilter('');
                  }}
                  style={{ color: '#6b7280' }}
                >
                  Clear
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        {(() => {
          const filteredSessions = sessions.filter((s) => {
            const matchCode = !codeFilter || s.shortCode?.includes(codeFilter);
            const matchCourse =
              !courseFilter || String(s.course?.id) === courseFilter;
            return matchCode && matchCourse;
          });

          const headCells: XHeadCell[] = [
            {
              name: 'label',
              label: 'Session',
              render: (_v, row) => (
                <Box>
                  <Typography
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: '#111827',
                      lineHeight: 1.3,
                    }}
                  >
                    {row.label || `Session #${row.id}`}
                  </Typography>
                  <Typography style={{ fontSize: 11, color: '#6b7280' }}>
                    {row.course?.title || '—'}
                  </Typography>
                </Box>
              ),
            },
            {
              name: 'shortCode',
              label: 'Code',
              render: (_v, row) => (
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: 3,
                    color: '#1f2025',
                  }}
                >
                  {row.shortCode}
                </span>
              ),
            },
            {
              name: 'createdAt',
              label: 'Date',
              render: (_v, row) => (
                <Typography
                  style={{
                    fontSize: 13,
                    color: '#374151',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fmtDate(row.createdAt)}
                </Typography>
              ),
            },
            {
              name: '_count',
              label: 'Checked In',
              render: (_v, row) => (
                <Chip
                  label={row._count?.records ?? 0}
                  size="small"
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontWeight: 700,
                  }}
                />
              ),
            },
            {
              name: 'isActive',
              label: 'Status',
              render: (_v, row) => {
                const expired = isExpired(row);
                const s = !row.isActive
                  ? { label: 'Closed', color: '#6b7280', bg: '#f3f4f6' }
                  : expired
                  ? { label: 'Expired', color: '#b45309', bg: '#fef3c7' }
                  : { label: 'Active', color: '#15803d', bg: '#dcfce7' };
                return (
                  <Chip
                    label={s.label}
                    size="small"
                    style={{
                      background: s.bg,
                      color: s.color,
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                );
              },
            },
            {
              name: 'id',
              label: '',
              render: (_v, row) => {
                const expired = isExpired(row);
                return (
                  <Box display="flex" style={{ gap: 4 }}>
                    {row.isActive && !expired && (
                      <Tooltip title="Show QR">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          style={{
                            borderRadius: 6,
                            minWidth: 0,
                            padding: '2px 10px',
                            fontSize: 11,
                          }}
                          onClick={async () => {
                            const res = await fetch(
                              `${apiBaseUrl}/api/attendance/sessions/${row.id}`,
                              { headers: authHeader() },
                            );
                            const full: FullSession = await res.json();
                            stopPolling();
                            startPolling(full);
                          }}
                        >
                          QR
                        </Button>
                      </Tooltip>
                    )}
                    {row.isActive && !expired && (
                      <Tooltip title="Close session">
                        <IconButton
                          size="small"
                          onClick={() => handleClose(row.id)}
                        >
                          <StopIcon
                            style={{ color: '#ef4444', fontSize: 16 }}
                          />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="View check-ins">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(row)}
                      >
                        <VisibilityIcon
                          style={{ fontSize: 16, color: '#3b82f6' }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              },
            },
          ];

          return (
            <XTable
              headCells={headCells}
              data={filteredSessions}
              initialRowsPerPage={10}
              initialSortBy="createdAt"
              initialOrder="desc"
              loading={loading}
            />
          );
        })()}
      </Box>

      {/* Create Session Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle style={{ fontWeight: 700 }}>
          New Attendance Session
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" style={{ gap: 16 }} mt={1}>
            <TextField
              label="Session Label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Week 4 – Monday Morning"
              variant="outlined"
              size="small"
              fullWidth
            />
            <TextField
              select
              label="QR expires after"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({ ...form, durationMinutes: e.target.value })
              }
              variant="outlined"
              size="small"
              fullWidth
            >
              {[15, 30, 45, 60, 90, 120].map((m) => (
                <MenuItem key={m} value={String(m)}>
                  {m} minutes
                </MenuItem>
              ))}
            </TextField>
            {courses.length > 0 && (
              <TextField
                select
                label="Course (optional)"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                variant="outlined"
                size="small"
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {courses.map((c: any) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.title}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {hubs.length > 0 && (
              <TextField
                select
                label="Hub (optional)"
                value={form.hubId}
                onChange={(e) => setForm({ ...form, hubId: e.target.value })}
                variant="outlined"
                size="small"
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {hubs.map((h: any) => (
                  <MenuItem key={h.id} value={String(h.id)}>
                    {h.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions style={{ padding: '12px 24px' }}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            color="primary"
            disabled={submitting}
            style={{ borderRadius: 8 }}
          >
            {submitting ? 'Creating…' : 'Create & Show QR'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle style={{ fontWeight: 700 }}>
          {detailSession?.label || `Session #${detailSession?.id}`}
          <Typography
            style={{
              fontSize: 13,
              color: '#6b7280',
              fontWeight: 400,
              marginTop: 2,
            }}
          >
            {detailSession && fmtDate(detailSession.createdAt)} ·{' '}
            {detailSession?.records?.length ?? 0} checked in
          </Typography>
        </DialogTitle>
        <DialogContent style={{ paddingBottom: 8 }}>
          {(detailSession?.records ?? []).length === 0 ? (
            <Typography style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              No check-ins recorded.
            </Typography>
          ) : (
            (detailSession?.records ?? []).map((r) => (
              <div key={r.id} className={classes.checkinRow}>
                <div className={classes.avatar}>{initials(r)}</div>
                <div style={{ flex: 1 }}>
                  <Typography
                    style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}
                  >
                    {fullName(r)}
                  </Typography>
                  <Typography style={{ fontSize: 12, color: '#6b7280' }}>
                    {r.student?.studentId}
                  </Typography>
                </div>
                <Box textAlign="right">
                  <Typography style={{ fontSize: 12, color: '#6b7280' }}>
                    {fmt(r.checkedInAt)}
                  </Typography>
                  <Typography
                    style={{
                      fontSize: 10,
                      color: r.method === 'QR' ? '#3b82f6' : '#f59e0b',
                      fontWeight: 600,
                    }}
                  >
                    {r.method}
                  </Typography>
                </Box>
              </div>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminAttendance;
