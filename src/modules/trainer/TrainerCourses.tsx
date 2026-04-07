import React, { useEffect, useState } from 'react';
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputBase,
  LinearProgress,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import SchoolIcon from '@material-ui/icons/School';
import LinkIcon from '@material-ui/icons/Link';
import DescriptionIcon from '@material-ui/icons/Description';
import AssignmentIcon from '@material-ui/icons/Assignment';
import PeopleIcon from '@material-ui/icons/People';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';
import { useHistory, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { get, post, del } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import Toast from '../../utils/Toast';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';
const PURPLE = '#8b5cf6';
const GREEN = '#10b981';
const AMBER = '#f59e0b';
const BLUE = '#3b82f6';

const useStyles = makeStyles((theme: Theme) => ({
  root: { paddingBottom: 32 },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    flexWrap: 'wrap' as any,
    gap: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: 800, color: DARK },
  pageSub: { fontSize: 13, color: '#8a8f99', marginTop: 2 },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 20,
    flexWrap: 'wrap' as any,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: '7px 14px',
    flex: 1,
    maxWidth: 360,
  },
  filterBtn: {
    border: '1px solid rgba(0,0,0,0.12)',
    color: '#5a5e6b',
    borderRadius: 8,
    padding: '6px 16px',
    fontSize: 13,
    fontWeight: 500,
    textTransform: 'none' as any,
  },
  addBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    padding: '7px 18px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'none' as any,
    '&:hover': { background: '#e02d5c' },
  },

  // Course cards
  courseCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column' as any,
    height: '100%',
    transition: 'box-shadow 0.18s, border-color 0.18s',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      borderColor: 'rgba(0,0,0,0.13)',
    },
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  courseCodeBadge: {
    background: 'rgba(254,58,106,0.08)',
    color: CORAL,
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 5,
    padding: '2px 8px',
  },
  courseName: {
    fontSize: 15,
    fontWeight: 700,
    color: DARK,
    marginBottom: 10,
    flex: 1,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#8a8f99',
    marginBottom: 6,
  },
  metaIcon: { fontSize: 14, color: '#9ca3af' },
  trimester: { fontSize: 11, color: '#9ca3af', marginBottom: 14 },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    paddingTop: 12,
    marginTop: 'auto',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: 5,
  },
  statusLabel: { fontSize: 12, fontWeight: 600 },
  viewDetailsBtn: {
    fontSize: 12,
    fontWeight: 700,
    color: CORAL,
    textTransform: 'none' as any,
    padding: '3px 0',
    '&:hover': { background: 'transparent', textDecoration: 'underline' },
  },

  // Detail view
  backBtn: { marginRight: 8 },
  detailTitle: { fontSize: 20, fontWeight: 800, color: DARK },
  detailSub: { fontSize: 13, color: '#8a8f99', marginTop: 2 },
  statBox: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statNum: { fontSize: 20, fontWeight: 800, color: DARK, lineHeight: 1 },
  statLbl: {
    fontSize: 10,
    color: '#8a8f99',
    marginTop: 3,
    fontWeight: 600,
    textTransform: 'uppercase' as any,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    height: '100%',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#8a8f99',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addSmallBtn: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${AMBER} 100%)`,
    color: '#fff',
    borderRadius: 7,
    fontWeight: 700,
    fontSize: 11,
    textTransform: 'none' as any,
    padding: '4px 10px',
    '&:hover': { opacity: 0.88 },
  },
  resourceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 0',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    '&:last-child': { borderBottom: 'none' },
  },
  resourceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'rgba(99,102,241,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resourceTitle: { flex: 1, fontSize: 13, fontWeight: 600, color: DARK },
  resourceMeta: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  studentRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '9px 0',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    '&:last-child': { borderBottom: 'none' },
  },
  studentName: { fontSize: 13, fontWeight: 600, color: DARK },
  progressPill: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 6,
    padding: '2px 8px',
  },
  progressBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#f3f4f6',
    marginTop: 8,
  },
  progressFill: {
    background: `linear-gradient(90deg, ${PURPLE} 0%, #6366f1 100%)`,
    borderRadius: 3,
  },
  emptyText: {
    fontSize: 13,
    color: '#c4c8d0',
    textAlign: 'center' as any,
    padding: '18px 0',
  },
}));

// ── Course List ───────────────────────────────────────────────────────────────
const CourseList = () => {
  const classes = useStyles();
  const history = useHistory();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    get(
      remoteRoutes.courses,
      (data: any) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setCourses(list);
        setLoading(false);
      },
      undefined,
      () => setLoading(false),
    );
  }, []);

  const filtered = courses.filter((c: any) => {
    if (!query) return true;
    return (c.title || c.name || '')
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <CircularProgress size={28} style={{ color: CORAL }} />
      </div>
    );

  return (
    <div className={classes.root}>
      <div className={classes.pageHeader}>
        <div>
          <div className={classes.pageTitle}>My Classes</div>
          <div className={classes.pageSub}>
            Manage all your classes and monitor student progress
          </div>
        </div>
      </div>

      <div className={classes.toolbar}>
        <div className={classes.searchBox}>
          <SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
          <InputBase
            placeholder="Search classes..."
            style={{ fontSize: 13, flex: 1 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="outlined" className={classes.filterBtn}>
          All Classes
        </Button>
        <Button
          variant="contained"
          className={classes.addBtn}
          startIcon={<AddIcon />}
          disableElevation
        >
          Add Class
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Typography className={classes.emptyText}>
          {query
            ? 'No classes match your search.'
            : 'No courses assigned yet — ask your admin to assign you.'}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((c: any) => {
            const isActive = c.isActive !== false;
            const enrolled = c.enrolledCount || c.studentCount || 0;
            const schedule =
              c.schedule ||
              (c.days ? `${c.days} ${c.startTime || ''}`.trim() : '');
            const trimester = c.trimester || c.term || 'Trimester 1';

            return (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <div className={classes.courseCard}>
                  <div className={classes.cardTop}>
                    {c.courseCode || c.code ? (
                      <span className={classes.courseCodeBadge}>
                        {c.courseCode || c.code}
                      </span>
                    ) : (
                      <span />
                    )}
                    <MoreVertIcon
                      style={{
                        fontSize: 18,
                        color: '#c4c8d0',
                        cursor: 'pointer',
                      }}
                    />
                  </div>

                  <div className={classes.courseName}>
                    {c.title || c.name || 'Unnamed Class'}
                  </div>

                  <div className={classes.metaRow}>
                    <PeopleIcon className={classes.metaIcon} />
                    {enrolled} Students
                  </div>

                  {schedule && (
                    <div className={classes.metaRow}>
                      <AccessTimeIcon className={classes.metaIcon} />
                      {schedule}
                    </div>
                  )}

                  <div className={classes.trimester}>{trimester}</div>

                  <div className={classes.cardFooter}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        className={classes.statusDot}
                        style={{ background: isActive ? GREEN : '#9ca3af' }}
                      />
                      <span
                        className={classes.statusLabel}
                        style={{ color: isActive ? GREEN : '#9ca3af' }}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <Button
                      className={classes.viewDetailsBtn}
                      disableRipple
                      onClick={() =>
                        history.push(`${localRoutes.trainerCourses}/${c.id}`)
                      }
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Grid>
            );
          })}
        </Grid>
      )}
    </div>
  );
};

// ── Course Detail ─────────────────────────────────────────────────────────────
const CourseDetail = ({ courseId }: { courseId: number }) => {
  const classes = useStyles();
  const history = useHistory();
  const [course, setCourse] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [trainerStats, setTrainerStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [addResourceOpen, setAddResourceOpen] = useState(false);
  const [addAssignmentOpen, setAddAssignmentOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'Document',
    url: '',
    description: '',
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: '100',
  });
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    get(
      `${remoteRoutes.courses}/${courseId}`,
      (data: any) => {
        setCourse(data);
        setLoading(false);
      },
      undefined,
      () => setLoading(false),
    );
    get(`${remoteRoutes.courses}/${courseId}/resources`, (data: any) =>
      setResources(Array.isArray(data) ? data : []),
    );
    get(`${remoteRoutes.courses}/${courseId}/trainer-stats`, (data: any) => {
      if (data) setTrainerStats(data);
    });
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const handleAddResource = () => {
    if (!resourceForm.title) return;
    setSaving(true);
    post(
      `${remoteRoutes.courses}/${courseId}/resources`,
      resourceForm,
      () => {
        Toast.success('Resource added');
        setAddResourceOpen(false);
        setResourceForm({
          title: '',
          type: 'Document',
          url: '',
          description: '',
        });
        loadData();
        setSaving(false);
      },
      undefined,
      () => setSaving(false),
    );
  };

  const handleDeleteResource = (resourceId: number) => {
    del(`${remoteRoutes.courses}/${courseId}/resources/${resourceId}`, () => {
      Toast.success('Resource removed');
      setResources((r) => r.filter((x) => x.id !== resourceId));
    });
  };

  const handleAddAssignment = () => {
    if (!assignmentForm.title) return;
    setSaving(true);
    post(
      remoteRoutes.assignments,
      {
        ...assignmentForm,
        courseId,
        maxScore: parseInt(assignmentForm.maxScore, 10) || 100,
      },
      () => {
        Toast.success('Assignment created');
        setAddAssignmentOpen(false);
        setAssignmentForm({
          title: '',
          description: '',
          dueDate: '',
          maxScore: '100',
        });
        loadData();
        setSaving(false);
      },
      undefined,
      () => setSaving(false),
    );
  };

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <CircularProgress size={28} style={{ color: CORAL }} />
      </div>
    );
  if (!course)
    return <Typography style={{ padding: 40 }}>Course not found.</Typography>;

  const enrollments: any[] = course.enrollments || [];

  return (
    <div className={classes.root}>
      <div className={classes.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconButton
            size="small"
            onClick={() => history.push(localRoutes.trainerCourses)}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <div>
            <div className={classes.detailTitle}>
              {course.title || course.name}
            </div>
            <div className={classes.detailSub}>{course.description}</div>
          </div>
        </div>
      </div>

      <Grid container spacing={2} style={{ marginBottom: 20 }}>
        {[
          {
            label: 'Active Students',
            value: trainerStats.activeStudents ?? enrollments.length,
            color: PURPLE,
            bg: 'rgba(139,92,246,0.08)',
            Icon: PeopleIcon,
          },
          {
            label: "Today's Classes",
            value: trainerStats.classesToday ?? 0,
            color: BLUE,
            bg: 'rgba(59,130,246,0.08)',
            Icon: SchoolIcon,
          },
          {
            label: 'Attendance Today',
            value: trainerStats.todayAttendance ?? 0,
            color: GREEN,
            bg: 'rgba(16,185,129,0.08)',
            Icon: PeopleIcon,
          },
          {
            label: 'To Grade',
            value: trainerStats.pendingSubmissions ?? 0,
            color: AMBER,
            bg: 'rgba(245,158,11,0.08)',
            Icon: AssignmentIcon,
          },
        ].map(({ label, value, color, bg, Icon }) => (
          <Grid item xs={6} sm={3} key={label}>
            <div className={classes.statBox}>
              <div className={classes.statIconBox} style={{ background: bg }}>
                <Icon style={{ fontSize: 18, color }} />
              </div>
              <div>
                <div className={classes.statNum}>{value}</div>
                <div className={classes.statLbl}>{label}</div>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <div className={classes.card}>
            <div className={classes.cardTitle}>
              <span>Resources</span>
              <Button
                size="small"
                className={classes.addSmallBtn}
                startIcon={<AddIcon style={{ fontSize: 13 }} />}
                onClick={() => setAddResourceOpen(true)}
              >
                Add
              </Button>
            </div>
            {resources.length === 0 ? (
              <Typography className={classes.emptyText}>
                No resources yet
              </Typography>
            ) : (
              resources.map((r: any) => (
                <div key={r.id} className={classes.resourceRow}>
                  <div className={classes.resourceIcon}>
                    {r.url || r.type === 'Link' ? (
                      <LinkIcon style={{ fontSize: 15, color: '#6366f1' }} />
                    ) : (
                      <DescriptionIcon
                        style={{ fontSize: 15, color: '#6366f1' }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className={classes.resourceTitle}>
                      {r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: DARK, textDecoration: 'none' }}
                        >
                          {r.title}
                        </a>
                      ) : (
                        r.title
                      )}
                    </div>
                    <div className={classes.resourceMeta}>
                      {r.type}
                      {r.description ? ` · ${r.description}` : ''}
                    </div>
                  </div>
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteResource(r.id)}
                    >
                      <DeleteIcon style={{ fontSize: 15, color: '#f87171' }} />
                    </IconButton>
                  </Tooltip>
                </div>
              ))
            )}
          </div>
        </Grid>

        <Grid item xs={12} md={6}>
          <div className={classes.card}>
            <div className={classes.cardTitle}>
              <span>Student Progress</span>
              <Button
                size="small"
                className={classes.addSmallBtn}
                startIcon={<AddIcon style={{ fontSize: 13 }} />}
                onClick={() => setAddAssignmentOpen(true)}
              >
                Add Assignment
              </Button>
            </div>
            {enrollments.length === 0 ? (
              <Typography className={classes.emptyText}>
                No students enrolled yet
              </Typography>
            ) : (
              enrollments.map((e: any) => {
                const name =
                  [
                    e.student?.contact?.person?.firstName,
                    e.student?.contact?.person?.lastName,
                  ]
                    .filter(Boolean)
                    .join(' ') || 'Unknown';
                const progress = Math.round(e.progress || 0);
                const color =
                  progress >= 80 ? GREEN : progress >= 40 ? AMBER : CORAL;
                return (
                  <div key={e.id} className={classes.studentRow}>
                    <span className={classes.studentName}>{name}</span>
                    <span
                      className={classes.progressPill}
                      style={{ background: `${color}18`, color }}
                    >
                      {progress}%
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Grid>

        {trainerStats.topStudents?.length > 0 && (
          <Grid item xs={12} md={6}>
            <div className={classes.card}>
              <div className={classes.cardTitle}>
                <span>
                  <EmojiEventsIcon
                    style={{
                      fontSize: 13,
                      marginRight: 4,
                      verticalAlign: 'middle',
                      color: AMBER,
                    }}
                  />
                  Top Performers
                </span>
              </div>
              {trainerStats.topStudents.map((s: any, i: number) => (
                <div key={s.name || i} className={classes.studentRow}>
                  <span className={classes.studentName}>
                    {i + 1}. {s.name}
                  </span>
                  <span
                    className={classes.progressPill}
                    style={{
                      background: 'rgba(139,92,246,0.08)',
                      color: PURPLE,
                    }}
                  >
                    {s.progress}%
                  </span>
                </div>
              ))}
            </div>
          </Grid>
        )}
      </Grid>

      {/* Add Resource Dialog */}
      <Dialog
        open={addResourceOpen}
        onClose={() => setAddResourceOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Resource</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="dense"
            value={resourceForm.title}
            onChange={(e) =>
              setResourceForm({ ...resourceForm, title: e.target.value })
            }
          />
          <TextField
            select
            label="Type"
            fullWidth
            margin="dense"
            value={resourceForm.type}
            onChange={(e) =>
              setResourceForm({ ...resourceForm, type: e.target.value })
            }
          >
            {['Document', 'Link', 'Video', 'Audio', 'Image'].map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="URL (optional)"
            fullWidth
            margin="dense"
            value={resourceForm.url}
            onChange={(e) =>
              setResourceForm({ ...resourceForm, url: e.target.value })
            }
            placeholder="https://..."
          />
          <TextField
            label="Description (optional)"
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            value={resourceForm.description}
            onChange={(e) =>
              setResourceForm({ ...resourceForm, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddResourceOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddResource}
            disabled={saving}
            variant="contained"
            style={{
              background: CORAL,
              color: '#fff',
              textTransform: 'none',
              borderRadius: 8,
            }}
          >
            {saving ? (
              <CircularProgress size={14} style={{ color: '#fff' }} />
            ) : (
              'Add Resource'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Assignment Dialog */}
      <Dialog
        open={addAssignmentOpen}
        onClose={() => setAddAssignmentOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create Assignment</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="dense"
            value={assignmentForm.title}
            onChange={(e) =>
              setAssignmentForm({ ...assignmentForm, title: e.target.value })
            }
          />
          <TextField
            label="Instructions"
            fullWidth
            margin="dense"
            multiline
            minRows={3}
            value={assignmentForm.description}
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                description: e.target.value,
              })
            }
          />
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={assignmentForm.dueDate}
            onChange={(e) =>
              setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })
            }
          />
          <TextField
            label="Max Score"
            type="number"
            fullWidth
            margin="dense"
            inputProps={{ min: 1, max: 100 }}
            value={assignmentForm.maxScore}
            onChange={(e) =>
              setAssignmentForm({ ...assignmentForm, maxScore: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddAssignmentOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddAssignment}
            disabled={saving}
            variant="contained"
            style={{
              background: CORAL,
              color: '#fff',
              textTransform: 'none',
              borderRadius: 8,
            }}
          >
            {saving ? (
              <CircularProgress size={14} style={{ color: '#fff' }} />
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// ── Router wrapper ────────────────────────────────────────────────────────────
const TrainerCourses = () => {
  const { courseId } = useParams<{ courseId?: string }>();
  return (
    <Layout>
      {courseId ? (
        <CourseDetail courseId={parseInt(courseId, 10)} />
      ) : (
        <CourseList />
      )}
    </Layout>
  );
};

export default TrainerCourses;
