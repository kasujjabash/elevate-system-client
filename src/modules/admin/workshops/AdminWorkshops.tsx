import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputBase,
  MenuItem,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import HeadsetIcon from '@material-ui/icons/Headset';
import VideocamIcon from '@material-ui/icons/Videocam';
import CloseIcon from '@material-ui/icons/Close';
import Layout from '../../../components/layout/Layout';
import { get, post, put, del } from '../../../utils/ajax';
import { remoteRoutes } from '../../../data/constants';
import Toast from '../../../utils/Toast';
import { extractYouTubeId, ytThumb, ytEmbed } from '../../student/Workshops';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: 24, [theme.breakpoints.down('xs')]: { padding: 12 } },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap' as any,
    gap: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: 800, color: DARK },
  pageSub: { fontSize: 13, color: '#8a8f99', marginTop: 3 },
  addBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'none' as any,
    '&:hover': { background: '#e02d5c' },
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
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
    padding: '8px 14px',
    flex: 1,
    maxWidth: 340,
  },
  filterBtn: {
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 20,
    padding: '5px 14px',
    cursor: 'pointer',
    border: '1px solid rgba(0,0,0,0.12)',
    background: 'transparent',
    color: '#5a5e6b',
    '&:hover': { borderColor: CORAL, color: CORAL },
  },
  filterBtnActive: {
    background: CORAL,
    color: '#fff',
    border: `1px solid ${CORAL}`,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
    [theme.breakpoints.down('xs')]: { gridTemplateColumns: '1fr' },
  },

  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.07)',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    position: 'relative' as any,
  },
  thumb: {
    position: 'relative' as any,
    width: '100%',
    paddingTop: '52%',
    background: '#1a1a2e',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  thumbImg: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as any,
  },
  thumbPlaceholder: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    cursor: 'pointer',
  },
  playOverlay: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.28)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute' as any,
    top: 10,
    left: 10,
    borderRadius: 6,
    padding: '3px 9px',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as any,
  },

  cardBody: { padding: '14px 16px 16px' },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: DARK,
    marginBottom: 5,
    lineHeight: 1.35,
  },
  cardDesc: {
    fontSize: 12,
    color: '#8a8f99',
    lineHeight: 1.5,
    marginBottom: 12,
    display: '-webkit-box' as any,
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  courseBadge: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 4,
    background: 'rgba(254,58,106,0.08)',
    color: CORAL,
    padding: '2px 7px',
    maxWidth: 120,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as any,
  },
  cardActions: {
    display: 'flex',
    gap: 4,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': { background: '#f5f5f5' },
  },

  empty: {
    padding: '60px 20px',
    textAlign: 'center' as any,
    color: '#b0b5bf',
    gridColumn: '1 / -1',
  },
  loadingWrap: {
    padding: '60px 20px',
    display: 'flex',
    justifyContent: 'center',
    gridColumn: '1 / -1',
  },

  // Form dialog
  formSection: { marginBottom: 18 },
  formLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#5a5e6b',
    marginBottom: 6,
    display: 'block',
  },
  previewBox: {
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.08)',
    background: '#1a1a2e',
  },
  previewThumb: {
    position: 'relative' as any,
    paddingTop: '56.25%',
    overflow: 'hidden',
  },
  previewImg: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as any,
  },
  previewEmpty: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
  },
  previewLabel: {
    fontSize: 11,
    color: '#9ca3af',
    padding: '6px 12px',
    textAlign: 'center' as any,
  },

  // Player dialog
  playerDialog: {
    '& .MuiDialog-paper': {
      borderRadius: 14,
      overflow: 'hidden',
      maxWidth: 860,
    },
  },
  iframeWrap: {
    position: 'relative' as any,
    paddingTop: '56.25%',
    background: '#000',
    width: '100%',
  },
  iframe: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },

  submitBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 13,
    textTransform: 'none' as any,
    padding: '8px 22px',
    '&:hover': { background: '#e02d5c' },
    '&:disabled': { background: '#f3f4f6', color: '#c0c4ce' },
  },
}));

type ItemType = 'workshop' | 'podcast';

interface WorkshopItem {
  id?: string;
  title: string;
  description: string;
  type: ItemType;
  url: string;
  courseName?: string;
  hubName?: string;
  createdAt?: string;
}

const EMPTY_FORM: WorkshopItem = {
  title: '',
  description: '',
  type: 'workshop',
  url: '',
  courseName: '',
  hubName: '',
};

const TYPE_META = {
  workshop: { label: 'Workshop', color: '#fff', bg: CORAL, Icon: VideocamIcon },
  podcast: {
    label: 'Podcast',
    color: '#fff',
    bg: '#3b82f6',
    Icon: HeadsetIcon,
  },
};

const fmtDate = (iso: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
const AdminWorkshops = () => {
  const classes = useStyles();
  const [items, setItems] = useState<WorkshopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ItemType>('all');
  const [search, setSearch] = useState('');

  // Form dialog
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkshopItem | null>(null);
  const [form, setForm] = useState<WorkshopItem>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleting, setDeleting] = useState<WorkshopItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Player preview
  const [playing, setPlaying] = useState<WorkshopItem | null>(null);

  useEffect(() => {
    get(
      remoteRoutes.workshops,
      (data: any) => {
        setItems(Array.isArray(data) ? data : data?.data || []);
        setLoading(false);
      },
      undefined,
      () => setLoading(false),
    );
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item: WorkshopItem) => {
    setEditing(item);
    setForm({ ...item });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.url.trim()) {
      Toast.error('Title and YouTube URL are required.');
      return;
    }
    setSaving(true);
    if (editing?.id) {
      put(
        `${remoteRoutes.workshops}/${editing.id}`,
        form,
        (saved: any) => {
          setItems((prev) =>
            prev.map((it) => (it.id === editing.id ? saved || form : it)),
          );
          setShowForm(false);
          setSaving(false);
          Toast.success('Updated successfully.');
        },
        () => {
          setSaving(false);
          Toast.error('Failed to update.');
        },
      );
    } else {
      post(
        remoteRoutes.workshops,
        form,
        (saved: any) => {
          setItems((prev) => [saved || form, ...prev]);
          setShowForm(false);
          setSaving(false);
          Toast.success('Added successfully.');
        },
        () => {
          setSaving(false);
          Toast.error('Failed to add.');
        },
      );
    }
  };

  const handleDelete = () => {
    if (!deleting?.id) return;
    del(
      `${remoteRoutes.workshops}/${deleting.id}`,
      () => {
        setItems((prev) => prev.filter((it) => it.id !== deleting.id));
        setConfirmDelete(false);
        setDeleting(null);
        Toast.success('Deleted.');
      },
      () => Toast.error('Failed to delete.'),
    );
  };

  const previewId = extractYouTubeId(form.url);
  const playingId = playing ? extractYouTubeId(playing.url || '') : null;

  const visible = items.filter((it) => {
    if (filter !== 'all' && it.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (it.title || '').toLowerCase().includes(q) ||
        (it.description || '').toLowerCase().includes(q) ||
        (it.courseName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <Layout title="Workshops & Podcasts">
      <div className={classes.root}>
        <div className={classes.pageHeader}>
          <div>
            <div className={classes.pageTitle}>Workshops &amp; Podcasts</div>
            <div className={classes.pageSub}>
              Manage YouTube workshops and podcast episodes available to
              students.
            </div>
          </div>
          <Button
            variant="contained"
            className={classes.addBtn}
            startIcon={<AddIcon />}
            disableElevation
            onClick={openAdd}
          >
            Add Content
          </Button>
        </div>

        {/* Toolbar */}
        <div className={classes.toolbar}>
          <div className={classes.searchBox}>
            <SearchIcon style={{ fontSize: 17, color: '#9ca3af' }} />
            <InputBase
              placeholder="Search…"
              style={{ fontSize: 13, flex: 1 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(['all', 'workshop', 'podcast'] as const).map((f) => (
            <button
              key={f}
              className={`${classes.filterBtn} ${
                filter === f ? classes.filterBtnActive : ''
              }`}
              onClick={() => setFilter(f)}
            >
              {f === 'all'
                ? 'All'
                : f === 'workshop'
                ? 'Workshops'
                : 'Podcasts'}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={classes.grid}>
          {loading ? (
            <div className={classes.loadingWrap}>
              <CircularProgress size={28} style={{ color: CORAL }} />
            </div>
          ) : visible.length === 0 ? (
            <div className={classes.empty}>
              <PlayArrowIcon
                style={{
                  fontSize: 44,
                  color: '#e0e0e0',
                  display: 'block',
                  margin: '0 auto 10px',
                }}
              />
              <Typography
                style={{ fontWeight: 600, fontSize: 14, color: '#8a8f99' }}
              >
                {items.length === 0 ? 'No content added yet' : 'No results'}
              </Typography>
              <Typography style={{ fontSize: 12, marginTop: 4 }}>
                {items.length === 0
                  ? 'Click "Add Content" to get started.'
                  : 'Try a different filter.'}
              </Typography>
            </div>
          ) : (
            visible.map((item, i) => {
              const ytId = extractYouTubeId(item.url || '');
              const type: ItemType =
                item.type === 'podcast' ? 'podcast' : 'workshop';
              const meta = TYPE_META[type];
              const Icon = meta.Icon;
              return (
                <div key={item.id || i} className={classes.card}>
                  {/* Thumbnail */}
                  <div
                    className={classes.thumb}
                    onClick={() => setPlaying(item)}
                  >
                    {ytId ? (
                      <img
                        src={ytThumb(ytId)}
                        alt={item.title}
                        className={classes.thumbImg}
                      />
                    ) : (
                      <div className={classes.thumbPlaceholder}>
                        <Icon
                          style={{
                            fontSize: 36,
                            color: 'rgba(255,255,255,0.2)',
                          }}
                        />
                      </div>
                    )}
                    <div className={classes.playOverlay}>
                      <div className={classes.playCircle}>
                        <PlayArrowIcon
                          style={{ fontSize: 24, color: CORAL, marginLeft: 3 }}
                        />
                      </div>
                    </div>
                    <div
                      className={classes.typeBadge}
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.label}
                    </div>
                  </div>

                  <div className={classes.cardBody}>
                    <div className={classes.cardTitle}>
                      {item.title || 'Untitled'}
                    </div>
                    {item.description && (
                      <div className={classes.cardDesc}>{item.description}</div>
                    )}
                    <div className={classes.cardMeta}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          minWidth: 0,
                        }}
                      >
                        {item.courseName && (
                          <span className={classes.courseBadge}>
                            {item.courseName}
                          </span>
                        )}
                        {item.createdAt && (
                          <span
                            style={{
                              fontSize: 10,
                              color: '#b0b5bf',
                              flexShrink: 0,
                            }}
                          >
                            {fmtDate(item.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className={classes.cardActions}>
                        <IconButton
                          size="small"
                          title="Edit"
                          onClick={() => openEdit(item)}
                        >
                          <EditIcon
                            style={{ fontSize: 16, color: '#8a8f99' }}
                          />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Delete"
                          onClick={() => {
                            setDeleting(item);
                            setConfirmDelete(true);
                          }}
                        >
                          <DeleteIcon
                            style={{ fontSize: 16, color: '#e05252' }}
                          />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Add / Edit dialog ────────────────────────────────────────────── */}
        <Dialog
          open={showForm}
          onClose={() => setShowForm(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              {editing ? 'Edit Content' : 'Add Workshop or Podcast'}
            </span>
            <IconButton size="small" onClick={() => setShowForm(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ paddingTop: 20 }}>
            {/* Type */}
            <div className={classes.formSection}>
              <span className={classes.formLabel}>Content Type *</span>
              <TextField
                select
                fullWidth
                variant="outlined"
                size="small"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as ItemType })
                }
              >
                <MenuItem value="workshop">Workshop (Video)</MenuItem>
                <MenuItem value="podcast">Podcast</MenuItem>
              </TextField>
            </div>

            {/* Title */}
            <div className={classes.formSection}>
              <span className={classes.formLabel}>Title *</span>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g. Introduction to UI/UX Design"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className={classes.formSection}>
              <span className={classes.formLabel}>Description</span>
              <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                size="small"
                placeholder="Brief description of the content…"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* YouTube URL */}
            <div className={classes.formSection}>
              <span className={classes.formLabel}>YouTube URL *</span>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="https://www.youtube.com/watch?v=…"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              {/* Preview */}
              {form.url && (
                <div className={classes.previewBox}>
                  <div className={classes.previewThumb}>
                    {previewId ? (
                      <img
                        src={ytThumb(previewId)}
                        alt="preview"
                        className={classes.previewImg}
                      />
                    ) : (
                      <div className={classes.previewEmpty}>
                        Invalid YouTube URL — enter a valid link
                      </div>
                    )}
                  </div>
                  {previewId && (
                    <div className={classes.previewLabel}>
                      Video ID: {previewId} · Thumbnail preview
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Course tag */}
            <div className={classes.formSection}>
              <span className={classes.formLabel}>Course Tag (optional)</span>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g. Graphic Design"
                value={form.courseName || ''}
                onChange={(e) =>
                  setForm({ ...form, courseName: e.target.value })
                }
              />
            </div>

            {/* Hub tag */}
            <div className={classes.formSection} style={{ marginBottom: 4 }}>
              <span className={classes.formLabel}>Hub (optional)</span>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g. Katanga"
                value={form.hubName || ''}
                onChange={(e) => setForm({ ...form, hubName: e.target.value })}
              />
            </div>
          </DialogContent>
          <Divider />
          <DialogActions style={{ padding: '14px 20px', gap: 8 }}>
            <Button
              variant="outlined"
              style={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13,
              }}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className={classes.submitBtn}
              disableElevation
              disabled={saving || !form.title.trim() || !form.url.trim()}
              onClick={handleSave}
            >
              {saving ? (
                <CircularProgress size={16} style={{ color: '#fff' }} />
              ) : editing ? (
                'Save Changes'
              ) : (
                'Add Content'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Delete confirm dialog ────────────────────────────────────────── */}
        <Dialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle style={{ fontWeight: 700 }}>Delete Content</DialogTitle>
          <DialogContent>
            <Typography style={{ fontSize: 13, color: '#5a5e6b' }}>
              Are you sure you want to delete{' '}
              <strong>"{deleting?.title}"</strong>? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions style={{ padding: '12px 20px', gap: 8 }}>
            <Button
              variant="outlined"
              style={{
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13,
              }}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disableElevation
              style={{
                background: '#e05252',
                color: '#fff',
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 13,
              }}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Player dialog ────────────────────────────────────────────────── */}
        <Dialog
          open={!!playing}
          onClose={() => setPlaying(null)}
          maxWidth="md"
          fullWidth
          className={classes.playerDialog}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
            }}
          >
            <Typography
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: DARK,
                flex: 1,
                marginRight: 12,
              }}
            >
              {playing?.title || ''}
            </Typography>
            <IconButton size="small" onClick={() => setPlaying(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
          <Divider />
          {playingId ? (
            <div className={classes.iframeWrap}>
              <iframe
                className={classes.iframe}
                src={ytEmbed(playingId)}
                title={playing?.title || 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                color: '#8a8f99',
                background: '#1a1a2e',
              }}
            >
              <Typography
                style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}
              >
                No valid YouTube URL for this item.
              </Typography>
            </div>
          )}
          {playing?.description && (
            <div
              style={{
                padding: '12px 20px 16px',
                fontSize: 13,
                color: '#8a8f99',
                lineHeight: 1.6,
              }}
            >
              {playing.description}
            </div>
          )}
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminWorkshops;
