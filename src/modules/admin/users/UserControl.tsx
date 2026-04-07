import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Grid,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import PersonIcon from '@material-ui/icons/Person';
import CloseIcon from '@material-ui/icons/Close';
import ViewListIcon from '@material-ui/icons/ViewList';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import BlockIcon from '@material-ui/icons/Block';
import { useSelector } from 'react-redux';
import Layout from '../../../components/layout/Layout';
import { search, put } from '../../../utils/ajax';
import Toast from '../../../utils/Toast';
import TextField from '@material-ui/core/TextField';
import { remoteRoutes, appPermissions } from '../../../data/constants';
import { IState } from '../../../data/types';
import { hasAnyRole, hasRole } from '../../../data/appRoles';
import UserEditor from './UserEditor';
import RolesEditor from './RolesEditor';
import EditDialog from '../../../components/EditDialog';
import { IRoles } from './types';

const CORAL = '#E72C6C';
const GREEN = '#10b981';
const DARK = '#1f2025';

const useStyles = makeStyles((_theme: Theme) => ({
  root: { minHeight: '100%' },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap' as any,
    gap: 12,
  },
  pageTitle: { fontSize: 20, fontWeight: 800, color: DARK },
  pageSub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  tabs: { display: 'flex', gap: 4, marginBottom: 24 },
  tab: {
    padding: '8px 20px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    background: '#f3f4f6',
    color: '#6b7280',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    '&:hover': { background: '#e5e7eb' },
  },
  tabActive: {
    background: CORAL,
    color: '#fff',
    '&:hover': { background: CORAL },
  },

  addBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 600,
    textTransform: 'none' as any,
    fontSize: 13,
    padding: '7px 18px',
    '&:hover': { background: '#c4185a' },
  },

  // ── User cards ─────────────────────────────────────────────────────────────
  userCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    '&:hover': { boxShadow: '0 3px 10px rgba(0,0,0,0.08)' },
  },
  userAvatar: {
    width: 42,
    height: 42,
    background: 'rgba(231,44,108,0.1)',
    color: CORAL,
    flexShrink: 0,
  },
  userName: { fontSize: 14, fontWeight: 700, color: DARK, lineHeight: 1 },
  userUsername: { fontSize: 11, color: '#9ca3af', marginTop: 3 },
  userRoles: { display: 'flex', gap: 4, flexWrap: 'wrap' as any, marginTop: 6 },

  // ── Role cards ─────────────────────────────────────────────────────────────
  roleCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '18px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    height: '100%',
    boxSizing: 'border-box' as any,
  },
  roleHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  roleName: { fontSize: 14, fontWeight: 800, color: DARK },
  roleDesc: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
  rolePerms: { display: 'flex', flexWrap: 'wrap' as any, gap: 4 },

  emptyText: {
    fontSize: 13,
    color: '#c0c4ce',
    textAlign: 'center' as any,
    padding: '40px 0',
  },

  // ── View toggle ────────────────────────────────────────────────────────────
  viewToggle: {
    display: 'flex',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewToggleBtn: { padding: '6px 10px', borderRadius: 0, minWidth: 'unset' },

  // ── List (table) view ──────────────────────────────────────────────────────
  tableCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.07)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  tableHeadCell: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.05em',
    padding: '10px 16px',
    borderBottom: '1px solid #f3f4f6',
    background: '#fafafa',
  },
  tableCell: {
    fontSize: 13,
    color: DARK,
    padding: '12px 16px',
    borderBottom: '1px solid #f9f9f9',
  },
  tableRow: {
    cursor: 'pointer',
    '&:hover': { background: '#fafafa' },
    '&:last-child td': { borderBottom: 'none' },
  },

  // ── Detail dialog ──────────────────────────────────────────────────────────
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '24px 24px 16px',
    borderBottom: '1px solid #f3f4f6',
  },
  detailAvatar: {
    width: 56,
    height: 56,
    background: 'rgba(231,44,108,0.1)',
    color: CORAL,
  },
  detailName: { fontSize: 18, fontWeight: 800, color: DARK },
  detailMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  detailSection: { padding: '16px 24px', borderBottom: '1px solid #f3f4f6' },
  detailLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 8,
  },
  detailActions: { padding: '16px 24px', display: 'flex', gap: 8 },

  editBtn: {
    background: CORAL,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 600,
    textTransform: 'none' as any,
    fontSize: 13,
    '&:hover': { background: '#c4185a' },
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.07em',
    marginBottom: 12,
    marginTop: 28,
  },
}));

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: CORAL,
  ADMIN: '#6366f1',
  HUB_MANAGER: '#f59e0b',
  TRAINER: '#8b5cf6',
  INSTRUCTOR: '#8b5cf6',
  STUDENT: GREEN,
};

const roleColor = (r: string) => ROLE_COLORS[r.toUpperCase()] || '#94a3b8';

export default function UserControl() {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const canEditUsers = hasAnyRole(user, [appPermissions.roleUserEdit]);
  const canEditRoles = hasRole(user, appPermissions.roleEdit);

  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<IRoles[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // detail dialog
  const [detailUser, setDetailUser] = useState<any | null>(null);

  // deactivation confirmation
  const [deactivateTarget, setDeactivateTarget] = useState<any | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmEmailError, setConfirmEmailError] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  // add/edit dialog
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editRole, setEditRole] = useState<any | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);

  useEffect(() => {
    setLoadingUsers(true);
    search(
      remoteRoutes.users,
      { limit: 500 },
      (resp) => setUsers(resp),
      undefined,
      () => setLoadingUsers(false),
    );
  }, []);

  useEffect(() => {
    if (tab === 'roles') {
      setLoadingRoles(true);
      search(
        remoteRoutes.roles,
        { limit: 100 },
        (resp: IRoles[]) => setRoles(resp),
        undefined,
        () => setLoadingRoles(false),
      );
    }
  }, [tab]);

  const openDeactivateDialog = (u: any) => {
    setDeactivateTarget(u);
    setConfirmEmail('');
    setConfirmEmailError('');
  };

  const handleDeactivate = () => {
    if (!deactivateTarget) return;
    if (confirmEmail !== deactivateTarget.email) {
      setConfirmEmailError('Email does not match. Please type it exactly.');
      return;
    }
    setDeactivating(true);
    const updated = {
      ...deactivateTarget,
      isActive: !deactivateTarget.isActive,
    };
    put(
      `${remoteRoutes.users}/${deactivateTarget.id}`,
      updated,
      (resp: any) => {
        setUsers((prev: any[]) =>
          prev.map((u) => (u.id === resp.id ? resp : u)),
        );
        Toast.success(
          `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
        );
        setDeactivateTarget(null);
        setConfirmEmail('');
        setDetailUser(null);
      },
      undefined,
      () => setDeactivating(false),
    );
  };

  const openNewUser = () => {
    setEditUser(null);
    setEditUserOpen(true);
  };
  const openEditUser = (u: any) => {
    setEditUser({
      id: u.id,
      username: u.username,
      roles: [...(u.roles || [])],
      contact: { id: u.contactId, label: u.fullName },
      isActive: u.isActive,
    });
    setEditUserOpen(true);
  };
  const closeUser = () => {
    setEditUserOpen(false);
    setEditUser(null);
  };
  const doneUser = (dt: any) => {
    if (editUser) setUsers(users.map((u) => (u.id === dt.id ? dt : u)));
    else setUsers([dt, ...users]);
    closeUser();
  };
  const deletedUser = (dt: any) => {
    setUsers(users.filter((u) => u.id !== dt.id));
    closeUser();
  };

  const openNewRole = () => {
    setEditRole(null);
    setEditRoleOpen(true);
  };
  const openEditRole = (r: any) => {
    setEditRole({
      id: r.id,
      role: r.role,
      description: r.description,
      permissions: [...(r.permissions || [])],
      isActive: r.isActive,
    });
    setEditRoleOpen(true);
  };
  const closeRole = () => {
    setEditRoleOpen(false);
    setEditRole(null);
  };
  const doneRole = (dt: any) => {
    if (editRole) setRoles(roles.map((r) => (r.id === dt.id ? dt : r)));
    else setRoles([dt, ...roles]);
    closeRole();
  };
  const deletedRole = (dt: any) => {
    setRoles(roles.filter((r) => r.id !== dt.id));
    closeRole();
  };

  return (
    <Layout>
      <div className={classes.root}>
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className={classes.header}>
          <div>
            <div className={classes.pageTitle}>Users & Roles</div>
            <div className={classes.pageSub}>
              Manage system access and permissions
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {tab === 'users' && (
              <div className={classes.viewToggle}>
                <Button
                  className={classes.viewToggleBtn}
                  onClick={() => setViewMode('list')}
                  style={{
                    backgroundColor:
                      viewMode === 'list' ? '#f5f5f5' : 'transparent',
                  }}
                >
                  <ViewListIcon
                    style={{
                      fontSize: 18,
                      color: viewMode === 'list' ? DARK : '#8a8f99',
                    }}
                  />
                </Button>
                <Button
                  className={classes.viewToggleBtn}
                  onClick={() => setViewMode('grid')}
                  style={{
                    backgroundColor:
                      viewMode === 'grid' ? '#f5f5f5' : 'transparent',
                  }}
                >
                  <ViewModuleIcon
                    style={{
                      fontSize: 18,
                      color: viewMode === 'grid' ? DARK : '#8a8f99',
                    }}
                  />
                </Button>
              </div>
            )}
            <Button
              className={classes.addBtn}
              startIcon={<AddIcon style={{ fontSize: 16 }} />}
              onClick={tab === 'users' ? openNewUser : openNewRole}
              disabled={tab === 'users' ? !canEditUsers : !canEditRoles}
            >
              {tab === 'users' ? 'Add User' : 'Add Role'}
            </Button>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className={classes.tabs}>
          {(['users', 'roles'] as const).map((t) => (
            <button
              key={t}
              className={`${classes.tab} ${tab === t ? classes.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'users'
                ? `Users (${users.length})`
                : `Roles (${roles.length})`}
            </button>
          ))}
        </div>

        {/* ── Users tab ────────────────────────────────────────────── */}
        {tab === 'users' && (
          <>
            {loadingUsers ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: 48,
                }}
              >
                <CircularProgress size={28} style={{ color: CORAL }} />
              </div>
            ) : users.length === 0 ? (
              <Typography className={classes.emptyText}>
                No users found
              </Typography>
            ) : viewMode === 'list' ? (
              /* ── List view ────────────────────────────────────────── */
              <div className={classes.tableCard}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.tableHeadCell}>
                        User
                      </TableCell>
                      <TableCell className={classes.tableHeadCell}>
                        Username
                      </TableCell>
                      <TableCell className={classes.tableHeadCell}>
                        Roles
                      </TableCell>
                      <TableCell className={classes.tableHeadCell}>
                        Status
                      </TableCell>
                      {canEditUsers && (
                        <TableCell className={classes.tableHeadCell} />
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow
                        key={u.id}
                        className={classes.tableRow}
                        onClick={() => setDetailUser(u)}
                      >
                        <TableCell className={classes.tableCell}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                            }}
                          >
                            <Avatar
                              src={u.avatar}
                              style={{
                                width: 32,
                                height: 32,
                                background: 'rgba(231,44,108,0.1)',
                                color: CORAL,
                                fontSize: 13,
                              }}
                            >
                              <PersonIcon style={{ fontSize: 16 }} />
                            </Avatar>
                            <span style={{ fontWeight: 600 }}>
                              {u.fullName || u.username}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={classes.tableCell}
                          style={{ color: '#9ca3af' }}
                        >
                          @{u.username}
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                          <div
                            style={{
                              display: 'flex',
                              gap: 4,
                              flexWrap: 'wrap',
                            }}
                          >
                            {(u.roles || []).map((r: string) => (
                              <Chip
                                key={r}
                                label={r}
                                size="small"
                                style={{
                                  background: `${roleColor(r)}18`,
                                  color: roleColor(r),
                                  fontWeight: 700,
                                  fontSize: 10,
                                  height: 18,
                                }}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: u.isActive ? GREEN : '#94a3b8',
                            }}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        {canEditUsers && (
                          <TableCell
                            className={classes.tableCell}
                            style={{ textAlign: 'right' }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditUser(u);
                              }}
                            >
                              <EditIcon
                                style={{ fontSize: 15, color: '#9ca3af' }}
                              />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* ── Grid view ────────────────────────────────────────── */
              <Grid container spacing={2}>
                {users.map((u) => (
                  <Grid item xs={12} sm={6} md={4} key={u.id}>
                    <div
                      className={classes.userCard}
                      onClick={() => setDetailUser(u)}
                    >
                      <Avatar className={classes.userAvatar} src={u.avatar}>
                        <PersonIcon style={{ fontSize: 22 }} />
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={classes.userName}>
                          {u.fullName || u.username}
                        </div>
                        <div className={classes.userUsername}>
                          @{u.username}
                        </div>
                        <div className={classes.userRoles}>
                          {(u.roles || []).slice(0, 3).map((r: string) => (
                            <Chip
                              key={r}
                              label={r}
                              size="small"
                              style={{
                                background: `${roleColor(r)}18`,
                                color: roleColor(r),
                                fontWeight: 700,
                                fontSize: 10,
                                height: 18,
                              }}
                            />
                          ))}
                          {(u.roles || []).length > 3 && (
                            <Chip
                              size="small"
                              label={`+${u.roles.length - 3}`}
                              style={{ fontSize: 10, height: 18 }}
                            />
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: u.isActive ? GREEN : '#94a3b8',
                          }}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {canEditUsers && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditUser(u);
                            }}
                          >
                            <EditIcon
                              style={{ fontSize: 15, color: '#9ca3af' }}
                            />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* ── Roles tab ────────────────────────────────────────────── */}
        {tab === 'roles' && (
          <>
            {loadingRoles ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: 48,
                }}
              >
                <CircularProgress size={28} style={{ color: CORAL }} />
              </div>
            ) : roles.length === 0 ? (
              <Typography className={classes.emptyText}>
                No roles defined yet
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {roles.map((r) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={r.id}
                    style={{ display: 'flex' }}
                  >
                    <div
                      className={classes.roleCard}
                      style={{
                        width: '100%',
                        borderTop: `3px solid ${roleColor(r.role)}`,
                      }}
                    >
                      <div className={classes.roleHeader}>
                        <div>
                          <div className={classes.roleName}>{r.role}</div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              marginTop: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: r.isActive ? GREEN : '#94a3b8',
                              }}
                            >
                              {r.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        {canEditRoles && (
                          <IconButton
                            size="small"
                            onClick={() => openEditRole(r)}
                          >
                            <EditIcon
                              style={{ fontSize: 15, color: '#9ca3af' }}
                            />
                          </IconButton>
                        )}
                      </div>
                      {r.description && (
                        <div className={classes.roleDesc}>{r.description}</div>
                      )}
                      <div
                        className={classes.sectionLabel}
                        style={{ marginTop: 8 }}
                      >
                        Permissions
                      </div>
                      <div className={classes.rolePerms}>
                        {(r.permissions || []).map((p) => (
                          <Chip
                            key={p}
                            label={p}
                            size="small"
                            style={{
                              background: '#f3f4f6',
                              color: '#374151',
                              fontWeight: 600,
                              fontSize: 10,
                              height: 20,
                            }}
                          />
                        ))}
                        {(!r.permissions || r.permissions.length === 0) && (
                          <span style={{ fontSize: 12, color: '#c0c4ce' }}>
                            No permissions assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* ── User Detail Dialog ───────────────────────────────────── */}
        <Dialog
          open={!!detailUser}
          onClose={() => setDetailUser(null)}
          maxWidth="xs"
          fullWidth
        >
          {detailUser && (
            <>
              <div
                style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
              >
                <IconButton size="small" onClick={() => setDetailUser(null)}>
                  <CloseIcon style={{ fontSize: 18 }} />
                </IconButton>
              </div>

              <div className={classes.detailHeader}>
                <Avatar
                  className={classes.detailAvatar}
                  src={detailUser.avatar}
                  style={{
                    width: 56,
                    height: 56,
                    background: 'rgba(231,44,108,0.1)',
                    color: CORAL,
                  }}
                >
                  <PersonIcon style={{ fontSize: 28 }} />
                </Avatar>
                <div>
                  <div className={classes.detailName}>
                    {detailUser.fullName || detailUser.username}
                  </div>
                  <div className={classes.detailMeta}>
                    @{detailUser.username}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      marginTop: 6,
                    }}
                  >
                    {detailUser.isActive ? (
                      <>
                        <CheckCircleIcon
                          style={{ fontSize: 13, color: GREEN }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: GREEN,
                            fontWeight: 700,
                          }}
                        >
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <BlockIcon style={{ fontSize: 13, color: '#94a3b8' }} />
                        <span
                          style={{
                            fontSize: 12,
                            color: '#94a3b8',
                            fontWeight: 700,
                          }}
                        >
                          Inactive
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className={classes.detailSection}>
                <div className={classes.detailLabel}>Roles</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(detailUser.roles || []).length === 0 ? (
                    <span style={{ fontSize: 12, color: '#c0c4ce' }}>
                      No roles assigned
                    </span>
                  ) : (
                    (detailUser.roles || []).map((r: string) => (
                      <Chip
                        key={r}
                        label={r}
                        size="small"
                        style={{
                          background: `${roleColor(r)}18`,
                          color: roleColor(r),
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {detailUser.email && (
                <div className={classes.detailSection}>
                  <div className={classes.detailLabel}>Email</div>
                  <Typography variant="body2" style={{ color: DARK }}>
                    {detailUser.email}
                  </Typography>
                </div>
              )}

              {detailUser.phone && (
                <div className={classes.detailSection}>
                  <div className={classes.detailLabel}>Phone</div>
                  <Typography variant="body2" style={{ color: DARK }}>
                    {detailUser.phone}
                  </Typography>
                </div>
              )}

              <div className={classes.detailActions}>
                {canEditUsers && (
                  <Button
                    className={classes.editBtn}
                    startIcon={<EditIcon style={{ fontSize: 15 }} />}
                    onClick={() => {
                      openEditUser(detailUser);
                      setDetailUser(null);
                    }}
                  >
                    Edit User
                  </Button>
                )}
                {canEditUsers && (
                  <Button
                    style={{
                      borderRadius: 8,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: 13,
                      background: detailUser.isActive ? '#fee2e2' : '#dcfce7',
                      color: detailUser.isActive ? '#dc2626' : GREEN,
                    }}
                    startIcon={
                      detailUser.isActive ? (
                        <BlockIcon style={{ fontSize: 15 }} />
                      ) : (
                        <CheckCircleIcon style={{ fontSize: 15 }} />
                      )
                    }
                    onClick={() => openDeactivateDialog(detailUser)}
                  >
                    {detailUser.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                )}
                <Button
                  style={{
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    border: '1px solid #e5e7eb',
                  }}
                  onClick={() => setDetailUser(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </Dialog>

        {/* ── Add/Edit User Dialog ─────────────────────────────────── */}
        {canEditUsers && (
          <EditDialog
            title={
              editUser ? `Edit ${editUser.username || 'User'}` : 'Create User'
            }
            open={editUserOpen}
            onClose={closeUser}
          >
            <UserEditor
              data={editUser}
              isNew={!editUser}
              done={doneUser}
              onDeleted={deletedUser}
              onCancel={closeUser}
            />
          </EditDialog>
        )}

        {/* ── Add/Edit Role Dialog ─────────────────────────────────── */}
        {canEditRoles && (
          <EditDialog
            title={editRole ? `Edit ${editRole.role}` : 'Create Role'}
            open={editRoleOpen}
            onClose={closeRole}
          >
            <RolesEditor
              data={editRole}
              isNew={!editRole}
              done={doneRole}
              onDeleted={deletedRole}
              onCancel={closeRole}
            />
          </EditDialog>
        )}

        {/* ── Deactivation Confirmation Dialog ─────────────────────── */}
        <Dialog
          open={!!deactivateTarget}
          onClose={() => {
            setDeactivateTarget(null);
            setConfirmEmail('');
            setConfirmEmailError('');
          }}
          maxWidth="xs"
          fullWidth
        >
          {deactivateTarget && (
            <div style={{ padding: 28 }}>
              <Typography
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: DARK,
                  marginBottom: 8,
                }}
              >
                {deactivateTarget.isActive ? 'Deactivate' : 'Activate'} User
              </Typography>
              <Typography
                style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}
              >
                You are about to{' '}
                <strong>
                  {deactivateTarget.isActive ? 'deactivate' : 'activate'}
                </strong>{' '}
                <strong>
                  {deactivateTarget.fullName || deactivateTarget.username}
                </strong>
                .
              </Typography>
              <Typography
                style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}
              >
                To confirm, type the user's email address below:
                {deactivateTarget.email && (
                  <span
                    style={{
                      display: 'block',
                      fontWeight: 700,
                      color: DARK,
                      marginTop: 4,
                    }}
                  >
                    {deactivateTarget.email}
                  </span>
                )}
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Type email to confirm"
                value={confirmEmail}
                onChange={(e) => {
                  setConfirmEmail(e.target.value);
                  setConfirmEmailError('');
                }}
                onPaste={(e) => e.preventDefault()}
                error={!!confirmEmailError}
                helperText={
                  confirmEmailError ||
                  'Pasting is disabled — type the email manually'
                }
                inputProps={{ autoComplete: 'off' }}
              />
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 24,
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  style={{
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    border: '1px solid #e5e7eb',
                  }}
                  onClick={() => {
                    setDeactivateTarget(null);
                    setConfirmEmail('');
                    setConfirmEmailError('');
                  }}
                  disabled={deactivating}
                >
                  Cancel
                </Button>
                <Button
                  style={{
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    background: deactivateTarget.isActive ? '#dc2626' : GREEN,
                    color: '#fff',
                  }}
                  onClick={handleDeactivate}
                  disabled={deactivating || !confirmEmail}
                >
                  {deactivating ? (
                    <CircularProgress size={16} style={{ color: '#fff' }} />
                  ) : deactivateTarget.isActive ? (
                    'Deactivate'
                  ) : (
                    'Activate'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </Layout>
  );
}
