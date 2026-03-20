import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useHistory } from 'react-router-dom';
import { apiBaseUrl, localRoutes } from '../../data/constants';

const TOKEN_KEY = '__elevate__academy__token';

type Status =
  | 'idle'
  | 'loading'
  | 'success'
  | 'already'
  | 'expired'
  | 'closed'
  | 'invalid'
  | 'error'
  | 'noauth';

const resultCfg: Record<
  Exclude<Status, 'idle' | 'loading'>,
  { emoji: string; title: string; color: string; bg: string }
> = {
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
    title: 'Code has expired',
    color: '#b45309',
    bg: '#fef3c7',
  },
  closed: {
    emoji: '🔒',
    title: 'Session is closed',
    color: '#6b7280',
    bg: '#f3f4f6',
  },
  invalid: {
    emoji: '❓',
    title: 'Invalid code',
    color: '#ef4444',
    bg: '#fef2f2',
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

const AttendanceCode: React.FC = () => {
  const history = useHistory();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [detail, setDetail] = useState('');
  const [sessionLabel, setSessionLabel] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const authToken = localStorage.getItem(TOKEN_KEY);
    if (!authToken) {
      setStatus('noauth');
      return;
    }

    setStatus('loading');
    setDetail('');

    try {
      const res = await fetch(`${apiBaseUrl}/api/attendance/checkin-code`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

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
          setDetail('Ask your instructor for the current session code.');
        } else if (msg.toLowerCase().includes('closed')) {
          setStatus('closed');
          setDetail('The instructor has closed this session.');
        } else {
          setStatus('error');
          setDetail(msg || 'Please try again.');
        }
        return;
      }

      if (res.status === 404) {
        setStatus('invalid');
        setDetail('Double-check the code and try again.');
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
      setDetail('Network error. Check your connection and try again.');
    }
  };

  const isDone = status !== 'idle' && status !== 'loading';
  const cfg = isDone ? resultCfg[status as keyof typeof resultCfg] : null;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      style={{
        background: cfg ? cfg.bg : '#f8f7f5',
        padding: 24,
        transition: 'background 0.4s',
      }}
    >
      <Box
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: '48px 40px',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
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

        {/* Result state */}
        {isDone && cfg ? (
          <>
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
                style={{ borderRadius: 10 }}
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
                  borderColor: cfg.color,
                  color: cfg.color,
                }}
                onClick={() => history.push(localRoutes.dashboard)}
              >
                Go to Dashboard
              </Button>
            )}

            {(status === 'invalid' ||
              status === 'expired' ||
              status === 'closed' ||
              status === 'error') && (
              <Button
                variant="outlined"
                fullWidth
                style={{ borderRadius: 10 }}
                onClick={() => {
                  setStatus('idle');
                  setCode('');
                }}
              >
                Try Again
              </Button>
            )}
          </>
        ) : (
          /* Entry form */
          <>
            <Typography
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: '#111827',
                marginBottom: 8,
                fontFamily: '"Plus Jakarta Sans", sans-serif',
              }}
            >
              Enter Session Code
            </Typography>
            <Typography
              style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}
            >
              Type the code shown on the screen by your instructor
            </Typography>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                  )
                }
                maxLength={6}
                placeholder="A4K9WR"
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: 10,
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  border: '2px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '16px 8px',
                  outline: 'none',
                  color: '#111827',
                  background: '#f9fafb',
                  boxSizing: 'border-box',
                  marginBottom: 20,
                  textTransform: 'uppercase',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#fe3a6a')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                autoComplete="off"
                autoCapitalize="characters"
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={code.length < 4 || status === 'loading'}
                style={{
                  borderRadius: 10,
                  height: 48,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {status === 'loading' ? (
                  <CircularProgress size={22} style={{ color: '#fff' }} />
                ) : (
                  'Check In'
                )}
              </Button>
            </form>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AttendanceCode;
