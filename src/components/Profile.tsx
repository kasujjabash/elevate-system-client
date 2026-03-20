import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { Avatar, makeStyles, createStyles, Theme } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { IState } from '../data/types';
import { getInitials } from '../utils/stringHelpers';
import { handleLogout } from '../data/coreActions';
import { localRoutes } from '../data/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    trigger: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: 8,
      transition: 'background 0.15s ease',
      '&:hover': {
        background: 'rgba(0,0,0,0.05)',
      },
    },
    avatar: {
      width: 32,
      height: 32,
      fontSize: 13,
      fontWeight: 700,
      background: 'linear-gradient(135deg, #fe3a6a 0%, #fe8c45 100%)',
    },
    name: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#1f2025',
      maxWidth: 160,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    menuItem: {
      fontSize: '13px',
      fontWeight: 500,
      minWidth: 140,
    },
  }),
);

export const BarView = (props: any) => {
  const classes = useStyles();
  const profile = useSelector((state: IState) => state.core.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  function doLogout() {
    dispatch(handleLogout());
  }

  function handleMenu(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  function goToProfile() {
    handleCloseMenu();
    history.push(localRoutes.profile);
  }

  return (
    <div>
      <div
        className={classes.trigger}
        onClick={handleMenu}
        aria-controls="menu-appbar"
        aria-haspopup="true"
        role="button"
      >
        <Avatar className={classes.avatar} src={profile?.avatar || ''}>
          {getInitials(profile.fullName || '')}
        </Avatar>
        <span className={classes.name}>{profile.fullName}</span>
      </div>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        getContentAnchorEl={null}
        open={menuOpen}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={goToProfile} className={classes.menuItem}>
          My Profile
        </MenuItem>
        <MenuItem onClick={doLogout} className={classes.menuItem}>
          Sign out
        </MenuItem>
      </Menu>
    </div>
  );
};
