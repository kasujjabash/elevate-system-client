import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  makeStyles,
  Theme,
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
} from '@material-ui/core';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import AddIcon from '@material-ui/icons/Add';
import GetAppIcon from '@material-ui/icons/GetApp';
import VisibilityIcon from '@material-ui/icons/Visibility';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import LinkIcon from '@material-ui/icons/Link';
import Layout from '../../components/layout/Layout';
import { get, post, del } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';
const BLUE = '#3b82f6';
const AMBER = '#f59e0b';
const GREEN = '#10b981';
const PURPLE = '#8b5cf6';

const TYPE_COLORS: Record<string, string> = {
  PRESENTATION: BLUE,
  PDF: CORAL,
  VIDEO: PURPLE,
  DOCUMENT: AMBER,
  IMAGE: GREEN,
  LINK: '#6b7280',
};

const RESOURCE_TYPES = [
  'PRESENTATION',
  'PDF',
  'VIDEO',
  'DOCUMENT',
  'IMAGE',
  'LINK',
];

const useStyles = makeStyles((_theme: Theme) => ({
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
    '&:hover': { background: '#d42360' },
  },
  statsRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap' as any,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '14px 20px',
    flex: '1 1 120px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 20, fontWeight: 800, color: DARK },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 600,
    textTransform: 'uppercase' as any,
  },
  toolbar: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap' as any,
    alignItems: 'center',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: '6px 14px',
    flex: 1,
    maxWidth: 340,
  },
  courseFilter: { display: 'flex', gap: 8, flexWrap: 'wrap' as any },
  filterChip: {
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 20,
    cursor: 'pointer',
    border: '1px solid rgba(0,0,0,0.12)',
    padding: '4px 12px',
    transition: 'all 0.15s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 16,
  },
  resourceCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '16px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    position: 'relative' as any,
  },
  resourceCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 5,
    padding: '2px 8px',
    color: '#fff',
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: DARK,
    marginBottom: 3,
  },
  resourceCourseName: { fontSize: 11, color: '#8a8f99', marginBottom: 8 },
  resourceMeta: { fontSize: 11, color: '#c0c4ce', marginBottom: 12 },
  resourceFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f3f4f6',
    paddingTop: 10,
  },
  engagementRow: { display: 'flex', gap: 12 },
  engagement: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 11,
    color: '#9ca3af',
  },
  actionBtns: { display: 'flex', gap: 4, alignItems: 'center' },
  viewBtn: {
    fontSize: 11,
    fontWeight: 600,
    color: CORAL,
    textTransform: 'none' as any,
    padding: '2px 8px',
  },
  deleteBtn: { padding: 4, color: '#d1d5db', '&:hover': { color: CORAL } },
  emptyState: {
    textAlign: 'center' as any,
    padding: '60px 20px',
    color: '#c0c4ce',
  },
  dialogTitle: { fontSize: 16, fontWeight: 700, color: DARK },
  field: { marginBottom: 16 },
  saveBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    padding: '8px 20px',
    fontWeight: 700,
    textTransform: 'none' as any,
    '&:hover': { background: '#d42360' },
  },
  cancelBtn: { color: '#8a8f99', textTransform: 'none' as any },
}));

interface IResource {
  id: number | string;
  type: string;
  title: string;
  courseId: string | number;
  courseName?: string;
  url?: string;
  size?: string;
  createdAt?: string;
  views?: number;
  downloads?: number;
}

interface ICourse {
  id: string | number;
  title?: string;
  name?: string;
}

const TrainerResources = () => {
  const classes = useStyles();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCourseId, setActiveCourseId] = useState<string | number | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'PDF',
    url: '',
    courseId: '',
  });

  // Load trainer's courses on mount
  useEffect(() => {
    get(
      remoteRoutes.courses,
      (data: any) => {
        const list: ICourse[] = Array.isArray(data) ? data : data?.data || [];
        setCourses(list);
        // Auto-select first course
        if (list.length > 0 && !activeCourseId) {
          setActiveCourseId(list[0].id);
        }
      },
      undefined,
      () => setLoading(false),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch resources whenever active course changes
  useEffect(() => {
    if (!activeCourseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    get(
      `${remoteRoutes.courseResources}/${activeCourseId}/resources`,
      (data: any) => {
        const list: IResource[] = Array.isArray(data) ? data : data?.data || [];
        const courseName = courses.find(
          (c) => String(c.id) === String(activeCourseId),
        );
        setResources(
          list.map((r) => ({
            ...r,
            courseName: courseName?.title || courseName?.name || '',
          })),
        );
        setLoading(false);
      },
      undefined,
      () => setLoading(false),
    );
  }, [activeCourseId, courses]);

  const filtered = resources.filter(
    (r) => !query || r.title.toLowerCase().includes(query.toLowerCase()),
  );

  const handleAdd = () => {
    setSaving(true);
    post(
      `${remoteRoutes.courseResources}/${
        form.courseId || activeCourseId
      }/resources`,
      { title: form.title, type: form.type, url: form.url },
      (created: any) => {
        const courseName = courses.find(
          (c) => String(c.id) === String(form.courseId || activeCourseId),
        );
        setResources((prev) => [
          {
            ...created,
            courseName: courseName?.title || courseName?.name || '',
          },
          ...prev,
        ]);
        setSaving(false);
        setDialogOpen(false);
        setForm({ title: '', type: 'PDF', url: '', courseId: '' });
      },
      undefined,
      () => setSaving(false),
    );
  };

  const handleDelete = (id: number | string) => {
    del(
      `${remoteRoutes.courseResources}/${activeCourseId}/resources/${id}`,
      () => setResources((prev) => prev.filter((r) => r.id !== id)),
    );
  };

  const totalDownloads = resources.reduce((s, r) => s + (r.downloads || 0), 0);
  const videoCount = resources.filter((r) => r.type === 'VIDEO').length;
  const docCount = resources.filter((r) => r.type !== 'VIDEO').length;

  return (
    <Layout>
      <div className={classes.root}>
        <div className={classes.pageHeader}>
          <div>
            <div className={classes.pageTitle}>Resources</div>
            <div className={classes.pageSub}>
              Upload and manage learning materials for your classes
            </div>
          </div>
          <Button
            variant="contained"
            className={classes.addBtn}
            disableElevation
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Resource
          </Button>
        </div>

        {/* Stats */}
        <div className={classes.statsRow}>
          {[
            {
              label: 'Total Resources',
              value: resources.length,
              color: CORAL,
              bg: 'rgba(254,58,106,0.08)',
            },
            {
              label: 'Total Downloads',
              value: totalDownloads,
              color: BLUE,
              bg: 'rgba(59,130,246,0.08)',
            },
            {
              label: 'Documents',
              value: docCount,
              color: AMBER,
              bg: 'rgba(245,158,11,0.08)',
            },
            {
              label: 'Videos',
              value: videoCount,
              color: PURPLE,
              bg: 'rgba(139,92,246,0.08)',
            },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={classes.statCard}>
              <div className={classes.statIcon} style={{ background: bg }}>
                <FolderOpenIcon style={{ fontSize: 18, color }} />
              </div>
              <div>
                <div className={classes.statValue}>{loading ? '…' : value}</div>
                <div className={classes.statLabel}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar: search + course filter */}
        <div className={classes.toolbar}>
          <div className={classes.searchBox}>
            <SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
            <InputBase
              placeholder="Search resources..."
              style={{ fontSize: 13, flex: 1 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={classes.courseFilter}>
            {courses.map((c) => {
              const name = c.title || c.name || 'Course';
              const active = String(c.id) === String(activeCourseId);
              return (
                <div
                  key={c.id}
                  className={classes.filterChip}
                  onClick={() => setActiveCourseId(c.id)}
                  style={{
                    background: active ? CORAL : 'transparent',
                    color: active ? '#fff' : DARK,
                    borderColor: active ? CORAL : 'rgba(0,0,0,0.12)',
                  }}
                >
                  {name}
                </div>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <CircularProgress size={28} style={{ color: CORAL }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className={classes.emptyState}>
            <FolderOpenIcon
              style={{ fontSize: 48, color: '#e5e7eb', marginBottom: 12 }}
            />
            <Typography style={{ fontSize: 14, color: '#9ca3af' }}>
              {resources.length === 0
                ? 'No resources yet. Click "Add Resource" to upload one.'
                : 'No resources match your search.'}
            </Typography>
          </div>
        ) : (
          <div className={classes.grid}>
            {filtered.map((r) => (
              <div key={r.id} className={classes.resourceCard}>
                <div className={classes.resourceCardTop}>
                  <span
                    className={classes.typeBadge}
                    style={{ background: TYPE_COLORS[r.type] || '#9ca3af' }}
                  >
                    {r.type}
                  </span>
                  {r.size && (
                    <span style={{ fontSize: 11, color: '#c0c4ce' }}>
                      {r.size}
                    </span>
                  )}
                </div>
                <div className={classes.resourceTitle}>{r.title}</div>
                {r.courseName && (
                  <div className={classes.resourceCourseName}>
                    {r.courseName}
                  </div>
                )}
                {r.createdAt && (
                  <div className={classes.resourceMeta}>
                    Added: {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                )}
                <div className={classes.resourceFooter}>
                  <div className={classes.engagementRow}>
                    {r.views != null && (
                      <span className={classes.engagement}>
                        <VisibilityIcon style={{ fontSize: 13 }} /> {r.views}
                      </span>
                    )}
                    {r.downloads != null && (
                      <span className={classes.engagement}>
                        <GetAppIcon style={{ fontSize: 13 }} /> {r.downloads}
                      </span>
                    )}
                  </div>
                  <div className={classes.actionBtns}>
                    {r.url && (
                      <Button
                        size="small"
                        className={classes.viewBtn}
                        onClick={() => window.open(r.url, '_blank')}
                      >
                        View
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      className={classes.deleteBtn}
                      onClick={() => handleDelete(r.id)}
                    >
                      <DeleteIcon style={{ fontSize: 16 }} />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Resource Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle disableTypography>
          <span className={classes.dialogTitle}>Add Resource</span>
        </DialogTitle>
        <DialogContent>
          <div className={classes.field}>
            <TextField
              label="Title"
              fullWidth
              variant="outlined"
              size="small"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div className={classes.field}>
            <TextField
              label="Type"
              select
              fullWidth
              variant="outlined"
              size="small"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              {RESOURCE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className={classes.field}>
            <TextField
              label="Course"
              select
              fullWidth
              variant="outlined"
              size="small"
              value={form.courseId || String(activeCourseId || '')}
              onChange={(e) =>
                setForm((f) => ({ ...f, courseId: e.target.value }))
              }
            >
              {courses.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.title || c.name}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className={classes.field}>
            <TextField
              label="URL / Link"
              fullWidth
              variant="outlined"
              size="small"
              placeholder="https://..."
              InputProps={{
                startAdornment: (
                  <LinkIcon
                    style={{ fontSize: 16, color: '#9ca3af', marginRight: 6 }}
                  />
                ),
              }}
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            />
          </div>
        </DialogContent>
        <DialogActions style={{ padding: '8px 24px 20px' }}>
          <Button
            className={classes.cancelBtn}
            onClick={() => setDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className={classes.saveBtn}
            variant="contained"
            disableElevation
            disabled={!form.title || saving}
            onClick={handleAdd}
          >
            {saving ? (
              <CircularProgress size={16} style={{ color: '#fff' }} />
            ) : (
              'Add Resource'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default TrainerResources;
