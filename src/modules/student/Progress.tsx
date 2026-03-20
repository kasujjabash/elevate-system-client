import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/Loading';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { search } from '../../utils/ajax';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    statCard: {
      textAlign: 'center',
      padding: theme.spacing(1),
    },
    statIcon: {
      fontSize: 40,
      marginBottom: 4,
    },
    courseCard: {
      marginBottom: theme.spacing(2),
    },
    progressRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(0.5),
    },
    classRow: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.75, 0),
      borderBottom: `1px solid ${theme.palette.divider}`,
      gap: theme.spacing(1),
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    emptyState: {
      textAlign: 'center',
      padding: theme.spacing(8),
      color: theme.palette.text.secondary,
    },
    emptyIcon: {
      fontSize: 64,
      color: theme.palette.primary.light,
      marginBottom: theme.spacing(2),
    },
    sectionTitle: {
      fontWeight: 600,
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(3),
    },
  }),
);

const Progress = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = 0;
    const finish = () => {
      done += 1;
      if (done === 2) setLoading(false);
    };

    search(
      remoteRoutes.coursesEnrollment,
      { contactId: user.contactId },
      (data) => setEnrollments(Array.isArray(data) ? data : data.data || []),
      undefined,
      finish,
    );

    search(
      remoteRoutes.classesAttendance,
      { contactId: user.contactId },
      (data) =>
        setAttendanceRecords(Array.isArray(data) ? data : data.data || []),
      undefined,
      finish,
    );
  }, [user.contactId]);

  if (loading) {
    return (
      <Layout title="My Progress">
        <Loading />
      </Layout>
    );
  }

  const completed = enrollments.filter((e) => e.status === 'completed').length;
  const inProgress = enrollments.filter((e) => e.status !== 'completed').length;
  const attendedCount = attendanceRecords.filter(
    (r) => r.attended === true || r.status === 'present',
  ).length;

  const overallProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
            enrollments.length,
        )
      : 0;

  const stats = [
    {
      label: 'Overall Progress',
      value: `${overallProgress}%`,
      icon: TrendingUpIcon,
      color: '#3f51b5',
    },
    {
      label: 'Courses Completed',
      value: completed,
      icon: CheckCircleIcon,
      color: '#388e3c',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: RadioButtonUncheckedIcon,
      color: '#f57c00',
    },
    {
      label: 'Classes Attended',
      value: attendedCount,
      icon: CheckCircleIcon,
      color: '#0288d1',
    },
  ];

  return (
    <Layout title="My Progress">
      <Box p={2}>
        <Typography variant="h5" gutterBottom>
          My Progress
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginBottom: 24 }}
        >
          Your learning journey overview
        </Typography>

        {/* Stats */}
        <Grid container spacing={2}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={6} sm={3} key={stat.label}>
                <Card elevation={2}>
                  <CardContent className={classes.statCard}>
                    <Icon
                      className={classes.statIcon}
                      style={{ color: stat.color }}
                    />
                    <Typography variant="h5">{stat.value}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Per-course breakdown */}
        <Typography variant="h6" className={classes.sectionTitle}>
          Course Breakdown
        </Typography>

        {enrollments.length === 0 ? (
          <Box className={classes.emptyState}>
            <TrendingUpIcon className={classes.emptyIcon} />
            <Typography variant="h6" gutterBottom>
              No courses enrolled
            </Typography>
            <Typography variant="body2">
              Enroll in courses to track your progress here.
            </Typography>
          </Box>
        ) : (
          enrollments.map((enrollment: any) => {
            const course = enrollment.group || enrollment.course || {};
            const progress = enrollment.progress || 0;
            const classesAttended = attendanceRecords.filter(
              (r) =>
                (r.groupId === course.id || r.courseId === course.id) &&
                (r.attended === true || r.status === 'present'),
            ).length;
            const totalClasses = attendanceRecords.filter(
              (r) => r.groupId === course.id || r.courseId === course.id,
            ).length;

            return (
              <Card
                key={enrollment.id}
                className={classes.courseCard}
                elevation={2}
              >
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        style={{ fontWeight: 600 }}
                      >
                        {course.name || 'Course'}
                      </Typography>
                      {course.category && (
                        <Typography variant="caption" color="textSecondary">
                          {course.category.name || course.category}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={enrollment.status || 'Active'}
                      size="small"
                      color={
                        enrollment.status === 'completed'
                          ? 'primary'
                          : 'default'
                      }
                    />
                  </Box>

                  {/* Progress bar */}
                  <div className={classes.progressRow}>
                    <Typography variant="caption">Course Progress</Typography>
                    <Typography variant="caption" style={{ fontWeight: 600 }}>
                      {progress}%
                    </Typography>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    style={{ marginBottom: 12 }}
                  />

                  {/* Attendance */}
                  {totalClasses > 0 && (
                    <>
                      <div className={classes.progressRow}>
                        <Typography variant="caption">Attendance</Typography>
                        <Typography
                          variant="caption"
                          style={{ fontWeight: 600 }}
                        >
                          {classesAttended} / {totalClasses} classes
                        </Typography>
                      </div>
                      <LinearProgress
                        variant="determinate"
                        value={
                          totalClasses > 0
                            ? (classesAttended / totalClasses) * 100
                            : 0
                        }
                        color="secondary"
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>
    </Layout>
  );
};

export default Progress;
