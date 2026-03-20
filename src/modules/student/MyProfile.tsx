import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  TextField,
  Tooltip,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import EmailIcon from '@material-ui/icons/Email';
import PhoneIcon from '@material-ui/icons/Phone';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PersonIcon from '@material-ui/icons/Person';
import SchoolIcon from '@material-ui/icons/School';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { get, put } from '../../utils/ajax';
import Toast from '../../utils/Toast';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    page: {
      minHeight: '100%',
      background: '#f8f7f5',
      padding: '0 0 48px',
    },

    /* ── Banner ─────────────────────────────────────────── */
    banner: {
      height: 140,
      background: `linear-gradient(135deg, ${DARK} 0%, #2d2f38 60%, #3a1a28 100%)`,
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 70% 50%, rgba(254,58,106,0.3) 0%, transparent 60%)`,
        pointerEvents: 'none',
      },
    },

    /* ── Content container ──────────────────────────────── */
    container: {
      maxWidth: 720,
      margin: '0 auto',
      padding: '0 24px',
      [theme.breakpoints.down('sm')]: { padding: '0 16px' },
    },

    /* ── Avatar row ─────────────────────────────────────── */
    avatarRow: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginTop: -44,
      marginBottom: 16,
    },
    avatar: {
      width: 88,
      height: 88,
      fontSize: 30,
      fontWeight: 800,
      background: `linear-gradient(135deg, ${CORAL} 0%, ${ORANGE} 100%)`,
      border: '4px solid #f8f7f5',
      boxShadow: `0 6px 20px rgba(254,58,106,0.35)`,
      letterSpacing: '-1px',
    },
    editAvatarBtn: {
      marginBottom: 8,
      color: '#8a8f99',
      fontSize: 13,
      fontWeight: 600,
      '&:hover': { color: CORAL },
    },

    /* ── Name block ─────────────────────────────────────── */
    nameBlock: {
      marginBottom: 20,
    },
    fullName: {
      fontSize: 24,
      fontWeight: 800,
      color: DARK,
      letterSpacing: '-0.03em',
      lineHeight: 1.2,
    },
    emailLine: {
      fontSize: 14,
      color: '#8a8f99',
      marginTop: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    rolePill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 10,
      background: 'rgba(254,58,106,0.1)',
      color: CORAL,
      border: `1px solid rgba(254,58,106,0.2)`,
      borderRadius: 20,
      padding: '4px 12px',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as any,
    },

    /* ── Section card ───────────────────────────────────── */
    card: {
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #ede8e3',
      marginBottom: 16,
      overflow: 'hidden',
    },
    cardHead: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 22px 0',
    },
    cardHeadLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    cardIconCircle: {
      width: 34,
      height: 34,
      borderRadius: 10,
      background: 'rgba(254,58,106,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 700,
      color: DARK,
    },
    editBtn: {
      fontSize: 12,
      fontWeight: 600,
      color: '#8a8f99',
      padding: '4px 10px',
      borderRadius: 8,
      '&:hover': { color: CORAL, background: 'rgba(254,58,106,0.06)' },
    },

    /* ── Info rows ──────────────────────────────────────── */
    infoList: {
      padding: '14px 22px 20px',
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid #f3ede9',
      '&:last-child': { borderBottom: 'none', paddingBottom: 0 },
    },
    infoIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      background: '#f5f4f2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    infoText: {},
    infoLabel: {
      fontSize: 11,
      fontWeight: 600,
      color: '#b0a8a0',
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as any,
      lineHeight: 1,
    },
    infoValue: {
      fontSize: 14,
      color: DARK,
      fontWeight: 500,
      marginTop: 2,
    },
    infoValueMuted: {
      color: '#c9c4bf',
      fontStyle: 'italic',
    },

    /* ── Read view fields ───────────────────────────────── */
    fieldGrid: { padding: '16px 22px 22px' },
    fieldItem: { marginBottom: 4 },
    fieldLabel: {
      fontSize: 11,
      fontWeight: 600,
      color: '#b0a8a0',
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as any,
      marginBottom: 3,
    },
    fieldValue: {
      fontSize: 14,
      color: DARK,
      fontWeight: 500,
      padding: '8px 0',
      borderBottom: '1px solid #f3ede9',
    },

    /* ── Edit form ──────────────────────────────────────── */
    editForm: { padding: '16px 22px 22px' },
    saveBtn: {
      background: `linear-gradient(135deg, ${CORAL}, ${ORANGE})`,
      color: '#fff',
      borderRadius: 10,
      padding: '8px 24px',
      fontWeight: 700,
      fontSize: 13,
      boxShadow: `0 4px 14px rgba(254,58,106,0.25)`,
      '&:hover': { opacity: 0.9 },
      '&:disabled': { opacity: 0.55 },
    },
    cancelBtn: {
      borderRadius: 10,
      padding: '8px 18px',
      fontWeight: 600,
      fontSize: 13,
      color: '#8a8f99',
      '&:hover': { background: '#f5f4f2' },
    },

    /* ── Loading / center ───────────────────────────────── */
    center: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 60,
    },
  }),
);

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

interface IProfile {
  contactId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  dateOfBirth: string | null;
  avatar: string | null;
  email: string;
  phone: string;
  hub: string;
  hubCode: string;
}

const MyProfile = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);

  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' });

  useEffect(() => {
    setLoading(true);
    get(
      remoteRoutes.profile,
      (data: IProfile) => {
        setProfile(data);
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        });
      },
      () => {
        // Fallback: build from JWT user
        const [firstName = '', ...rest] = (user.fullName || '').split(' ');
        const lastName = rest.join(' ');
        setForm({ firstName, lastName, phone: '' });
      },
      () => setLoading(false),
    );
  }, [user]);

  const handleSave = () => {
    setSaving(true);
    put(
      remoteRoutes.profile,
      form,
      (data: IProfile) => {
        setProfile(data);
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        });
        setEditing(false);
        setSaving(false);
        Toast.success('Profile updated');
      },
      () => {
        Toast.error('Failed to save changes');
        setSaving(false);
      },
    );
  };

  const displayName = profile?.fullName || user.fullName;
  const displayEmail = profile?.email || user.email;
  const displayPhone = profile?.phone || '';
  const displayHub = profile?.hub || '';
  const roles = (user.roles as string[]) || [];

  return (
    <Layout title="My Profile">
      <div className={classes.page}>
        {/* Banner */}
        <div className={classes.banner} />

        <div className={classes.container}>
          {/* Avatar row */}
          <div className={classes.avatarRow}>
            <Avatar
              className={classes.avatar}
              src={profile?.avatar || user.avatar || ''}
            >
              {getInitials(displayName)}
            </Avatar>
            <Tooltip title="Coming soon">
              <span>
                <Button className={classes.editAvatarBtn} size="small" disabled>
                  Change photo
                </Button>
              </span>
            </Tooltip>
          </div>

          {/* Name block */}
          {loading ? (
            <div className={classes.center}>
              <CircularProgress style={{ color: CORAL }} />
            </div>
          ) : (
            <>
              <div className={classes.nameBlock}>
                <div className={classes.fullName}>{displayName}</div>
                <div className={classes.emailLine}>
                  <EmailIcon style={{ fontSize: 14, color: '#c9c4bf' }} />
                  {displayEmail}
                </div>
                {roles.map((r) => (
                  <span key={r} className={classes.rolePill}>
                    <SchoolIcon style={{ fontSize: 13 }} />
                    {r}
                  </span>
                ))}
              </div>

              {/* Contact info card */}
              <div className={classes.card}>
                <div className={classes.cardHead}>
                  <div className={classes.cardHeadLeft}>
                    <div className={classes.cardIconCircle}>
                      <PersonIcon style={{ fontSize: 16, color: CORAL }} />
                    </div>
                    <span className={classes.cardTitle}>Contact Details</span>
                  </div>
                </div>
                <div className={classes.infoList}>
                  <div className={classes.infoRow}>
                    <div className={classes.infoIconWrap}>
                      <EmailIcon style={{ fontSize: 15, color: '#8a8f99' }} />
                    </div>
                    <div className={classes.infoText}>
                      <div className={classes.infoLabel}>Email address</div>
                      <div className={classes.infoValue}>{displayEmail}</div>
                    </div>
                  </div>
                  <div className={classes.infoRow}>
                    <div className={classes.infoIconWrap}>
                      <PhoneIcon style={{ fontSize: 15, color: '#8a8f99' }} />
                    </div>
                    <div className={classes.infoText}>
                      <div className={classes.infoLabel}>Phone</div>
                      <div
                        className={`${classes.infoValue} ${
                          !displayPhone ? classes.infoValueMuted : ''
                        }`}
                      >
                        {displayPhone || 'Not set'}
                      </div>
                    </div>
                  </div>
                  {displayHub && (
                    <div className={classes.infoRow}>
                      <div className={classes.infoIconWrap}>
                        <LocationOnIcon
                          style={{ fontSize: 15, color: '#8a8f99' }}
                        />
                      </div>
                      <div className={classes.infoText}>
                        <div className={classes.infoLabel}>Hub</div>
                        <div className={classes.infoValue}>{displayHub}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal info card */}
              <div className={classes.card}>
                <div className={classes.cardHead}>
                  <div className={classes.cardHeadLeft}>
                    <div className={classes.cardIconCircle}>
                      <EditIcon style={{ fontSize: 15, color: CORAL }} />
                    </div>
                    <span className={classes.cardTitle}>
                      Personal Information
                    </span>
                  </div>
                  {!editing && (
                    <IconButton
                      size="small"
                      className={classes.editBtn}
                      onClick={() => setEditing(true)}
                    >
                      <EditIcon style={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </div>

                {editing ? (
                  <div className={classes.editForm}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          variant="outlined"
                          size="small"
                          value={form.firstName}
                          onChange={(e) =>
                            setForm({ ...form, firstName: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          variant="outlined"
                          size="small"
                          value={form.lastName}
                          onChange={(e) =>
                            setForm({ ...form, lastName: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone number"
                          variant="outlined"
                          size="small"
                          placeholder="+256 700 000000"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          variant="outlined"
                          size="small"
                          value={displayEmail}
                          disabled
                          helperText="Contact admin to change your email"
                        />
                      </Grid>
                    </Grid>
                    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                      <Button
                        className={classes.saveBtn}
                        variant="contained"
                        disableElevation
                        disabled={saving}
                        startIcon={
                          saving ? (
                            <CircularProgress
                              size={14}
                              style={{ color: '#fff' }}
                            />
                          ) : (
                            <SaveIcon style={{ fontSize: 16 }} />
                          )
                        }
                        onClick={handleSave}
                      >
                        {saving ? 'Saving…' : 'Save Changes'}
                      </Button>
                      <Button
                        className={classes.cancelBtn}
                        disabled={saving}
                        startIcon={<CancelIcon style={{ fontSize: 16 }} />}
                        onClick={() => {
                          setEditing(false);
                          if (profile)
                            setForm({
                              firstName: profile.firstName,
                              lastName: profile.lastName,
                              phone: profile.phone,
                            });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={classes.fieldGrid}>
                    <Grid container spacing={2}>
                      {[
                        { label: 'First Name', value: form.firstName },
                        { label: 'Last Name', value: form.lastName },
                        { label: 'Phone', value: form.phone || '—' },
                        { label: 'Gender', value: profile?.gender || '—' },
                      ].map(({ label, value }) => (
                        <Grid item xs={12} sm={6} key={label}>
                          <div className={classes.fieldItem}>
                            <div className={classes.fieldLabel}>{label}</div>
                            <div className={classes.fieldValue}>
                              {value || '—'}
                            </div>
                          </div>
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                )}
              </div>

              {/* Account status card */}
              <div className={classes.card}>
                <div className={classes.cardHead}>
                  <div className={classes.cardHeadLeft}>
                    <div className={classes.cardIconCircle}>
                      <CheckCircleIcon style={{ fontSize: 16, color: CORAL }} />
                    </div>
                    <span className={classes.cardTitle}>Account Status</span>
                  </div>
                </div>
                <div className={classes.infoList}>
                  <div className={classes.infoRow}>
                    <div className={classes.infoIconWrap}>
                      <CheckCircleIcon
                        style={{ fontSize: 15, color: '#10b981' }}
                      />
                    </div>
                    <div className={classes.infoText}>
                      <div className={classes.infoLabel}>Status</div>
                      <div
                        className={classes.infoValue}
                        style={{ color: '#10b981' }}
                      >
                        Active
                      </div>
                    </div>
                  </div>
                  <div className={classes.infoRow}>
                    <div className={classes.infoIconWrap}>
                      <SchoolIcon style={{ fontSize: 15, color: '#8a8f99' }} />
                    </div>
                    <div className={classes.infoText}>
                      <div className={classes.infoLabel}>Role</div>
                      <div className={classes.infoValue}>
                        {roles.join(', ') || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyProfile;
