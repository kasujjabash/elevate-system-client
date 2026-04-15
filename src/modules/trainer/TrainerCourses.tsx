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
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { get, post, del, search } from '../../utils/ajax';
import { remoteRoutes, localRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import Toast from '../../utils/Toast';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';
const PURPLE = '#8b5cf6';
const GREEN = '#10b981';
const AMBER = '#f59e0b';
const BLUE = '#3b82f6';

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: '24px 24px 40px', background: '#f8f7f5', minHeight: '100%' },

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
    border: '1px solid #ede8e3',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as any,
    transition: 'box-shadow 0.15s',
    '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.09)' },
  },
  cardTop: { padding: '18px 20px 14px', flex: 1 },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  enrollBadge: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    padding: '3px 10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  enrollOpen: {
    background: 'rgba(16,185,129,0.1)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.2)',
  },
  enrollClosed: {
    background: 'rgba(156,163,175,0.12)',
    color: '#6b7280',
    border: '1px solid rgba(156,163,175,0.2)',
  },
  courseName: {
    fontSize: 16,
    fontWeight: 700,
    color: DARK,
    lineHeight: 1.3,
    marginBottom: 6,
  },
  courseDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.55,
    marginBottom: 14,
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  } as any,
  instructorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  instructorAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${CORAL}, ${ORANGE})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  instructorName: { fontSize: 13, fontWeight: 600, color: '#374151' },
  instructorRole: { fontSize: 11, color: '#9ca3af' },
  noInstructor: { fontSize: 13, color: '#c9c4bf', fontStyle: 'italic' as any },
  statsBar: {
    display: 'flex',
    gap: 18,
    borderTop: '1px solid #f3ede9',
    paddingTop: 12,
    marginTop: 4,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as any,
    alignItems: 'flex-start',
  },
  statNumber: { fontSize: 18, fontWeight: 800, color: DARK, lineHeight: 1 },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  cardFooter: {
    borderTop: '1px solid #f3ede9',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    background: '#fdfcfb',
  },
  emptyBox: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #ede8e3',
    padding: '60px 24px',
    textAlign: 'center' as any,
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

  // ── Module management ──────────────────────────────────────────
  moduleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 0',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    cursor: 'pointer',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { opacity: 0.85 },
  },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: 13, fontWeight: 700, color: DARK },
  moduleMeta: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  contentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '7px 14px 7px 24px',
    borderBottom: '1px solid rgba(0,0,0,0.04)',
    background: '#fafafa',
    '&:last-child': { borderBottom: 'none' },
  },
  contentTypePill: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 5,
    padding: '2px 7px',
    flexShrink: 0,
  },
}));

function initials(name: string) {
  return (name || '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ── Course List ───────────────────────────────────────────────────────────────
const CourseList = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const sid = user?.contactId ?? user?.id;
    const userName = (user?.fullName || user?.username || '')
      .toLowerCase()
      .trim();
    setLoading(true);

    // Phase 1: look up this trainer's record in the instructor table to get the
    // correct instructorId (the course table uses instructor table IDs, NOT contactId/userId)
    search(
      remoteRoutes.courseInstructors,
      {},
      (iData: any) => {
        const instructors: any[] = Array.isArray(iData)
          ? iData
          : iData?.data || [];
        // Match by contactId/id first, then fall back to name
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

        // Phase 2: fetch courses scoped to the resolved instructor ID
        search(
          remoteRoutes.courses,
          { instructorId, limit: 200 },
          (data: any) => {
            const list: any[] = Array.isArray(data) ? data : data?.data || [];
            setCourses(list);
            setLoading(false);
          },
          () => setLoading(false),
          () => setLoading(false),
        );
      },
      // Instructor list request failed — fall back to raw user ID
      () => {
        search(
          remoteRoutes.courses,
          { instructorId: sid, limit: 200 },
          (data: any) => {
            const list: any[] = Array.isArray(data) ? data : data?.data || [];
            setCourses(list);
            setLoading(false);
          },
          () => setLoading(false),
          () => setLoading(false),
        );
      },
    );
  }, [user?.contactId]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* Header — no add button for trainers */}
      <div className={classes.pageHeader} style={{ marginBottom: 20 }}>
        <div>
          <div className={classes.pageTitle}>My Classes</div>
          <div className={classes.pageSub}>
            {courses.length} course{courses.length !== 1 ? 's' : ''} · manage
            curriculum and track student progress
          </div>
        </div>
      </div>

      {/* Search toolbar — no add/filter buttons */}
      <div className={classes.toolbar}>
        <div className={classes.searchBox}>
          <SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
          <InputBase
            placeholder="Search classes…"
            style={{ fontSize: 13, flex: 1 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={classes.emptyBox}>
          <SchoolIcon style={{ fontSize: 48, color: '#d1d5db' }} />
          <Typography
            style={{
              color: '#6b7280',
              marginTop: 10,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {query ? 'No classes match your search' : 'No courses assigned yet'}
          </Typography>
          {!query && (
            <Typography
              variant="body2"
              style={{ color: '#9ca3af', marginTop: 6 }}
            >
              Ask your admin to assign you to a course.
            </Typography>
          )}
        </div>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((c: any) => {
            const enrolled = c.enrolledCount || c.studentCount || 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <div className={classes.courseCard}>
                  <div className={classes.cardTop}>
                    {/* Enrollment status row (read-only for trainers) */}
                    <div className={classes.statusRow}>
                      <span
                        className={`${classes.enrollBadge} ${
                          c.isEnrollable
                            ? classes.enrollOpen
                            : classes.enrollClosed
                        }`}
                      >
                        {c.isEnrollable
                          ? 'Enrollment Open'
                          : 'Enrollment Closed'}
                      </span>
                      {(c.courseCode || c.code) && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#9ca3af',
                            background: '#f3f4f6',
                            borderRadius: 6,
                            padding: '2px 8px',
                          }}
                        >
                          {c.courseCode || c.code}
                        </span>
                      )}
                    </div>

                    {/* Course name */}
                    <div className={classes.courseName}>
                      {c.title || c.name || 'Unnamed Course'}
                    </div>

                    {/* Description (2-line clamp) */}
                    {c.description && (
                      <div className={classes.courseDesc}>{c.description}</div>
                    )}

                    {/* Instructor */}
                    {c.instructor ? (
                      <div className={classes.instructorRow}>
                        <div className={classes.instructorAvatar}>
                          {initials(c.instructor)}
                        </div>
                        <div>
                          <div className={classes.instructorName}>
                            {c.instructor}
                          </div>
                          <div className={classes.instructorRole}>
                            Instructor
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={classes.instructorRow}>
                        <span className={classes.noInstructor}>
                          No instructor assigned
                        </span>
                      </div>
                    )}

                    {/* Stats bar */}
                    <div className={classes.statsBar}>
                      <div className={classes.statItem}>
                        <div className={classes.statNumber}>{enrolled}</div>
                        <div className={classes.statLabel}>Enrolled</div>
                      </div>
                      {(c.capacity || c.maxStudents) && (
                        <div className={classes.statItem}>
                          <div className={classes.statNumber}>
                            {c.capacity || c.maxStudents}
                          </div>
                          <div className={classes.statLabel}>Capacity</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer — Manage only (trainers can't add/edit courses) */}
                  <div className={classes.cardFooter}>
                    <Button
                      size="small"
                      disableElevation
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#fff',
                        background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
                        borderRadius: 8,
                        padding: '5px 16px',
                        textTransform: 'none',
                        boxShadow: 'none',
                      }}
                      onClick={() =>
                        history.push(`${localRoutes.trainerCourses}/${c.id}`)
                      }
                    >
                      Manage →
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

  // Modules
  const [modules, setModules] = useState<any[]>([]);
  const [expandedMods, setExpandedMods] = useState<Set<number>>(new Set());
  const [openModuleDialog, setOpenModuleDialog] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    moduleNumber: '1',
    description: '',
  });
  const [savingModule, setSavingModule] = useState(false);
  const [openContentDialog, setOpenContentDialog] = useState(false);
  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'Lesson',
    videoUrl: '',
    body: '',
    durationMin: '',
  });
  const [targetModule, setTargetModule] = useState<any>(null);
  const [savingContent, setSavingContent] = useState(false);

  const BASE = remoteRoutes.coursesBase;

  const loadModules = () => {
    get(
      `${BASE}/${courseId}/modules`,
      (data: any) => {
        const list: any[] = Array.isArray(data) ? data : data?.data || [];
        setModules(list);
        setExpandedMods(new Set(list.map((m: any) => m.id)));
      },
      undefined,
      undefined,
    );
  };

  const handleAddModule = () => {
    if (!moduleForm.title.trim()) {
      Toast.error('Module title required');
      return;
    }
    setSavingModule(true);
    post(
      `${BASE}/${courseId}/modules`,
      {
        title: moduleForm.title,
        description: moduleForm.description,
        weekNumber: Number(moduleForm.moduleNumber) || 1,
        order: Number(moduleForm.moduleNumber) || 1,
      },
      () => {
        Toast.success('Module added');
        setOpenModuleDialog(false);
        setModuleForm({ title: '', moduleNumber: '1', description: '' });
        loadModules();
        setSavingModule(false);
      },
      () => {
        Toast.error('Failed to add module');
        setSavingModule(false);
      },
      undefined,
    );
  };

  const handleAddContent = () => {
    if (!contentForm.title.trim()) {
      Toast.error('Content title required');
      return;
    }
    if (!targetModule) return;
    setSavingContent(true);
    post(
      `${BASE}/modules/${targetModule.id}/content`,
      {
        title: contentForm.title,
        type: contentForm.type,
        videoUrl: contentForm.videoUrl || undefined,
        body: contentForm.body || undefined,
        durationMin: Number(contentForm.durationMin) || undefined,
        order: (targetModule.contents?.length ?? 0) + 1,
      },
      () => {
        Toast.success('Content added');
        setOpenContentDialog(false);
        setContentForm({
          title: '',
          type: 'Lesson',
          videoUrl: '',
          body: '',
          durationMin: '',
        });
        loadModules();
        setSavingContent(false);
      },
      () => {
        Toast.error('Failed to add content');
        setSavingContent(false);
      },
      undefined,
    );
  };

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
    loadModules();
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

      {/* ── Course Modules ───────────────────────────────────────── */}
      <div className={classes.card} style={{ marginBottom: 16 }}>
        <div className={classes.cardTitle}>
          <span>Course Modules</span>
          <Button
            size="small"
            className={classes.addSmallBtn}
            startIcon={<AddIcon style={{ fontSize: 13 }} />}
            onClick={() => setOpenModuleDialog(true)}
          >
            Add Module
          </Button>
        </div>

        {modules.length === 0 ? (
          <Typography className={classes.emptyText}>
            No modules yet — click "Add Module" to build the curriculum
          </Typography>
        ) : (
          modules.map((mod: any) => {
            const isExp = expandedMods.has(mod.id);
            return (
              <div key={mod.id}>
                <div
                  className={classes.moduleRow}
                  onClick={() =>
                    setExpandedMods((prev) => {
                      const next = new Set(prev);
                      isExp ? next.delete(mod.id) : next.add(mod.id);
                      return next;
                    })
                  }
                >
                  <div className={classes.moduleInfo}>
                    <div className={classes.moduleTitle}>
                      Module {mod.weekNumber || mod.order} · {mod.title}
                    </div>
                    <div className={classes.moduleMeta}>
                      {mod.contents?.length || 0} item
                      {mod.contents?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Button
                    size="small"
                    className={classes.addSmallBtn}
                    startIcon={<AddIcon style={{ fontSize: 12 }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetModule(mod);
                      setContentForm({
                        title: '',
                        type: 'Lesson',
                        videoUrl: '',
                        body: '',
                        durationMin: '',
                      });
                      setOpenContentDialog(true);
                    }}
                  >
                    Add Content
                  </Button>
                  {isExp ? (
                    <ExpandLessIcon
                      style={{ fontSize: 18, color: '#9ca3af' }}
                    />
                  ) : (
                    <ExpandMoreIcon
                      style={{ fontSize: 18, color: '#9ca3af' }}
                    />
                  )}
                </div>

                {isExp &&
                  (!mod.contents || mod.contents.length === 0 ? (
                    <div
                      style={{
                        padding: '10px 14px 10px 24px',
                        color: '#c9c4bf',
                        fontSize: 13,
                        background: '#fafafa',
                      }}
                    >
                      No content yet — click "Add Content"
                    </div>
                  ) : (
                    mod.contents.map((c: any) => (
                      <div key={c.id} className={classes.contentItem}>
                        <span
                          className={classes.contentTypePill}
                          style={{
                            background: 'rgba(99,102,241,0.1)',
                            color: '#6366f1',
                          }}
                        >
                          {c.type}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: DARK,
                            flex: 1,
                            fontWeight: 500,
                          }}
                        >
                          {c.title}
                        </span>
                        {c.durationMin && (
                          <span
                            style={{
                              fontSize: 12,
                              color: '#9ca3af',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                          >
                            <AccessTimeIcon style={{ fontSize: 13 }} />
                            {c.durationMin} min
                          </span>
                        )}
                      </div>
                    ))
                  ))}
              </div>
            );
          })
        )}
      </div>

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

      {/* Add Module Dialog */}
      <Dialog
        open={openModuleDialog}
        onClose={() => setOpenModuleDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          disableTypography
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: DARK }}>
            Add Module
          </span>
        </DialogTitle>
        <DialogContent style={{ padding: '16px 20px' }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Module #"
                type="number"
                fullWidth
                margin="dense"
                inputProps={{ min: 1 }}
                value={moduleForm.moduleNumber}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, moduleNumber: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                label="Title"
                fullWidth
                margin="dense"
                value={moduleForm.title}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, title: e.target.value })
                }
                placeholder="e.g. Introduction to Design"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description (optional)"
                fullWidth
                margin="dense"
                multiline
                minRows={2}
                value={moduleForm.description}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: '12px 20px' }}>
          <Button
            onClick={() => setOpenModuleDialog(false)}
            style={{ textTransform: 'none', color: '#6b7280', fontSize: 13 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddModule}
            disabled={savingModule}
            variant="contained"
            disableElevation
            style={{
              background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
              color: '#fff',
              textTransform: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              padding: '7px 20px',
            }}
          >
            {savingModule ? (
              <CircularProgress size={14} style={{ color: '#fff' }} />
            ) : (
              'Add Module'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Content Dialog */}
      <Dialog
        open={openContentDialog}
        onClose={() => setOpenContentDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          disableTypography
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: DARK }}>
            Add Content
            {targetModule ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#8a8f99',
                  marginLeft: 8,
                }}
              >
                → {targetModule.title}
              </span>
            ) : null}
          </span>
        </DialogTitle>
        <DialogContent style={{ padding: '16px 20px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                margin="dense"
                value={contentForm.title}
                onChange={(e) =>
                  setContentForm({ ...contentForm, title: e.target.value })
                }
                placeholder="e.g. Intro Video"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Type"
                fullWidth
                margin="dense"
                value={contentForm.type}
                onChange={(e) =>
                  setContentForm({ ...contentForm, type: e.target.value })
                }
              >
                {['Lesson', 'Video', 'Document', 'Link', 'Quiz'].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Duration (min)"
                type="number"
                fullWidth
                margin="dense"
                inputProps={{ min: 1 }}
                value={contentForm.durationMin}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    durationMin: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="URL (optional)"
                fullWidth
                margin="dense"
                value={contentForm.videoUrl}
                onChange={(e) =>
                  setContentForm({ ...contentForm, videoUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes / Body (optional)"
                fullWidth
                margin="dense"
                multiline
                minRows={2}
                value={contentForm.body}
                onChange={(e) =>
                  setContentForm({ ...contentForm, body: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: '12px 20px' }}>
          <Button
            onClick={() => setOpenContentDialog(false)}
            style={{ textTransform: 'none', color: '#6b7280', fontSize: 13 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddContent}
            disabled={savingContent}
            variant="contained"
            disableElevation
            style={{
              background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
              color: '#fff',
              textTransform: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              padding: '7px 20px',
            }}
          >
            {savingContent ? (
              <CircularProgress size={14} style={{ color: '#fff' }} />
            ) : (
              'Add Content'
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
