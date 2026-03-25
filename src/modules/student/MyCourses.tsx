import React, { useEffect, useState, useMemo } from 'react';
import {
  Button,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import SchoolIcon from '@material-ui/icons/School';
import SearchIcon from '@material-ui/icons/Search';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import MenuBookIcon from '@material-ui/icons/MenuBook';

import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/Loading';
import { localRoutes, remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { get } from '../../utils/ajax';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: theme.spacing(3), minHeight: '100%' },

  // ── Programme header card ────────────────────────────────────────
  programCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    borderLeft: `4px solid ${CORAL}`,
    padding: '20px 24px',
    marginBottom: 20,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: DARK,
    marginBottom: 4,
  },
  programDate: {
    fontSize: 12,
    color: '#8a8f99',
    marginBottom: 12,
  },
  metaBadges: {
    display: 'flex',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap' as any,
  },
  metaBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: 'rgba(254,58,106,0.07)',
    color: CORAL,
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 600,
  },
  programDesc: {
    fontSize: 13,
    color: '#5a5e6b',
    lineHeight: 1.55,
    marginBottom: 16,
    maxWidth: 640,
  },
  chooseBtn: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    boxShadow: 'none',
    fontSize: 13,
    padding: '8px 20px',
    '&:hover': { opacity: 0.9, boxShadow: 'none' },
  },

  // ── Search ───────────────────────────────────────────────────────
  searchBar: {
    marginBottom: 24,
    '& .MuiOutlinedInput-root': {
      borderRadius: 10,
      background: '#fff',
      fontSize: 13,
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
  },

  // ── Month group ──────────────────────────────────────────────────
  monthLabel: {
    fontSize: 16,
    fontWeight: 700,
    color: DARK,
    marginBottom: 4,
    marginTop: 8,
  },
  weekLabel: {
    fontSize: 12,
    color: '#8a8f99',
    marginBottom: 16,
  },

  // ── Module card ──────────────────────────────────────────────────
  moduleCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '16px',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, transform 0.15s',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as any,
    position: 'relative' as any,
    '&:hover': {
      boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
      transform: 'translateY(-2px)',
    },
  },
  moduleCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  moduleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 7,
    background: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: '1.5px solid rgba(0,0,0,0.18)',
    flexShrink: 0,
  },
  moduleName: {
    fontSize: 13,
    fontWeight: 700,
    color: DARK,
    lineHeight: 1.4,
    marginBottom: 6,
    flex: 1,
  },
  moduleCode: {
    fontSize: 11,
    color: '#8a8f99',
    marginTop: 'auto' as any,
  },

  // ── Empty state ──────────────────────────────────────────────────
  emptyBox: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '60px 24px',
    textAlign: 'center' as any,
  },
}));

const MyCourses = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    get(
      remoteRoutes.myCourses,
      (data) =>
        setEnrollments(
          (Array.isArray(data) ? data : []).filter(
            (e: any) => e.status !== 'Pending' && e.status !== 'Dropped',
          ),
        ),
      undefined,
      () => setLoading(false),
    );
  }, [user.contactId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return enrollments;
    const q = search.toLowerCase();
    return enrollments.filter((e: any) => {
      const title = (
        e.title ||
        e.course?.title ||
        e.group?.name ||
        ''
      ).toLowerCase();
      const code = (
        e.code ||
        e.courseCode ||
        e.course?.code ||
        ''
      ).toLowerCase();
      return title.includes(q) || code.includes(q);
    });
  }, [enrollments, search]);

  // Group modules by "month" (derived from code prefix like 1.x, 2.x)
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach((e: any) => {
      const code = e.code || e.courseCode || e.course?.code || '';
      const month = code
        ? `Month ${Math.ceil(parseFloat(code) || 1)}`
        : 'Month 1';
      if (!map[month]) map[month] = [];
      map[month].push(e);
    });
    // If no codes, put everything in Month 1
    if (Object.keys(map).length === 0 && filtered.length > 0) {
      map['Month 1'] = filtered;
    }
    return map;
  }, [filtered]);

  // Programme name from first enrollment
  const programmeName =
    enrollments[0]?.programmeName ||
    enrollments[0]?.program?.name ||
    enrollments[0]?.course?.programName ||
    'Certificate Programme';

  const totalModules = enrollments.length;

  if (loading)
    return (
      <Layout title="My Modules">
        <Loading />
      </Layout>
    );

  return (
    <Layout title="My Modules">
      <div className={classes.root}>
        {/* Programme header */}
        {enrollments.length > 0 && (
          <div className={classes.programCard}>
            <div className={classes.programTitle}>{programmeName}</div>
            <div className={classes.programDate}>
              {enrollments[0]?.startDate
                ? new Date(enrollments[0].startDate).toLocaleDateString(
                    'en-GB',
                    { month: 'long', year: 'numeric' },
                  )
                : 'Current Programme'}
            </div>
            <div className={classes.metaBadges}>
              <div className={classes.metaBadge}>
                <CalendarTodayIcon style={{ fontSize: 13 }} />
                {enrollments[0]?.durationMonths || '6'} Months
              </div>
              <div className={classes.metaBadge}>
                <ViewModuleIcon style={{ fontSize: 13 }} />
                {totalModules} module{totalModules !== 1 ? 's' : ''}
              </div>
            </div>
            <div className={classes.programDesc}>
              Your programme has {totalModules} module
              {totalModules !== 1 ? 's' : ''}. Select the modules you'd like to
              focus on this month.
            </div>
            <Button
              variant="contained"
              className={classes.chooseBtn}
              onClick={() => history.push(localRoutes.catalog)}
            >
              Choose your Modules
            </Button>
          </div>
        )}

        {/* Search */}
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search modules by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={classes.searchBar}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ fontSize: 18, color: '#8a8f99' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Empty state */}
        {enrollments.length === 0 && (
          <div className={classes.emptyBox}>
            <SchoolIcon style={{ fontSize: 56, color: '#d1d5db' }} />
            <Typography
              style={{
                color: '#6b7280',
                marginTop: 12,
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              You haven't enrolled in any modules yet
            </Typography>
            <Typography
              variant="body2"
              style={{ color: '#9ca3af', marginTop: 6, marginBottom: 16 }}
            >
              Browse available courses and start learning
            </Typography>
            <Button
              variant="contained"
              className={classes.chooseBtn}
              onClick={() => history.push(localRoutes.catalog)}
            >
              Browse Course Catalog
            </Button>
          </div>
        )}

        {/* Module groups */}
        {Object.entries(grouped).map(([month, modules], gi) => (
          <div key={month} style={{ marginBottom: 32 }}>
            <div className={classes.monthLabel}>{month}</div>
            <div className={classes.weekLabel}>Week 1–{modules.length}</div>

            <Grid container spacing={2}>
              {modules.map((enrollment: any, i: number) => {
                const title =
                  enrollment.title ||
                  enrollment.course?.title ||
                  enrollment.group?.name ||
                  'Module';
                const code =
                  enrollment.code ||
                  enrollment.courseCode ||
                  enrollment.course?.code ||
                  `${gi + 1}.${i + 1}`;
                const courseId = enrollment.courseId || enrollment.course?.id;

                return (
                  <Grid
                    item
                    xs={6}
                    sm={4}
                    md={3}
                    key={enrollment.enrollmentId || enrollment.id || i}
                  >
                    <div
                      className={classes.moduleCard}
                      onClick={() =>
                        courseId && history.push(`/my-courses/${courseId}`)
                      }
                    >
                      <div className={classes.moduleCardTop}>
                        <div className={classes.moduleIconWrap}>
                          <MenuBookIcon
                            style={{ fontSize: 16, color: '#aab0bd' }}
                          />
                        </div>
                        <div className={classes.moduleCheckbox} />
                      </div>

                      <div className={classes.moduleName}>{title}</div>
                      <div className={classes.moduleCode}>{code}</div>
                    </div>
                  </Grid>
                );
              })}
            </Grid>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default MyCourses;
