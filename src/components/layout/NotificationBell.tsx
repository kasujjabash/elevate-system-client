import React, { useCallback, useEffect, useRef, useState } from 'react';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import AssignmentIcon from '@material-ui/icons/Assignment';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { get, search } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { isStudent, isTrainer, isHubManager } from '../../data/appRoles';

const CORAL = '#fe3a6a';

const useStyles = makeStyles(() => ({
  bell: { color: '#8a8f99' },
  bellActive: { color: CORAL },
  badge: {
    '& .MuiBadge-badge': {
      background: CORAL,
      color: '#fff',
      fontSize: 10,
      fontWeight: 700,
      minWidth: 16,
      height: 16,
      padding: '0 4px',
    },
  },

  popover: {
    width: 340,
    maxHeight: 480,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px 10px',
    background: '#fff',
  },
  headerTitle: { fontSize: 14, fontWeight: 700, color: '#1f2025' },
  clearBtn: {
    fontSize: 11,
    color: CORAL,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    padding: 0,
    '&:hover': { textDecoration: 'underline' },
  },

  list: { flex: 1, overflowY: 'auto' as any, background: '#fff' },
  empty: {
    padding: '32px 16px',
    textAlign: 'center' as any,
    color: '#c4c8d0',
    fontSize: 13,
  },

  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    transition: 'background 0.15s',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: '#fafafa' },
  },
  itemUnread: { background: 'rgba(254,58,106,0.04)' },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1f2025',
    marginBottom: 2,
  },
  itemBody: {
    fontSize: 11,
    color: '#8a8f99',
    lineHeight: 1.4,
    overflow: 'hidden',
    display: '-webkit-box' as any,
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
  },
  itemTime: { fontSize: 10, color: '#c4c8d0', marginTop: 3 },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: CORAL,
    flexShrink: 0,
    marginTop: 5,
  },
}));

interface Notif {
  id: string;
  type: 'announcement' | 'enrollment' | 'submission' | 'grade';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const timeAgo = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return '';
  }
};

const TYPE_META: Record<
  Notif['type'],
  { icon: React.ElementType; color: string; bg: string }
> = {
  announcement: {
    icon: AnnouncementIcon,
    color: CORAL,
    bg: 'rgba(254,58,106,0.10)',
  },
  enrollment: {
    icon: PersonAddIcon,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.10)',
  },
  submission: {
    icon: AssignmentIcon,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.10)',
  },
  grade: {
    icon: CheckCircleOutlineIcon,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.10)',
  },
};

const POLL_MS = 60_000; // refresh every 60 s

const NotificationBell: React.FC = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const student = isStudent(user);
  const trainer = isTrainer(user);
  const hubManager = isHubManager(user);
  const isAdmin = !student && !trainer; // admin / hub manager / super admin

  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unread = notifs.filter((n) => !readIds.has(n.id)).length;

  const buildNotifs = useCallback(() => {
    const next: Notif[] = [];

    // ── Announcements (all roles) ──────────────────────────────────
    get(
      remoteRoutes.announcements,
      (data: any) => {
        const list: any[] = Array.isArray(data) ? data : data?.data || [];
        list.slice(0, 5).forEach((a: any) => {
          next.push({
            id: `ann-${a.id}`,
            type: 'announcement',
            title: a.title || 'Announcement',
            body: a.message || a.body || a.content || '',
            time: timeAgo(a.createdAt || a.date),
            read: false,
          });
        });
        setNotifs((prev) => mergeNotifs(prev, next, 'announcement'));
      },
      undefined,
      undefined,
    );

    // ── Pending enrollments (admin / hub manager) ──────────────────
    if (isAdmin || hubManager) {
      get(
        remoteRoutes.enrollmentPending,
        (data: any) => {
          const list: any[] = Array.isArray(data) ? data : data?.data || [];
          const pending: Notif[] = list.slice(0, 5).map((e: any) => ({
            id: `enr-${e.id}`,
            type: 'enrollment' as const,
            title: 'New Enrollment Request',
            body: `${
              e.studentName || e.name || 'A student'
            } wants to enroll in ${e.courseName || 'a course'}`,
            time: timeAgo(e.createdAt || e.requestedAt),
            read: false,
          }));
          setNotifs((prev) => mergeNotifs(prev, pending, 'enrollment'));
        },
        undefined,
        undefined,
      );
    }

    // ── Ungraded submissions (admin / trainer) ─────────────────────
    if (isAdmin || trainer) {
      const params = trainer
        ? { instructorId: user?.contactId ?? user?.id, limit: 5 }
        : { limit: 5 };
      search(
        remoteRoutes.assignmentSubmissions,
        params,
        (data: any) => {
          const list: any[] = Array.isArray(data) ? data : data?.data || [];
          const ungraded = list
            .filter(
              (s: any) =>
                !s.grade && (s.status || '').toLowerCase() !== 'graded',
            )
            .slice(0, 5)
            .map((s: any) => ({
              id: `sub-${s.id}`,
              type: 'submission' as const,
              title: 'Assignment Submission',
              body: `${s.studentName || s.name || 'A student'} submitted "${
                s.assignmentTitle || s.projectTitle || 'an assignment'
              }"`,
              time: timeAgo(s.submittedAt || s.createdAt),
              read: false,
            }));
          setNotifs((prev) => mergeNotifs(prev, ungraded, 'submission'));
        },
        undefined,
        undefined,
      );
    }
  }, [isAdmin, hubManager, trainer, user?.contactId, user?.id]);

  useEffect(() => {
    buildNotifs();
    timerRef.current = setInterval(buildNotifs, POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [buildNotifs]);

  const open = (e: React.MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget);
  };

  const close = () => {
    // mark all current as read on close
    setReadIds(new Set(notifs.map((n) => n.id)));
    setAnchor(null);
  };

  const clearAll = () => {
    setReadIds(new Set(notifs.map((n) => n.id)));
  };

  return (
    <>
      <IconButton size="small" onClick={open} style={{ marginRight: 4 }}>
        <Badge badgeContent={unread || 0} className={classes.badge} max={9}>
          {unread > 0 ? (
            <NotificationsActiveIcon
              style={{ fontSize: 22 }}
              className={classes.bellActive}
            />
          ) : (
            <NotificationsNoneIcon
              style={{ fontSize: 22 }}
              className={classes.bell}
            />
          )}
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ className: classes.popover }}
      >
        {/* Header */}
        <div className={classes.header}>
          <Typography className={classes.headerTitle}>
            Notifications {unread > 0 && `(${unread})`}
          </Typography>
          {unread > 0 && (
            <button className={classes.clearBtn} onClick={clearAll}>
              Mark all read
            </button>
          )}
        </div>
        <Divider />

        {/* List */}
        <div className={classes.list}>
          {notifs.length === 0 ? (
            <div className={classes.empty}>
              <NotificationsNoneIcon
                style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}
              />
              <br />
              No notifications yet
            </div>
          ) : (
            notifs.map((n) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              const isUnread = !readIds.has(n.id);
              return (
                <div
                  key={n.id}
                  className={`${classes.item} ${
                    isUnread ? classes.itemUnread : ''
                  }`}
                >
                  <div
                    className={classes.iconBox}
                    style={{ background: meta.bg }}
                  >
                    <Icon style={{ fontSize: 17, color: meta.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={classes.itemTitle}>{n.title}</div>
                    <div className={classes.itemBody}>{n.body}</div>
                    {n.time && <div className={classes.itemTime}>{n.time}</div>}
                  </div>
                  {isUnread && <div className={classes.unreadDot} />}
                </div>
              );
            })
          )}
        </div>
      </Popover>
    </>
  );
};

// Merge incoming notifs of a given type without duplicating existing ones
function mergeNotifs(
  prev: Notif[],
  incoming: Notif[],
  type: Notif['type'],
): Notif[] {
  const kept = prev.filter((n) => n.type !== type);
  return [...incoming, ...kept].slice(0, 20);
}

export default NotificationBell;
