import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Collapse,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import SchoolIcon from '@material-ui/icons/School';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/Loading';
import { remoteRoutes } from '../../data/constants';
import { get } from '../../utils/ajax';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';

const MODULE_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
];

const useStyles = makeStyles(() => ({
  root: { padding: 24 },
  breadcrumb: { fontSize: 13, color: '#8a8f99', marginBottom: 6 },
  breadcrumbSep: { margin: '0 6px', color: '#c4c8d0' },
  breadcrumbActive: { color: CORAL },
  pageTitle: { fontSize: 24, fontWeight: 700, color: DARK, marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#8a8f99', marginBottom: 20 },

  searchBar: {
    marginBottom: 24,
    '& .MuiOutlinedInput-root': {
      borderRadius: 10,
      background: '#fff',
      fontSize: 13,
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
  },

  // Programme card
  programCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  programHeader: {
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    cursor: 'pointer',
    userSelect: 'none' as any,
    '&:hover': { background: '#fafafa' },
  },
  programHeaderLeft: { flex: 1 },
  programBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: 'rgba(254,58,106,0.07)',
    color: CORAL,
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
  },
  programName: { fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 6 },
  programMeta: { fontSize: 12, color: '#8a8f99' },
  expandIcon: { color: '#8a8f99', marginTop: 4 },
  programDivider: {
    height: 1,
    background: 'rgba(0,0,0,0.06)',
    margin: '0 24px',
  },
  modulesGrid: { padding: '16px 24px 24px' },

  // Module card
  moduleCard: {
    background: '#f9f9fb',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.07)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column' as any,
    height: '100%',
    position: 'relative' as any,
    transition: 'box-shadow 0.15s',
    '&:hover': { boxShadow: '0 3px 12px rgba(0,0,0,0.09)' },
  },
  moduleTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  moduleIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleCodeBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    borderRadius: 6,
    padding: '2px 7px',
  },
  moduleName: {
    fontSize: 13,
    fontWeight: 700,
    color: DARK,
    lineHeight: 1.4,
    marginBottom: 6,
  },
  moduleDesc: {
    fontSize: 12,
    color: '#8a8f99',
    lineHeight: 1.5,
    flex: 1,
  },
  moduleFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTop: '1px solid rgba(0,0,0,0.06)',
  },
  moduleCredits: { fontSize: 11, color: '#8a8f99' },
  moduleStatus: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 10,
    padding: '3px 8px',
  },

  emptyBox: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '60px 24px',
    textAlign: 'center' as any,
  },
}));

const StudentCourses = () => {
  const classes = useStyles();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    get(
      remoteRoutes.courses,
      (data: any[]) => {
        // Group courses by programme/category
        const raw = Array.isArray(data) ? data : [];

        // If courses have a category/programme field, group by it
        // Otherwise treat each top-level course as a programme with children as modules
        const grouped: Record<string, any> = {};
        raw.forEach((c: any) => {
          const progName =
            c.programmeName ||
            c.program?.name ||
            c.category?.name ||
            c.categoryName ||
            'Programmes';
          if (!grouped[progName]) {
            grouped[progName] = {
              id: c.programId || c.program?.id || progName,
              name: progName,
              modules: [],
              duration: c.durationMonths || c.duration || null,
            };
          }
          grouped[progName].modules.push(c);
        });

        const list = Object.values(grouped);
        setPrograms(list);

        // Auto-expand first programme
        if (list.length > 0) {
          setExpanded(new Set([list[0].id]));
        }
      },
      () => setPrograms([]),
      () => setLoading(false),
    );
  }, []);

  const toggle = (id: any) => {
    setExpanded((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const filtered = programs
    .map((prog) => ({
      ...prog,
      modules: prog.modules.filter((m: any) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (m.title || m.name || '').toLowerCase().includes(q) ||
          (m.code || m.courseCode || '').toLowerCase().includes(q) ||
          (m.description || '').toLowerCase().includes(q)
        );
      }),
    }))
    .filter((prog) => {
      if (!search.trim()) return true;
      return (
        prog.name.toLowerCase().includes(search.toLowerCase()) ||
        prog.modules.length > 0
      );
    });

  if (loading) {
    return (
      <Layout title="Courses">
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout title="Courses">
      <div className={classes.root}>
        {/* Breadcrumb */}
        <div className={classes.breadcrumb}>
          <span>Home</span>
          <span className={classes.breadcrumbSep}>›</span>
          <span className={classes.breadcrumbActive}>Courses</span>
        </div>

        <div className={classes.pageTitle}>Courses &amp; Modules</div>
        <div className={classes.pageSubtitle}>
          All programmes and their modules offered on the Elevate system
        </div>

        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search courses or modules..."
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

        {filtered.length === 0 ? (
          <div className={classes.emptyBox}>
            <SchoolIcon
              style={{
                fontSize: 56,
                color: '#d1d5db',
                display: 'block',
                margin: '0 auto 12px',
              }}
            />
            <Typography
              style={{ color: '#6b7280', fontWeight: 700, fontSize: 16 }}
            >
              No courses found
            </Typography>
            <Typography
              variant="body2"
              style={{ color: '#9ca3af', marginTop: 6 }}
            >
              {search
                ? 'Try a different search term'
                : 'No courses have been added to the system yet'}
            </Typography>
          </div>
        ) : (
          filtered.map((prog) => (
            <div key={prog.id} className={classes.programCard}>
              {/* Programme header */}
              <div
                className={classes.programHeader}
                onClick={() => toggle(prog.id)}
              >
                <div className={classes.programHeaderLeft}>
                  <div className={classes.programBadge}>
                    <SchoolIcon style={{ fontSize: 12 }} />
                    Programme
                  </div>
                  <div className={classes.programName}>{prog.name}</div>
                  <div className={classes.programMeta}>
                    {prog.modules.length} module
                    {prog.modules.length !== 1 ? 's' : ''}
                    {prog.duration ? ` · ${prog.duration} Months` : ''}
                  </div>
                </div>
                <div className={classes.expandIcon}>
                  {expanded.has(prog.id) ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </div>
              </div>

              <Collapse in={expanded.has(prog.id)}>
                <div className={classes.programDivider} />
                <div className={classes.modulesGrid}>
                  {prog.modules.length === 0 ? (
                    <Typography
                      style={{
                        fontSize: 13,
                        color: '#8a8f99',
                        padding: '8px 0',
                      }}
                    >
                      No modules found for this programme.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {prog.modules.map((mod: any, i: number) => {
                        const color = MODULE_COLORS[i % MODULE_COLORS.length];
                        const code = mod.code || mod.courseCode || `${i + 1}`;
                        const name = mod.title || mod.name || 'Module';
                        const enrolled =
                          mod.isEnrolled || mod.enrolled || false;

                        return (
                          <Grid item xs={6} sm={4} md={3} key={mod.id || i}>
                            <div className={classes.moduleCard}>
                              <div className={classes.moduleTop}>
                                <div
                                  className={classes.moduleIconWrap}
                                  style={{ background: `${color}18` }}
                                >
                                  <MenuBookIcon
                                    style={{ fontSize: 16, color }}
                                  />
                                </div>
                                <span
                                  className={classes.moduleCodeBadge}
                                  style={{ background: color }}
                                >
                                  {code}
                                </span>
                              </div>

                              <div className={classes.moduleName}>{name}</div>
                              {mod.description && (
                                <div className={classes.moduleDesc}>
                                  {mod.description.length > 80
                                    ? `${mod.description.slice(0, 80)}…`
                                    : mod.description}
                                </div>
                              )}

                              <div className={classes.moduleFooter}>
                                <span className={classes.moduleCredits}>
                                  {mod.creditUnits
                                    ? `${mod.creditUnits} Credits`
                                    : 'Module'}
                                </span>
                                <span
                                  className={classes.moduleStatus}
                                  style={
                                    enrolled
                                      ? {
                                          background: 'rgba(16,185,129,0.1)',
                                          color: '#10b981',
                                        }
                                      : {
                                          background: 'rgba(254,58,106,0.08)',
                                          color: CORAL,
                                        }
                                  }
                                >
                                  {enrolled ? 'Enrolled' : 'Available'}
                                </span>
                              </div>
                            </div>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </div>
              </Collapse>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default StudentCourses;
