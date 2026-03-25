import React, { useState } from 'react';
import { Button, Divider, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { FormikHelpers } from 'formik';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import XForm from '../../components/forms/XForm';
import XTextInput from '../../components/inputs/XTextInput';
import { IState } from '../../data/types';
import { remoteRoutes } from '../../data/constants';
import { put } from '../../utils/ajax';
import { reqString } from '../../data/validations';
import Toast from '../../utils/Toast';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';

const useStyles = makeStyles(() => ({
  root: { padding: 24, maxWidth: 760 },
  breadcrumb: { fontSize: 13, color: '#8a8f99', marginBottom: 6 },
  breadcrumbSep: { margin: '0 6px', color: '#c4c8d0' },
  breadcrumbActive: { color: CORAL },
  pageTitle: { fontSize: 24, fontWeight: 700, color: DARK, marginBottom: 24 },

  // Profile card at top
  profileCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '24px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${CORAL}, #fe8c45)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  profileName: { fontSize: 18, fontWeight: 700, color: DARK },
  profileEmail: { fontSize: 13, color: '#8a8f99', marginTop: 2 },
  profileRole: {
    display: 'inline-block',
    marginTop: 6,
    background: 'rgba(254,58,106,0.08)',
    color: CORAL,
    borderRadius: 20,
    padding: '2px 10px',
    fontSize: 11,
    fontWeight: 700,
  },

  // Section card
  sectionCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '18px 24px',
    cursor: 'pointer',
    userSelect: 'none' as any,
    '&:hover': { background: '#fafafa' },
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: 'rgba(254,58,106,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: DARK },
  sectionDesc: { fontSize: 12, color: '#8a8f99', marginTop: 1 },
  sectionBody: {
    padding: '0 24px 24px',
    maxWidth: 420,
  },

  // Form submit override
  formWrap: {
    '& .MuiButton-containedPrimary': {
      backgroundColor: '#90A1B9',
      boxShadow: 'none',
      borderRadius: 8,
      fontWeight: 600,
      '&:hover': { backgroundColor: '#7a8fa8', boxShadow: 'none' },
    },
  },

  // Notification row
  notifRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 24px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  notifLabel: { fontSize: 13, fontWeight: 600, color: DARK },
  notifDesc: { fontSize: 12, color: '#8a8f99', marginTop: 2 },
  toggle: {
    width: 40,
    height: 22,
    borderRadius: 11,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0 3px',
    flexShrink: 0,
    transition: 'background 0.2s',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
  },
}));

const passwordSchema = yup.object().shape({
  newPassword: reqString.min(8, 'Password must be at least 8 characters'),
  confirmPassword: reqString.test(
    'passwords-match',
    'Passwords must match',
    function (value) {
      return this.parent.newPassword === value;
    },
  ),
});

const NotifToggle = ({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) => {
  const classes = useStyles();
  return (
    <div
      className={classes.toggle}
      style={{ background: on ? CORAL : '#d1d5db' }}
      onClick={onToggle}
    >
      <div
        className={classes.toggleThumb}
        style={{ transform: on ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </div>
  );
};

const Settings = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const [openSection, setOpenSection] = useState<string>('password');
  const [notifs, setNotifs] = useState({
    email: true,
    classes: true,
    results: false,
  });

  const initials = (user.fullName || user.username || 'U')
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0]?.toUpperCase() || '')
    .join('');

  const toggle = (section: string) =>
    setOpenSection((s) => (s === section ? '' : section));

  function handlePasswordSubmit(values: any, actions: FormikHelpers<any>) {
    put(
      remoteRoutes.users,
      {
        id: user.id,
        roles: user.roles,
        password: values.confirmPassword,
        oldPassword: values.oldPassword,
      },
      () => Toast.success('Password updated successfully'),
      () => Toast.error('Old password is incorrect'),
    );
    actions.resetForm();
  }

  return (
    <Layout title="Settings">
      <div className={classes.root}>
        {/* Breadcrumb */}
        <div className={classes.breadcrumb}>
          <span>Home</span>
          <span className={classes.breadcrumbSep}>›</span>
          <span className={classes.breadcrumbActive}>Settings</span>
        </div>

        <div className={classes.pageTitle}>Settings</div>

        {/* Profile card */}
        <div className={classes.profileCard}>
          <div className={classes.avatar}>{initials}</div>
          <div>
            <div className={classes.profileName}>
              {user.fullName || user.username}
            </div>
            <div className={classes.profileEmail}>
              {user.email || user.username}
            </div>
            <span className={classes.profileRole}>
              {user.roles?.[0] || 'Student'}
            </span>
          </div>
        </div>

        {/* Change Password */}
        <div className={classes.sectionCard}>
          <div
            className={classes.sectionHeader}
            onClick={() => toggle('password')}
          >
            <div className={classes.sectionIconWrap}>
              <LockOutlinedIcon style={{ fontSize: 18, color: CORAL }} />
            </div>
            <div>
              <div className={classes.sectionTitle}>Change Password</div>
              <div className={classes.sectionDesc}>
                Update your account password
              </div>
            </div>
          </div>

          {openSection === 'password' && (
            <>
              <Divider style={{ opacity: 0.5 }} />
              <div className={classes.sectionBody}>
                <div className={classes.formWrap}>
                  <XForm
                    onSubmit={handlePasswordSubmit}
                    schema={passwordSchema}
                  >
                    <XTextInput
                      label="Old Password"
                      name="oldPassword"
                      type="password"
                      variant="outlined"
                      style={{ marginTop: '1rem' }}
                    />
                    <XTextInput
                      label="New Password"
                      name="newPassword"
                      type="password"
                      variant="outlined"
                      style={{ marginTop: '1rem' }}
                    />
                    <XTextInput
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      variant="outlined"
                      style={{ marginTop: '1rem' }}
                    />
                  </XForm>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className={classes.sectionCard}>
          <div
            className={classes.sectionHeader}
            onClick={() => toggle('notifications')}
          >
            <div className={classes.sectionIconWrap}>
              <NotificationsNoneIcon style={{ fontSize: 18, color: CORAL }} />
            </div>
            <div>
              <div className={classes.sectionTitle}>Notifications</div>
              <div className={classes.sectionDesc}>
                Manage what alerts you receive
              </div>
            </div>
          </div>

          {openSection === 'notifications' && (
            <>
              <Divider style={{ opacity: 0.5 }} />
              {[
                {
                  key: 'email',
                  label: 'Email Notifications',
                  desc: 'Receive updates and announcements via email',
                },
                {
                  key: 'classes',
                  label: 'Class Reminders',
                  desc: 'Get reminded before your upcoming live classes',
                },
                {
                  key: 'results',
                  label: 'Assessment Results',
                  desc: 'Be notified when new results are published',
                },
              ].map(({ key, label, desc }) => (
                <div key={key} className={classes.notifRow}>
                  <div>
                    <div className={classes.notifLabel}>{label}</div>
                    <div className={classes.notifDesc}>{desc}</div>
                  </div>
                  <NotifToggle
                    on={(notifs as any)[key]}
                    onToggle={() =>
                      setNotifs((n) => ({ ...n, [key]: !(n as any)[key] }))
                    }
                  />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Account */}
        <div className={classes.sectionCard}>
          <div
            className={classes.sectionHeader}
            onClick={() => toggle('account')}
          >
            <div className={classes.sectionIconWrap}>
              <PersonOutlineIcon style={{ fontSize: 18, color: CORAL }} />
            </div>
            <div>
              <div className={classes.sectionTitle}>Account</div>
              <div className={classes.sectionDesc}>
                View your account details
              </div>
            </div>
          </div>

          {openSection === 'account' && (
            <>
              <Divider style={{ opacity: 0.5 }} />
              <div className={classes.sectionBody} style={{ paddingTop: 16 }}>
                {[
                  { label: 'Full Name', value: user.fullName || '—' },
                  { label: 'Email', value: user.email || user.username || '—' },
                  { label: 'Contact ID', value: user.contactId || '—' },
                  { label: 'Role', value: user.roles?.join(', ') || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <Typography
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#8a8f99',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 2,
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      style={{ fontSize: 14, color: DARK, fontWeight: 500 }}
                    >
                      {value}
                    </Typography>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
