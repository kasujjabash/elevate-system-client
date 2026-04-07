import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import DescriptionIcon from '@material-ui/icons/Description';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import LockIcon from '@material-ui/icons/Lock';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import MenuBookIcon from '@material-ui/icons/MenuBook';
import { useHistory, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { localRoutes, remoteRoutes } from '../../data/constants';
import { get, post } from '../../utils/ajax';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';
const DONE = '#10b981';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    page: {
      minHeight: '100%',
      background: '#f8f7f5',
      display: 'flex',
      flexDirection: 'column',
    },

    /* ── Top header ─────────────────────────────────── */
    header: {
      background: '#fff',
      borderBottom: '1px solid #ede8e3',
      padding: '16px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexShrink: 0,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      [theme.breakpoints.down('sm')]: { padding: '12px 16px' },
    },
    backBtn: {
      color: '#9ca3af',
      padding: 6,
      '&:hover': { color: CORAL, background: '#fff0f3', borderRadius: 8 },
    },
    headerMeta: {
      flex: 1,
      minWidth: 0,
    },
    courseTitle: {
      fontSize: 16,
      fontWeight: 800,
      color: DARK,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      whiteSpace: 'nowrap' as any,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    progressText: {
      fontSize: 11,
      color: '#9ca3af',
      marginTop: 4,
    },

    /* ── Circular progress ring ─────────────────────── */
    ringPct: {
      fontSize: 13,
      fontWeight: 800,
      color: DARK,
      lineHeight: 1,
    },
    ringDone: {
      fontSize: 9,
      color: '#9ca3af',
      letterSpacing: '0.04em',
      marginTop: 2,
    },

    /* ── Body ───────────────────────────────────────── */
    body: {
      flex: 1,
      padding: '24px 28px 48px',
      maxWidth: 840,
      width: '100%',
      alignSelf: 'center' as any,
      boxSizing: 'border-box' as any,
      [theme.breakpoints.down('sm')]: { padding: '16px 12px 32px' },
    },

    sectionTitle: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as any,
      color: '#b0a8a0',
      marginBottom: 14,
      marginTop: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      '&::after': {
        content: '""',
        flex: 1,
        height: 1,
        background: '#ede8e3',
      },
    },

    /* ── Module accordion ───────────────────────────── */
    moduleCard: {
      background: '#fff',
      border: '1px solid #ede8e3',
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
      transition: 'box-shadow 0.15s, border-color 0.15s',
    },
    moduleCardOpen: {
      borderColor: `${CORAL}55`,
      boxShadow: `0 6px 28px rgba(254,58,106,0.08)`,
    },
    moduleCardDone: {
      borderColor: '#a7f3d0',
    },
    moduleHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px 20px',
      cursor: 'pointer',
      gap: 14,
      '&:hover': { background: '#fdfcfb' },
      transition: 'background 0.1s',
    },
    moduleHeaderLocked: {
      cursor: 'default',
      '&:hover': { background: 'transparent' },
    },

    /* small circle showing module progress */
    moduleRingWrap: {
      position: 'relative' as any,
      width: 44,
      height: 44,
      flexShrink: 0,
    },
    moduleRingTrack: {
      position: 'absolute' as any,
      top: 0,
      left: 0,
      color: '#f0ece9',
    },
    moduleRingFill: {
      position: 'absolute' as any,
      top: 0,
      left: 0,
    },
    moduleRingLabel: {
      position: 'absolute' as any,
      top: 0,
      left: 0,
      width: 44,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    moduleRingPct: {
      fontSize: 10,
      fontWeight: 800,
      color: DARK,
      lineHeight: 1,
    },

    moduleMeta: { flex: 1, minWidth: 0 },
    moduleTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: DARK,
      letterSpacing: '-0.01em',
    },
    moduleTitleDone: { color: '#6b7280' },
    moduleSub: {
      fontSize: 12,
      color: '#9ca3af',
      marginTop: 3,
      display: 'flex',
      gap: 10,
    },
    moduleSubItem: { display: 'inline-flex', alignItems: 'center', gap: 3 },
    moduleDoneBadge: {
      fontSize: 11,
      fontWeight: 700,
      background: 'rgba(16,185,129,0.1)',
      color: DONE,
      borderRadius: 20,
      padding: '3px 10px',
    },
    moduleLockedBadge: {
      fontSize: 11,
      fontWeight: 700,
      background: '#f3f4f6',
      color: '#9ca3af',
      borderRadius: 20,
      padding: '3px 10px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    },
    expandChevron: {
      color: '#c9c4bf',
      transition: 'transform 0.22s',
      flexShrink: 0,
    },
    expandChevronOpen: {
      transform: 'rotate(180deg)',
    },

    /* ── Module body (when open) ─────────────────────── */
    moduleBody: {
      borderTop: '1px solid #f0ece9',
      padding: '16px 20px 20px',
      background: '#fdfcfb',
    },

    /* ── Lesson row ─────────────────────────────────── */
    lessonCard: {
      background: '#fff',
      border: '1px solid #ede8e3',
      borderRadius: 12,
      marginBottom: 8,
      overflow: 'hidden',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    },
    lessonCardOpen: {
      borderColor: CORAL,
      boxShadow: `0 3px 18px rgba(254,58,106,0.09)`,
    },
    lessonCardDone: {
      borderColor: '#a7f3d0',
      background: '#f0fdf4',
    },
    lessonRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      gap: 12,
      cursor: 'pointer',
      '&:hover': { background: '#fdfcfb' },
    },
    lessonIcon: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    lessonMeta: { flex: 1, minWidth: 0 },
    lessonTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: DARK,
      lineHeight: 1.3,
    },
    lessonTitleDone: {
      color: '#9ca3af',
      textDecoration: 'line-through',
    },
    lessonSub: {
      fontSize: 11,
      color: '#9ca3af',
      marginTop: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    lessonSubItem: { display: 'inline-flex', alignItems: 'center', gap: 3 },

    /* ── Expanded content ───────────────────────────── */
    lessonContent: {
      borderTop: '1px solid #f0ece9',
      padding: '18px 18px 22px',
      background: '#fff',
    },
    contentSectionLabel: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as any,
      color: '#c9c4bf',
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      '&::after': {
        content: '""',
        flex: 1,
        height: 1,
        background: '#f0ece9',
      },
    },
    videoBox: {
      position: 'relative' as any,
      paddingBottom: '56.25%',
      borderRadius: 12,
      overflow: 'hidden',
      background: '#000',
      marginBottom: 20,
      boxShadow: '0 6px 30px rgba(0,0,0,0.12)',
    },
    videoIframe: {
      position: 'absolute' as any,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: 'none',
    },
    prose: {
      fontSize: 14,
      lineHeight: 1.85,
      color: '#374151',
      marginBottom: 20,
      '& p': {
        marginBottom: 12,
        marginTop: 0,
        '&:last-child': { marginBottom: 0 },
      },
      '& h2': {
        fontSize: 17,
        fontWeight: 700,
        color: DARK,
        marginTop: 24,
        marginBottom: 8,
        paddingBottom: 5,
        borderBottom: `2px solid #f3e4db`,
      },
      '& h3': {
        fontSize: 14,
        fontWeight: 700,
        color: '#1f2937',
        marginTop: 16,
        marginBottom: 5,
      },
      '& pre': {
        background: '#1e1e2e',
        color: '#cdd6f4',
        padding: '12px 16px',
        borderRadius: 10,
        overflowX: 'auto',
        fontSize: 13,
        lineHeight: 1.65,
        marginBottom: 12,
        fontFamily: '"Fira Code",monospace',
      },
      '& code': {
        background: '#fff0f3',
        color: CORAL,
        padding: '1px 5px',
        borderRadius: 4,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: '"Fira Code",monospace',
      },
      '& ul,& ol': { paddingLeft: 20, marginBottom: 10 },
      '& li': { marginBottom: 4 },
      '& blockquote': {
        borderLeft: `4px solid ${CORAL}`,
        margin: '16px 0',
        background: '#fff8f9',
        borderRadius: '0 8px 8px 0',
        padding: '10px 14px',
        color: '#6b7280',
        fontStyle: 'italic',
      },
      '& strong': { color: DARK, fontWeight: 700 },
      '& a': { color: CORAL, textDecoration: 'underline' },
      '& img': { maxWidth: '100%', borderRadius: 8, margin: '8px 0' },
    },
    actionRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as any,
      gap: 10,
      marginTop: 6,
    },
    completeBtn: {
      background: `linear-gradient(135deg,${CORAL},${ORANGE})`,
      color: '#fff',
      borderRadius: 10,
      padding: '9px 26px',
      fontWeight: 700,
      fontSize: 14,
      boxShadow: `0 4px 14px rgba(254,58,106,0.28)`,
      '&:hover': { opacity: 0.9 },
      '&:disabled': { opacity: 0.6 },
    },
    doneBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: DONE,
      fontWeight: 700,
      fontSize: 14,
    },
    doneNote: { fontSize: 12, color: '#9ca3af', fontWeight: 400 },

    /* ── Assignment card ────────────────────────────── */
    assignCard: {
      borderRadius: 12,
      overflow: 'hidden',
      border: `1px solid rgba(254,140,69,0.3)`,
      marginBottom: 8,
    },
    assignBanner: {
      background: `linear-gradient(135deg,${CORAL},${ORANGE})`,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer',
    },
    assignIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 9,
      background: 'rgba(255,255,255,0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    assignBannerMeta: { flex: 1 },
    assignBannerLabel: {
      fontSize: 10,
      fontWeight: 700,
      color: 'rgba(255,255,255,0.7)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as any,
    },
    assignBannerTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: '#fff',
      lineHeight: 1.2,
    },
    assignBody: { background: '#fff', padding: '18px 20px' },
    submitBtn: {
      background: `linear-gradient(135deg,${ORANGE},${CORAL})`,
      color: '#fff',
      borderRadius: 10,
      padding: '9px 26px',
      fontWeight: 700,
      fontSize: 14,
      '&:hover': { opacity: 0.9 },
      '&:disabled': { opacity: 0.6 },
    },

    /* ── Loading / empty ─────────────────────────────── */
    center: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48,
    },

    /* ── Resources section ──────────────────────────── */
    resourcesSection: { marginTop: 24, marginBottom: 8 },
    resourceRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: '#fff',
      border: '1px solid #ede8e3',
      borderRadius: 10,
      padding: '12px 16px',
      marginBottom: 8,
      '&:hover': { background: '#fdf9f7' },
    },
    resourceIcon: {
      width: 34,
      height: 34,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    resourceName: { flex: 1, fontSize: 13, fontWeight: 600, color: DARK },
    resourceType: {
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 4,
      padding: '2px 7px',
      color: '#fff',
    },
    resourceDownloadBtn: {
      fontSize: 11,
      fontWeight: 600,
      color: CORAL,
      textTransform: 'none' as any,
      padding: '3px 10px',
      border: '1px solid rgba(254,58,106,0.2)',
      borderRadius: 6,
      '&:hover': { background: 'rgba(254,58,106,0.06)' },
    },
  }),
);

/* ── helpers ─────────────────────────────────────────── */
function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt)
    return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  return url;
}

/** Convert plain text (with newlines) to HTML paragraphs.
 *  If the body already contains HTML tags, return as-is. */
function toHtml(text: string): string {
  if (!text) return '';
  // Already contains HTML tags — trust it as-is
  if (/<[a-z][\s\S]*?>/i.test(text)) return text;
  // Plain text: double newline → new paragraph, single newline → <br>
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function typeColor(type: string) {
  if (type === 'Video') return '#0ea5e9';
  if (type === 'Assignment') return ORANGE;
  if (type === 'Quiz') return '#f59e0b';
  if (type === 'Resource') return DONE;
  return CORAL;
}

function typeIcon(type: string) {
  if (type === 'Video') return PlayCircleFilledIcon;
  if (type === 'Assignment') return AssignmentIcon;
  return DescriptionIcon;
}

/* ── Circular ring component ─────────────────────────── */
interface RingProps {
  value: number;
  size: number;
  thickness: number;
  color: string;
  trackColor: string;
  label?: React.ReactNode;
}
function Ring({ value, size, thickness, color, trackColor, label }: RingProps) {
  return (
    <div
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        style={{ color: trackColor, position: 'absolute', top: 0, left: 0 }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        style={{ color, position: 'absolute', top: 0, left: 0 }}
      />
      {label && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

/* ── Types ───────────────────────────────────────────── */
interface IModule {
  id: number;
  title: string;
  weekNumber: number;
  contentCount: number;
  completedCount?: number;
  contents: IContentItem[];
}
interface IContentItem {
  id: number;
  title: string;
  type: string;
  order: number;
  durationMin?: number;
  completed?: boolean;
}
interface IContentFull {
  id: number;
  title: string;
  body?: string;
  videoUrl?: string;
  type: string;
  durationMin?: number;
  completed?: boolean;
  moduleId: number;
  weekNumber: number;
  courseId: number;
  courseTitle: string;
}

/* ── Component ───────────────────────────────────────── */
const CoursePlayer = () => {
  const classes = useStyles();
  const history = useHistory();
  const { courseId } = useParams<{ courseId: string }>();

  const [modules, setModules] = useState<IModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [openModuleId, setOpenModuleId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedAssign, setExpandedAssign] = useState<number | null>(null);
  const [contentMap, setContentMap] = useState<Record<number, IContentFull>>(
    {},
  );
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [resources, setResources] = useState<
    Array<{ id: number | string; title: string; type: string; url?: string }>
  >([]);

  const baseUrl = remoteRoutes.coursesBase;

  const totalItems = modules.reduce((s, m) => s + m.contentCount, 0);
  const completedItems = modules.reduce(
    (s, m) => s + (m.completedCount ?? 0),
    0,
  );
  const overallPct =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const currentWeekIdx = (() => {
    const i = modules.findIndex(
      (m) => (m.completedCount ?? 0) < m.contentCount,
    );
    return i === -1 ? modules.length - 1 : i;
  })();
  const isLocked = (idx: number) => idx > currentWeekIdx;

  /* load content on demand */
  const fetchContent = useCallback(
    (itemId: number, onDone?: (d: IContentFull) => void) => {
      if (contentMap[itemId]) {
        onDone?.(contentMap[itemId]);
        return;
      }
      setLoadingId(itemId);
      get(
        `${baseUrl}/content/${itemId}`,
        (data: IContentFull) => {
          if (data.courseTitle) setCourseTitle(data.courseTitle);
          setContentMap((prev) => ({ ...prev, [data.id]: data }));
          setLoadingId(null);
          onDone?.(data);
        },
        undefined,
        () => setLoadingId(null),
      );
    },
    [baseUrl, contentMap],
  );

  const openLesson = useCallback(
    (item: IContentItem) => {
      setExpandedId((prev) => (prev === item.id ? null : item.id));
      setExpandedAssign(null);
      fetchContent(item.id);
    },
    [fetchContent],
  );

  const openAssignment = useCallback(
    (item: IContentItem) => {
      setExpandedAssign((prev) => (prev === item.id ? null : item.id));
      setExpandedId(null);
      fetchContent(item.id);
    },
    [fetchContent],
  );

  const handleMarkComplete = (item: IContentItem) => {
    const full = contentMap[item.id];
    if (!full || full.completed) return;
    setMarkingId(item.id);
    post(
      `${baseUrl}/content/${item.id}/complete`,
      {},
      () => {
        setContentMap((prev) => ({
          ...prev,
          [item.id]: { ...prev[item.id], completed: true },
        }));
        setModules((prev) =>
          prev.map((m) =>
            m.id === full.moduleId
              ? {
                  ...m,
                  completedCount: (m.completedCount ?? 0) + 1,
                  contents: m.contents.map((c) =>
                    c.id === item.id ? { ...c, completed: true } : c,
                  ),
                }
              : m,
          ),
        );
        setMarkingId(null);
      },
      undefined,
      () => setMarkingId(null),
    );
  };

  const loadModules = useCallback(() => {
    if (!courseId) return;
    setLoadingModules(true);
    get(
      `${baseUrl}/${courseId}/modules`,
      (data: IModule[]) => {
        setModules(data);
        const cur =
          data.find((m) => (m.completedCount ?? 0) < m.contentCount) ?? data[0];
        if (cur) setOpenModuleId(cur.id);
        setLoadingModules(false);
      },
      undefined,
      () => setLoadingModules(false),
    );
  }, [courseId, baseUrl]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  // Fetch course resources
  useEffect(() => {
    if (!courseId) return;
    get(
      `${remoteRoutes.courseResources}/${courseId}/resources`,
      (data: any) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setResources(list);
      },
    );
  }, [courseId]);

  /* ── render ── */
  return (
    <Layout title={courseTitle || 'Course'}>
      <div className={classes.page}>
        {/* ══ HEADER ══════════════════════════════════ */}
        <div className={classes.header}>
          <Tooltip title="Back to My Courses">
            <IconButton
              className={classes.backBtn}
              size="small"
              onClick={() => history.push(localRoutes.myCourses)}
            >
              <ArrowBackIcon style={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <div className={classes.headerMeta}>
            <div className={classes.courseTitle}>
              {courseTitle || 'Loading…'}
            </div>
            <div className={classes.progressText}>
              {completedItems} of {totalItems} lessons completed
            </div>
          </div>

          {/* Circular overall progress */}
          <Ring
            value={overallPct}
            size={64}
            thickness={4.5}
            color={overallPct === 100 ? DONE : CORAL}
            trackColor="#f0ece9"
            label={
              <>
                <span className={classes.ringPct}>{overallPct}%</span>
                <span className={classes.ringDone}>done</span>
              </>
            }
          />
        </div>

        {/* ══ BODY ════════════════════════════════════ */}
        {loadingModules ? (
          <div className={classes.center}>
            <CircularProgress style={{ color: CORAL }} />
          </div>
        ) : modules.length === 0 ? (
          <div className={classes.center}>
            <Typography style={{ color: '#9ca3af' }}>
              No content yet — check back soon.
            </Typography>
          </div>
        ) : (
          <div className={classes.body}>
            <div className={classes.sectionTitle}>
              <MenuBookIcon style={{ fontSize: 12 }} />
              Course Modules
            </div>

            {resources.length > 0 && (
              <div className={classes.resourcesSection}>
                <div className={classes.sectionTitle}>
                  <DescriptionIcon style={{ fontSize: 12 }} />
                  Course Resources
                </div>
                {resources.map((r) => {
                  const typeColors: Record<string, string> = {
                    PDF: CORAL,
                    VIDEO: '#8b5cf6',
                    PRESENTATION: '#3b82f6',
                    DOCUMENT: '#f59e0b',
                    IMAGE: DONE,
                    LINK: '#6b7280',
                  };
                  const col = typeColors[r.type?.toUpperCase()] || '#9ca3af';
                  return (
                    <div key={r.id} className={classes.resourceRow}>
                      <div
                        className={classes.resourceIcon}
                        style={{ background: `${col}18` }}
                      >
                        <DescriptionIcon style={{ fontSize: 16, color: col }} />
                      </div>
                      <span className={classes.resourceName}>{r.title}</span>
                      <span
                        className={classes.resourceType}
                        style={{ background: col }}
                      >
                        {r.type}
                      </span>
                      {r.url && (
                        <Button
                          size="small"
                          className={classes.resourceDownloadBtn}
                          onClick={() => window.open(r.url, '_blank')}
                        >
                          Open
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {modules.map((mod, idx) => {
              const locked = isLocked(idx);
              const isDone =
                (mod.completedCount ?? 0) >= mod.contentCount &&
                mod.contentCount > 0;
              const isOpen = openModuleId === mod.id && !locked;
              const modPct =
                mod.contentCount > 0
                  ? Math.round(
                      ((mod.completedCount ?? 0) / mod.contentCount) * 100,
                    )
                  : 0;
              const ringColor = isDone ? DONE : CORAL;

              /* content items split */
              const lessons = (mod.contents || []).filter(
                (c) => c.type !== 'Assignment',
              );
              const assignments = (mod.contents || []).filter(
                (c) => c.type === 'Assignment',
              );

              return (
                <div
                  key={mod.id}
                  className={`${classes.moduleCard} ${
                    isOpen ? classes.moduleCardOpen : ''
                  } ${isDone && !isOpen ? classes.moduleCardDone : ''}`}
                >
                  {/* Module header row */}
                  <div
                    className={`${classes.moduleHeader} ${
                      locked ? classes.moduleHeaderLocked : ''
                    }`}
                    onClick={() => {
                      if (locked) return;
                      setOpenModuleId((prev) =>
                        prev === mod.id ? null : mod.id,
                      );
                      setExpandedId(null);
                      setExpandedAssign(null);
                    }}
                  >
                    {/* Small ring */}
                    <Ring
                      value={modPct}
                      size={44}
                      thickness={4}
                      color={locked ? '#d1d5db' : ringColor}
                      trackColor="#f0ece9"
                      label={
                        locked ? (
                          <LockIcon
                            style={{ fontSize: 14, color: '#9ca3af' }}
                          />
                        ) : isDone ? (
                          <CheckCircleIcon
                            style={{ fontSize: 18, color: DONE }}
                          />
                        ) : (
                          <span className={classes.moduleRingPct}>
                            {modPct}%
                          </span>
                        )
                      }
                    />

                    <div className={classes.moduleMeta}>
                      <div
                        className={`${classes.moduleTitle} ${
                          isDone ? classes.moduleTitleDone : ''
                        }`}
                      >
                        {mod.title || `Module ${idx + 1}`}
                      </div>
                      <div className={classes.moduleSub}>
                        <span className={classes.moduleSubItem}>
                          <DescriptionIcon style={{ fontSize: 11 }} />
                          {mod.contentCount}{' '}
                          {mod.contentCount === 1 ? 'item' : 'items'}
                        </span>
                        {!locked && (
                          <span className={classes.moduleSubItem}>
                            <CheckCircleIcon style={{ fontSize: 11 }} />
                            {mod.completedCount ?? 0} done
                          </span>
                        )}
                      </div>
                    </div>

                    {locked ? (
                      <span className={classes.moduleLockedBadge}>
                        <LockIcon style={{ fontSize: 11 }} /> Locked
                      </span>
                    ) : isDone ? (
                      <span className={classes.moduleDoneBadge}>Completed</span>
                    ) : (
                      <ExpandMoreIcon
                        className={`${classes.expandChevron} ${
                          isOpen ? classes.expandChevronOpen : ''
                        }`}
                        style={{ fontSize: 22 }}
                      />
                    )}
                  </div>

                  {/* ── Module body (expanded) ── */}
                  {isOpen && (
                    <div className={classes.moduleBody}>
                      {/* Lessons */}
                      {lessons.length > 0 && (
                        <>
                          {lessons.map((item) => {
                            const isExpanded = expandedId === item.id;
                            const isLoading = loadingId === item.id;
                            const isMarking = markingId === item.id;
                            const full = contentMap[item.id];
                            const done = item.completed || full?.completed;
                            const IconComp = typeIcon(item.type);
                            const color = typeColor(item.type);

                            return (
                              <div
                                key={item.id}
                                className={`${classes.lessonCard} ${
                                  isExpanded ? classes.lessonCardOpen : ''
                                } ${
                                  done && !isExpanded
                                    ? classes.lessonCardDone
                                    : ''
                                }`}
                              >
                                <div
                                  className={classes.lessonRow}
                                  onClick={() => openLesson(item)}
                                >
                                  <div
                                    className={classes.lessonIcon}
                                    style={{
                                      background: done
                                        ? '#d1fae5'
                                        : color + '18',
                                    }}
                                  >
                                    {done ? (
                                      <CheckCircleIcon
                                        style={{ fontSize: 16, color: DONE }}
                                      />
                                    ) : (
                                      <IconComp
                                        style={{ fontSize: 16, color }}
                                      />
                                    )}
                                  </div>
                                  <div className={classes.lessonMeta}>
                                    <div
                                      className={`${classes.lessonTitle} ${
                                        done ? classes.lessonTitleDone : ''
                                      }`}
                                    >
                                      {item.title}
                                    </div>
                                    <div className={classes.lessonSub}>
                                      <span className={classes.lessonSubItem}>
                                        <IconComp
                                          style={{
                                            fontSize: 10,
                                            color: '#c9c4bf',
                                          }}
                                        />{' '}
                                        {item.type}
                                      </span>
                                      {item.durationMin && (
                                        <span className={classes.lessonSubItem}>
                                          <AccessTimeIcon
                                            style={{
                                              fontSize: 10,
                                              color: '#c9c4bf',
                                            }}
                                          />{' '}
                                          {item.durationMin}m
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {done ? (
                                    <CheckCircleIcon
                                      style={{
                                        fontSize: 16,
                                        color: DONE,
                                        flexShrink: 0,
                                      }}
                                    />
                                  ) : (
                                    <RadioButtonUncheckedIcon
                                      style={{
                                        fontSize: 16,
                                        color: '#d1d5db',
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                  <ExpandMoreIcon
                                    className={`${classes.expandChevron} ${
                                      isExpanded
                                        ? classes.expandChevronOpen
                                        : ''
                                    }`}
                                    style={{ fontSize: 18 }}
                                  />
                                </div>

                                {/* Inline expanded content */}
                                {isExpanded && (
                                  <div className={classes.lessonContent}>
                                    {isLoading ? (
                                      <Box
                                        display="flex"
                                        justifyContent="center"
                                        py={3}
                                      >
                                        <CircularProgress
                                          size={26}
                                          style={{ color: CORAL }}
                                        />
                                      </Box>
                                    ) : full ? (
                                      <>
                                        {full.videoUrl && (
                                          <>
                                            <div
                                              className={
                                                classes.contentSectionLabel
                                              }
                                            >
                                              Video
                                            </div>
                                            <div className={classes.videoBox}>
                                              <iframe
                                                className={classes.videoIframe}
                                                src={embedUrl(full.videoUrl)}
                                                title={full.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                              />
                                            </div>
                                          </>
                                        )}
                                        {full.body && (
                                          <>
                                            {full.videoUrl && (
                                              <div
                                                className={
                                                  classes.contentSectionLabel
                                                }
                                              >
                                                Notes
                                              </div>
                                            )}
                                            <div
                                              className={classes.prose}
                                              dangerouslySetInnerHTML={{
                                                __html: toHtml(full.body!),
                                              }}
                                            />
                                          </>
                                        )}
                                        <div className={classes.actionRow}>
                                          {done || full.completed ? (
                                            <div className={classes.doneBadge}>
                                              <CheckCircleIcon
                                                style={{ fontSize: 20 }}
                                              />
                                              <div>
                                                Lesson completed
                                                <div
                                                  className={classes.doneNote}
                                                >
                                                  Great work — keep going!
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            <Button
                                              className={classes.completeBtn}
                                              variant="contained"
                                              disableElevation
                                              disabled={isMarking}
                                              onClick={() =>
                                                handleMarkComplete(item)
                                              }
                                            >
                                              {isMarking ? (
                                                <CircularProgress
                                                  size={16}
                                                  style={{ color: '#fff' }}
                                                />
                                              ) : (
                                                'Mark as Complete'
                                              )}
                                            </Button>
                                          )}
                                        </div>
                                      </>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      )}

                      {/* Assignments */}
                      {assignments.length > 0 && (
                        <div style={{ marginTop: lessons.length > 0 ? 16 : 0 }}>
                          <div
                            className={classes.sectionTitle}
                            style={{ marginTop: 0 }}
                          >
                            <AssignmentIcon style={{ fontSize: 12 }} />
                            Assignment
                          </div>
                          {assignments.map((asgn) => {
                            const isExpanded = expandedAssign === asgn.id;
                            const isLoading = loadingId === asgn.id;
                            const isMarking = markingId === asgn.id;
                            const full = contentMap[asgn.id];
                            const done = asgn.completed || full?.completed;

                            return (
                              <div key={asgn.id} className={classes.assignCard}>
                                <div
                                  className={classes.assignBanner}
                                  onClick={() => openAssignment(asgn)}
                                >
                                  <div className={classes.assignIconCircle}>
                                    {done ? (
                                      <AssignmentTurnedInIcon
                                        style={{ color: '#fff', fontSize: 20 }}
                                      />
                                    ) : (
                                      <AssignmentIcon
                                        style={{ color: '#fff', fontSize: 20 }}
                                      />
                                    )}
                                  </div>
                                  <div className={classes.assignBannerMeta}>
                                    <div className={classes.assignBannerLabel}>
                                      Module {idx + 1} · Assignment
                                    </div>
                                    <div className={classes.assignBannerTitle}>
                                      {asgn.title}
                                    </div>
                                  </div>
                                  <ExpandMoreIcon
                                    style={{
                                      color: 'rgba(255,255,255,0.8)',
                                      fontSize: 20,
                                      transition: 'transform 0.2s',
                                      transform: isExpanded
                                        ? 'rotate(180deg)'
                                        : 'none',
                                      flexShrink: 0,
                                    }}
                                  />
                                </div>

                                {isExpanded && (
                                  <div className={classes.assignBody}>
                                    {isLoading ? (
                                      <Box
                                        display="flex"
                                        justifyContent="center"
                                        py={3}
                                      >
                                        <CircularProgress
                                          size={26}
                                          style={{ color: CORAL }}
                                        />
                                      </Box>
                                    ) : full ? (
                                      <>
                                        {full.body && (
                                          <div
                                            className={classes.prose}
                                            dangerouslySetInnerHTML={{
                                              __html: toHtml(full.body!),
                                            }}
                                          />
                                        )}
                                        <div className={classes.actionRow}>
                                          {done || full.completed ? (
                                            <div className={classes.doneBadge}>
                                              <AssignmentTurnedInIcon
                                                style={{ fontSize: 20 }}
                                              />
                                              <div>
                                                Assignment submitted
                                                <div
                                                  className={classes.doneNote}
                                                >
                                                  Well done!
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            <Button
                                              className={classes.submitBtn}
                                              variant="contained"
                                              disableElevation
                                              disabled={isMarking}
                                              onClick={() =>
                                                handleMarkComplete(asgn)
                                              }
                                            >
                                              {isMarking ? (
                                                <CircularProgress
                                                  size={16}
                                                  style={{ color: '#fff' }}
                                                />
                                              ) : (
                                                'Submit Assignment'
                                              )}
                                            </Button>
                                          )}
                                        </div>
                                      </>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CoursePlayer;
