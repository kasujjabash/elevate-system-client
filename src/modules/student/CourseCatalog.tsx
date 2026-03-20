import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import SchoolIcon from '@material-ui/icons/School';
import PersonIcon from '@material-ui/icons/Person';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/Loading';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { get, post } from '../../utils/ajax';
import Toast from '../../utils/Toast';

const CORAL = '#fe3a6a';
const ORANGE = '#fe8c45';
const DARK = '#1f2025';

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: theme.spacing(3), background: '#f8f7f5', minHeight: '100%' },
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: DARK,
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#8a8f99',
    marginTop: 2,
    marginBottom: theme.spacing(2.5),
  },
  searchBox: {
    background: '#fff',
    borderRadius: 10,
    marginBottom: theme.spacing(2.5),
    '& .MuiOutlinedInput-root': { borderRadius: 10, fontSize: 13 },
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #ede8e3',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as any,
    transition: 'box-shadow 0.15s',
    '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.09)' },
  },
  cardTop: { padding: '18px 20px 16px', flex: 1 },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  enrollBadge: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    padding: '3px 10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  enrollOpen: {
    background: 'rgba(16,185,129,0.1)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.2)',
  },
  enrollClosed: {
    background: 'rgba(156,163,175,0.12)',
    color: '#6b7280',
    border: '1px solid rgba(156,163,175,0.2)',
  },
  courseName: {
    fontSize: 16,
    fontWeight: 700,
    color: DARK,
    lineHeight: 1.3,
    marginBottom: 8,
  },
  courseDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.55,
    marginBottom: 12,
    display: '-webkit-box',
    '-webkit-line-clamp': 3,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  } as any,
  instructorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  instructorAvatar: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${CORAL}, ${ORANGE})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  cardFooter: {
    borderTop: '1px solid #f3ede9',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fdfcfb',
  },
  enrollBtn: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    boxShadow: 'none',
    fontSize: 12,
    '&:hover': { opacity: 0.9 },
    '&:disabled': { opacity: 0.55, color: '#fff' },
  },
  emptyBox: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #ede8e3',
    padding: '60px 24px',
    textAlign: 'center' as any,
  },
}));

function initials(name: string) {
  return (name || '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const CourseCatalog = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let done = 0;
    const finish = () => {
      done += 1;
      if (done === 2) setLoading(false);
    };

    get(
      remoteRoutes.courses,
      (data) => {
        setCourses(Array.isArray(data) ? data : []);
      },
      undefined,
      finish,
    );

    get(
      remoteRoutes.myCourses,
      (data) => {
        const list: any[] = Array.isArray(data) ? data : [];
        const enrolled = new Set<number>(
          list
            .filter((e) => e.status !== 'Pending')
            .map((e) => e.courseId || e.course?.id)
            .filter(Boolean),
        );
        const pending = new Set<number>(
          list
            .filter((e) => e.status === 'Pending')
            .map((e) => e.courseId || e.course?.id)
            .filter(Boolean),
        );
        setEnrolledIds(enrolled);
        setPendingIds(pending);
      },
      undefined,
      finish,
    );
  }, [user.contactId]);

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const handleEnroll = (courseId: number) => {
    setEnrolling(courseId);
    post(
      `${remoteRoutes.coursesBase}/${courseId}/enroll`,
      {},
      (data: any) => {
        if (data?.status === 'Pending') {
          Toast.info('Enrollment request sent — awaiting admin approval.');
          setPendingIds((prev) => {
            const s = new Set(prev);
            s.add(courseId);
            return s;
          });
        } else {
          Toast.success('Enrolled successfully!');
          setEnrolledIds((prev) => {
            const s = new Set(prev);
            s.add(courseId);
            return s;
          });
        }
        setEnrolling(null);
      },
      () => {
        Toast.error('Enrollment failed. Please try again.');
        setEnrolling(null);
      },
    );
  };

  const filtered = courses.filter((c) => {
    const name = (c.title || c.name || '').toLowerCase();
    const desc = (c.description || '').toLowerCase();
    const instr = (c.instructor || '').toLowerCase();
    const q = query.toLowerCase();
    return name.includes(q) || desc.includes(q) || instr.includes(q);
  });

  if (loading) {
    return (
      <Layout title="Course Catalog">
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout title="Course Catalog">
      <div className={classes.root}>
        <div className={classes.pageTitle}>Course Catalog</div>
        <div className={classes.pageSubtitle}>
          Browse available courses and enroll to start learning
        </div>

        <TextField
          fullWidth
          variant="outlined"
          size="small"
          className={classes.searchBox}
          placeholder="Search by course name, description or instructor…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
        />

        {filtered.length === 0 ? (
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
              {query
                ? 'No courses match your search'
                : 'No courses available yet'}
            </Typography>
            {!query && (
              <Typography
                variant="body2"
                style={{ color: '#9ca3af', marginTop: 6 }}
              >
                Check back soon — courses will appear here when they're
                published.
              </Typography>
            )}
          </div>
        ) : (
          <Grid container spacing={2}>
            {filtered.map((course: any) => {
              const isEnrolled = enrolledIds.has(course.id);
              const isPending = pendingIds.has(course.id);
              const isEnrolling = enrolling === course.id;
              const title = course.title || course.name || 'Untitled Course';
              const description = course.description || '';
              const instructor = course.instructor || '';

              return (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <div className={classes.card}>
                    <div className={classes.cardTop}>
                      {/* Open / Closed badge */}
                      <div className={classes.statusRow}>
                        <span
                          className={`${classes.enrollBadge} ${
                            course.isEnrollable
                              ? classes.enrollOpen
                              : classes.enrollClosed
                          }`}
                        >
                          {course.isEnrollable ? (
                            <>
                              <LockOpenIcon style={{ fontSize: 11 }} /> Open
                            </>
                          ) : (
                            <>
                              <LockIcon style={{ fontSize: 11 }} /> Closed
                            </>
                          )}
                        </span>
                      </div>

                      {/* Title */}
                      <div className={classes.courseName}>{title}</div>

                      {/* Description */}
                      <div
                        className={classes.courseDesc}
                        style={
                          !description
                            ? { color: '#c9c4bf', fontStyle: 'italic' }
                            : {}
                        }
                      >
                        {description || 'No description available.'}
                      </div>

                      {/* Instructor */}
                      <div className={classes.instructorRow}>
                        {instructor ? (
                          <>
                            <div className={classes.instructorAvatar}>
                              {initials(instructor)}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: '#374151',
                                }}
                              >
                                {instructor}
                              </div>
                              <div style={{ fontSize: 10, color: '#9ca3af' }}>
                                Instructor
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <PersonIcon
                              style={{ fontSize: 16, color: '#d1d5db' }}
                            />
                            <span
                              style={{
                                fontSize: 12,
                                color: '#c9c4bf',
                                fontStyle: 'italic',
                              }}
                            >
                              No instructor assigned
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className={classes.cardFooter}>
                      {isEnrolled ? (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#10b981',
                          }}
                        >
                          ✓ Enrolled
                        </span>
                      ) : isPending ? (
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#f59e0b',
                          }}
                        >
                          ⏳ Pending approval
                        </span>
                      ) : course.isEnrollable ? (
                        <Button
                          size="small"
                          className={classes.enrollBtn}
                          disabled={isEnrolling}
                          onClick={() => handleEnroll(course.id)}
                          startIcon={
                            isEnrolling ? (
                              <CircularProgress
                                size={12}
                                style={{ color: '#fff' }}
                              />
                            ) : undefined
                          }
                        >
                          {isEnrolling ? 'Enrolling…' : 'Enroll Now'}
                        </Button>
                      ) : (
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                          Enrollment closed
                        </span>
                      )}
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        )}
      </div>
    </Layout>
  );
};

export default CourseCatalog;
