import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import { useParams, useHistory } from 'react-router-dom';
import { apiBaseUrl, localRoutes } from '../../data/constants';

const TOKEN_KEY = '__elevate__academy__token';

type Status =
  | 'loading'
  | 'success'
  | 'already'
  | 'expired'
  | 'closed'
  | 'error'
  | 'noauth';

const messages: Record<
  Status,
  { emoji: string; title: string; color: string; bg: string }
> = {
  loading: {
    emoji: '⏳',
    title: 'Checking you in…',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  success: {
    emoji: '✅',
    title: "You're checked in!",
    color: '#15803d',
    bg: '#dcfce7',
  },
  already: {
    emoji: '👍',
    title: 'Already checked in!',
    color: '#15803d',
    bg: '#dcfce7',
  },
  expired: {
    emoji: '⌛',
    title: 'QR code has expired',
    color: '#b45309',
    bg: '#fef3c7',
  },
  closed: {
    emoji: '🔒',
    title: 'Session is closed',
    color: '#6b7280',
    bg: '#f3f4f6',
  },
  error: {
    emoji: '❌',
    title: 'Something went wrong',
    color: '#ef4444',
    bg: '#fef2f2',
  },
  noauth: {
    emoji: '🔐',
    title: 'Please log in first',
    color: '#6b7280',
    bg: '#f3f4f6',
  },
};

const CheckIn: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const history = useHistory();
  const [status, setStatus] = useState<Status>('loading');
  const [detail, setDetail] = useState('');
  const [sessionLabel, setSessionLabel] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem(TOKEN_KEY);
    if (!authToken) {
      setStatus('noauth');
      return;
    }

    const doCheckIn = async () => {
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/attendance/checkin/${token}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const data = await res.json();

        if (res.status === 409) {
          setStatus('already');
          setDetail('Your attendance has been recorded.');
          return;
        }

        if (res.status === 400) {
          const msg: string = data?.message ?? '';
          if (msg.toLowerCase().includes('expir')) {
            setStatus('expired');
            setDetail('Ask your instructor to generate a new QR code.');
          } else if (msg.toLowerCase().includes('closed')) {
            setStatus('closed');
            setDetail('The instructor has closed this session.');
          } else {
            setStatus('error');
            setDetail(msg || 'Please try again or ask your instructor.');
          }
          return;
        }

        if (res.status === 404) {
          setStatus('error');
          setDetail('Invalid QR code. Please scan again.');
          return;
        }

        if (!res.ok) {
          setStatus('error');
          setDetail('Please try again or contact your instructor.');
          return;
        }

        setSessionLabel(data?.session?.label ?? '');
        setStatus('success');
        setDetail('Your attendance has been recorded.');
      } catch {
        setStatus('error');
        setDetail('Network error. Please check your connection and try again.');
      }
    };

    doCheckIn();
  }, [token]);

  const cfg = messages[status];

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      style={{ background: cfg.bg, padding: 24, transition: 'background 0.4s' }}
    >
      <Box
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: '48px 40px',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
        }}
      >
        {/* Logo */}
        <Box mb={3}>
          <div
            style={{
              width: 32,
              height: 3,
              borderRadius: 4,
              background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
              margin: '0 auto 8px',
            }}
          />
          <Typography
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 800,
              fontSize: 15,
              color: '#1f2025',
            }}
          >
            Elevate Academy
          </Typography>
        </Box>

        {/* Status icon */}
        {status === 'loading' ? (
          <CircularProgress
            style={{ color: '#fe3a6a', marginBottom: 20 }}
            size={56}
          />
        ) : (
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: cfg.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 36,
            }}
          >
            {cfg.emoji}
          </Box>
        )}

        <Typography
          style={{
            fontWeight: 800,
            fontSize: 22,
            color: cfg.color,
            marginBottom: 8,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}
        >
          {cfg.title}
        </Typography>

        {sessionLabel && status === 'success' && (
          <Typography
            style={{
              fontSize: 14,
              color: '#374151',
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            {sessionLabel}
          </Typography>
        )}

        {detail && (
          <Typography
            style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}
          >
            {detail}
          </Typography>
        )}

        {status === 'noauth' && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            style={{ borderRadius: 10, marginTop: 8 }}
            onClick={() => history.push('/login')}
          >
            Log In
          </Button>
        )}

        {(status === 'success' || status === 'already') && (
          <Button
            variant="outlined"
            fullWidth
            style={{
              borderRadius: 10,
              marginTop: 8,
              borderColor: cfg.color,
              color: cfg.color,
            }}
            onClick={() => history.push(localRoutes.dashboard)}
          >
            Go to Dashboard
          </Button>
        )}

        {(status === 'expired' ||
          status === 'closed' ||
          status === 'error') && (
          <Button
            variant="outlined"
            fullWidth
            style={{ borderRadius: 10, marginTop: 8 }}
            onClick={() => history.push(localRoutes.dashboard)}
          >
            Back to Dashboard
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CheckIn;
