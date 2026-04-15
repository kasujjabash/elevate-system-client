import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputBase,
  TextField,
  Typography,
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import ForumIcon from '@material-ui/icons/Forum';
import GroupIcon from '@material-ui/icons/Group';
import PersonIcon from '@material-ui/icons/Person';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { get, post } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';
const GREEN = '#10b981';
const BLUE = '#3b82f6';
const AMBER = '#f59e0b';
const PURPLE = '#8b5cf6';
const AVATAR_COLORS = [PURPLE, BLUE, GREEN, AMBER, CORAL, '#06b6d4'];

const POLL_INTERVAL = 15_000; // 15 s

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: 'calc(100vh - 112px)',
    display: 'flex',
    flexDirection: 'column' as any,
    paddingBottom: 0,
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: { fontSize: 22, fontWeight: 800, color: DARK },
  newBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'none' as any,
    '&:hover': { background: '#e02d5c' },
  },

  layout: {
    display: 'flex',
    gap: 0,
    flex: 1,
    minHeight: 0,
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },

  // ── Left panel ─────────────────────────────────────────────────────────────
  leftPanel: {
    width: 300,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as any,
    borderRight: '1px solid rgba(0,0,0,0.07)',
    [theme.breakpoints.down('sm')]: { width: '100%' },
  },
  leftHeader: {
    padding: '14px 16px 10px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  leftTitle: { fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 10 },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    background: '#f5f5f5',
    borderRadius: 8,
    padding: '6px 12px',
  },
  conversationList: { flex: 1, overflowY: 'auto' as any },

  sectionHeading: {
    padding: '8px 16px 4px',
    fontSize: 10,
    fontWeight: 700,
    color: '#9ca3af',
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as any,
    borderBottom: '1px solid rgba(0,0,0,0.04)',
    background: '#fafafa',
  },

  conversation: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(0,0,0,0.04)',
    transition: 'background 0.1s',
    '&:hover': { background: '#fafafa' },
  },
  conversationActive: {
    background: 'rgba(254,58,106,0.05)',
    borderLeft: `3px solid ${CORAL}`,
    paddingLeft: 13,
  },
  convAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    position: 'relative',
  },
  groupAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    background:
      'linear-gradient(135deg, rgba(254,58,106,0.15) 0%, rgba(254,140,69,0.15) 100%)',
  },
  convName: { fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 2 },
  convSnippet: {
    fontSize: 12,
    color: '#8a8f99',
    whiteSpace: 'nowrap' as any,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 160,
  },
  convMeta: {
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'column' as any,
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  convTime: { fontSize: 10, color: '#b0b5bf' },
  courseBadge: {
    fontSize: 9,
    fontWeight: 700,
    borderRadius: 4,
    background: 'rgba(254,58,106,0.08)',
    color: CORAL,
    padding: '1px 5px',
  },
  memberCount: {
    fontSize: 10,
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: CORAL,
    flexShrink: 0,
  },

  // ── Right panel ─────────────────────────────────────────────────────────────
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as any,
    minWidth: 0,
  },
  chatHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  chatHeaderName: { fontSize: 15, fontWeight: 700, color: DARK },
  chatHeaderMeta: { fontSize: 12, color: '#8a8f99' },
  chatMessages: {
    flex: 1,
    overflowY: 'auto' as any,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column' as any,
    gap: 12,
  },
  messagePair: {
    display: 'flex',
    flexDirection: 'column' as any,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#8a8f99',
    marginBottom: 3,
    paddingLeft: 4,
  },
  senderLabelMine: {
    textAlign: 'right' as any,
    paddingRight: 4,
    paddingLeft: 0,
    color: CORAL,
  },
  bubble: {
    maxWidth: '68%',
    borderRadius: 14,
    padding: '10px 14px',
    fontSize: 13,
    lineHeight: 1.55,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    background: `linear-gradient(135deg, ${CORAL}, ${ORANGE})`,
    color: '#fff',
    borderBottomRightRadius: 3,
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    background: '#f5f5f5',
    color: DARK,
    borderBottomLeftRadius: 3,
  },
  bubbleMeta: {
    fontSize: 10,
    opacity: 0.65,
    marginTop: 4,
    textAlign: 'right' as any,
  },
  bubbleMetaTheirs: { textAlign: 'left' as any },
  chatInput: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(0,0,0,0.07)',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-end',
  },
  sendBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    minWidth: 44,
    width: 44,
    height: 44,
    '&:hover': { background: '#e02d5c' },
    '&:disabled': { background: '#f3f4f6', color: '#c0c4ce' },
  },

  // Empty & loading states
  emptyPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as any,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#b0b5bf',
    padding: 40,
    textAlign: 'center' as any,
  },

  // Contact picker dialog
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { opacity: 0.8 },
  },
  contactName: { fontSize: 13, fontWeight: 600, color: DARK },
  contactRole: { fontSize: 11, color: '#8a8f99' },
  contactCourse: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 4,
    background: 'rgba(254,58,106,0.08)',
    color: CORAL,
    padding: '1px 5px',
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  (name || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const fmtTime = (iso: string) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return format(d, 'h:mm a');
    return format(d, 'd MMM');
  } catch {
    return '';
  }
};

const fmtFull = (iso: string) => {
  if (!iso) return '';
  try {
    return format(new Date(iso), 'h:mm a');
  } catch {
    return '';
  }
};

const avatarColor = (name: string) =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// Is this a group/course room?
const isGroupRoom = (room: any) =>
  room.type === 'group' || !!room.courseId || !!room.courseName;

// ── Main component ─────────────────────────────────────────────────────────────
const CourseChat = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const myId = String(user?.id || user?.contactId || '');
  const myName = user?.fullName || 'Me';
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [rooms, setRooms] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contactQuery, setContactQuery] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [search, setSearch] = useState('');

  // Broadcast unread count to NavMenu (same-tab custom event + localStorage)
  const broadcastUnread = (roomList: any[]) => {
    const total = roomList.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
    localStorage.setItem('elevate_chat_unread', String(total));
    window.dispatchEvent(
      new CustomEvent('chatUnreadUpdate', { detail: total }),
    );
  };

  // Load rooms + contacts on mount
  useEffect(() => {
    get(
      remoteRoutes.chatRooms,
      (data: any) => {
        const list = Array.isArray(data) ? data : [];
        setRooms(list);
        broadcastUnread(list);
        setLoadingRooms(false);
      },
      undefined,
      () => setLoadingRooms(false),
    );

    get(
      remoteRoutes.chatContacts,
      (data: any) => {
        setContacts(Array.isArray(data) ? data : []);
      },
      undefined,
      () => {},
    );
  }, []);

  // Fetch messages & poll when active room changes
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeRoom) return;

    const fetchMsgs = (initial: boolean = false) => {
      if (initial) {
        setLoadingMsgs(true);
        setMessages([]);
      }
      get(
        `${remoteRoutes.chatRooms}/${activeRoom.id}/messages`,
        (data: any) => {
          setMessages(Array.isArray(data) ? data : []);
          if (initial) setLoadingMsgs(false);
        },
        undefined,
        () => {
          if (initial) setLoadingMsgs(false);
        },
      );
    };

    fetchMsgs(true);
    pollRef.current = setInterval(() => fetchMsgs(false), POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeRoom?.id]);

  // Scroll to bottom when messages load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!text.trim() || !activeRoom) return;
    setSending(true);
    const optimistic = {
      id: `tmp_${Date.now()}`,
      content: text,
      senderId: myId,
      senderName: myName,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText('');

    post(
      `${remoteRoutes.chatRooms}/${activeRoom.id}/messages`,
      { content: optimistic.content },
      (saved: any) => {
        setSending(false);
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? saved || optimistic : m)),
        );
        setRooms((prev) =>
          prev.map((r) =>
            r.id === activeRoom.id
              ? {
                  ...r,
                  lastMessage: optimistic.content,
                  lastMessageAt: optimistic.createdAt,
                }
              : r,
          ),
        );
      },
      undefined,
      () => setSending(false),
    );
  };

  // Start a 1:1 direct message with a contact
  const handleStartDirect = (contact: any) => {
    setCreatingRoom(true);
    post(
      remoteRoutes.chatRooms,
      {
        type: 'direct',
        participantId: contact.id || contact.contactId,
        courseId: contact.courseId,
      },
      (room: any) => {
        setCreatingRoom(false);
        setShowNewChat(false);
        setContactQuery('');
        setRooms((prev) => {
          const exists = prev.find((r) => r.id === room.id);
          return exists ? prev : [room, ...prev];
        });
        setActiveRoom(room);
      },
      undefined,
      () => setCreatingRoom(false),
    );
  };

  // Get or create a course group room
  const handleOpenCourseRoom = (courseId: string, courseName: string) => {
    // Check if room already loaded
    const existing = rooms.find(
      (r) => isGroupRoom(r) && String(r.courseId) === String(courseId),
    );
    if (existing) {
      setActiveRoom(existing);
      return;
    }
    setCreatingRoom(true);
    post(
      remoteRoutes.chatRooms,
      { type: 'group', courseId, title: courseName },
      (room: any) => {
        setCreatingRoom(false);
        setRooms((prev) => {
          const exists = prev.find((r) => r.id === room.id);
          return exists ? prev : [room, ...prev];
        });
        setActiveRoom(room);
      },
      undefined,
      () => setCreatingRoom(false),
    );
  };

  const filteredContacts = contacts.filter((c) => {
    if (!contactQuery) return true;
    return (c.fullName || c.name || '')
      .toLowerCase()
      .includes(contactQuery.toLowerCase());
  });

  const courseRooms = rooms.filter(isGroupRoom);
  const directRooms = rooms.filter((r) => !isGroupRoom(r));

  const filterRoom = (r: any) => {
    if (!search) return true;
    const name = r.title || r.courseName || '';
    return name.toLowerCase().includes(search.toLowerCase());
  };

  const otherParticipant = (room: any) => {
    const parts: any[] = room.participants || [];

    // Find the participant that isn't the current user
    const other =
      parts.find(
        (p: any) => String(p.id || p.contactId || p.userId) !== myId,
      ) ||
      parts[0] ||
      {};

    // The API often returns participants with just { id } — cross-reference
    // the contacts list we already loaded for the full name
    const otherId = String(other.id || other.contactId || other.userId || '');
    const fromContacts = otherId
      ? contacts.find(
          (c: any) =>
            String(c.id || c.contactId) === otherId ||
            String(c.userId) === otherId,
        )
      : null;

    // Also check room-level fields some backends put on direct rooms
    const roomLevel = room.otherUser || room.recipient || room.peer || {};

    // Merge: contacts data has the richest name info
    const merged: any = { ...roomLevel, ...other, ...(fromContacts || {}) };

    const name =
      merged.fullName ||
      merged.name ||
      merged.displayName ||
      (merged.firstName && merged.lastName
        ? `${merged.firstName} ${merged.lastName}`.trim()
        : null) ||
      merged.firstName ||
      merged.lastName ||
      merged.username ||
      (merged.email ? merged.email.split('@')[0] : null) ||
      room.title ||
      null;

    return { ...merged, displayName: name };
  };

  const roomDisplayName = (room: any) => {
    if (isGroupRoom(room))
      return room.title || room.courseName || 'Course Chat';
    const other = otherParticipant(room);
    return (
      other.displayName ||
      other.fullName ||
      other.name ||
      room.title ||
      'Direct Message'
    );
  };

  return (
    <Layout>
      <div className={classes.root}>
        {/* Header */}
        <div className={classes.pageHeader}>
          <div className={classes.pageTitle}>Chats &amp; Inquiries</div>
          <Button
            variant="contained"
            className={classes.newBtn}
            startIcon={<AddIcon />}
            disableElevation
            onClick={() => setShowNewChat(true)}
          >
            Direct Message
          </Button>
        </div>

        {/* Main layout */}
        <div className={classes.layout}>
          {/* ── Left: conversation list ──────────────────────────────────── */}
          <div className={classes.leftPanel}>
            <div className={classes.leftHeader}>
              <div className={classes.leftTitle}>Conversations</div>
              <div className={classes.searchBox}>
                <SearchIcon style={{ fontSize: 16, color: '#9ca3af' }} />
                <InputBase
                  placeholder="Search conversations…"
                  style={{ fontSize: 12, flex: 1 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className={classes.conversationList}>
              {loadingRooms ? (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <CircularProgress size={22} style={{ color: CORAL }} />
                </div>
              ) : (
                <>
                  {/* ── Course / Group rooms ── */}
                  {courseRooms.filter(filterRoom).length > 0 && (
                    <>
                      <div className={classes.sectionHeading}>Course Chats</div>
                      {courseRooms.filter(filterRoom).map((room) => {
                        const name =
                          room.title || room.courseName || 'Course Chat';
                        const memberCount =
                          room.participants?.length || room.memberCount || 0;
                        const isActive = activeRoom?.id === room.id;
                        const unread = room.unreadCount || 0;
                        const snippet = (() => {
                          if (!room.lastMessage)
                            return 'Start the conversation';
                          if (typeof room.lastMessage === 'object') {
                            return (
                              room.lastMessage.content ||
                              room.lastMessage.body ||
                              'New message'
                            );
                          }
                          return String(room.lastMessage);
                        })();
                        return (
                          <div
                            key={room.id}
                            className={`${classes.conversation} ${
                              isActive ? classes.conversationActive : ''
                            }`}
                            onClick={() => setActiveRoom(room)}
                          >
                            <div
                              style={{ position: 'relative', flexShrink: 0 }}
                            >
                              <div className={classes.groupAvatarBox}>
                                <GroupIcon
                                  style={{ fontSize: 20, color: CORAL }}
                                />
                              </div>
                              {unread > 0 && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: -3,
                                    right: -3,
                                    background: CORAL,
                                    color: '#fff',
                                    borderRadius: 10,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    minWidth: 16,
                                    height: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 3px',
                                    border: '2px solid #fff',
                                  }}
                                >
                                  {unread > 99 ? '99+' : unread}
                                </div>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className={classes.convName}>{name}</div>
                              <div className={classes.convSnippet}>
                                {snippet}
                              </div>
                            </div>
                            <div className={classes.convMeta}>
                              <span className={classes.convTime}>
                                {fmtTime(room.lastMessageAt || room.createdAt)}
                              </span>
                              {memberCount > 0 && (
                                <span className={classes.memberCount}>
                                  <PersonIcon style={{ fontSize: 10 }} />
                                  {memberCount}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* ── Direct rooms ── */}
                  {directRooms.filter(filterRoom).length > 0 && (
                    <>
                      <div className={classes.sectionHeading}>
                        {directRooms.filter(filterRoom).length === 1
                          ? (() => {
                              const room = directRooms.filter(filterRoom)[0];
                              const other = otherParticipant(room);
                              return (
                                other.displayName ||
                                other.fullName ||
                                other.name ||
                                other.firstName ||
                                'Direct Message'
                              );
                            })()
                          : 'Direct Messages'}
                      </div>
                      {directRooms.filter(filterRoom).map((room) => {
                        const other = otherParticipant(room);
                        // Resolve best available name — never show raw fallback text
                        const name =
                          other.displayName ||
                          other.fullName ||
                          other.name ||
                          (other.firstName && other.lastName
                            ? `${other.firstName} ${other.lastName}`.trim()
                            : null) ||
                          other.firstName ||
                          other.lastName ||
                          other.username ||
                          (other.email ? other.email.split('@')[0] : null) ||
                          room.title ||
                          null;
                        const displayName = name || 'Loading…';
                        const isActive = activeRoom?.id === room.id;
                        const unread = room.unreadCount || 0;
                        const snippet = (() => {
                          if (!room.lastMessage)
                            return 'Start the conversation';
                          if (typeof room.lastMessage === 'object') {
                            const c =
                              room.lastMessage.content ||
                              room.lastMessage.body ||
                              room.lastMessage.text ||
                              '';
                            return c || 'New message';
                          }
                          return String(room.lastMessage);
                        })();
                        return (
                          <div
                            key={room.id}
                            className={`${classes.conversation} ${
                              isActive ? classes.conversationActive : ''
                            }`}
                            onClick={() => setActiveRoom(room)}
                          >
                            <div
                              className={classes.convAvatar}
                              style={{
                                background: name
                                  ? avatarColor(name)
                                  : '#c4c8d0',
                              }}
                            >
                              {name ? initials(name) : '?'}
                              {unread > 0 && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: -3,
                                    right: -3,
                                    background: CORAL,
                                    color: '#fff',
                                    borderRadius: 10,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    minWidth: 16,
                                    height: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 3px',
                                    border: '2px solid #fff',
                                  }}
                                >
                                  {unread > 99 ? '99+' : unread}
                                </div>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className={classes.convName}>
                                {displayName}
                              </div>
                              <div className={classes.convSnippet}>
                                {snippet}
                              </div>
                            </div>
                            <div className={classes.convMeta}>
                              <span className={classes.convTime}>
                                {fmtTime(room.lastMessageAt || room.createdAt)}
                              </span>
                              {room.courseName && (
                                <span className={classes.courseBadge}>
                                  {room.courseName}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Empty state */}
                  {courseRooms.length === 0 && directRooms.length === 0 && (
                    <div
                      style={{
                        padding: '32px 16px',
                        textAlign: 'center',
                        color: '#b0b5bf',
                      }}
                    >
                      <ForumIcon
                        style={{
                          fontSize: 36,
                          color: '#e0e0e0',
                          display: 'block',
                          margin: '0 auto 8px',
                        }}
                      />
                      <Typography style={{ fontSize: 12 }}>
                        No conversations yet
                      </Typography>
                      <Typography style={{ fontSize: 11, marginTop: 4 }}>
                        Click "Direct Message" to start chatting
                      </Typography>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Right: chat panel ─────────────────────────────────────────── */}
          <div className={classes.rightPanel}>
            {!activeRoom ? (
              <div className={classes.emptyPane}>
                <ForumIcon
                  style={{ fontSize: 52, color: '#e0e0e0', marginBottom: 14 }}
                />
                <Typography
                  style={{ fontWeight: 700, color: '#8a8f99', fontSize: 15 }}
                >
                  Select a conversation
                </Typography>
                <Typography
                  style={{
                    color: '#b0b5bf',
                    marginTop: 6,
                    fontSize: 13,
                    maxWidth: 280,
                  }}
                >
                  Choose a conversation from the left, or start a new direct
                  message with a classmate or your trainer.
                </Typography>
                <Button
                  variant="contained"
                  className={classes.newBtn}
                  startIcon={<AddIcon />}
                  disableElevation
                  style={{ marginTop: 20 }}
                  onClick={() => setShowNewChat(true)}
                >
                  Direct Message
                </Button>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className={classes.chatHeader}>
                  <IconButton
                    size="small"
                    style={{ marginRight: 4 }}
                    onClick={() => setActiveRoom(null)}
                  >
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>

                  {isGroupRoom(activeRoom) ? (
                    <>
                      <div
                        className={classes.groupAvatarBox}
                        style={{ width: 36, height: 36 }}
                      >
                        <GroupIcon style={{ fontSize: 18, color: CORAL }} />
                      </div>
                      <div>
                        <div className={classes.chatHeaderName}>
                          {activeRoom.title ||
                            activeRoom.courseName ||
                            'Course Chat'}
                        </div>
                        <div className={classes.chatHeaderMeta}>
                          {activeRoom.participants?.length > 0
                            ? `${activeRoom.participants.length} members`
                            : 'Group chat'}
                        </div>
                      </div>
                    </>
                  ) : (
                    (() => {
                      const other = otherParticipant(activeRoom);
                      const name =
                        other.displayName ||
                        other.fullName ||
                        other.name ||
                        other.firstName ||
                        `${other.firstName || ''} ${
                          other.lastName || ''
                        }`.trim() ||
                        other.username ||
                        other.email?.split('@')[0] ||
                        activeRoom.title ||
                        'Chat';
                      return (
                        <>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: avatarColor(name),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#fff',
                              flexShrink: 0,
                            }}
                          >
                            {initials(name)}
                          </div>
                          <div>
                            <div className={classes.chatHeaderName}>{name}</div>
                            {(other.role || activeRoom.courseName) && (
                              <div className={classes.chatHeaderMeta}>
                                {other.role}
                                {other.role && activeRoom.courseName
                                  ? ' · '
                                  : ''}
                                {activeRoom.courseName}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()
                  )}
                </div>

                {/* Messages */}
                <div className={classes.chatMessages}>
                  {loadingMsgs ? (
                    <div style={{ textAlign: 'center', padding: 32 }}>
                      <CircularProgress size={22} style={{ color: CORAL }} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#b0b5bf',
                        padding: 32,
                      }}
                    >
                      <Typography style={{ fontSize: 13 }}>
                        No messages yet — say hello!
                      </Typography>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMine =
                        String(msg.senderId || msg.sender?.id) === myId;
                      const sender = isMine
                        ? null
                        : msg.sender ||
                          activeRoom?.participants?.find(
                            (p: any) =>
                              String(p.id || p.contactId || p.userId) ===
                              String(msg.senderId || msg.sender?.id),
                          );

                      // Enhanced sender name extraction
                      let senderName = isMine ? 'You' : 'Unknown';
                      if (!isMine && sender) {
                        senderName =
                          sender.displayName ||
                          sender.fullName ||
                          sender.name ||
                          (sender.firstName && sender.lastName
                            ? `${sender.firstName} ${sender.lastName}`.trim()
                            : '') ||
                          sender.firstName ||
                          sender.lastName ||
                          sender.username ||
                          sender.email?.split('@')[0] ||
                          msg.senderName ||
                          'Unknown';
                      } else if (!isMine) {
                        senderName =
                          msg.senderName ||
                          msg.sender?.fullName ||
                          msg.sender?.name ||
                          'Unknown';
                      }

                      // Count messages from this sender
                      const messagesFromSender = messages.filter(
                        (m) =>
                          String(m.senderId || m.sender?.id) ===
                          String(msg.senderId || msg.sender?.id),
                      ).length;

                      return (
                        <div key={msg.id} className={classes.messagePair}>
                          <div
                            className={`${classes.senderLabel} ${
                              isMine ? classes.senderLabelMine : ''
                            }`}
                          >
                            {senderName}
                            {!isMine && messagesFromSender > 1 && (
                              <span
                                style={{
                                  fontSize: 8,
                                  marginLeft: 4,
                                  opacity: 0.7,
                                }}
                              >
                                ({messagesFromSender})
                              </span>
                            )}
                          </div>
                          <div
                            className={`${classes.bubble} ${
                              isMine ? classes.bubbleMine : classes.bubbleTheirs
                            }`}
                          >
                            {typeof (msg.content || msg.body) === 'object'
                              ? JSON.stringify(msg.content || msg.body)
                              : msg.content || msg.body}
                            <div
                              className={`${classes.bubbleMeta} ${
                                !isMine ? classes.bubbleMetaTheirs : ''
                              }`}
                            >
                              {fmtFull(msg.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className={classes.chatInput}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Type a message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    style={{ borderRadius: 8 }}
                  />
                  <IconButton
                    className={classes.sendBtn}
                    disabled={sending || !text.trim()}
                    onClick={handleSend}
                  >
                    {sending ? (
                      <CircularProgress size={16} style={{ color: CORAL }} />
                    ) : (
                      <SendIcon style={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── New direct message dialog ─────────────────────────────────── */}
        <Dialog
          open={showNewChat}
          onClose={() => {
            setShowNewChat(false);
            setContactQuery('');
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              New Direct Message
            </span>
            <IconButton
              size="small"
              onClick={() => {
                setShowNewChat(false);
                setContactQuery('');
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent style={{ paddingTop: 14, paddingBottom: 16 }}>
            <Typography
              style={{ fontSize: 12, color: '#8a8f99', marginBottom: 12 }}
            >
              You can message classmates enrolled in the same course, your
              trainer, and your hub manager.
            </Typography>
            <div
              style={{
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#f5f5f5',
                borderRadius: 8,
                padding: '7px 12px',
              }}
            >
              <SearchIcon style={{ fontSize: 17, color: '#9ca3af' }} />
              <InputBase
                autoFocus
                placeholder="Search classmates or trainer…"
                style={{ fontSize: 13, flex: 1 }}
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
              />
            </div>

            {contacts.length === 0 ? (
              <Typography
                style={{
                  fontSize: 13,
                  color: '#8a8f99',
                  textAlign: 'center',
                  padding: '16px 0',
                }}
              >
                No contacts available yet.
              </Typography>
            ) : filteredContacts.length === 0 ? (
              <Typography
                style={{
                  fontSize: 13,
                  color: '#8a8f99',
                  textAlign: 'center',
                  padding: '16px 0',
                }}
              >
                No matches found.
              </Typography>
            ) : (
              filteredContacts.map((c, i) => {
                const name = c.fullName || c.name || 'User';
                return (
                  <div
                    key={c.id || c.contactId || i}
                    className={classes.contactRow}
                    onClick={() => !creatingRoom && handleStartDirect(c)}
                    style={{ opacity: creatingRoom ? 0.6 : 1 }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: avatarColor(name),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {initials(name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className={classes.contactName}>{name}</div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          alignItems: 'center',
                          marginTop: 2,
                        }}
                      >
                        {c.role && (
                          <span className={classes.contactRole}>{c.role}</span>
                        )}
                        {c.courseName && (
                          <span className={classes.contactCourse}>
                            {c.courseName}
                          </span>
                        )}
                      </div>
                    </div>
                    {creatingRoom && (
                      <CircularProgress size={16} style={{ color: CORAL }} />
                    )}
                  </div>
                );
              })
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export { CourseChat as default, CourseChat };
export type {};
