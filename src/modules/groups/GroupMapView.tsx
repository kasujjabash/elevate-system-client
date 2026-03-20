import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  makeStyles,
  Theme,
  createStyles,
} from '@material-ui/core';
import LocationOnIcon from '@material-ui/icons/LocationOn';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
    hubCard: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      '&:hover': {
        boxShadow: theme.shadows[4],
      },
    },
    hubHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
    },
    locationIcon: {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    },
  }),
);

interface IHubLocation {
  name: string;
  address: string;
  description: string;
}

interface IProps {
  data?: IHubLocation[];
}

const defaultHubLocations: IHubLocation[] = [
  {
    name: 'Katanga Hub',
    address: 'Katanga, Kampala',
    description:
      'Digital skills training center focusing on web development and UI/UX design',
  },
  {
    name: 'Kosovo Hub',
    address: 'Kosovo, Kampala',
    description:
      'Specializing in video production and film & photography courses',
  },
  {
    name: 'Jinja Hub',
    address: 'Jinja, Eastern Uganda',
    description:
      'Full-service digital skills center offering all course categories',
  },
  {
    name: 'Namayemba Hub',
    address: 'Namayemba, Central Uganda',
    description:
      'Community-focused hub for digital literacy and technical skills',
  },
  {
    name: 'Lyantode Hub',
    address: 'Lyantode, Western Uganda',
    description:
      'Rural digital skills center expanding access to technology education',
  },
];

const HubMapView = ({ data = defaultHubLocations }: IProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Typography variant="h6" gutterBottom>
        Elevate Academy Hub Locations
      </Typography>
      <Grid container spacing={3}>
        {data.map((hub, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card className={classes.hubCard}>
              <CardContent>
                <Box className={classes.hubHeader}>
                  <LocationOnIcon className={classes.locationIcon} />
                  <Typography variant="h6" component="h3">
                    {hub.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {hub.address}
                </Typography>
                <Typography variant="body2">{hub.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HubMapView;
