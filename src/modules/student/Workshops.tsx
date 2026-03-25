import React from 'react';
import Layout from '../../components/layout/Layout';
import { Box, Typography, Paper } from '@material-ui/core';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';

const Workshops = () => (
  <Layout>
    <Box p={3}>
      <Typography
        variant="h5"
        style={{ fontWeight: 700, color: '#1f2025', marginBottom: 24 }}
      >
        Workshops &amp; Podcasts
      </Typography>
      <Paper
        elevation={0}
        style={{
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12,
          padding: 60,
          textAlign: 'center',
        }}
      >
        <PlayCircleOutlineIcon
          style={{ fontSize: 48, color: '#e0e0e0', marginBottom: 12 }}
        />
        <Typography
          variant="body1"
          style={{ color: '#8a8f99', fontWeight: 500 }}
        >
          Coming soon
        </Typography>
        <Typography variant="body2" style={{ color: '#b0b5bf', marginTop: 4 }}>
          Workshops and podcast content will be available here.
        </Typography>
      </Paper>
    </Box>
  </Layout>
);

export default Workshops;
