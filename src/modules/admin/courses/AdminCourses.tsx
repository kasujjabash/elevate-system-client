import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SchoolIcon from '@material-ui/icons/School';
import SearchIcon from '@material-ui/icons/Search';
import EditIcon from '@material-ui/icons/Edit';

import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import Layout from '../../../components/layout/Layout';
import { get, patch, post, put } from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';
import Toast from '../../../utils/Toast';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: theme.spacing(3), background: '#f8f7f5', minHeight: '100%' },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap' as any,
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: DARK,
    letterSpacing: '-0.02em',
  },
  pageSubtitle: { fontSize: 13, color: '#8a8f99', marginTop: 2 },

  toolbar: {
    display: 'flex',
    gap: 10,
    marginBottom: theme.spacing(2.5),
    alignItems: 'center',
  },
  searchBox: {
    background: '#fff',
    borderRadius: 10,
    flex: 1,
    '& .MuiOutlinedInput-root': { borderRadius: 10, fontSize: 13 },
  },

  gradientBtn: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    boxShadow: 'none',
    '&:hover': { opacity: 0.9, boxShadow: `0 4px 14px rgba(254,58,106,0.3)` },
    '&:disabled': { opacity: 0.55, color: '#fff' },
  },
  outlineBtn: {
    borderRadius: 8,
    fontWeight: 600,
    textTransform: 'none' as any,
    fontSize: 13,
    borderColor: '#e5e7eb',
    color: '#374151',
    '&:hover': {
      borderColor: CORAL,
      color: CORAL,
      background: 'rgba(254,58,106,0.04)',
    },
  },

  // ── Course card ──────────────────────────────────────────────
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

  // Stats bar inside card
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
  statNumber: {
    fontSize: 20,
    fontWeight: 800,
    color: DARK,
    lineHeight: 1,
  },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  // Instructor row
  instructorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  instructorAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${CORAL}, ${ORANGE})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  instructorName: { fontSize: 13, fontWeight: 600, color: '#374151' },
  instructorRole: { fontSize: 11, color: '#9ca3af' },
  noInstructor: { fontSize: 13, color: '#c9c4bf', fontStyle: 'italic' },

  cardFooter: {
    borderTop: '1px solid #f3ede9',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fdfcfb',
  },

  emptyBox: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #ede8e3',
    padding: '60px 24px',
    textAlign: 'center' as any,
  },

  // ── Detail view ──────────────────────────────────────────────
  detailHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2.5),
    gap: 12,
    flexWrap: 'wrap' as any,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: DARK,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  detailMeta: { fontSize: 13, color: '#8a8f99', marginTop: 4 },

  // Detail info panel
  infoPanel: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #ede8e3',
    padding: '16px 22px',
    marginBottom: theme.spacing(2.5),
    display: 'flex',
    flexWrap: 'wrap' as any,
    alignItems: 'center',
    gap: '10px 32px',
  },
  infoPanelStat: {
    textAlign: 'center' as any,
  },
  infoPanelStatNum: {
    fontSize: 24,
    fontWeight: 800,
    color: DARK,
    lineHeight: 1,
  },
  infoPanelStatLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  infoPanelDivider: {
    width: 1,
    height: 40,
    background: '#f3ede9',
    flexShrink: 0,
  },

  // Week / module card
  weekCard: {
    background: '#fff',
    border: '1px solid #ede8e3',
    borderRadius: 12,
    marginBottom: theme.spacing(1.5),
    overflow: 'hidden',
  },
  weekHeader: {
    padding: '13px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover': { background: '#fdfcfb' },
  },
  weekTitle: { fontWeight: 700, fontSize: 14, color: DARK },
  weekMeta: { fontSize: 12, color: '#8a8f99', marginTop: 2 },
  contentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 18px 9px 28px',
    borderTop: '1px solid #f3ede9',
  },
  contentTypePill: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 5,
    letterSpacing: '0.03em',
    textTransform: 'uppercase' as any,
    flexShrink: 0,
  },

  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: 700,
    fontSize: 16,
    color: DARK,
  },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 0',
  },
}));

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Lesson: { bg: '#eff6ff', color: '#3b82f6' },
  Video: { bg: '#fdf2f8', color: '#a855f7' },
  Assignment: { bg: '#fff7ed', color: '#f59e0b' },
  Quiz: { bg: '#f0fdf4', color: '#22c55e' },
  Resource: { bg: '#f8f9fa', color: '#6b7280' },
};

function initials(name: string) {
  return (name || '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const BASE = remoteRoutes.coursesBase;
const EMPTY_COURSE = {
  title: '',
  description: '',
  instructorId: '',
  maxStudents: '30',
  isEnrollable: true,
};
const EMPTY_MODULE = { title: '', weekNumber: '1', description: '' };
const EMPTY_CONTENT = {
  title: '',
  type: 'Lesson',
  videoUrl: '',
  body: '',
  durationMin: '10',
};

const AdminCourses = () => {
  const classes = useStyles();

  const [courses, setCourses] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [toggling, setToggling] = useState(false);

  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [savingCourse, setSavingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(false);
  const [editingCourseData, setEditingCourseData] = useState<any>(null);

  const [openModuleDialog, setOpenModuleDialog] = useState(false);
  const [moduleForm, setModuleForm] = useState(EMPTY_MODULE);
  const [savingModule, setSavingModule] = useState(false);

  const [openContentDialog, setOpenContentDialog] = useState(false);
  const [targetModule, setTargetModule] = useState<any>(null);
  const [contentForm, setContentForm] = useState(EMPTY_CONTENT);
  const [savingContent, setSavingContent] = useState(false);

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [actioning, setActioning] = useState<number | null>(null);

  // ── Load ────────────────────────────────────────────────────────
  const fetchCourses = useCallback(() => {
    setLoading(true);
    get(
      remoteRoutes.courses,
      (data: any[]) => {
        const list = Array.isArray(data) ? data : [];
        setCourses(list);
        setFiltered(list);
      },
      undefined,
      () => setLoading(false),
    );
  }, []);

  const fetchPending = useCallback(() => {
    setPendingLoading(true);
    get(
      remoteRoutes.enrollmentPending,
      (data: any[]) => setPendingRequests(Array.isArray(data) ? data : []),
      undefined,
      () => setPendingLoading(false),
    );
  }, []);

  useEffect(() => {
    fetchCourses();
    fetchPending();
    get(
      remoteRoutes.courseInstructors,
      (data: any[]) => setInstructors(Array.isArray(data) ? data : []),
      undefined,
      undefined,
    );
  }, [fetchCourses, fetchPending]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(courses);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      courses.filter(
        (c) =>
          (c.title || c.name || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.instructor || '').toLowerCase().includes(q),
      ),
    );
  }, [search, courses]);

  // ── Modules ──────────────────────────────────────────────────────
  const fetchModules = useCallback((courseId: number) => {
    setModulesLoading(true);
    get(
      `${BASE}/${courseId}/modules`,
      (data: any[]) => {
        const list = Array.isArray(data) ? data : [];
        setModules(list);
        setExpandedWeeks(new Set(list.map((m: any) => m.id)));
      },
      undefined,
      () => setModulesLoading(false),
    );
  }, []);

  const openCourse = (course: any) => {
    setSelectedCourse(course);
    fetchModules(course.id);
  };

  const toggleWeek = (id: number) => {
    setExpandedWeeks((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ── CRUD helpers ─────────────────────────────────────────────────
  const handleSaveCourse = () => {
    if (!courseForm.title.trim()) {
      Toast.error('Title is required');
      return;
    }
    setSavingCourse(true);
    const payload = {
      title: courseForm.title,
      description: courseForm.description,
      instructorId: courseForm.instructorId || null,
      maxStudents: Number(courseForm.maxStudents) || 30,
      isEnrollable: courseForm.isEnrollable,
    };
    const target = editingCourseData || selectedCourse;
    const action = editingCourse
      ? put(
          `${BASE}/${target.id}`,
          payload,
          (data: any) => {
            Toast.success('Course updated');
            const newInstructor =
              instructors.find(
                (i) => String(i.id) === String(courseForm.instructorId),
              )?.name || target.instructor;
            const updated = {
              ...target,
              ...data,
              title: courseForm.title,
              name: courseForm.title,
              instructor: newInstructor,
            };
            if (selectedCourse?.id === target.id) setSelectedCourse(updated);
            setCourses((prev) =>
              prev.map((c) => (c.id === target.id ? updated : c)),
            );
            setEditingCourseData(null);
            setOpenCourseDialog(false);
          },
          () => Toast.error('Failed to update'),
          () => setSavingCourse(false),
        )
      : post(
          remoteRoutes.courses,
          payload,
          (data: any) => {
            Toast.success('Course created');
            setOpenCourseDialog(false);
            setCourseForm(EMPTY_COURSE);
            fetchCourses();
            if (data?.id) openCourse({ ...data, enrolledCount: 0 });
          },
          () => Toast.error('Failed to create course'),
          () => setSavingCourse(false),
        );
    return action;
  };

  const handleToggleEnrollable = (course: any) => {
    setToggling(true);
    patch(
      `${BASE}/${course.id}/enrollable`,
      {},
      (data: any) => {
        const updated = {
          ...course,
          isEnrollable: data?.isEnrollable ?? !course.isEnrollable,
        };
        setSelectedCourse((prev: any) =>
          prev?.id === course.id ? updated : prev,
        );
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? updated : c)),
        );
        Toast.success(
          updated.isEnrollable ? 'Enrollment opened' : 'Enrollment closed',
        );
      },
      () => Toast.error('Failed to toggle enrollment'),
      () => setToggling(false),
    );
  };

  const handleSaveModule = () => {
    if (!moduleForm.title.trim()) {
      Toast.error('Week title required');
      return;
    }
    setSavingModule(true);
    post(
      `${BASE}/${selectedCourse.id}/modules`,
      {
        title: moduleForm.title,
        description: moduleForm.description,
        weekNumber: Number(moduleForm.weekNumber) || 1,
        order: Number(moduleForm.weekNumber) || 1,
      },
      () => {
        Toast.success('Week added');
        setOpenModuleDialog(false);
        setModuleForm(EMPTY_MODULE);
        fetchModules(selectedCourse.id);
      },
      () => Toast.error('Failed to add week'),
      () => setSavingModule(false),
    );
  };

  const handleSaveContent = () => {
    if (!contentForm.title.trim()) {
      Toast.error('Title required');
      return;
    }
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
        setContentForm(EMPTY_CONTENT);
        fetchModules(selectedCourse.id);
      },
      () => Toast.error('Failed to add content'),
      () => setSavingContent(false),
    );
  };

  const openEditCourse = (course: any) => {
    setEditingCourse(true);
    setEditingCourseData(course);
    const instrId =
      instructors.find((i) => i.name === course.instructor)?.id ?? '';
    setCourseForm({
      title: course.title || course.name || '',
      description: course.description || '',
      instructorId: instrId ? String(instrId) : '',
      maxStudents: String(course.capacity || course.maxStudents || 30),
      isEnrollable: course.isEnrollable ?? true,
    });
    setOpenCourseDialog(true);
  };

  const handleApprove = (id: number) => {
    setActioning(id);
    patch(
      `${remoteRoutes.enrollmentApprove}/${id}/approve`,
      {},
      () => {
        Toast.success('Enrollment approved');
        setPendingRequests((prev) => prev.filter((r) => r.id !== id));
        setActioning(null);
      },
      () => {
        Toast.error('Failed to approve');
        setActioning(null);
      },
    );
  };

  const handleReject = (id: number) => {
    setActioning(id);
    patch(
      `${remoteRoutes.enrollmentApprove}/${id}/reject`,
      {},
      () => {
        Toast.warn('Enrollment rejected');
        setPendingRequests((prev) => prev.filter((r) => r.id !== id));
        setActioning(null);
      },
      () => {
        Toast.error('Failed to reject');
        setActioning(null);
      },
    );
  };

  // ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className={classes.root}>
        {/* ══ DETAIL VIEW ══════════════════════════════════════════ */}
        {selectedCourse ? (
          <>
            <div className={classes.detailHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconButton
                  size="small"
                  onClick={() => setSelectedCourse(null)}
                >
                  <ArrowBackIcon />
                </IconButton>
                <div>
                  <div className={classes.detailTitle}>
                    {selectedCourse.title || selectedCourse.name}
                  </div>
                  <div className={classes.detailMeta}>
                    {selectedCourse.instructor
                      ? `Taught by ${selectedCourse.instructor}`
                      : 'No instructor assigned'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as any }}>
                <Button
                  variant="outlined"
                  size="small"
                  className={classes.outlineBtn}
                  startIcon={<EditIcon style={{ fontSize: 15 }} />}
                  onClick={() => openEditCourse(selectedCourse)}
                >
                  Edit
                </Button>
                <Tooltip
                  title={
                    selectedCourse.isEnrollable
                      ? 'Close enrollment'
                      : 'Open enrollment'
                  }
                >
                  <Button
                    variant="outlined"
                    size="small"
                    className={classes.outlineBtn}
                    disabled={toggling}
                    startIcon={
                      selectedCourse.isEnrollable ? (
                        <LockIcon style={{ fontSize: 15 }} />
                      ) : (
                        <LockOpenIcon style={{ fontSize: 15 }} />
                      )
                    }
                    onClick={() => handleToggleEnrollable(selectedCourse)}
                    style={{
                      color: selectedCourse.isEnrollable
                        ? '#ef4444'
                        : '#10b981',
                      borderColor: selectedCourse.isEnrollable
                        ? '#fca5a5'
                        : '#6ee7b7',
                    }}
                  >
                    {selectedCourse.isEnrollable
                      ? 'Close Enrollment'
                      : 'Open Enrollment'}
                  </Button>
                </Tooltip>
                <Button
                  variant="contained"
                  size="small"
                  className={classes.gradientBtn}
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setModuleForm({
                      ...EMPTY_MODULE,
                      weekNumber: String(modules.length + 1),
                    });
                    setOpenModuleDialog(true);
                  }}
                >
                  Add Week
                </Button>
              </div>
            </div>

            {/* Info panel */}
            <div className={classes.infoPanel}>
              <div className={classes.infoPanelStat}>
                <div className={classes.infoPanelStatNum}>
                  {selectedCourse.enrolledCount || 0}
                </div>
                <div className={classes.infoPanelStatLabel}>
                  Students enrolled
                </div>
              </div>
              <div className={classes.infoPanelDivider} />
              <div className={classes.infoPanelStat}>
                <div className={classes.infoPanelStatNum}>{modules.length}</div>
                <div className={classes.infoPanelStatLabel}>Weeks</div>
              </div>
              <div className={classes.infoPanelDivider} />
              <div className={classes.infoPanelStat}>
                <div className={classes.infoPanelStatNum}>
                  {modules.reduce(
                    (s, m) => s + (m.contentCount ?? m.contents?.length ?? 0),
                    0,
                  )}
                </div>
                <div className={classes.infoPanelStatLabel}>Lessons</div>
              </div>
              <div className={classes.infoPanelDivider} />
              {/* Instructor */}
              {selectedCourse.instructor ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className={classes.instructorAvatar}>
                    {initials(selectedCourse.instructor)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>
                      {selectedCourse.instructor}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      Instructor
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    color: '#c9c4bf',
                    fontStyle: 'italic',
                  }}
                >
                  No instructor assigned
                </div>
              )}
              <div style={{ marginLeft: 'auto' }}>
                <span
                  className={`${classes.enrollBadge} ${
                    selectedCourse.isEnrollable
                      ? classes.enrollOpen
                      : classes.enrollClosed
                  }`}
                >
                  {selectedCourse.isEnrollable ? (
                    <>
                      <LockOpenIcon style={{ fontSize: 12 }} /> Enrollment Open
                    </>
                  ) : (
                    <>
                      <LockIcon style={{ fontSize: 12 }} /> Enrollment Closed
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Weeks */}
            {modulesLoading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress style={{ color: CORAL }} />
              </Box>
            ) : modules.length === 0 ? (
              <div className={classes.emptyBox}>
                <SchoolIcon style={{ fontSize: 48, color: '#d1d5db' }} />
                <Typography
                  style={{ color: '#8a8f99', marginTop: 10, fontWeight: 600 }}
                >
                  No weeks yet
                </Typography>
                <Typography
                  variant="body2"
                  style={{ color: '#c9c4bf', marginTop: 4 }}
                >
                  Click "Add Week" to build the curriculum
                </Typography>
              </div>
            ) : (
              modules.map((mod: any) => {
                const isExp = expandedWeeks.has(mod.id);
                const itemCount = mod.contentCount ?? mod.contents?.length ?? 0;
                return (
                  <div key={mod.id} className={classes.weekCard}>
                    <div
                      className={classes.weekHeader}
                      onClick={() => toggleWeek(mod.id)}
                    >
                      <div>
                        <div className={classes.weekTitle}>
                          Week {mod.weekNumber}: {mod.title}
                        </div>
                        <div className={classes.weekMeta}>
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                          {mod.description ? ` · ${mod.description}` : ''}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          className={classes.outlineBtn}
                          startIcon={<AddIcon style={{ fontSize: 13 }} />}
                          style={{ fontSize: 12 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetModule(mod);
                            setContentForm(EMPTY_CONTENT);
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
                    </div>
                    {isExp &&
                      (!mod.contents || mod.contents.length === 0 ? (
                        <div
                          style={{
                            padding: '12px 18px 12px 28px',
                            color: '#c9c4bf',
                            fontSize: 13,
                          }}
                        >
                          No content yet — click "Add Content" to add lessons.
                        </div>
                      ) : (
                        mod.contents.map((c: any) => {
                          const tc =
                            TYPE_COLORS[c.type] || TYPE_COLORS.Resource;
                          return (
                            <div key={c.id} className={classes.contentItem}>
                              <span
                                className={classes.contentTypePill}
                                style={{ background: tc.bg, color: tc.color }}
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
                          );
                        })
                      ))}
                  </div>
                );
              })
            )}
          </>
        ) : (
          /* ══ LIST VIEW ════════════════════════════════════════════ */
          <>
            <div className={classes.header}>
              <div>
                <div className={classes.pageTitle}>Course Management</div>
                <div className={classes.pageSubtitle}>
                  {courses.length} course{courses.length !== 1 ? 's' : ''} ·
                  manage curriculum, instructors & enrollment
                </div>
              </div>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                className={classes.gradientBtn}
                onClick={() => {
                  setCourseForm(EMPTY_COURSE);
                  setEditingCourse(false);
                  setEditingCourseData(null);
                  setOpenCourseDialog(true);
                }}
              >
                New Course
              </Button>
            </div>

            {/* ── Pending enrollment requests ── */}
            {(pendingLoading || pendingRequests.length > 0) && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  border: '1px solid #fde68a',
                  marginBottom: 20,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '12px 20px',
                    background: '#fffbeb',
                    borderBottom: '1px solid #fde68a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>⏳</span>
                  <Typography
                    style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}
                  >
                    Enrollment Requests
                  </Typography>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 12,
                      color: '#92400e',
                      background: '#fef3c7',
                      borderRadius: 20,
                      padding: '2px 10px',
                      fontWeight: 700,
                    }}
                  >
                    {pendingRequests.length} pending
                  </span>
                </div>
                {pendingLoading ? (
                  <Box display="flex" justifyContent="center" py={3}>
                    <CircularProgress size={24} style={{ color: CORAL }} />
                  </Box>
                ) : (
                  pendingRequests.map((req: any) => (
                    <div
                      key={req.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 20px',
                        borderBottom: '1px solid #f3ede9',
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{ fontSize: 13, fontWeight: 600, color: DARK }}
                        >
                          {req.studentName}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#6b7280',
                            marginTop: 2,
                          }}
                        >
                          wants to enroll in <strong>{req.courseName}</strong>
                        </div>
                      </div>
                      <Button
                        size="small"
                        disabled={actioning === req.id}
                        onClick={() => handleApprove(req.id)}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          background: 'rgba(16,185,129,0.1)',
                          color: '#10b981',
                          borderRadius: 8,
                          textTransform: 'none',
                          border: '1px solid rgba(16,185,129,0.2)',
                          marginRight: 6,
                        }}
                      >
                        {actioning === req.id ? (
                          <CircularProgress size={12} />
                        ) : (
                          'Approve'
                        )}
                      </Button>
                      <Button
                        size="small"
                        disabled={actioning === req.id}
                        onClick={() => handleReject(req.id)}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          background: 'rgba(239,68,68,0.06)',
                          color: '#ef4444',
                          borderRadius: 8,
                          textTransform: 'none',
                          border: '1px solid rgba(239,68,68,0.15)',
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className={classes.toolbar}>
              <TextField
                className={classes.searchBox}
                variant="outlined"
                size="small"
                placeholder="Search by name, description or instructor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress style={{ color: CORAL }} />
              </Box>
            ) : filtered.length === 0 ? (
              <div className={classes.emptyBox}>
                <SchoolIcon style={{ fontSize: 56, color: '#d1d5db' }} />
                <Typography
                  style={{
                    color: '#6b7280',
                    marginTop: 12,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {search ? 'No courses match your search' : 'No courses yet'}
                </Typography>
                {!search && (
                  <Typography
                    variant="body2"
                    style={{ color: '#9ca3af', marginTop: 6 }}
                  >
                    Click "New Course" to create your first course.
                  </Typography>
                )}
              </div>
            ) : (
              <Grid container spacing={2}>
                {filtered.map((course: any) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <div className={classes.courseCard}>
                      <div className={classes.cardTop}>
                        {/* Status row */}
                        <div className={classes.statusRow}>
                          <span
                            className={`${classes.enrollBadge} ${
                              course.isEnrollable
                                ? classes.enrollOpen
                                : classes.enrollClosed
                            }`}
                          >
                            {course.isEnrollable ? (
                              <>
                                <LockOpenIcon style={{ fontSize: 11 }} /> Open
                              </>
                            ) : (
                              <>
                                <LockIcon style={{ fontSize: 11 }} /> Closed
                              </>
                            )}
                          </span>
                          <button
                            onClick={() => handleToggleEnrollable(course)}
                            disabled={toggling}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#9ca3af',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            {course.isEnrollable ? 'Close' : 'Open'} →
                          </button>
                        </div>

                        {/* Name */}
                        <div className={classes.courseName}>
                          {course.title || course.name}
                        </div>

                        {/* Description */}
                        {course.description && (
                          <div className={classes.courseDesc}>
                            {course.description}
                          </div>
                        )}

                        {/* Instructor */}
                        {course.instructor ? (
                          <div className={classes.instructorRow}>
                            <div className={classes.instructorAvatar}>
                              {initials(course.instructor)}
                            </div>
                            <div>
                              <div className={classes.instructorName}>
                                {course.instructor}
                              </div>
                              <div className={classes.instructorRole}>
                                Instructor
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={classes.instructorRow}>
                            <div className={classes.noInstructor}>
                              No instructor assigned
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className={classes.statsBar}>
                          <div className={classes.statItem}>
                            <div className={classes.statNumber}>
                              {course.enrolledCount || 0}
                            </div>
                            <div className={classes.statLabel}>Enrolled</div>
                          </div>
                          {course.capacity && (
                            <div className={classes.statItem}>
                              <div className={classes.statNumber}>
                                {course.capacity}
                              </div>
                              <div className={classes.statLabel}>Capacity</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={classes.cardFooter}>
                        <Button
                          size="small"
                          variant="outlined"
                          className={classes.outlineBtn}
                          startIcon={<EditIcon style={{ fontSize: 13 }} />}
                          style={{ fontSize: 12 }}
                          onClick={() => openEditCourse(course)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          className={classes.gradientBtn}
                          style={{ fontSize: 12 }}
                          onClick={() => openCourse(course)}
                        >
                          Manage →
                        </Button>
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* ══ COURSE DIALOG ═══════════════════════════════════════ */}
        <Dialog
          open={openCourseDialog}
          onClose={() => setOpenCourseDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle disableTypography>
            <div className={classes.dialogTitle}>
              <span>{editingCourse ? 'Edit Course' : 'New Course'}</span>
              <IconButton
                size="small"
                onClick={() => {
                  setOpenCourseDialog(false);
                  setEditingCourseData(null);
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ paddingTop: 20 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Course Title *"
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, title: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  placeholder="e.g. Web Development Fundamentals"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      description: e.target.value,
                    })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  multiline
                  minRows={3}
                  placeholder="What will students learn in this course?"
                />
              </Grid>
              <Grid item xs={12} sm={7}>
                <TextField
                  select
                  label="Instructor / Tutor"
                  value={courseForm.instructorId}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      instructorId: e.target.value,
                    })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">— No instructor —</MenuItem>
                  {instructors.map((i: any) => (
                    <MenuItem key={i.id} value={String(i.id)}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${CORAL}, ${ORANGE})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          {initials(i.name)}
                        </div>
                        {i.name}
                      </div>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Max Students"
                  type="number"
                  value={courseForm.maxStudents}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      maxStudents: e.target.value,
                    })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              {!editingCourse && (
                <Grid item xs={12}>
                  <div className={classes.switchRow}>
                    <div>
                      <Typography
                        variant="body2"
                        style={{ fontWeight: 600, color: '#374151' }}
                      >
                        Open for enrollment immediately
                      </Typography>
                      <Typography
                        variant="caption"
                        style={{ color: '#9ca3af' }}
                      >
                        Students can self-enroll when this is on
                      </Typography>
                    </div>
                    <Switch
                      checked={courseForm.isEnrollable}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          isEnrollable: e.target.checked,
                        })
                      }
                      color="primary"
                      size="small"
                    />
                  </div>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions style={{ padding: '12px 24px', gap: 8 }}>
            <Button
              onClick={() => {
                setOpenCourseDialog(false);
                setEditingCourseData(null);
              }}
              style={{
                textTransform: 'none',
                color: '#8a8f99',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className={classes.gradientBtn}
              onClick={handleSaveCourse}
              disabled={savingCourse}
              startIcon={
                savingCourse ? (
                  <CircularProgress size={14} style={{ color: '#fff' }} />
                ) : undefined
              }
            >
              {savingCourse
                ? 'Saving…'
                : editingCourse
                ? 'Save Changes'
                : 'Create Course'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ══ ADD WEEK DIALOG ════════════════════════════════════ */}
        <Dialog
          open={openModuleDialog}
          onClose={() => setOpenModuleDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle disableTypography>
            <div className={classes.dialogTitle}>
              <span>Add Week</span>
              <IconButton
                size="small"
                onClick={() => setOpenModuleDialog(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ paddingTop: 20 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Week #"
                  type="number"
                  value={moduleForm.weekNumber}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, weekNumber: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  label="Title *"
                  value={moduleForm.title}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, title: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  placeholder="e.g. HTML Foundations"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description (optional)"
                  value={moduleForm.description}
                  onChange={(e) =>
                    setModuleForm({
                      ...moduleForm,
                      description: e.target.value,
                    })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions style={{ padding: '12px 24px', gap: 8 }}>
            <Button
              onClick={() => setOpenModuleDialog(false)}
              style={{
                textTransform: 'none',
                color: '#8a8f99',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className={classes.gradientBtn}
              onClick={handleSaveModule}
              disabled={savingModule}
              startIcon={
                savingModule ? (
                  <CircularProgress size={14} style={{ color: '#fff' }} />
                ) : undefined
              }
            >
              {savingModule ? 'Adding…' : 'Add Week'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ══ ADD CONTENT DIALOG ══════════════════════════════════ */}
        <Dialog
          open={openContentDialog}
          onClose={() => setOpenContentDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle disableTypography>
            <div className={classes.dialogTitle}>
              <div>
                <div>Add Content</div>
                {targetModule && (
                  <div
                    style={{
                      fontSize: 12,
                      color: '#8a8f99',
                      fontWeight: 400,
                      marginTop: 2,
                    }}
                  >
                    Week {targetModule.weekNumber}: {targetModule.title}
                  </div>
                )}
              </div>
              <IconButton
                size="small"
                onClick={() => setOpenContentDialog(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ paddingTop: 20 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Title *"
                  value={contentForm.title}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, title: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  placeholder="e.g. Introduction to HTML"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Type"
                  value={contentForm.type}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, type: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                >
                  {['Lesson', 'Video', 'Assignment', 'Quiz', 'Resource'].map(
                    (t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ),
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="YouTube Video URL (optional)"
                  value={contentForm.videoUrl}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, videoUrl: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  placeholder="https://www.youtube.com/watch?v=..."
                  helperText="Paste a YouTube link — embedded automatically for students"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={
                    contentForm.type === 'Assignment'
                      ? 'Assignment Instructions'
                      : 'Lesson Notes'
                  }
                  value={contentForm.body}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, body: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  multiline
                  minRows={6}
                  placeholder={
                    contentForm.type === 'Assignment'
                      ? 'Describe what students need to do and submit…'
                      : 'Write lesson text and notes here…'
                  }
                  helperText="Line breaks and spacing are preserved exactly as typed — no special formatting needed."
                  inputProps={{
                    style: { fontFamily: 'inherit', lineHeight: 1.7 },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={contentForm.durationMin}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      durationMin: e.target.value,
                    })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions style={{ padding: '12px 24px', gap: 8 }}>
            <Button
              onClick={() => setOpenContentDialog(false)}
              style={{
                textTransform: 'none',
                color: '#8a8f99',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className={classes.gradientBtn}
              onClick={handleSaveContent}
              disabled={savingContent}
              startIcon={
                savingContent ? (
                  <CircularProgress size={14} style={{ color: '#fff' }} />
                ) : undefined
              }
            >
              {savingContent ? 'Saving…' : 'Add Content'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminCourses;
