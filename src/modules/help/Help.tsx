import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Collapse,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import RocketLaunchIcon from '@material-ui/icons/Stars';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Layout from '../../components/layout/Layout';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      maxWidth: 900,
    },

    // ── Page header ──────────────────────────────────────────────
    header: {
      marginBottom: theme.spacing(4),
    },
    headerLabel: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#fe3a6a',
      marginBottom: theme.spacing(1),
    },
    headerTitle: {
      fontSize: '26px',
      fontWeight: 800,
      color: '#1f2025',
      letterSpacing: '-0.03em',
      lineHeight: 1.2,
      marginBottom: theme.spacing(1),
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#8a8f99',
      lineHeight: 1.6,
      maxWidth: 520,
    },

    // ── Topic cards ───────────────────────────────────────────────
    topicCard: {
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      height: '100%',
      transition: 'box-shadow 0.15s ease, transform 0.15s ease',
      '&:hover': {
        boxShadow: '0 6px 16px rgba(0,0,0,0.09)',
        transform: 'translateY(-1px)',
      },
    },
    topicCardContent: {
      padding: theme.spacing(2.5),
    },
    topicIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing(1.5),
    },
    topicTitle: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#1f2025',
      marginBottom: theme.spacing(0.75),
      letterSpacing: '-0.01em',
    },
    topicBody: {
      fontSize: '13px',
      color: '#5a5e6b',
      lineHeight: 1.6,
    },

    // ── Section label ─────────────────────────────────────────────
    sectionLabel: {
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#8a8f99',
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(4),
    },

    // ── FAQ ───────────────────────────────────────────────────────
    faqCard: {
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    },
    faqItem: {
      padding: theme.spacing(0),
      '&:not(:last-child)': {
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      },
    },
    faqQuestion: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(2, 2.5),
      cursor: 'pointer',
      userSelect: 'none',
      '&:hover': {
        backgroundColor: '#fafafa',
      },
    },
    faqQuestionText: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#1f2025',
      letterSpacing: '-0.01em',
    },
    faqChevron: {
      color: '#8a8f99',
      fontSize: 20,
      flexShrink: 0,
      transition: 'transform 0.2s ease',
    },
    faqAnswer: {
      padding: theme.spacing(0, 2.5, 2),
      fontSize: '13px',
      color: '#5a5e6b',
      lineHeight: 1.65,
      backgroundColor: '#fafafa',
    },

    // ── Contact strip ─────────────────────────────────────────────
    contactStrip: {
      marginTop: theme.spacing(4),
      borderRadius: 12,
      background: 'linear-gradient(135deg, #1f2025 0%, #2d2f38 100%)',
      padding: theme.spacing(3),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing(2),
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    contactTitle: {
      fontSize: '15px',
      fontWeight: 700,
      color: '#ffffff',
      marginBottom: 4,
      letterSpacing: '-0.01em',
    },
    contactSub: {
      fontSize: '13px',
      color: 'rgba(255,255,255,0.5)',
    },
    contactEmail: {
      display: 'inline-block',
      padding: '8px 20px',
      borderRadius: 8,
      background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
      color: '#fff',
      fontSize: '13px',
      fontWeight: 700,
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
  }),
);

const TOPICS = [
  {
    icon: RocketLaunchIcon,
    color: '#fe3a6a',
    bg: 'rgba(254,58,106,0.1)',
    title: 'Getting Started',
    body: 'Learn how to navigate the Elevate Academy management system and set up your profile.',
  },
  {
    icon: PersonAddIcon,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
    title: 'Student Registration',
    body: 'Step-by-step guide on registering new students and assigning them to courses and hubs.',
  },
  {
    icon: LibraryBooksIcon,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    title: 'Course Management',
    body: 'How to create and manage courses — Web Development, Video Production, Film & Photography, and UI/UX Design.',
  },
  {
    icon: LocationOnIcon,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    title: 'Hub Administration',
    body: 'Managing hub locations: Katanga, Kosovo, Jinja, Namayemba, and Lyantode.',
  },
  {
    icon: AssessmentIcon,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    title: 'Reports & Analytics',
    body: 'Understanding student progress reports and generating analytics for course performance.',
  },
];

const FAQS = [
  {
    q: 'How do I enroll a student in multiple courses?',
    a: "Navigate to the student's profile and use the course enrollment section to add additional courses.",
  },
  {
    q: 'How do I transfer a student between hubs?',
    a: "Go to the student's details page and update their hub assignment in the profile settings.",
  },
  {
    q: 'Where can I view course completion reports?',
    a: 'Visit the Reports section in the main navigation to access comprehensive analytics and progress reports.',
  },
  {
    q: "How do I reset a student's password?",
    a: 'Go to Admin → Manage Users, find the student account, and use the Reset Password option from the actions menu.',
  },
  {
    q: 'Can I export student data?',
    a: 'Yes. From the Students section, use the export button in the top-right toolbar to download a CSV of the current list.',
  },
];

const Help = () => {
  const classes = useStyles();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <Layout title="Help Center">
      <div className={classes.root}>
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.headerLabel}>
            <HelpOutlineIcon style={{ fontSize: 13 }} />
            Help Center
          </div>
          <div className={classes.headerTitle}>How can we help you?</div>
          <div className={classes.headerSubtitle}>
            Find guidance on managing students, courses, hubs, and reports
            across the Elevate Academy platform.
          </div>
        </div>

        {/* Topics */}
        <Typography className={classes.sectionLabel}>Browse topics</Typography>
        <Grid container spacing={2}>
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={topic.title}>
                <Card className={classes.topicCard}>
                  <CardContent className={classes.topicCardContent}>
                    <div
                      className={classes.topicIconWrap}
                      style={{ background: topic.bg }}
                    >
                      <Icon style={{ fontSize: 20, color: topic.color }} />
                    </div>
                    <div className={classes.topicTitle}>{topic.title}</div>
                    <div className={classes.topicBody}>{topic.body}</div>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* FAQ */}
        <Typography className={classes.sectionLabel}>
          Frequently asked questions
        </Typography>
        <Card className={classes.faqCard}>
          {FAQS.map((faq, i) => (
            <div className={classes.faqItem} key={i}>
              <div
                className={classes.faqQuestion}
                onClick={() => toggleFaq(i)}
                role="button"
              >
                <span className={classes.faqQuestionText}>{faq.q}</span>
                {openFaq === i ? (
                  <ExpandLessIcon className={classes.faqChevron} />
                ) : (
                  <ExpandMoreIcon className={classes.faqChevron} />
                )}
              </div>
              <Collapse in={openFaq === i}>
                <div className={classes.faqAnswer}>{faq.a}</div>
              </Collapse>
            </div>
          ))}
        </Card>

        {/* Contact strip */}
        <div className={classes.contactStrip}>
          <div>
            <div className={classes.contactTitle}>Still need help?</div>
            <div className={classes.contactSub}>
              Reach out to the Era92 support team directly.
            </div>
          </div>
          <a
            href="mailto:support@era92elevate.org"
            className={classes.contactEmail}
          >
            Contact Support
          </a>
        </div>

        <Box style={{ marginBottom: 24 }} />
      </div>
    </Layout>
  );
};

export default Help;
