import React, { useEffect, useState } from 'react';
import { Button, Grid, LinearProgress, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import SchoolIcon from '@material-ui/icons/School';
import PersonIcon from '@material-ui/icons/Person';

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
    marginBottom: theme.spacing(3),
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
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  } as any,
  instructorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    marginBottom: 14,
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
  instructorName: { fontSize: 12, fontWeight: 600, color: '#374151' },
  progressSection: { marginTop: 4 },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: { fontSize: 12, color: '#6b7280' },
  progressValue: { fontSize: 12, fontWeight: 700, color: CORAL },
  progressBar: { borderRadius: 4, height: 6, backgroundColor: '#f3ede9' },
  progressFill: { borderRadius: 4 },
  cardFooter: {
    borderTop: '1px solid #f3ede9',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fdfcfb',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 20,
    padding: '3px 10px',
  },
  openBtn: {
    background: `linear-gradient(90deg, ${CORAL} 0%, ${ORANGE} 100%)`,
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none' as any,
    boxShadow: 'none',
    fontSize: 13,
    '&:hover': { opacity: 0.9 },
  },
  emptyBox: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #ede8e3',
    padding: '60px 24px',
    textAlign: 'center' as any,
  },
  modulesMeta: { fontSize: 12, color: '#9ca3af', marginBottom: 10 },
}));

function initials(name: string) {
  return (name || '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const MyCourses = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Layout title="My Courses">
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout title="My Courses">
      <div className={classes.root}>
        <div className={classes.pageTitle}>My Courses</div>
        <div className={classes.pageSubtitle}>
          {enrollments.length} course{enrollments.length !== 1 ? 's' : ''}{' '}
          enrolled
        </div>

        {enrollments.length === 0 ? (
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
              You haven't enrolled in any courses yet
            </Typography>
            <Typography
              variant="body2"
              style={{ color: '#9ca3af', marginTop: 6, marginBottom: 16 }}
            >
              Browse available courses and start learning
            </Typography>
            <Button
              variant="contained"
              className={classes.openBtn}
              onClick={() => history.push(localRoutes.catalog)}
            >
              Browse Course Catalog
            </Button>
          </div>
        ) : (
          <Grid container spacing={2}>
            {enrollments.map((enrollment: any) => {
              const title =
                enrollment.title ||
                enrollment.course?.title ||
                enrollment.group?.name ||
                'Course';
              const description =
                enrollment.description || enrollment.course?.description || '';
              const instructor =
                enrollment.instructor || enrollment.course?.instructor || '';
              const progress = enrollment.progress || 0;
              const moduleCount =
                enrollment.moduleCount ?? enrollment.course?.moduleCount;
              const courseId = enrollment.courseId || enrollment.course?.id;
              const status = enrollment.status || 'active';

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={enrollment.enrollmentId || enrollment.id}
                >
                  <div className={classes.card}>
                    <div className={classes.cardTop}>
                      <div className={classes.courseName}>{title}</div>

                      {description ? (
                        <div className={classes.courseDesc}>{description}</div>
                      ) : null}

                      {instructor ? (
                        <div className={classes.instructorRow}>
                          <div className={classes.instructorAvatar}>
                            {initials(instructor)}
                          </div>
                          <div>
                            <div className={classes.instructorName}>
                              {instructor}
                            </div>
                            <div style={{ fontSize: 10, color: '#9ca3af' }}>
                              Instructor
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={classes.instructorRow}>
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
                        </div>
                      )}

                      {moduleCount != null && (
                        <div className={classes.modulesMeta}>
                          {moduleCount} week{moduleCount !== 1 ? 's' : ''}
                        </div>
                      )}

                      <div className={classes.progressSection}>
                        <div className={classes.progressRow}>
                          <span className={classes.progressLabel}>
                            Progress
                          </span>
                          <span className={classes.progressValue}>
                            {progress}%
                          </span>
                        </div>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          classes={{
                            root: classes.progressBar,
                            bar: classes.progressFill,
                          }}
                          style={{ backgroundColor: '#f3ede9' }}
                        />
                      </div>
                    </div>

                    <div className={classes.cardFooter}>
                      <span
                        className={classes.statusBadge}
                        style={
                          status === 'completed'
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
                        {status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                      <Button
                        size="small"
                        className={classes.openBtn}
                        onClick={() => {
                          if (courseId) history.push(`/my-courses/${courseId}`);
                        }}
                      >
                        Open →
                      </Button>
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

export default MyCourses;
