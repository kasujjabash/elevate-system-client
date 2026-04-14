import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  InputBase,
  CircularProgress,
  Chip,
  makeStyles,
  Theme,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { search } from '../../utils/ajax';
import { remoteRoutes } from '../../data/constants';
import { IState } from '../../data/types';

const CORAL = '#fe3a6a';
const DARK = '#1f2025';
const GREEN = '#10b981';
const BLUE = '#3b82f6';
const AMBER = '#f59e0b';
const PURPLE = '#8b5cf6';

const AVATAR_COLORS = [PURPLE, BLUE, GREEN, AMBER, CORAL];

// Normalise a raw enrollment entry → flat student object
const extractStudent = (enrollment: any, courseTitle: string) => {
  // enrollment may be the student directly, or have a .student sub-object
  const s = enrollment.student || enrollment;
  const person = s.contact?.person || s.person || {};
  const firstName = person.firstName || s.firstName || '';
  const lastName = person.lastName || s.lastName || '';
  const fullName =
    [firstName, lastName].filter(Boolean).join(' ') ||
    s.fullName ||
    s.name ||
    'Student';
  const email = s.contact?.email || s.email || person.email || '';
  const phone = s.contact?.phone || s.phone || person.phone || '';
  const contactId = s.contactId || s.contact?.id || s.id;
  const studentId = s.studentId || s.studentNumber || '';
  return {
    contactId,
    studentId,
    fullName,
    firstName,
    lastName,
    email,
    phone,
    course: courseTitle,
    progress: enrollment.progress ?? null,
  };
};

const useStyles = makeStyles((theme: Theme) => ({
  root: { paddingBottom: 32 },
  pageTitle: { fontSize: 22, fontWeight: 800, color: DARK },
  pageSub: { fontSize: 13, color: '#8a8f99', marginTop: 2, marginBottom: 20 },

  statsRow: {
    display: 'flex',
    gap: 14,
    marginBottom: 20,
    flexWrap: 'wrap' as any,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: '14px 20px',
    flex: '1 1 120px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  statValue: { fontSize: 22, fontWeight: 800, color: DARK },
  statLabel: {
    fontSize: 10,
    color: '#8a8f99',
    fontWeight: 600,
    textTransform: 'uppercase' as any,
    letterSpacing: '0.04em',
    marginTop: 3,
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap' as any,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: '7px 14px',
    flex: 1,
    maxWidth: 380,
  },
  courseFilter: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as any,
    flex: 1,
  },
  filterChip: {
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 20,
    cursor: 'pointer',
    border: '1px solid rgba(0,0,0,0.12)',
  },

  tableCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.1fr 1.5fr 1.3fr 1fr 100px',
    padding: '10px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    background: '#fafafa',
    [theme.breakpoints.down('sm')]: { display: 'none' },
  },
  tableHeadCell: {
    fontSize: 10,
    fontWeight: 700,
    color: '#8a8f99',
    textTransform: 'uppercase' as any,
    letterSpacing: '0.05em',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.1fr 1.5fr 1.3fr 1fr 100px',
    padding: '13px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    alignItems: 'center',
    '&:last-child': { borderBottom: 'none' },
    '&:hover': { background: '#fafafa' },
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr 1fr', gap: 8 },
  },
  nameCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  studentName: { fontSize: 13, fontWeight: 600, color: DARK },
  cell: { fontSize: 13, color: '#5a5e6b' },
  courseChip: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 5,
    background: 'rgba(254,58,106,0.08)',
    color: CORAL,
    padding: '2px 7px',
    display: 'inline-block',
    marginRight: 4,
    marginBottom: 2,
  },
  viewBtn: {
    fontSize: 11,
    fontWeight: 700,
    color: CORAL,
    background: 'rgba(254,58,106,0.07)',
    borderRadius: 20,
    padding: '4px 12px',
    textTransform: 'none' as any,
    '&:hover': { background: 'rgba(254,58,106,0.13)' },
  },
  emptyState: {
    textAlign: 'center' as any,
    padding: '48px 20px',
    color: '#c4c8d0',
  },
}));

interface StudentRow {
  contactId: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  courses: string[];
  progress: number | null;
}

const TrainerStudents = () => {
  const classes = useStyles();
  const history = useHistory();
  const user = useSelector((state: IState) => state.core.user);

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [courseNames, setCourseNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCourse, setActiveCourse] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.contactId) return;

    // Fetch only courses where the logged-in trainer is the instructor
    search(
      remoteRoutes.courses,
      { instructorId: user.contactId },
      (coursesData: any) => {
        const courseList: any[] = Array.isArray(coursesData)
          ? coursesData
          : coursesData?.data || [];

        if (courseList.length === 0) {
          setLoading(false);
          return;
        }

        setCourseNames(
          courseList.map((c: any) => c.title || c.name || 'Course'),
        );

        // For each course, fetch its enrollments
        const studentMap: Record<string, StudentRow> = {};
        let pending = courseList.length;

        const done = () => {
          setStudents(Object.values(studentMap));
          setLoading(false);
        };

        const processEnrollments = (
          enrollments: any[],
          courseTitle: string,
        ) => {
          enrollments.forEach((e: any) => {
            const s = extractStudent(e, courseTitle);
            const key = s.contactId || s.fullName;
            if (!key) return;
            if (studentMap[key]) {
              if (!studentMap[key].courses.includes(courseTitle)) {
                studentMap[key].courses.push(courseTitle);
              }
            } else {
              studentMap[key] = { ...s, courses: [courseTitle] };
            }
          });
        };

        courseList.forEach((course: any) => {
          const courseTitle = course.title || course.name || 'Course';
          search(
            remoteRoutes.groupsMembership,
            { groupId: course.id },
            (enrollData: any) => {
              const enrollments: any[] = Array.isArray(enrollData)
                ? enrollData
                : enrollData?.data || [];
              processEnrollments(enrollments, courseTitle);
              pending--;
              if (pending === 0) done();
            },
            () => {
              pending--;
              if (pending === 0) done();
            },
            undefined,
          );
        });
      },
      () => setLoading(false),
      undefined,
    );
  }, [user?.contactId]);

  const filtered = students.filter((s) => {
    const matchesQuery =
      !query ||
      [s.fullName, s.email, s.studentId]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesCourse = !activeCourse || s.courses.includes(activeCourse);
    return matchesQuery && matchesCourse;
  });

  const navigateToProfile = (s: StudentRow) => {
    if (s.contactId) history.push(`/people/students/${s.contactId}`);
  };

  return (
    <Layout>
      <div className={classes.root}>
        <div className={classes.pageTitle}>Students</div>
        <div className={classes.pageSub}>Students enrolled in your courses</div>

        {/* Stats */}
        <div className={classes.statsRow}>
          {[
            { label: 'Total Students', value: loading ? '…' : students.length },
            { label: 'My Courses', value: loading ? '…' : courseNames.length },
            { label: 'Avg. Attendance', value: '—' },
            { label: 'Avg. Grade', value: '—' },
          ].map(({ label, value }) => (
            <div key={label} className={classes.statCard}>
              <div className={classes.statValue}>{value}</div>
              <div className={classes.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className={classes.toolbar}>
          <div className={classes.searchBox}>
            <SearchIcon style={{ fontSize: 17, color: '#9ca3af' }} />
            <InputBase
              placeholder="Search students..."
              style={{ fontSize: 13, flex: 1 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={classes.courseFilter}>
            <Chip
              label="All Courses"
              size="small"
              className={classes.filterChip}
              onClick={() => setActiveCourse(null)}
              style={{
                background: !activeCourse ? CORAL : 'transparent',
                color: !activeCourse ? '#fff' : DARK,
                borderColor: !activeCourse ? CORAL : 'rgba(0,0,0,0.12)',
              }}
            />
            {courseNames.map((name) => (
              <Chip
                key={name}
                label={name}
                size="small"
                className={classes.filterChip}
                onClick={() =>
                  setActiveCourse(activeCourse === name ? null : name)
                }
                style={{
                  background: activeCourse === name ? CORAL : 'transparent',
                  color: activeCourse === name ? '#fff' : DARK,
                  borderColor:
                    activeCourse === name ? CORAL : 'rgba(0,0,0,0.12)',
                }}
              />
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <CircularProgress size={28} style={{ color: CORAL }} />
            <Typography
              style={{ fontSize: 13, color: '#8a8f99', marginTop: 12 }}
            >
              Loading your students…
            </Typography>
          </div>
        ) : (
          <div className={classes.tableCard}>
            <div className={classes.tableHead}>
              {[
                'Student',
                'Student ID',
                'Contact',
                'Course(s)',
                'Progress',
                'Actions',
              ].map((h) => (
                <div key={h} className={classes.tableHeadCell}>
                  {h}
                </div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className={classes.emptyState}>
                <Typography style={{ fontSize: 14, color: '#9ca3af' }}>
                  {students.length === 0
                    ? 'No students enrolled in your courses yet.'
                    : 'No students match your search.'}
                </Typography>
              </div>
            ) : (
              filtered.map((s, i) => {
                const initials =
                  s.fullName
                    .split(' ')
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || '?';
                const progress = s.progress;
                const progressColor =
                  progress == null
                    ? '#8a8f99'
                    : progress >= 80
                    ? GREEN
                    : progress >= 40
                    ? AMBER
                    : CORAL;

                return (
                  <div key={s.contactId || i} className={classes.tableRow}>
                    <div className={classes.nameCell}>
                      <div
                        className={classes.avatar}
                        style={{
                          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                        }}
                      >
                        {initials}
                      </div>
                      <span className={classes.studentName}>{s.fullName}</span>
                    </div>
                    <div className={classes.cell}>
                      {s.studentId || s.contactId || '—'}
                    </div>
                    <div className={classes.cell} style={{ fontSize: 12 }}>
                      {s.email || s.phone || '—'}
                    </div>
                    <div>
                      {s.courses.map((c) => (
                        <span key={c} className={classes.courseChip}>
                          {c}
                        </span>
                      ))}
                    </div>
                    <div
                      className={classes.cell}
                      style={{ fontWeight: 600, color: progressColor }}
                    >
                      {progress != null ? `${Math.round(progress)}%` : '—'}
                    </div>
                    <div>
                      <Button
                        size="small"
                        className={classes.viewBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToProfile(s);
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrainerStudents;
