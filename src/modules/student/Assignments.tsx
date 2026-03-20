import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import GradeIcon from '@material-ui/icons/Grade';
import LockIcon from '@material-ui/icons/Lock';
import StarIcon from '@material-ui/icons/Star';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import LinkIcon from '@material-ui/icons/Link';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloseIcon from '@material-ui/icons/Close';
import {
  format,
  isPast,
  differenceInDays,
  differenceInWeeks,
  parseISO,
} from 'date-fns';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/Loading';
import { remoteRoutes } from '../../data/constants';
import { get, post } from '../../utils/ajax';
import Toast from '../../utils/Toast';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
    },

    // ── Page header ─────────────────────────────────────────────
    headerLabel: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#fe3a6a',
      marginBottom: theme.spacing(0.5),
    },
    pageTitle: {
      fontSize: '22px',
      fontWeight: 800,
      color: '#1f2025',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    pageSub: {
      fontSize: '13px',
      color: '#8a8f99',
      marginTop: 4,
      marginBottom: theme.spacing(3),
    },

    // ── Tabs ────────────────────────────────────────────────────
    tabs: {
      marginBottom: theme.spacing(3),
      borderBottom: '1px solid rgba(0,0,0,0.07)',
    },

    // ── Week group ──────────────────────────────────────────────
    weekHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(1.5, 2),
      cursor: 'pointer',
      borderRadius: 10,
      marginBottom: theme.spacing(1),
      userSelect: 'none',
      transition: 'background 0.15s',
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.03)',
      },
    },
    weekHeaderLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    weekBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 700,
      flexShrink: 0,
    },
    weekTitle: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#1f2025',
      letterSpacing: '-0.01em',
    },
    weekMeta: {
      fontSize: '12px',
      color: '#8a8f99',
      marginTop: 1,
    },
    lockedBanner: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: theme.spacing(1.5, 2),
      backgroundColor: '#f8f9fa',
      borderRadius: 10,
      border: '1px dashed #e0e0e0',
      marginBottom: theme.spacing(2),
    },

    // ── Assignment card ──────────────────────────────────────────
    assignmentCard: {
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: theme.spacing(1.5),
      overflow: 'hidden',
      transition: 'box-shadow 0.15s',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      },
    },
    cardAccentBar: {
      height: 3,
      width: '100%',
    },
    cardBody: {
      padding: theme.spacing(2, 2.5),
    },
    cardTopRow: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(0.5),
    },
    assignmentTitle: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#1f2025',
      letterSpacing: '-0.01em',
      flex: 1,
      marginRight: theme.spacing(1),
    },
    courseName: {
      fontSize: '12px',
      color: '#8a8f99',
      marginBottom: theme.spacing(0.75),
    },
    dueRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: theme.spacing(0.75),
    },
    submissionBox: {
      backgroundColor: '#f5f4f2',
      borderRadius: 8,
      padding: theme.spacing(1, 1.5),
      marginTop: theme.spacing(1),
      fontSize: 13,
      color: '#5a5e6b',
    },
    gradeBox: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#f3e5f5',
      borderRadius: 8,
      padding: theme.spacing(0.75, 1.5),
      marginTop: theme.spacing(1),
      fontSize: 13,
      fontWeight: 600,
      color: '#9c27b0',
    },

    // ── Empty state ──────────────────────────────────────────────
    emptyState: {
      textAlign: 'center',
      padding: theme.spacing(8, 4),
      color: theme.palette.text.secondary,
    },

    // ── Submit dialog ────────────────────────────────────────────
    submitTypeButton: {
      flex: 1,
      borderRadius: 8,
      textTransform: 'none',
      fontWeight: 600,
      fontSize: 13,
      padding: theme.spacing(1.5),
      border: '1.5px solid #e0e0e0',
      color: '#5a5e6b',
      '&.active': {
        borderColor: '#fe3a6a',
        color: '#fe3a6a',
        backgroundColor: 'rgba(254,58,106,0.04)',
      },
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
  }),
);

// ─── Types ───────────────────────────────────────────────────
type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'overdue';
type SubmitType = 'text' | 'link' | 'file';

interface WeekGroup {
  weekNumber: number;
  assignments: any[];
  isLocked: boolean;
  isCurrent: boolean;
  unlockDate?: Date;
}

// ─── Helpers ──────────────────────────────────────────────────
const getStatus = (a: any): AssignmentStatus => {
  if (a.submission?.score !== undefined && a.submission?.score !== null)
    return 'graded';
  if (a.submission) return 'submitted';
  if (a.dueDate && isPast(new Date(a.dueDate))) return 'overdue';
  return 'pending';
};

const STATUS_CONFIG: Record<
  AssignmentStatus,
  { label: string; bg: string; color: string; barColor: string }
> = {
  pending: {
    label: 'Pending',
    bg: '#eff6ff',
    color: '#3b82f6',
    barColor: '#3b82f6',
  },
  submitted: {
    label: 'Submitted',
    bg: '#f0fdf4',
    color: '#22c55e',
    barColor: '#22c55e',
  },
  graded: {
    label: 'Graded',
    bg: '#f5f3ff',
    color: '#9c27b0',
    barColor: '#9c27b0',
  },
  overdue: {
    label: 'Overdue',
    bg: '#fff1f2',
    color: '#fe3a6a',
    barColor: '#fe3a6a',
  },
};

/**
 * Given a courseStartDate string and weekNumber, return whether the week is currently unlocked.
 * Week 1 unlocks on the courseStartDate, week 2 one week later, etc.
 */
const calcWeekUnlocked = (
  weekNumber: number,
  courseStartDate?: string,
): boolean => {
  if (!courseStartDate) return true;
  try {
    const start = parseISO(courseStartDate);
    const unlockOn = new Date(start);
    unlockOn.setDate(unlockOn.getDate() + (weekNumber - 1) * 7);
    return new Date() >= unlockOn;
  } catch {
    return true;
  }
};

const calcCurrentWeek = (courseStartDate?: string): number => {
  if (!courseStartDate) return 1;
  try {
    const start = parseISO(courseStartDate);
    const weeks = differenceInWeeks(new Date(), start);
    return Math.max(1, weeks + 1);
  } catch {
    return 1;
  }
};

// ─── Component ────────────────────────────────────────────────
const Assignments = () => {
  const classes = useStyles();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0=By Week, 1=Pending, 2=Submitted, 3=Graded
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>(
    {},
  );

  // Submit dialog state
  const [submitDialog, setSubmitDialog] = useState<any | null>(null);
  const [submitType, setSubmitType] = useState<SubmitType>('text');
  const [submissionText, setSubmissionText] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    get(
      `${remoteRoutes.assignments}/mine`,
      (data) => setAssignments(Array.isArray(data) ? data : []),
      undefined,
      () => setLoading(false),
    );
  }, []);

  // ── Group assignments by week ─────────────────────────────
  const courseStartDate: string | undefined = assignments[0]?.courseStartDate;
  const currentWeek = calcCurrentWeek(courseStartDate);

  const weekGroups: WeekGroup[] = React.useMemo(() => {
    const map: Record<number, any[]> = {};
    assignments.forEach((a) => {
      const wk = a.weekNumber || 0;
      if (!map[wk]) map[wk] = [];
      map[wk].push(a);
    });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([wkStr, items]) => {
        const wk = Number(wkStr);
        const locked = wk > 0 && !calcWeekUnlocked(wk, courseStartDate);
        return {
          weekNumber: wk,
          assignments: items,
          isLocked: locked,
          isCurrent: wk === currentWeek,
        };
      });
  }, [assignments, courseStartDate, currentWeek]);

  // Auto-expand current week
  useEffect(() => {
    if (weekGroups.length > 0) {
      const initial: Record<number, boolean> = {};
      weekGroups.forEach((g) => {
        initial[g.weekNumber] = g.isCurrent || !g.isLocked;
      });
      setExpandedWeeks(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekGroups.length]);

  const toggleWeek = (wk: number) =>
    setExpandedWeeks((prev) => ({ ...prev, [wk]: !prev[wk] }));

  // ── Submission handlers ───────────────────────────────────
  const openSubmit = (assignment: any) => {
    setSubmitDialog(assignment);
    setSubmitType(assignment.isMilestone ? 'file' : 'text');
    setSubmissionText('');
    setSubmissionLink('');
    setSubmissionFile(null);
  };

  const handleSubmit = () => {
    if (submitType === 'text' && !submissionText.trim()) {
      Toast.error('Please write your submission.');
      return;
    }
    if (submitType === 'link' && !submissionLink.trim()) {
      Toast.error('Please enter a link.');
      return;
    }
    if (submitType === 'file' && !submissionFile) {
      Toast.error('Please attach a PDF file.');
      return;
    }

    setSubmitting(true);

    // For file submissions we would use FormData; for now send JSON
    const payload: any = {
      type: submitType,
    };
    if (submitType === 'text') payload.content = submissionText;
    if (submitType === 'link') payload.link = submissionLink;
    if (submitType === 'file' && submissionFile)
      payload.fileName = submissionFile.name;

    post(
      `${remoteRoutes.assignments}/${submitDialog.id}/submissions`,
      payload,
      () => {
        Toast.success('Assignment submitted successfully!');
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === submitDialog.id
              ? {
                  ...a,
                  submission: {
                    content: submitType === 'text' ? submissionText : undefined,
                    link: submitType === 'link' ? submissionLink : undefined,
                    fileName:
                      submitType === 'file' && submissionFile
                        ? submissionFile.name
                        : undefined,
                    submittedAt: new Date(),
                  },
                }
              : a,
          ),
        );
        setSubmitDialog(null);
        setSubmitting(false);
      },
      () => {
        Toast.error('Submission failed. Please try again.');
        setSubmitting(false);
      },
    );
  };

  if (loading) {
    return (
      <Layout title="Assignments">
        <Loading />
      </Layout>
    );
  }

  const pendingList = assignments.filter((a) =>
    ['pending', 'overdue'].includes(getStatus(a)),
  );
  const submittedList = assignments.filter((a) => getStatus(a) === 'submitted');
  const gradedList = assignments.filter((a) => getStatus(a) === 'graded');

  // ── Assignment card ────────────────────────────────────────
  const AssignmentCard = ({ assignment }: { assignment: any }) => {
    const status = getStatus(assignment);
    const cfg = STATUS_CONFIG[status];
    const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const daysLeft =
      due && status === 'pending' ? differenceInDays(due, new Date()) : null;

    return (
      <Card className={classes.assignmentCard} elevation={0}>
        <div
          className={classes.cardAccentBar}
          style={{ background: cfg.barColor }}
        />
        <div className={classes.cardBody}>
          <div className={classes.cardTopRow}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                  marginBottom: 2,
                }}
              >
                <span className={classes.assignmentTitle}>
                  {assignment.title}
                </span>
                {assignment.isMilestone && (
                  <Chip
                    size="small"
                    icon={
                      <StarIcon style={{ fontSize: 11, color: '#f59e0b' }} />
                    }
                    label="Milestone"
                    style={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      backgroundColor: '#fff7ed',
                      color: '#f59e0b',
                      border: '1px solid #fde68a',
                      borderRadius: 6,
                    }}
                  />
                )}
              </div>
              <div className={classes.courseName}>
                {assignment.course?.name ||
                  assignment.group?.name ||
                  assignment.course ||
                  'Course'}
              </div>
            </div>
            <Chip
              label={cfg.label}
              size="small"
              style={{
                height: 22,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 6,
                backgroundColor: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.color}30`,
                flexShrink: 0,
              }}
            />
          </div>

          {assignment.description && (
            <Typography
              variant="body2"
              color="textSecondary"
              style={{ fontSize: 12, marginBottom: 6 }}
            >
              {assignment.description}
            </Typography>
          )}

          {due && (
            <div className={classes.dueRow}>
              <Typography
                variant="caption"
                style={{
                  color: status === 'overdue' ? '#fe3a6a' : '#8a8f99',
                  fontSize: 12,
                }}
              >
                Due {format(due, 'EEE, dd MMM yyyy')}
                {daysLeft !== null && daysLeft >= 0 && (
                  <span style={{ marginLeft: 6, fontWeight: 600 }}>
                    {daysLeft === 0 ? '(today)' : `(${daysLeft}d left)`}
                  </span>
                )}
              </Typography>
              {assignment.totalMarks && (
                <Typography
                  variant="caption"
                  style={{ color: '#c0c4ce', fontSize: 12 }}
                >
                  · {assignment.totalMarks} marks
                </Typography>
              )}
            </div>
          )}

          {/* Submission preview */}
          {assignment.submission?.content && (
            <div className={classes.submissionBox}>
              {assignment.submission.content}
            </div>
          )}
          {assignment.submission?.link && (
            <div className={classes.submissionBox}>
              <LinkIcon
                style={{
                  fontSize: 13,
                  verticalAlign: 'middle',
                  marginRight: 4,
                }}
              />
              <a
                href={assignment.submission.link}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#3b82f6', fontSize: 12 }}
              >
                {assignment.submission.link}
              </a>
            </div>
          )}
          {assignment.submission?.fileName && (
            <div className={classes.submissionBox}>
              <AttachFileIcon
                style={{
                  fontSize: 13,
                  verticalAlign: 'middle',
                  marginRight: 4,
                }}
              />
              {assignment.submission.fileName}
            </div>
          )}

          {/* Grade + feedback */}
          {status === 'graded' && (
            <Box mt={1}>
              <div className={classes.gradeBox}>
                <GradeIcon style={{ fontSize: 16 }} />
                Score: {assignment.submission.score}
                {assignment.maxScore ? ` / ${assignment.maxScore}` : ''}
              </div>
              {assignment.submission.feedback && (
                <Typography
                  variant="body2"
                  style={{ fontSize: 12, color: '#5a5e6b', marginTop: 6 }}
                >
                  <strong>Feedback:</strong> {assignment.submission.feedback}
                </Typography>
              )}
            </Box>
          )}

          {/* Submit button */}
          {(status === 'pending' || status === 'overdue') && (
            <Box mt={1.5}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                disableElevation
                startIcon={<AssignmentTurnedInIcon style={{ fontSize: 15 }} />}
                onClick={() => openSubmit(assignment)}
                style={{ fontSize: 12, borderRadius: 7, fontWeight: 700 }}
              >
                Submit Work
              </Button>
            </Box>
          )}
        </div>
      </Card>
    );
  };

  // ── Flat list renderer (Pending / Submitted / Graded tabs) ─
  const renderFlatList = (items: any[]) => {
    if (items.length === 0) {
      return (
        <Box className={classes.emptyState}>
          <AssignmentIcon
            style={{ fontSize: 56, color: '#e0e0e0', marginBottom: 12 }}
          />
          <Typography variant="body1" style={{ color: '#8a8f99' }}>
            Nothing here yet.
          </Typography>
        </Box>
      );
    }
    return (
      <Grid container spacing={2}>
        {items.map((a) => (
          <Grid item xs={12} md={6} key={a.id}>
            <AssignmentCard assignment={a} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Layout title="Assignments">
      <div className={classes.root}>
        {/* Header */}
        <div className={classes.headerLabel}>
          <AssignmentIcon style={{ fontSize: 13 }} /> Assignments
        </div>
        <div className={classes.pageTitle}>Your Assignments</div>
        <div className={classes.pageSub}>
          {pendingList.length} pending · {submittedList.length} submitted ·{' '}
          {gradedList.length} graded
          {courseStartDate && ` · You are on Week ${currentWeek}`}
        </div>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label="By Week"
            style={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label={`Pending (${pendingList.length})`}
            style={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label={`Submitted (${submittedList.length})`}
            style={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            label={`Graded (${gradedList.length})`}
            style={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>

        {/* ── By Week tab ── */}
        {tab === 0 &&
          (assignments.length === 0 ? (
            <Box className={classes.emptyState}>
              <AssignmentIcon
                style={{ fontSize: 56, color: '#e0e0e0', marginBottom: 12 }}
              />
              <Typography
                variant="h6"
                style={{ color: '#8a8f99', fontWeight: 600 }}
              >
                No assignments yet
              </Typography>
              <Typography
                variant="body2"
                style={{ color: '#c0c4ce', marginTop: 6 }}
              >
                Assignments will appear here once your instructors post them.
              </Typography>
            </Box>
          ) : (
            weekGroups.map((group) => {
              const expanded =
                expandedWeeks[group.weekNumber] ?? !group.isLocked;
              const doneCount = group.assignments.filter((a) =>
                ['submitted', 'graded'].includes(getStatus(a)),
              ).length;
              const progress =
                group.assignments.length > 0
                  ? Math.round((doneCount / group.assignments.length) * 100)
                  : 0;

              const badgeBg = group.isLocked
                ? '#f5f4f2'
                : group.isCurrent
                ? 'linear-gradient(135deg, #fe3a6a 0%, #fe8c45 100%)'
                : '#eef2ff';
              const badgeColor = group.isLocked
                ? '#c0c4ce'
                : group.isCurrent
                ? '#fff'
                : '#6366f1';

              return (
                <Box key={group.weekNumber} mb={2}>
                  {/* Week header */}
                  <div
                    className={classes.weekHeader}
                    onClick={() =>
                      !group.isLocked && toggleWeek(group.weekNumber)
                    }
                  >
                    <div className={classes.weekHeaderLeft}>
                      <div
                        className={classes.weekBadge}
                        style={{ background: badgeBg, color: badgeColor }}
                      >
                        {group.isLocked ? (
                          <LockIcon style={{ fontSize: 16 }} />
                        ) : (
                          `W${group.weekNumber}`
                        )}
                      </div>
                      <div>
                        <div className={classes.weekTitle}>
                          {group.weekNumber === 0
                            ? 'General'
                            : `Week ${group.weekNumber}`}
                          {group.isCurrent && (
                            <Chip
                              label="Current"
                              size="small"
                              style={{
                                height: 18,
                                fontSize: 10,
                                fontWeight: 700,
                                marginLeft: 8,
                                backgroundColor: 'rgba(254,58,106,0.1)',
                                color: '#fe3a6a',
                                borderRadius: 4,
                              }}
                            />
                          )}
                        </div>
                        <div className={classes.weekMeta}>
                          {group.assignments.length} assignment
                          {group.assignments.length !== 1 ? 's' : ''}
                          {group.isLocked
                            ? ' · Locked'
                            : ` · ${doneCount}/${group.assignments.length} done`}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      {!group.isLocked && group.assignments.length > 0 && (
                        <div
                          style={{
                            width: 80,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            style={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: '#f0f0f0',
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              color: '#8a8f99',
                              minWidth: 28,
                            }}
                          >
                            {progress}%
                          </span>
                        </div>
                      )}
                      {!group.isLocked &&
                        (expanded ? (
                          <ExpandLessIcon
                            style={{ color: '#8a8f99', fontSize: 20 }}
                          />
                        ) : (
                          <ExpandMoreIcon
                            style={{ color: '#8a8f99', fontSize: 20 }}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Locked banner */}
                  {group.isLocked && (
                    <div className={classes.lockedBanner}>
                      <LockIcon style={{ fontSize: 16, color: '#c0c4ce' }} />
                      <Typography style={{ fontSize: 13, color: '#8a8f99' }}>
                        Week {group.weekNumber} unlocks when you reach that week
                        in the course.
                      </Typography>
                    </div>
                  )}

                  {/* Assignment cards */}
                  {!group.isLocked && (
                    <Collapse in={expanded}>
                      <Grid
                        container
                        spacing={2}
                        style={{ paddingLeft: 8, paddingRight: 8 }}
                      >
                        {group.assignments.map((a) => (
                          <Grid item xs={12} md={6} key={a.id}>
                            <AssignmentCard assignment={a} />
                          </Grid>
                        ))}
                      </Grid>
                    </Collapse>
                  )}
                  <Divider style={{ marginTop: 8 }} />
                </Box>
              );
            })
          ))}

        {/* ── Flat tabs ── */}
        {tab === 1 && renderFlatList(pendingList)}
        {tab === 2 && renderFlatList(submittedList)}
        {tab === 3 && renderFlatList(gradedList)}

        <Box style={{ marginBottom: 24 }} />
      </div>

      {/* ── Submit dialog ── */}
      <Dialog
        open={!!submitDialog}
        onClose={() => setSubmitDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 12,
          }}
        >
          <div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              Submit Assignment
            </span>
            <div style={{ fontSize: 12, color: '#8a8f99', marginTop: 2 }}>
              {submitDialog?.title}
            </div>
          </div>
          <IconButton size="small" onClick={() => setSubmitDialog(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent style={{ paddingTop: 20 }}>
          {submitDialog?.description && (
            <Box
              mb={2}
              p={1.5}
              style={{ backgroundColor: '#f8f9fa', borderRadius: 8 }}
            >
              <Typography
                variant="body2"
                style={{ fontSize: 13, color: '#5a5e6b' }}
              >
                {submitDialog.description}
              </Typography>
            </Box>
          )}

          {/* Submission type selector */}
          <Typography
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#8a8f99',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            How would you like to submit?
          </Typography>
          <Box display="flex" style={{ gap: 8, marginBottom: 20 }}>
            {(
              [
                {
                  type: 'text' as SubmitType,
                  label: 'Write answer',
                  icon: <AssignmentIcon style={{ fontSize: 16 }} />,
                },
                {
                  type: 'link' as SubmitType,
                  label: 'Submit link',
                  icon: <LinkIcon style={{ fontSize: 16 }} />,
                },
                {
                  type: 'file' as SubmitType,
                  label: 'Upload PDF',
                  icon: <AttachFileIcon style={{ fontSize: 16 }} />,
                },
              ] as const
            ).map(({ type, label, icon }) => (
              <Button
                key={type}
                className={`${classes.submitTypeButton}${
                  submitType === type ? ' active' : ''
                }`}
                onClick={() => setSubmitType(type)}
                startIcon={icon}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 12,
                  border:
                    submitType === type
                      ? '1.5px solid #fe3a6a'
                      : '1.5px solid #e0e0e0',
                  color: submitType === type ? '#fe3a6a' : '#5a5e6b',
                  backgroundColor:
                    submitType === type
                      ? 'rgba(254,58,106,0.04)'
                      : 'transparent',
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* Text submission */}
          {submitType === 'text' && (
            <TextField
              fullWidth
              multiline
              minRows={5}
              variant="outlined"
              label="Your answer"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Write your answer here..."
            />
          )}

          {/* Link submission */}
          {submitType === 'link' && (
            <TextField
              fullWidth
              variant="outlined"
              label="Submission link"
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              placeholder="https://github.com/yourname/project"
              helperText="Paste a link to your project, Google Drive file, or portfolio"
              InputProps={{
                startAdornment: (
                  <LinkIcon
                    style={{ fontSize: 18, color: '#8a8f99', marginRight: 8 }}
                  />
                ),
              }}
            />
          )}

          {/* File upload */}
          {submitType === 'file' && (
            <div>
              <div
                className={classes.uploadZone}
                onClick={() => fileInputRef.current?.click()}
              >
                <CloudUploadIcon style={{ fontSize: 40, color: '#c0c4ce' }} />
                <Typography
                  style={{
                    color: '#5a5e6b',
                    fontSize: 14,
                    fontWeight: 600,
                    marginTop: 8,
                  }}
                >
                  {submissionFile
                    ? submissionFile.name
                    : 'Click to upload your PDF'}
                </Typography>
                <Typography
                  style={{ color: '#c0c4ce', fontSize: 12, marginTop: 4 }}
                >
                  PDF files only — max 20MB
                </Typography>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
              />
              {submissionFile && (
                <Box
                  display="flex"
                  alignItems="center"
                  mt={1}
                  style={{ gap: 6 }}
                >
                  <AttachFileIcon style={{ fontSize: 16, color: '#22c55e' }} />
                  <Typography
                    style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}
                  >
                    {submissionFile.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setSubmissionFile(null)}
                  >
                    <CloseIcon style={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              )}
            </div>
          )}
        </DialogContent>
        <Divider />
        <DialogActions style={{ padding: '12px 24px' }}>
          <Button
            onClick={() => setSubmitDialog(null)}
            disabled={submitting}
            style={{ textTransform: 'none', color: '#8a8f99' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disableElevation
            disabled={submitting}
            style={{ textTransform: 'none', fontWeight: 700, borderRadius: 8 }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Assignments;
