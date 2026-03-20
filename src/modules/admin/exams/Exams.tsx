import React, { useEffect, useState } from 'react';
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
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ScheduleIcon from '@material-ui/icons/Schedule';
import AssignmentIcon from '@material-ui/icons/Assignment';
import CloseIcon from '@material-ui/icons/Close';
import { format, parseISO } from 'date-fns';
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
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1f2025',
    fontFamily: '"Inter Tight", sans-serif',
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
  statCard: {
    borderRadius: 12,
    padding: theme.spacing(2.5),
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    border: '1px solid #f0f0f0',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1f2025',
    lineHeight: 1,
    fontFamily: '"Inter Tight", sans-serif',
  },
  statLabel: {
    fontSize: '13px',
    color: '#8a8f99',
    marginTop: 4,
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
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1f2025',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    fontFamily: '"Inter Tight", sans-serif',
  },
  resultsCard: {
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
    marginTop: theme.spacing(2),
  },
}));

const HUB_OPTIONS = ['Katanga', 'Kosovo', 'Jinja', 'Namayemba', 'Lyantode'];
const COURSE_OPTIONS = [
  'Graphic Design',
  'Website Development',
  'Film & Photography',
  'ALX Course',
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: '#eff6ff', color: '#3b82f6' },
  ongoing: { bg: '#fff7ed', color: '#f59e0b' },
  completed: { bg: '#f0fdf4', color: '#22c55e' },
  cancelled: { bg: '#fef2f2', color: '#ef4444' },
};

const EMPTY_FORM = {
  title: '',
  course: '',
  hub: '',
  date: '',
  time: '',
  duration: '',
  totalMarks: '',
  instructions: '',
};

const Exams = () => {
  const classes = useStyles();
  const [exams, setExams] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [openNew, setOpenNew] = useState(false);
  const [openResults, setOpenResults] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const fetchExams = () => {
    get(
      remoteRoutes.exams,
      (data: any[]) => setExams(Array.isArray(data) ? data : []),
      undefined,
      undefined,
    );
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreate = () => {
    if (!form.title || !form.course || !form.hub || !form.date) {
      Toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    post(
      remoteRoutes.exams,
      form,
      () => {
        Toast.info('Exam scheduled successfully');
        setOpenNew(false);
        setForm(EMPTY_FORM);
        fetchExams();
      },
      undefined,
      () => setLoading(false),
    );
  };

  const handleViewResults = (exam: any) => {
    setSelectedExam(exam);
    get(
      `${remoteRoutes.examResults}?examId=${exam.id}`,
      (data: any[]) => setExamResults(Array.isArray(data) ? data : []),
      undefined,
      undefined,
    );
    setOpenResults(true);
  };

  // Stats from exam list
  const scheduled = exams.filter((e) => e.status === 'scheduled').length;
  const completed = exams.filter((e) => e.status === 'completed').length;
  const total = exams.length;

  return (
    <Layout>
      <div className={classes.root}>
        {/* Header */}
        <div className={classes.header}>
          <div>
            <div className={classes.title}>Exam Management</div>
            <div style={{ fontSize: 14, color: '#8a8f99', marginTop: 2 }}>
              Schedule exams, track results, and manage student performance
            </div>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className={classes.addButton}
            onClick={() => setOpenNew(true)}
          >
            Schedule Exam
          </Button>
        </div>

        {/* Stats */}
        <Grid container spacing={2} style={{ marginBottom: 24 }}>
          <Grid item xs={12} sm={4}>
            <Card className={classes.statCard}>
              <div
                className={classes.statIcon}
                style={{ background: '#eff6ff' }}
              >
                <AssignmentIcon style={{ color: '#3b82f6', fontSize: 22 }} />
              </div>
              <div>
                <div className={classes.statNumber}>{total}</div>
                <div className={classes.statLabel}>Total Exams</div>
              </div>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card className={classes.statCard}>
              <div
                className={classes.statIcon}
                style={{ background: '#fff7ed' }}
              >
                <ScheduleIcon style={{ color: '#f59e0b', fontSize: 22 }} />
              </div>
              <div>
                <div className={classes.statNumber}>{scheduled}</div>
                <div className={classes.statLabel}>Upcoming / Scheduled</div>
              </div>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card className={classes.statCard}>
              <div
                className={classes.statIcon}
                style={{ background: '#f0fdf4' }}
              >
                <CheckCircleOutlineIcon
                  style={{ color: '#22c55e', fontSize: 22 }}
                />
              </div>
              <div>
                <div className={classes.statNumber}>{completed}</div>
                <div className={classes.statLabel}>Completed</div>
              </div>
            </Card>
          </Grid>
        </Grid>

        {/* Exam list */}
        <Typography className={classes.sectionTitle}>All Exams</Typography>
        <Card className={classes.tableCard}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHeadCell}>Exam</TableCell>
                <TableCell className={classes.tableHeadCell}>Course</TableCell>
                <TableCell className={classes.tableHeadCell}>Hub</TableCell>
                <TableCell className={classes.tableHeadCell}>Date</TableCell>
                <TableCell className={classes.tableHeadCell}>
                  Duration
                </TableCell>
                <TableCell className={classes.tableHeadCell}>Status</TableCell>
                <TableCell className={classes.tableHeadCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className={classes.tableCell}
                    style={{
                      textAlign: 'center',
                      color: '#8a8f99',
                      padding: 32,
                    }}
                  >
                    No exams scheduled yet. Click "Schedule Exam" to add one.
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => {
                  const sc = STATUS_COLORS[exam.status] || {
                    bg: '#f8f8f8',
                    color: '#8a8f99',
                  };
                  return (
                    <TableRow key={exam.id} hover>
                      <TableCell className={classes.tableCell}>
                        <strong>{exam.title}</strong>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {exam.course}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {exam.hub}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {exam.date
                          ? format(parseISO(exam.date), 'MMM d, yyyy')
                          : '—'}
                        {exam.time && (
                          <span style={{ color: '#8a8f99', marginLeft: 6 }}>
                            {exam.time}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {exam.duration ? `${exam.duration} min` : '—'}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <Chip
                          label={exam.status || 'scheduled'}
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
                          style={{
                            borderRadius: 6,
                            fontSize: 12,
                            textTransform: 'none',
                            borderColor: '#e0e0e0',
                            color: '#1f2025',
                          }}
                          onClick={() => handleViewResults(exam)}
                        >
                          View Results
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Create exam dialog */}
        <Dialog
          open={openNew}
          onClose={() => setOpenNew(false)}
          maxWidth="sm"
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
                fontFamily: '"Inter Tight", sans-serif',
              }}
            >
              Schedule New Exam
            </span>
            <IconButton size="small" onClick={() => setOpenNew(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ paddingTop: 20 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Exam Title *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Course *"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  variant="outlined"
                  fullWidth
                  size="small"
                >
                  {COURSE_OPTIONS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Hub *"
                  value={form.hub}
                  onChange={(e) => setForm({ ...form, hub: e.target.value })}
                  variant="outlined"
                  fullWidth
                  size="small"
                >
                  {HUB_OPTIONS.map((h) => (
                    <MenuItem key={h} value={h}>
                      {h} Hub
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date *"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  variant="outlined"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  variant="outlined"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Marks"
                  type="number"
                  value={form.totalMarks}
                  onChange={(e) =>
                    setForm({ ...form, totalMarks: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Instructions / Notes"
                  value={form.instructions}
                  onChange={(e) =>
                    setForm({ ...form, instructions: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                />
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
              disabled={loading}
              style={{
                background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
                color: '#fff',
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 'none',
              }}
            >
              Schedule Exam
            </Button>
          </DialogActions>
        </Dialog>

        {/* Results dialog */}
        <Dialog
          open={openResults}
          onClose={() => setOpenResults(false)}
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
                fontFamily: '"Inter Tight", sans-serif',
              }}
            >
              Results: {selectedExam?.title}
            </span>
            <IconButton size="small" onClick={() => setOpenResults(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ paddingTop: 16, paddingBottom: 16 }}>
            {examResults.length === 0 ? (
              <Box textAlign="center" py={4}>
                <AssignmentIcon style={{ fontSize: 48, color: '#e0e0e0' }} />
                <Typography style={{ color: '#8a8f99', marginTop: 8 }}>
                  No results submitted yet for this exam.
                </Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: '#8a8f99',
                      }}
                    >
                      Student
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: '#8a8f99',
                      }}
                    >
                      Score
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: '#8a8f99',
                      }}
                    >
                      Grade
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: '#8a8f99',
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examResults.map((r, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{r.studentName}</TableCell>
                      <TableCell>
                        {r.score}/{selectedExam?.totalMarks || '—'}
                      </TableCell>
                      <TableCell>
                        <strong>{r.grade}</strong>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.status || 'graded'}
                          size="small"
                          style={{
                            backgroundColor: '#f0fdf4',
                            color: '#22c55e',
                            fontWeight: 600,
                            fontSize: 11,
                            borderRadius: 6,
                            height: 20,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Exams;
