import React, { useEffect, useRef, useState } from 'react';
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
  FormControlLabel,
  Grid,
  IconButton,
  InputBase,
  LinearProgress,
  makeStyles,
  MenuItem,
  Switch,
  Tab,
  Tabs,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';
import GradeIcon from '@material-ui/icons/Grade';
import CloseIcon from '@material-ui/icons/Close';
import AssignmentIcon from '@material-ui/icons/Assignment';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';
import StarIcon from '@material-ui/icons/Star';
import LockIcon from '@material-ui/icons/Lock';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import { format, parseISO, addWeeks, isBefore, startOfDay } from 'date-fns';
import Layout from '../../../components/layout/Layout';
import { get, post } from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';
import Toast from '../../../utils/Toast';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';
const GREEN = '#10b981';
const AMBER = '#f59e0b';
const BLUE = '#3b82f6';
const PURPLE = '#8b5cf6';

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
    boxShadow: 'none',
    '&:hover': {
      background: '#e02d5c',
      boxShadow: '0 4px 14px rgba(254,58,106,0.3)',
    },
  },

  statsRow: { marginBottom: 24 },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statNum: { fontSize: 24, fontWeight: 800, color: DARK, lineHeight: 1 },
  statLbl: {
    fontSize: 11,
    color: '#8a8f99',
    marginTop: 3,
    fontWeight: 600,
    textTransform: 'uppercase' as any,
    letterSpacing: '0.04em',
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
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
    maxWidth: 380,
  },

  tabs: {
    marginBottom: 20,
    '& .MuiTabs-indicator': { backgroundColor: CORAL },
  },
  tab: { textTransform: 'none' as any, fontWeight: 600, fontSize: 13 },

  // Assessment card
  assessmentCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '18px 22px',
    marginBottom: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  badgesRow: { display: 'flex', gap: 6, flexWrap: 'wrap' as any },
  courseCodeBadge: {
    background: 'rgba(254,58,106,0.08)',
    color: CORAL,
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 5,
    padding: '2px 8px',
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 5,
    padding: '2px 8px',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 5,
    padding: '2px 8px',
  },
  actionsRow: { display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 },
  editBtn: {
    fontSize: 11,
    fontWeight: 600,
    color: '#5a5e6b',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 7,
    padding: '4px 12px',
    textTransform: 'none' as any,
  },
  gradeBtn: {
    background: CORAL,
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 7,
    padding: '5px 14px',
    textTransform: 'none' as any,
    boxShadow: 'none',
    '&:hover': { background: '#e02d5c' },
  },
  exportBtn: {
    background: GREEN,
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 7,
    padding: '5px 14px',
    textTransform: 'none' as any,
    boxShadow: 'none',
    '&:hover': { background: '#0ca678' },
  },

  assessmentTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: DARK,
    marginBottom: 3,
  },
  assessmentCourse: { fontSize: 12, color: '#8a8f99', marginBottom: 12 },
  milestoneBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '2px 8px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: '#fff7ed',
    color: AMBER,
    border: '1px solid #fde68a',
    marginLeft: 6,
  },
  weekBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '2px 8px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: '#eef2ff',
    color: '#6366f1',
    border: '1px solid #c7d2fe',
    marginLeft: 6,
  },

  metricsRow: {
    display: 'flex',
    gap: 28,
    flexWrap: 'wrap' as any,
    marginBottom: 12,
  },
  metric: {},
  metricLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 600,
    textTransform: 'uppercase' as any,
    letterSpacing: '0.05em',
    marginBottom: 2,
  },
  metricValue: { fontSize: 13, fontWeight: 700, color: DARK },

  progressBar: { height: 5, borderRadius: 3, backgroundColor: '#f3f4f6' },
  progressFill: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    borderRadius: 3,
  },
  progressFillDone: {
    background: `linear-gradient(90deg, ${GREEN} 0%, #34d399 100%)`,
    borderRadius: 3,
  },

  emptyText: {
    fontSize: 13,
    color: '#c4c8d0',
    textAlign: 'center' as any,
    padding: '40px 0',
  },

  // Submission card in dialog
  submissionCard: {
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 10,
    padding: '14px 16px',
    marginBottom: 12,
    background: '#fafafa',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#8a8f99',
    marginBottom: 6,
    display: 'block',
  },
  uploadZone: {
    border: '2px dashed #e0e0e0',
    borderRadius: 10,
    padding: theme.spacing(3),
    textAlign: 'center' as any,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    '&:hover': { borderColor: CORAL },
  },
  fileChip: { marginTop: 8, marginRight: 4, borderRadius: 6, fontSize: 12 },
  gradeInput: { width: 80 },
}));

const WEEK_OPTIONS = Array.from({ length: 52 }, (_, i) => i + 1);

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  open: { bg: '#eff6ff', color: BLUE },
  active: { bg: '#eff6ff', color: BLUE },
  submitted: { bg: '#fff7ed', color: AMBER },
  grading: { bg: '#fff7ed', color: AMBER },
  graded: { bg: '#f0fdf4', color: GREEN },
  completed: { bg: '#f0fdf4', color: GREEN },
  closed: { bg: '#f8f8f8', color: '#8a8f99' },
  draft: { bg: 'rgba(0,0,0,0.05)', color: '#8a8f99' },
};

const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  assignment: { bg: 'rgba(59,130,246,0.1)', color: BLUE },
  exam: { bg: 'rgba(254,58,106,0.1)', color: CORAL },
  quiz: { bg: 'rgba(139,92,246,0.1)', color: PURPLE },
  project: { bg: 'rgba(16,185,129,0.1)', color: GREEN },
};

const getStatusStyle = (s: string) =>
  STATUS_STYLES[s?.toLowerCase()] || { bg: '#f3f4f6', color: '#8a8f99' };
const getTypeStyle = (t: string) =>
  TYPE_STYLES[t?.toLowerCase()] || { bg: '#f3f4f6', color: '#8a8f99' };

const isWeekUnlocked = (weekNumber: number, courseStartDate: string) => {
  if (!courseStartDate) return true;
  const start = parseISO(courseStartDate);
  return !isBefore(
    startOfDay(new Date()),
    startOfDay(addWeeks(start, weekNumber - 1)),
  );
};

const EMPTY_FORM = {
  title: '',
  courseId: '',
  dueDate: '',
  maxScore: '100',
  description: '',
  weekNumber: '',
  isMilestone: false,
};

const TeacherAssignments = () => {
  const classes = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState(0);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [openNew, setOpenNew] = useState(false);
  const [openSubmissions, setOpenSubmissions] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');

  const fetchAssignments = () => {
    get(
      remoteRoutes.assignments,
      (data: any[]) => setAssignments(Array.isArray(data) ? data : []),
      undefined,
      undefined,
    );
  };

  useEffect(() => {
    fetchAssignments();
    get(
      remoteRoutes.coursesBase,
      (data: any[]) => setCourses(Array.isArray(data) ? data : []),
      undefined,
      undefined,
    );
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleCreate = () => {
    if (!form.title || !form.courseId || !form.dueDate) {
      Toast.error('Please fill in title, course, and due date');
      return;
    }
    setUploading(true);
    post(
      remoteRoutes.assignments,
      {
        title: form.title,
        courseId: Number(form.courseId),
        description: form.description,
        dueDate: form.dueDate,
        maxScore: form.maxScore ? Number(form.maxScore) : 100,
        weekNumber: form.weekNumber ? Number(form.weekNumber) : undefined,
        isMilestone: form.isMilestone,
      },
      () => {
        Toast.success('Assignment created successfully');
        setOpenNew(false);
        setForm(EMPTY_FORM);
        setAttachedFiles([]);
        fetchAssignments();
      },
      undefined,
      () => setUploading(false),
    );
  };

  const handleViewSubmissions = (assignment: any) => {
    setSelectedAssignment(assignment);
    get(
      `${remoteRoutes.assignments}/${assignment.id}/submissions`,
      (data: any[]) => {
        const list = Array.isArray(data) ? data : [];
        setSubmissions(list);
        const g: Record<string, string> = {};
        const f: Record<string, string> = {};
        list.forEach((s: any) => {
          g[s.id] = s.score != null ? String(s.score) : '';
          f[s.id] = s.feedback || '';
        });
        setGrades(g);
        setFeedback(f);
      },
      undefined,
      undefined,
    );
    setOpenSubmissions(true);
  };

  const handleSaveGrade = (submissionId: string) => {
    const score = Number(grades[submissionId]);
    if (Number.isNaN(score)) {
      Toast.error('Enter a valid score');
      return;
    }
    post(
      `${remoteRoutes.assignments}/submissions/${submissionId}/grade`,
      { score, feedback: feedback[submissionId] || '' },
      () => {
        Toast.success('Grade saved');
        setSubmissions((prev) =>
          prev.map((s) =>
            String(s.id) === submissionId
              ? {
                  ...s,
                  score,
                  feedback: feedback[submissionId],
                  status: 'Graded',
                }
              : s,
          ),
        );
      },
      undefined,
      undefined,
    );
  };

  const filtered = assignments.filter((a) => {
    const matchesTab =
      tab === 0 ||
      (tab === 1 && a.status === 'open') ||
      (tab === 2 && a.status === 'closed') ||
      (tab === 3 && a.isMilestone);
    const matchesQuery =
      !query || (a.title || '').toLowerCase().includes(query.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const openCount = assignments.filter((a) => a.status === 'open').length;
  const pendingGrading = assignments.filter(
    (a) => (a.submissionsCount || 0) > (a.gradedCount || 0),
  ).length;
  const milestoneCount = assignments.filter((a) => a.isMilestone).length;

  return (
    <Layout>
      <div className={classes.root}>
        {/* Header */}
        <div className={classes.pageHeader}>
          <div>
            <div className={classes.pageTitle}>Assessments</div>
            <div className={classes.pageSub}>
              Create and manage assessments for your classes
            </div>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className={classes.addBtn}
            disableElevation
            onClick={() => setOpenNew(true)}
          >
            Create Assessment
          </Button>
        </div>

        {/* Stats */}
        <Grid container spacing={2} className={classes.statsRow}>
          {[
            {
              label: 'Total Assignments',
              value: assignments.length,
              color: PURPLE,
              bg: 'rgba(139,92,246,0.08)',
            },
            {
              label: 'Currently Open',
              value: openCount,
              color: BLUE,
              bg: 'rgba(59,130,246,0.08)',
            },
            {
              label: 'Pending Grading',
              value: pendingGrading,
              color: CORAL,
              bg: 'rgba(254,58,106,0.08)',
            },
            {
              label: 'Milestones',
              value: milestoneCount,
              color: AMBER,
              bg: 'rgba(245,158,11,0.08)',
            },
          ].map((stat) => (
            <Grid item xs={6} sm={3} key={stat.label}>
              <div className={classes.statCard}>
                <div
                  className={classes.statIconBox}
                  style={{ background: stat.bg }}
                >
                  <AssignmentIcon style={{ color: stat.color, fontSize: 20 }} />
                </div>
                <div>
                  <div className={classes.statNum}>{stat.value}</div>
                  <div className={classes.statLbl}>{stat.label}</div>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>

        {/* Search + tabs */}
        <div className={classes.toolbar}>
          <div className={classes.searchBox}>
            <SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
            <InputBase
              placeholder="Search assessments..."
              style={{ fontSize: 13, flex: 1 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          className={classes.tabs}
        >
          <Tab label="All" className={classes.tab} />
          <Tab label="Open" className={classes.tab} />
          <Tab label="Closed" className={classes.tab} />
          <Tab
            label={`Milestones (${milestoneCount})`}
            className={classes.tab}
          />
        </Tabs>

        {/* Assessment cards */}
        {filtered.length === 0 ? (
          <Typography className={classes.emptyText}>
            No assessments found. Click "Create Assessment" to get started.
          </Typography>
        ) : (
          filtered.map((a) => {
            const statusStyle = getStatusStyle(a.status);
            const typeStyle = getTypeStyle(a.type || 'assignment');
            const submittedPct =
              a.totalStudents > 0
                ? Math.round(
                    ((a.submissionsCount || 0) / a.totalStudents) * 100,
                  )
                : 0;
            const isDone = submittedPct >= 100;
            const unlocked = a.courseStartDate
              ? isWeekUnlocked(a.weekNumber, a.courseStartDate)
              : true;

            return (
              <div key={a.id} className={classes.assessmentCard}>
                <div className={classes.cardTopRow}>
                  <div className={classes.badgesRow}>
                    {(a.courseCode || a.course?.code) && (
                      <span className={classes.courseCodeBadge}>
                        {a.courseCode || a.course?.code}
                      </span>
                    )}
                    <span
                      className={classes.typeBadge}
                      style={{
                        background: typeStyle.bg,
                        color: typeStyle.color,
                      }}
                    >
                      {(a.type || 'Assignment').charAt(0).toUpperCase() +
                        (a.type || 'Assignment').slice(1)}
                    </span>
                    <span
                      className={classes.statusBadge}
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      {(a.status || 'Open').charAt(0).toUpperCase() +
                        (a.status || 'Open').slice(1)}
                    </span>
                  </div>
                  <div className={classes.actionsRow}>
                    {isDone && (
                      <Button
                        size="small"
                        variant="contained"
                        className={classes.exportBtn}
                        disableElevation
                      >
                        Export
                      </Button>
                    )}
                    {!isDone && (a.submissionsCount || 0) > 0 && (
                      <Button
                        size="small"
                        variant="contained"
                        className={classes.gradeBtn}
                        disableElevation
                        startIcon={<GradeIcon style={{ fontSize: 13 }} />}
                        onClick={() => handleViewSubmissions(a)}
                      >
                        Grade Submissions
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      className={classes.editBtn}
                      startIcon={<EditIcon style={{ fontSize: 13 }} />}
                      onClick={() => handleViewSubmissions(a)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                <div>
                  <span className={classes.assessmentTitle}>{a.title}</span>
                  {a.isMilestone && (
                    <span className={classes.milestoneBadge}>
                      <StarIcon style={{ fontSize: 10 }} /> Milestone
                    </span>
                  )}
                  {a.weekNumber && (
                    <span className={classes.weekBadge}>Wk {a.weekNumber}</span>
                  )}
                  {!unlocked && (
                    <span
                      style={{ fontSize: 10, color: '#8a8f99', marginLeft: 6 }}
                    >
                      <LockIcon
                        style={{ fontSize: 10, verticalAlign: 'middle' }}
                      />{' '}
                      Locked
                    </span>
                  )}
                </div>

                <div className={classes.assessmentCourse}>
                  {typeof a.course === 'object' ? a.course?.title : a.course}
                  {a.hub &&
                    ` · ${
                      typeof a.hub === 'object'
                        ? a.hub?.name || a.hub?.title
                        : a.hub
                    }`}
                </div>

                <div className={classes.metricsRow}>
                  <div className={classes.metric}>
                    <div className={classes.metricLabel}>Due Date</div>
                    <div className={classes.metricValue}>
                      {a.dueDate
                        ? format(parseISO(a.dueDate), 'MMM d, yyyy')
                        : '—'}
                    </div>
                  </div>
                  <div className={classes.metric}>
                    <div className={classes.metricLabel}>Total Marks</div>
                    <div className={classes.metricValue}>
                      {a.maxScore || a.totalMarks || 100}
                    </div>
                  </div>
                  <div className={classes.metric}>
                    <div className={classes.metricLabel}>Submissions</div>
                    <div className={classes.metricValue}>
                      {a.submissionsCount || 0}/{a.totalStudents || 0}
                    </div>
                  </div>
                  <div className={classes.metric}>
                    <div className={classes.metricLabel}>Completion</div>
                    <div
                      className={classes.metricValue}
                      style={{ color: isDone ? GREEN : CORAL }}
                    >
                      {submittedPct}%
                    </div>
                  </div>
                </div>

                <LinearProgress
                  variant="determinate"
                  value={submittedPct}
                  className={classes.progressBar}
                  classes={{
                    bar: isDone
                      ? classes.progressFillDone
                      : classes.progressFill,
                  }}
                />
              </div>
            );
          })
        )}

        {/* ── Create Assignment Dialog ── */}
        <Dialog
          open={openNew}
          onClose={() => setOpenNew(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 700 }}>Create New Assessment</span>
            <IconButton size="small" onClick={() => setOpenNew(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ paddingTop: 20 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Assignment Title *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  select
                  label="Course *"
                  value={form.courseId}
                  onChange={(e) =>
                    setForm({ ...form, courseId: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                >
                  {courses.map((c: any) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Week"
                  value={form.weekNumber}
                  onChange={(e) =>
                    setForm({ ...form, weekNumber: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  helperText="Which course week?"
                >
                  {WEEK_OPTIONS.map((w) => (
                    <MenuItem key={w} value={w}>
                      Week {w}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Divider style={{ margin: '4px 0 8px' }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Due Date *"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Score"
                  type="number"
                  value={form.maxScore}
                  onChange={(e) =>
                    setForm({ ...form, maxScore: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description / Instructions"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isMilestone}
                      onChange={(e) =>
                        setForm({ ...form, isMilestone: e.target.checked })
                      }
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <span
                      style={{ fontSize: 13, fontWeight: 600, color: DARK }}
                    >
                      Milestone Assignment{' '}
                      <span style={{ fontWeight: 400, color: '#8a8f99' }}>
                        — requires PDF or link submission
                      </span>
                    </span>
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <span className={classes.sectionLabel}>Attach resources</span>
                <div
                  className={classes.uploadZone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUploadIcon style={{ fontSize: 34, color: '#c0c4ce' }} />
                  <Typography
                    style={{ color: '#8a8f99', fontSize: 13, marginTop: 4 }}
                  >
                    Click to upload files, PDFs, videos, or any resource
                  </Typography>
                  <Typography
                    style={{ color: '#c0c4ce', fontSize: 11, marginTop: 2 }}
                  >
                    Supports PDF, DOCX, MP4, MOV, PNG, JPG
                  </Typography>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.mp4,.mov,.png,.jpg,.jpeg,.pptx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {attachedFiles.length > 0 && (
                  <Box mt={1}>
                    {attachedFiles.map((f, i) => (
                      <Chip
                        key={i}
                        label={f.name}
                        onDelete={() =>
                          setAttachedFiles((prev) =>
                            prev.filter((_, j) => j !== i),
                          )
                        }
                        deleteIcon={<DeleteIcon />}
                        className={classes.fileChip}
                        icon={
                          f.type.startsWith('video/') ? (
                            <VideoLibraryIcon />
                          ) : (
                            <AttachFileIcon />
                          )
                        }
                        style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e0e0e0',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions style={{ padding: '12px 24px' }}>
            <Button
              onClick={() => setOpenNew(false)}
              style={{ textTransform: 'none', color: '#8a8f99' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={uploading}
              disableElevation
              style={{
                background: CORAL,
                color: '#fff',
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              {uploading ? 'Creating...' : 'Create Assessment'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Submissions & Grading Dialog ── */}
        <Dialog
          open={openSubmissions}
          onClose={() => setOpenSubmissions(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontWeight: 700 }}>
                Submissions — {selectedAssignment?.title}
              </span>
              <div
                style={{
                  fontSize: 12,
                  color: '#8a8f99',
                  fontWeight: 400,
                  marginTop: 2,
                }}
              >
                {selectedAssignment?.course}{' '}
                {selectedAssignment?.weekNumber &&
                  `· Week ${selectedAssignment.weekNumber}`}{' '}
                {selectedAssignment?.isMilestone && '· Milestone'} ·{' '}
                {submissions.length} submitted
              </div>
            </div>
            <IconButton size="small" onClick={() => setOpenSubmissions(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ paddingTop: 16 }}>
            {submissions.length === 0 ? (
              <Box textAlign="center" py={4}>
                <AssignmentIcon style={{ fontSize: 48, color: '#e0e0e0' }} />
                <Typography style={{ color: '#8a8f99', marginTop: 8 }}>
                  No submissions yet.
                </Typography>
              </Box>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className={classes.submissionCard}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={4}>
                      <Typography
                        style={{ fontWeight: 700, fontSize: 14, color: DARK }}
                      >
                        {sub.studentName}
                      </Typography>
                      <Typography style={{ fontSize: 12, color: '#8a8f99' }}>
                        Submitted:{' '}
                        {sub.submittedAt
                          ? format(parseISO(sub.submittedAt), 'MMM d, h:mm a')
                          : '—'}
                      </Typography>
                      {sub.fileUrl && (
                        <Button
                          size="small"
                          startIcon={<AttachFileIcon />}
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            textTransform: 'none',
                            fontSize: 12,
                            marginTop: 4,
                            color: CORAL,
                            padding: 0,
                          }}
                        >
                          View PDF
                        </Button>
                      )}
                      {sub.link && (
                        <Button
                          size="small"
                          href={sub.link}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            textTransform: 'none',
                            fontSize: 12,
                            marginTop: 4,
                            color: BLUE,
                            padding: 0,
                          }}
                        >
                          Open Link
                        </Button>
                      )}
                      {sub.text && (
                        <Typography
                          style={{
                            fontSize: 12,
                            color: '#5a5e6b',
                            marginTop: 6,
                            background: '#f5f5f5',
                            borderRadius: 6,
                            padding: '6px 10px',
                          }}
                        >
                          {sub.text}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Mark"
                        value={grades[sub.id] || ''}
                        onChange={(e) =>
                          setGrades({ ...grades, [sub.id]: e.target.value })
                        }
                        variant="outlined"
                        size="small"
                        type="number"
                        className={classes.gradeInput}
                        inputProps={{
                          min: 0,
                          max: selectedAssignment?.totalMarks || 100,
                        }}
                      />
                      <Typography
                        style={{ fontSize: 11, color: '#8a8f99', marginTop: 2 }}
                      >
                        /{selectedAssignment?.totalMarks || '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Feedback"
                        value={feedback[sub.id] || ''}
                        onChange={(e) =>
                          setFeedback({ ...feedback, [sub.id]: e.target.value })
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        placeholder="Write feedback for the student..."
                      />
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      sm={1}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSaveGrade(sub.id)}
                        disableElevation
                        style={{
                          background: CORAL,
                          color: '#fff',
                          borderRadius: 6,
                          textTransform: 'none',
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                </div>
              ))
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default TeacherAssignments;
