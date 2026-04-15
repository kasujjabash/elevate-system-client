import React, { useEffect, useState } from 'react';
import {
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  InputBase,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import HeadsetIcon from '@material-ui/icons/Headset';
import VideocamIcon from '@material-ui/icons/Videocam';
import Layout from '../../components/layout/Layout';
import { get } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';

// ── YouTube helpers ───────────────────────────────────────────────────────────
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
};

export const ytThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export const ytEmbed = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

// ── Styles ────────────────────────────────────────────────────────────────────
const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: 24, [theme.breakpoints.down('xs')]: { padding: 12 } },

  breadcrumb: { fontSize: 13, color: '#8a8f99', marginBottom: 6 },
  breadcrumbSep: { margin: '0 6px', color: '#c4c8d0' },
  breadcrumbActive: { color: CORAL },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
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
    maxWidth: 360,
    [theme.breakpoints.down('xs')]: { maxWidth: '100%' },
  },
  filterChip: {
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 20,
    cursor: 'pointer',
    border: '1px solid rgba(0,0,0,0.12)',
    '&:hover': { borderColor: CORAL, color: CORAL },
  },
  filterChipActive: {
    background: `${CORAL} !important`,
    color: '#fff !important',
    border: `1px solid ${CORAL} !important`,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
    [theme.breakpoints.down('xs')]: { gridTemplateColumns: '1fr' },
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.07)',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    },
  },
  thumb: {
    position: 'relative' as any,
    width: '100%',
    paddingTop: '56.25%', // 16:9
    background: '#1a1a2e',
    overflow: 'hidden',
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
  },
  playOverlay: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.25)',
    opacity: 0,
    transition: 'opacity 0.2s',
    '$card:hover &': { opacity: 1 },
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.92)',
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
    marginBottom: 6,
    lineHeight: 1.35,
    display: '-webkit-box' as any,
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  },
  cardDesc: {
    fontSize: 12,
    color: '#8a8f99',
    lineHeight: 1.5,
    display: '-webkit-box' as any,
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  courseBadge: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 4,
    background: 'rgba(254,58,106,0.08)',
    color: CORAL,
    padding: '2px 7px',
    whiteSpace: 'nowrap' as any,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 130,
  },
  cardDate: { fontSize: 10, color: '#b0b5bf', flexShrink: 0 },

  // ── Player modal ───────────────────────────────────────────────────────────
  playerDialog: {
    '& .MuiDialog-paper': {
      borderRadius: 16,
      overflow: 'hidden',
      maxWidth: 860,
    },
  },
  playerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '18px 20px 14px',
    background: '#fff',
    gap: 12,
  },
  playerTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: DARK,
    flex: 1,
    lineHeight: 1.3,
  },
  playerMeta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as any,
    gap: 8,
    padding: '0 20px 14px',
    background: '#fff',
  },
  playerTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.03em',
  },
  playerDesc: {
    fontSize: 13,
    color: '#5a5e6b',
    lineHeight: 1.7,
    padding: '14px 20px 20px',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    background: '#fafbfc',
    margin: 0,
    whiteSpace: 'pre-line' as any,
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
}));

type FilterType = 'all' | 'workshop' | 'podcast';

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
const Workshops = () => {
  const classes = useStyles();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [playing, setPlaying] = useState<any | null>(null);

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

  const visible = items.filter((it) => {
    // Normalize the type for comparison
    const itemType = (it.type || '').toLowerCase();
    const filterType = filter === 'all' ? 'all' : filter.toLowerCase();

    if (filter !== 'all' && itemType !== filterType) return false;

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

  const playingId = playing
    ? extractYouTubeId(playing.url || playing.youtubeUrl || '')
    : null;

  return (
    <Layout title="Workshops & Podcasts">
      <div className={classes.root}>
        {/* Breadcrumb */}
        <div className={classes.breadcrumb}>
          <span>Home</span>
          <span className={classes.breadcrumbSep}>›</span>
          <span className={classes.breadcrumbActive}>
            Workshops &amp; Podcasts
          </span>
        </div>

        {/* Toolbar */}
        <div className={classes.toolbar}>
          <div className={classes.searchBox}>
            <SearchIcon style={{ fontSize: 17, color: '#9ca3af' }} />
            <InputBase
              placeholder="Search workshops & podcasts…"
              style={{ fontSize: 13, flex: 1 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(['all', 'workshop', 'podcast'] as FilterType[]).map((f) => (
            <Chip
              key={f}
              label={
                f === 'all'
                  ? 'All'
                  : f === 'workshop'
                  ? 'Workshops'
                  : 'Podcasts'
              }
              className={`${classes.filterChip} ${
                filter === f ? classes.filterChipActive : ''
              }`}
              onClick={() => setFilter(f)}
            />
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
                  fontSize: 48,
                  color: '#e0e0e0',
                  display: 'block',
                  margin: '0 auto 10px',
                }}
              />
              <Typography
                style={{ fontWeight: 600, fontSize: 14, color: '#8a8f99' }}
              >
                {items.length === 0
                  ? 'No content available yet'
                  : 'No results found'}
              </Typography>
              <Typography style={{ fontSize: 12, marginTop: 4 }}>
                {items.length === 0
                  ? 'Workshops and podcasts added by your trainer or admin will appear here.'
                  : 'Try a different search or filter.'}
              </Typography>
            </div>
          ) : (
            visible.map((item, i) => {
              const ytId = extractYouTubeId(item.url || item.youtubeUrl || '');
              const type: 'workshop' | 'podcast' =
                item.type === 'podcast' ? 'podcast' : 'workshop';
              const meta = TYPE_META[type];
              const Icon = meta.Icon;
              return (
                <div
                  key={item.id || i}
                  className={classes.card}
                  onClick={() => setPlaying(item)}
                >
                  {/* Thumbnail */}
                  <div className={classes.thumb}>
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
                            fontSize: 40,
                            color: 'rgba(255,255,255,0.2)',
                          }}
                        />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className={classes.playOverlay}>
                      <div className={classes.playBtn}>
                        <PlayArrowIcon
                          style={{ fontSize: 26, color: CORAL, marginLeft: 3 }}
                        />
                      </div>
                    </div>
                    {/* Type badge */}
                    <div
                      className={classes.typeBadge}
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      {meta.label}
                    </div>
                  </div>

                  {/* Body */}
                  <div className={classes.cardBody}>
                    <div className={classes.cardTitle}>
                      {item.title || 'Untitled'}
                    </div>
                    {item.description && (
                      <div className={classes.cardDesc}>{item.description}</div>
                    )}
                    <div className={classes.cardMeta}>
                      {item.courseName ? (
                        <span className={classes.courseBadge}>
                          {item.courseName}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className={classes.cardDate}>
                        {fmtDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Player modal */}
        <Dialog
          open={!!playing}
          onClose={() => setPlaying(null)}
          maxWidth="md"
          fullWidth
          className={classes.playerDialog}
        >
          {/* Header */}
          <div className={classes.playerHeader}>
            <div className={classes.playerTitle}>{playing?.title || ''}</div>
            <IconButton size="small" onClick={() => setPlaying(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          {/* Tags row */}
          {playing &&
            (() => {
              const type: 'workshop' | 'podcast' =
                playing.type === 'podcast' ? 'podcast' : 'workshop';
              const meta = TYPE_META[type];
              const Icon = meta.Icon;
              return (
                <div className={classes.playerMeta}>
                  {/* Type tag */}
                  <span
                    className={classes.playerTag}
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    <Icon style={{ fontSize: 12 }} />
                    {meta.label}
                  </span>
                  {/* Course tag */}
                  {playing.courseName && (
                    <span
                      className={classes.playerTag}
                      style={{
                        background: 'rgba(254,58,106,0.08)',
                        color: CORAL,
                      }}
                    >
                      {playing.courseName}
                    </span>
                  )}
                  {/* Date tag */}
                  {playing.createdAt && (
                    <span
                      className={classes.playerTag}
                      style={{
                        background: 'rgba(0,0,0,0.04)',
                        color: '#8a8f99',
                      }}
                    >
                      {fmtDate(playing.createdAt)}
                    </span>
                  )}
                </div>
              );
            })()}

          {/* YouTube embed */}
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
                padding: '40px 20px',
                textAlign: 'center',
                background: '#1a1a2e',
              }}
            >
              <Typography
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}
              >
                No playable video URL found for this item.
              </Typography>
            </div>
          )}

          {/* Description */}
          {playing?.description && (
            <div className={classes.playerDesc}>{playing.description}</div>
          )}
        </Dialog>
      </div>
    </Layout>
  );
};

export default Workshops;
