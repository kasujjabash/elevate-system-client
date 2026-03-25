import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SendIcon from '@material-ui/icons/Send';
import ForumIcon from '@material-ui/icons/Forum';
import AddIcon from '@material-ui/icons/Add';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { get, post } from '../../utils/ajax';
import Toast from '../../utils/Toast';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';

const useStyles = makeStyles(() => ({
  root: { padding: 24 },
  breadcrumb: { fontSize: 13, color: '#8a8f99', marginBottom: 6 },
  breadcrumbSep: { margin: '0 6px', color: '#c4c8d0' },
  breadcrumbActive: { color: CORAL },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: { fontSize: 24, fontWeight: 700, color: DARK },

  layout: { display: 'flex', gap: 20, alignItems: 'flex-start' },

  // Left panel — thread list
  threadList: {
    width: 300,
    flexShrink: 0,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  threadListHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    fontSize: 13,
    fontWeight: 700,
    color: DARK,
  },
  thread: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'background 0.1s',
    '&:hover': { background: '#fafafa' },
  },
  threadActive: {
    background: 'rgba(254,58,106,0.05)',
    borderLeft: `3px solid ${CORAL}`,
  },
  threadSubject: {
    fontSize: 13,
    fontWeight: 600,
    color: DARK,
    marginBottom: 3,
  },
  threadSnippet: {
    fontSize: 12,
    color: '#8a8f99',
    whiteSpace: 'nowrap' as any,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  threadMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  threadDate: { fontSize: 11, color: '#b0b5bf' },

  // Right panel — conversation
  chatPanel: {
    flex: 1,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column' as any,
    minHeight: 500,
  },
  chatHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    fontSize: 14,
    fontWeight: 700,
    color: DARK,
  },
  chatMessages: {
    flex: 1,
    padding: '16px 20px',
    overflowY: 'auto' as any,
    display: 'flex',
    flexDirection: 'column' as any,
    gap: 14,
  },
  msgBubble: {
    maxWidth: '70%',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    lineHeight: 1.5,
  },
  msgStudent: {
    alignSelf: 'flex-end',
    background: `linear-gradient(135deg, ${CORAL}, #fe8c45)`,
    color: '#fff',
    borderBottomRightRadius: 3,
  },
  msgStaff: {
    alignSelf: 'flex-start',
    background: '#f5f5f5',
    color: DARK,
    borderBottomLeftRadius: 3,
  },
  msgMeta: { fontSize: 11, opacity: 0.7, marginTop: 4 },
  chatInput: {
    padding: '12px 16px',
    borderTop: '1px solid rgba(0,0,0,0.07)',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-end',
  },

  // New inquiry form
  formCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: 24,
  },
  formTitle: { fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 },
  sendBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    fontSize: 13,
    padding: '10px 24px',
    '&:hover': { background: '#e02d5c' },
  },
  newBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    fontSize: 13,
    '&:hover': { background: '#e02d5c' },
  },
  emptyChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as any,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#b0b5bf',
    padding: 40,
  },
}));

const statusColor = (status: string) => {
  if (status === 'Resolved')
    return { background: 'rgba(16,185,129,0.1)', color: '#10b981' };
  if (status === 'Open')
    return { background: 'rgba(254,58,106,0.08)', color: CORAL };
  return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' };
};

const ChatsInquiries = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const [threads, setThreads] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    get(
      `${remoteRoutes.studentsRequests}?type=inquiry`,
      (data) => setThreads(Array.isArray(data) ? data : []),
      () => setThreads([]),
      () => {},
    );
  }, [user.contactId]);

  const loadMessages = (thread: any) => {
    setSelected(thread);
    setMessages([]);
    if (!thread.id) return;
    get(
      `${remoteRoutes.studentsRequests}/${thread.id}/messages`,
      (data) => setMessages(Array.isArray(data) ? data : []),
      () => setMessages([]),
      () => {},
    );
  };

  const handleSend = () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    post(
      `${remoteRoutes.studentsRequests}/${selected.id}/messages`,
      { body: reply },
      () => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            body: reply,
            senderType: 'student',
            createdAt: new Date().toISOString(),
          },
        ]);
        setReply('');
        setSending(false);
      },
      () => {
        Toast.error('Failed to send message.');
        setSending(false);
      },
    );
  };

  const handleNewInquiry = () => {
    if (!newSubject.trim() || !newBody.trim()) return;
    setSubmitting(true);
    post(
      remoteRoutes.studentsRequests,
      { subject: newSubject, body: newBody, type: 'inquiry' },
      (data: any) => {
        Toast.success('Inquiry submitted successfully!');
        setThreads((prev) => [data, ...prev]);
        setShowNew(false);
        setNewSubject('');
        setNewBody('');
        setSubmitting(false);
      },
      () => {
        Toast.error('Failed to submit inquiry. Please try again.');
        setSubmitting(false);
      },
    );
  };

  const fmt = (iso: string) => {
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

  return (
    <Layout title="Chats / Inquiries">
      <div className={classes.root}>
        {/* Breadcrumb */}
        <div className={classes.breadcrumb}>
          <span>Home</span>
          <span className={classes.breadcrumbSep}>›</span>
          <span className={classes.breadcrumbActive}>
            Chats &amp; Inquiries
          </span>
        </div>

        <div className={classes.header}>
          <div className={classes.pageTitle}>Chats &amp; Inquiries</div>
          <Button
            variant="contained"
            className={classes.newBtn}
            startIcon={<AddIcon />}
            onClick={() => {
              setShowNew(true);
              setSelected(null);
            }}
          >
            New Inquiry
          </Button>
        </div>

        {showNew ? (
          /* New inquiry form */
          <div className={classes.formCard}>
            <div className={classes.formTitle}>Submit a New Inquiry</div>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              style={{ marginBottom: 14 }}
            />
            <TextField
              fullWidth
              multiline
              rows={5}
              variant="outlined"
              size="small"
              label="Message"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Box display="flex" style={{ gap: 10 }}>
              <Button
                variant="contained"
                className={classes.sendBtn}
                disabled={submitting || !newSubject.trim() || !newBody.trim()}
                onClick={handleNewInquiry}
                endIcon={
                  submitting ? (
                    <CircularProgress size={14} style={{ color: '#fff' }} />
                  ) : (
                    <SendIcon />
                  )
                }
              >
                Submit Inquiry
              </Button>
              <Button
                variant="outlined"
                style={{
                  borderRadius: 8,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
                onClick={() => setShowNew(false)}
              >
                Cancel
              </Button>
            </Box>
          </div>
        ) : (
          <div className={classes.layout}>
            {/* Thread list */}
            <div className={classes.threadList}>
              <div className={classes.threadListHeader}>
                Your Inquiries ({threads.length})
              </div>
              {threads.length === 0 ? (
                <Box p={3} textAlign="center">
                  <ForumIcon
                    style={{
                      fontSize: 36,
                      color: '#e0e0e0',
                      display: 'block',
                      margin: '0 auto 8px',
                    }}
                  />
                  <Typography style={{ fontSize: 13, color: '#8a8f99' }}>
                    No inquiries yet
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ fontSize: 12, color: '#b0b5bf', marginTop: 4 }}
                  >
                    Tap "New Inquiry" to get started
                  </Typography>
                </Box>
              ) : (
                threads.map((t) => (
                  <div
                    key={t.id}
                    className={`${classes.thread} ${
                      selected?.id === t.id ? classes.threadActive : ''
                    }`}
                    onClick={() => loadMessages(t)}
                  >
                    <div className={classes.threadSubject}>
                      {t.subject || 'Inquiry'}
                    </div>
                    <div className={classes.threadSnippet}>
                      {t.lastMessage || t.body || '—'}
                    </div>
                    <div className={classes.threadMeta}>
                      <span className={classes.threadDate}>
                        {fmt(t.createdAt || t.date)}
                      </span>
                      <Chip
                        label={t.status || 'Open'}
                        size="small"
                        style={{
                          ...statusColor(t.status || 'Open'),
                          fontSize: 10,
                          fontWeight: 700,
                          height: 20,
                          borderRadius: 10,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat panel */}
            <div className={classes.chatPanel}>
              {!selected ? (
                <div className={classes.emptyChat}>
                  <ForumIcon
                    style={{ fontSize: 48, color: '#e0e0e0', marginBottom: 12 }}
                  />
                  <Typography style={{ fontWeight: 600, color: '#8a8f99' }}>
                    Select an inquiry to view the conversation
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{
                      color: '#b0b5bf',
                      marginTop: 4,
                      textAlign: 'center',
                    }}
                  >
                    Or submit a new inquiry using the button above
                  </Typography>
                </div>
              ) : (
                <>
                  <div className={classes.chatHeader}>
                    {selected.subject || 'Inquiry'}
                    <Chip
                      label={selected.status || 'Open'}
                      size="small"
                      style={{
                        ...statusColor(selected.status || 'Open'),
                        fontSize: 10,
                        fontWeight: 700,
                        height: 20,
                        borderRadius: 10,
                        marginLeft: 10,
                      }}
                    />
                  </div>

                  <div className={classes.chatMessages}>
                    {/* Original message */}
                    <div
                      className={`${classes.msgBubble} ${classes.msgStudent}`}
                    >
                      {selected.body}
                      <div className={classes.msgMeta}>
                        {fmt(selected.createdAt)}
                      </div>
                    </div>
                    <Divider style={{ opacity: 0.4 }} />

                    {messages.length === 0 ? (
                      <Typography
                        style={{
                          fontSize: 12,
                          color: '#b0b5bf',
                          textAlign: 'center',
                          marginTop: 8,
                        }}
                      >
                        No replies yet — we'll get back to you soon
                      </Typography>
                    ) : (
                      messages.map((m) => (
                        <div
                          key={m.id}
                          className={`${classes.msgBubble} ${
                            m.senderType === 'student'
                              ? classes.msgStudent
                              : classes.msgStaff
                          }`}
                        >
                          {m.body}
                          <div className={classes.msgMeta}>
                            {fmt(m.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {selected.status !== 'Resolved' && (
                    <div className={classes.chatInput}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Type your reply..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        style={{ borderRadius: 8 }}
                      />
                      <Button
                        variant="contained"
                        className={classes.sendBtn}
                        disabled={sending || !reply.trim()}
                        onClick={handleSend}
                        style={{ whiteSpace: 'nowrap', minWidth: 80 }}
                      >
                        {sending ? (
                          <CircularProgress
                            size={16}
                            style={{ color: '#fff' }}
                          />
                        ) : (
                          <SendIcon />
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChatsInquiries;
