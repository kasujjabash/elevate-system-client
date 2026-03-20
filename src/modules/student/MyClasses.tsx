import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import EventIcon from '@material-ui/icons/Event';
import { format, isPast, isToday } from 'date-fns';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import Loading from '../../components/Loading';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';
import { search } from '../../utils/ajax';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    upcomingCard: {
      borderLeft: `4px solid ${theme.palette.primary.main}`,
    },
    todayCard: {
      borderLeft: `4px solid ${theme.palette.warning.main}`,
      backgroundColor: '#fff8e1',
    },
    pastCard: {
      borderLeft: `4px solid ${theme.palette.grey[400]}`,
      opacity: 0.75,
    },
    sectionTitle: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(2),
      fontWeight: 600,
    },
    emptyState: {
      textAlign: 'center',
      padding: theme.spacing(6),
      color: theme.palette.text.secondary,
    },
    emptyIcon: {
      fontSize: 56,
      marginBottom: theme.spacing(1),
      color: theme.palette.primary.light,
    },
  }),
);

const getClassDate = (session: any): Date | null => {
  const d = session.startDate || session.date;
  return d ? new Date(d) : null;
};

const ClassCard = ({ session }: { session: any }) => {
  const classes = useStyles();
  const date = getClassDate(session);
  const today = date ? isToday(date) : false;
  const past = date ? isPast(date) : false;

  const cardClass = today
    ? classes.todayCard
    : past
    ? classes.pastCard
    : classes.upcomingCard;

  let statusLabel = 'Upcoming';
  let statusColor: 'primary' | 'secondary' | 'default' = 'primary';
  if (today) {
    statusLabel = 'Today';
    statusColor = 'secondary';
  } else if (past) {
    statusLabel = 'Past';
    statusColor = 'default';
  }

  return (
    <Card elevation={1} className={cardClass}>
      <CardContent style={{ paddingBottom: 12 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box flex={1} mr={1}>
            <Typography variant="subtitle2">
              {session.name || session.title || 'Class Session'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {session.group?.name || session.course?.name || ''}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {date ? format(date, 'EEE, dd MMM yyyy') : 'Date TBD'}
              {session.startTime ? ` · ${session.startTime}` : ''}
              {session.endTime ? ` – ${session.endTime}` : ''}
            </Typography>
          </Box>
          <Chip label={statusLabel} size="small" color={statusColor} />
        </Box>
      </CardContent>
    </Card>
  );
};

const MyClasses = () => {
  const classes = useStyles();
  const user = useSelector((state: IState) => state.core.user);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    search(
      remoteRoutes.classes,
      { contactId: user.contactId, limit: 100 },
      (data) => setSessions(Array.isArray(data) ? data : data.data || []),
      undefined,
      () => setLoading(false),
    );
  }, [user.contactId]);

  if (loading) {
    return (
      <Layout title="My Classes">
        <Loading />
      </Layout>
    );
  }

  const upcoming = sessions.filter((s) => {
    const d = getClassDate(s);
    return d ? !isPast(d) : true;
  });
  const past = sessions.filter((s) => {
    const d = getClassDate(s);
    return d ? isPast(d) : false;
  });

  return (
    <Layout title="My Classes">
      <Box p={2}>
        <Typography variant="h5" gutterBottom>
          My Classes
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginBottom: 24 }}
        >
          {upcoming.length} upcoming · {past.length} past
        </Typography>

        <Typography variant="h6" className={classes.sectionTitle}>
          Upcoming
        </Typography>
        {upcoming.length === 0 ? (
          <Box className={classes.emptyState}>
            <EventIcon className={classes.emptyIcon} />
            <Typography>No upcoming classes scheduled.</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {upcoming.map((s) => (
              <Grid item xs={12} sm={6} md={4} key={s.id}>
                <ClassCard session={s} />
              </Grid>
            ))}
          </Grid>
        )}

        {past.length > 0 && (
          <>
            <Typography variant="h6" className={classes.sectionTitle}>
              Past Classes
            </Typography>
            <Grid container spacing={2}>
              {past.map((s) => (
                <Grid item xs={12} sm={6} md={4} key={s.id}>
                  <ClassCard session={s} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Layout>
  );
};

export default MyClasses;
