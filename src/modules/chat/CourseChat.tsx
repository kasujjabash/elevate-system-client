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
  dayLabel: {
    textAlign: 'center' as any,
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: 600,
    margin: '6px 0',
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
  bubbleSenderName: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 3,
    color: 'rgba(255,255,255,0.75)',
  },
  bubbleSenderNameTheirs: { color: '#8a8f99' },
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

// ── Main component ─────────────────────────────────────────────────────────────
const CourseChat = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const myId = user?.id || user?.contactId;
  const bottomRef = useRef<HTMLDivElement>(null);

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

  // Load rooms + contacts on mount
  useEffect(() => {
    get(
      remoteRoutes.chatRooms,
      (data: any) => {
        setRooms(Array.isArray(data) ? data : []);
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

  // Load messages when room changes
  useEffect(() => {
    if (!activeRoom) return;
    setLoadingMsgs(true);
    setMessages([]);
    get(
      `${remoteRoutes.chatRooms}/${activeRoom.id}/messages`,
      (data: any) => {
        setMessages(Array.isArray(data) ? data : []);
        setLoadingMsgs(false);
      },
      undefined,
      () => setLoadingMsgs(false),
    );
  }, [activeRoom?.id]);

  // Scroll to bottom when messages load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !activeRoom) return;
    setSending(true);
    const optimistic = {
      id: `tmp_${Date.now()}`,
      content: text,
      senderId: myId,
      senderName: user?.fullName || 'Me',
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
        // update room snippet
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

  const handleStartChat = (contact: any) => {
    setCreatingRoom(true);
    post(
      remoteRoutes.chatRooms,
      {
        participantId: contact.id || contact.contactId,
        courseId: contact.courseId,
      },
      (room: any) => {
        setCreatingRoom(false);
        setShowNewChat(false);
        setContactQuery('');
        // add room if not already in list
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

  const otherParticipant = (room: any) => {
    const parts: any[] = room.participants || [];
    return (
      parts.find((p) => String(p.id || p.contactId) !== String(myId)) ||
      parts[0] ||
      {}
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
            New Message
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
                />
              </div>
            </div>

            <div className={classes.conversationList}>
              {loadingRooms ? (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <CircularProgress size={22} style={{ color: CORAL }} />
                </div>
              ) : rooms.length === 0 ? (
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
                    Click "New Message" to start one
                  </Typography>
                </div>
              ) : (
                rooms.map((room) => {
                  const other = otherParticipant(room);
                  const name =
                    other.fullName || other.name || room.title || 'Chat';
                  const colorIdx =
                    (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
                  const isActive = activeRoom?.id === room.id;
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
                        style={{ background: AVATAR_COLORS[colorIdx] }}
                      >
                        {initials(name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={classes.convName}>{name}</div>
                        <div className={classes.convSnippet}>
                          {room.lastMessage || 'Start the conversation'}
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
                        {room.unreadCount > 0 && (
                          <div className={classes.unreadDot} />
                        )}
                      </div>
                    </div>
                  );
                })
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
                  Choose a conversation from the left, or start a new one with a
                  classmate or your trainer.
                </Typography>
                <Button
                  variant="contained"
                  className={classes.newBtn}
                  startIcon={<AddIcon />}
                  disableElevation
                  style={{ marginTop: 20 }}
                  onClick={() => setShowNewChat(true)}
                >
                  New Message
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
                  {(() => {
                    const other = otherParticipant(activeRoom);
                    const name =
                      other.fullName ||
                      other.name ||
                      activeRoom.title ||
                      'Chat';
                    const colorIdx =
                      (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
                    return (
                      <>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: AVATAR_COLORS[colorIdx],
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
                          {activeRoom.courseName && (
                            <div className={classes.chatHeaderMeta}>
                              {activeRoom.courseName}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
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
                    messages.map((msg) => {
                      const isMine =
                        String(msg.senderId || msg.sender?.id) === String(myId);
                      return (
                        <div
                          key={msg.id}
                          className={`${classes.bubble} ${
                            isMine ? classes.bubbleMine : classes.bubbleTheirs
                          }`}
                        >
                          {!isMine && (
                            <div
                              className={`${classes.bubbleSenderName} ${classes.bubbleSenderNameTheirs}`}
                            >
                              {msg.senderName || msg.sender?.fullName || 'User'}
                            </div>
                          )}
                          {msg.content || msg.body}
                          <div
                            className={`${classes.bubbleMeta} ${
                              !isMine ? classes.bubbleMetaTheirs : ''
                            }`}
                          >
                            {fmtFull(msg.createdAt)}
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
                    onKeyPress={(e) => {
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

        {/* ── New message dialog ─────────────────────────────────────────── */}
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
            <span style={{ fontWeight: 700, fontSize: 15 }}>New Message</span>
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
                const colorIdx =
                  (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
                return (
                  <div
                    key={c.id || c.contactId || i}
                    className={classes.contactRow}
                    onClick={() => !creatingRoom && handleStartChat(c)}
                    style={{ opacity: creatingRoom ? 0.6 : 1 }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: AVATAR_COLORS[colorIdx],
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

export default CourseChat;
