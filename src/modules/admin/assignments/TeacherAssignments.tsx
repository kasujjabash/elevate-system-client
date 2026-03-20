import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  makeStyles,
  MenuItem,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
import { format, parseISO, addWeeks, isBefore, startOfDay } from 'date-fns';
import Layout from '../../../components/layout/Layout';
import { get, post } from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';
import Toast from '../../../utils/Toast';

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: theme.spacing(3) },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1f2025',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#8a8f99',
    marginTop: 2,
  },
  addButton: {
    background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': {
      background: 'linear-gradient(90deg, #d4183f 0%, #d4712e 100%)',
      boxShadow: '0 4px 16px rgba(254,58,106,0.3)',
    },
  },
  tabs: {
    marginBottom: theme.spacing(3),
    borderBottom: '1px solid #f0f0f0',
  },
  tableCard: {
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
  },
  tableHeadCell: {
    fontWeight: 700,
    fontSize: '12px',
    color: '#8a8f99',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: '#f8f9fa',
    padding: '10px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  tableCell: {
    fontSize: '13px',
    color: '#1f2025',
    padding: '12px 16px',
    borderBottom: '1px solid #f8f8f8',
  },
  weekBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    backgroundColor: '#eef2ff',
    color: '#6366f1',
    border: '1px solid #c7d2fe',
  },
  milestoneBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    backgroundColor: '#fff7ed',
    color: '#f59e0b',
    border: '1px solid #fde68a',
    marginLeft: 6,
  },
  uploadZone: {
    border: '2px dashed #e0e0e0',
    borderRadius: 10,
    padding: theme.spacing(3),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    '&:hover': { borderColor: '#fe3a6a' },
  },
  fileChip: {
    marginTop: 8,
    marginRight: 4,
    borderRadius: 6,
    fontSize: 12,
  },
  gradeInput: { width: 80 },
  submissionCard: {
    border: '1px solid #f0f0f0',
    borderRadius: 10,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#8a8f99',
    marginBottom: 6,
    display: 'block',
  },
}));

// Build a 1–52 week array
const WEEK_OPTIONS = Array.from({ length: 52 }, (_, i) => i + 1);

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: { bg: '#eff6ff', color: '#3b82f6' },
  submitted: { bg: '#fff7ed', color: '#f59e0b' },
  graded: { bg: '#f0fdf4', color: '#22c55e' },
  closed: { bg: '#f8f8f8', color: '#8a8f99' },
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

/** Returns true if weekNumber is currently unlocked given courseStartDate */
const isWeekUnlocked = (
  weekNumber: number,
  courseStartDate: string,
): boolean => {
  if (!courseStartDate) return true;
  const startDate = parseISO(courseStartDate);
  const weekUnlockDate = addWeeks(startDate, weekNumber - 1);
  return !isBefore(startOfDay(new Date()), startOfDay(weekUnlockDate));
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
    // Load courses for the dropdown
    get(
      remoteRoutes.coursesBase,
      (data: any[]) => setCourses(Array.isArray(data) ? data : []),
      undefined,
      undefined,
    );
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
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
        setSubmissions(Array.isArray(data) ? data : []);
        const g: Record<string, string> = {};
        const f: Record<string, string> = {};
        (Array.isArray(data) ? data : []).forEach((s: any) => {
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

  const filteredAssignments = assignments.filter((a) => {
    if (tab === 1) return a.status === 'open';
    if (tab === 2) return a.status === 'closed';
    if (tab === 3) return a.isMilestone;
    return true;
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
        <div className={classes.header}>
          <div>
            <div className={classes.pageTitle}>Assignments</div>
            <div className={classes.pageSubtitle}>
              Create weekly assignments, upload resources, and manage student
              submissions
            </div>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={() => setOpenNew(true)}
          >
            New Assignment
          </Button>
        </div>

        {/* Stats */}
        <Grid container spacing={2} style={{ marginBottom: 24 }}>
          {[
            {
              label: 'Total Assignments',
              value: assignments.length,
              color: '#6366f1',
              bg: '#eef2ff',
            },
            {
              label: 'Currently Open',
              value: openCount,
              color: '#3b82f6',
              bg: '#eff6ff',
            },
            {
              label: 'Pending Grading',
              value: pendingGrading,
              color: '#f59e0b',
              bg: '#fff7ed',
            },
            {
              label: 'Milestones',
              value: milestoneCount,
              color: '#f59e0b',
              bg: '#fff7ed',
            },
          ].map((stat) => (
            <Grid item xs={6} sm={3} key={stat.label}>
              <Card
                style={{
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  border: '1px solid #f0f0f0',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: stat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AssignmentIcon style={{ color: stat.color, fontSize: 22 }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: '#1f2025',
                      lineHeight: 1,
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#8a8f99', marginTop: 4 }}>
                    {stat.label}
                  </div>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All" style={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab
            label="Open"
            style={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label="Closed"
            style={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label={`Milestones (${milestoneCount})`}
            style={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>

        {/* Table */}
        <Card className={classes.tableCard}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHeadCell}>
                  Assignment
                </TableCell>
                <TableCell className={classes.tableHeadCell}>Week</TableCell>
                <TableCell className={classes.tableHeadCell}>Course</TableCell>
                <TableCell className={classes.tableHeadCell}>Hub</TableCell>
                <TableCell className={classes.tableHeadCell}>
                  Due Date
                </TableCell>
                <TableCell className={classes.tableHeadCell}>
                  Submissions
                </TableCell>
                <TableCell className={classes.tableHeadCell}>Status</TableCell>
                <TableCell className={classes.tableHeadCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssignments.map((a) => {
                const sc = STATUS_COLORS[a.status] || {
                  bg: '#f8f8f8',
                  color: '#8a8f99',
                };
                const submittedPct =
                  a.totalStudents > 0
                    ? Math.round(
                        ((a.submissionsCount || 0) / a.totalStudents) * 100,
                      )
                    : 0;
                const unlocked = a.courseStartDate
                  ? isWeekUnlocked(a.weekNumber, a.courseStartDate)
                  : true;
                return (
                  <TableRow key={a.id} hover>
                    <TableCell className={classes.tableCell}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        <strong>{a.title}</strong>
                        {a.isMilestone && (
                          <span className={classes.milestoneBadge}>
                            <StarIcon style={{ fontSize: 10 }} /> Milestone
                          </span>
                        )}
                        {!unlocked && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: 10,
                              color: '#8a8f99',
                            }}
                          >
                            <LockIcon style={{ fontSize: 10 }} /> Locked
                          </span>
                        )}
                      </div>
                      {a.filesCount > 0 && (
                        <span style={{ fontSize: 11, color: '#8a8f99' }}>
                          <AttachFileIcon
                            style={{ fontSize: 11, verticalAlign: 'middle' }}
                          />{' '}
                          {a.filesCount} file(s)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {a.weekNumber ? (
                        <span className={classes.weekBadge}>
                          Wk {a.weekNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#c0c4ce' }}>—</span>
                      )}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {a.course}
                    </TableCell>
                    <TableCell className={classes.tableCell}>{a.hub}</TableCell>
                    <TableCell className={classes.tableCell}>
                      {a.dueDate
                        ? format(parseISO(a.dueDate), 'MMM d, yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={submittedPct}
                          style={{
                            flex: 1,
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: '#f0f0f0',
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: '#8a8f99',
                            minWidth: 40,
                          }}
                        >
                          {a.submissionsCount || 0}/{a.totalStudents || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <Chip
                        label={a.status || 'open'}
                        size="small"
                        style={{
                          backgroundColor: sc.bg,
                          color: sc.color,
                          fontWeight: 600,
                          fontSize: 11,
                          borderRadius: 6,
                          height: 22,
                          border: `1px solid ${sc.color}30`,
                        }}
                      />
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<GradeIcon style={{ fontSize: 14 }} />}
                        onClick={() => handleViewSubmissions(a)}
                        style={{
                          borderRadius: 6,
                          fontSize: 12,
                          textTransform: 'none',
                          borderColor: '#e0e0e0',
                          color: '#1f2025',
                        }}
                      >
                        Submissions
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredAssignments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className={classes.tableCell}
                    style={{
                      textAlign: 'center',
                      color: '#8a8f99',
                      padding: 40,
                    }}
                  >
                    No assignments yet. Click "New Assignment" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* ── Create assignment dialog ── */}
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
            <span
              style={{
                fontWeight: 700,
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              Create New Assignment
            </span>
            <IconButton size="small" onClick={() => setOpenNew(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ paddingTop: 20 }}>
            <Grid container spacing={2}>
              {/* Basic info */}
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

              {/* Dates + marks */}
              <Grid item xs={12}>
                <Divider style={{ margin: '4px 0 12px' }} />
                <span className={classes.sectionLabel}>Details</span>
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
                  helperText="Line breaks are preserved exactly as typed."
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
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1f2025',
                      }}
                    >
                      Milestone Assignment
                      <span
                        style={{
                          fontWeight: 400,
                          color: '#8a8f99',
                          marginLeft: 6,
                        }}
                      >
                        — requires PDF or link submission
                      </span>
                    </span>
                  }
                />
              </Grid>

              {/* File upload */}
              <Grid item xs={12}>
                <span className={classes.sectionLabel}>Attach resources</span>
                <div
                  className={classes.uploadZone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUploadIcon style={{ fontSize: 36, color: '#c0c4ce' }} />
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
                        onDelete={() => removeFile(i)}
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
              style={{
                background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
                color: '#fff',
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 'none',
              }}
            >
              {uploading ? 'Creating...' : 'Create Assignment'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Submissions & grading dialog ── */}
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
              <span
                style={{
                  fontWeight: 700,
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                }}
              >
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
                {selectedAssignment?.course} · {selectedAssignment?.hub} Hub
                {selectedAssignment?.weekNumber &&
                  ` · Week ${selectedAssignment.weekNumber}`}
                {selectedAssignment?.isMilestone && ' · Milestone'}
                {' · '}
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
                <Card key={sub.id} className={classes.submissionCard}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={4}>
                      <Typography
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#1f2025',
                        }}
                      >
                        {sub.studentName}
                      </Typography>
                      <Typography style={{ fontSize: 12, color: '#8a8f99' }}>
                        Submitted:{' '}
                        {sub.submittedAt
                          ? format(parseISO(sub.submittedAt), 'MMM d, h:mm a')
                          : '—'}
                      </Typography>
                      {/* File submission */}
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
                            color: '#fe3a6a',
                            padding: 0,
                          }}
                        >
                          View PDF
                        </Button>
                      )}
                      {/* Link submission */}
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
                            color: '#3b82f6',
                            padding: 0,
                          }}
                        >
                          Open Link
                        </Button>
                      )}
                      {/* Text submission */}
                      {sub.text && (
                        <Typography
                          style={{
                            fontSize: 12,
                            color: '#5a5e6b',
                            marginTop: 6,
                            background: '#f8f9fa',
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
                        style={{
                          background:
                            'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
                          color: '#fff',
                          borderRadius: 6,
                          textTransform: 'none',
                          fontSize: 12,
                          boxShadow: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              ))
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default TeacherAssignments;
