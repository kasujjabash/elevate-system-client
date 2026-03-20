import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  makeStyles,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import PeopleIcon from '@material-ui/icons/People';
import TodayIcon from '@material-ui/icons/Today';
import DateRangeIcon from '@material-ui/icons/DateRange';
import FilterListIcon from '@material-ui/icons/FilterList';
import PersonIcon from '@material-ui/icons/Person';
import SchoolIcon from '@material-ui/icons/School';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import UploadIcon from '@material-ui/icons/CloudUpload';
import ViewListIcon from '@material-ui/icons/ViewList';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Navigation from '../../components/layout/Layout';
import { search } from '../../utils/ajax';
import {
  appPermissions,
  localRoutes,
  remoteRoutes,
} from '../../data/constants';
import { crmConstants, ICrmState } from '../../data/contacts/reducer';
import { hasAnyRole } from '../../data/appRoles';
import { IState } from '../../data/types';
import EditDialog from '../../components/EditDialog';
import NewPersonForm from './NewPersonForm';
import ContactUpload from './ContactUpload';

// ─── SERVER ENDPOINT SPECIFICATION ───────────────────────────────────────────
// GET /api/students
//   Query params:
//     query       string   — name / email / phone search
//     hub         string   — hub slug: katanga | kosovo | jinja | namayemba | lyantode
//     course      string   — course slug: graphic-design | website-development |
//                            film-photography | alx-course
//     dateFrom    string   — YYYY-MM-DD  filter registeredAt >= dateFrom
//     dateTo      string   — YYYY-MM-DD  filter registeredAt <= dateTo
//     limit       number   — default 50
//     skip        number   — default 0
//
//   Response shape:
//   {
//     data: Student[],
//     total: number,        // total matching (ignoring pagination)
//     todayCount: number,   // students registered today (across ALL filters)
//     weekCount: number,    // students registered this week
//   }
//
//   Student shape:
//   {
//     id, firstName, lastName, middleName,
//     name,                 // computed full name
//     email, phone,
//     hub,                  // slug: "katanga"
//     hubName,              // display: "Katanga Hub"
//     course,               // slug: "website-development"
//     ageGroup, gender, civilStatus,
//     avatar,               // URL or null
//     status,               // "active" | "pending" | "inactive"
//     registeredAt,         // ISO datetime
//     occupation, residence
//   }
// ─────────────────────────────────────────────────────────────────────────────

const useStyles = makeStyles((theme: Theme) => ({
  root: { padding: theme.spacing(3) },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1f2025',
    fontFamily: '"Inter Tight", sans-serif',
  },
  subtitle: { fontSize: 13, color: '#8a8f99', marginTop: 2 },
  addButton: {
    background: 'linear-gradient(90deg, #fe3a6a 0%, #fe8c45 100%)',
    color: '#fff',
    borderRadius: 8,
    fontWeight: 700,
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': {
      background: 'linear-gradient(90deg, #d4183f 0%, #d4712e 100%)',
      boxShadow: '0 4px 16px rgba(254,58,106,0.3)',
    },
  },
  statsRow: { marginBottom: theme.spacing(3) },
  statCard: {
    borderRadius: 12,
    padding: theme.spacing(2),
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    '&:hover': { boxShadow: '0 3px 12px rgba(0,0,0,0.12)' },
  },
  statCardActive: {
    border: '2px solid #fe3a6a',
    boxShadow: '0 2px 12px rgba(254,58,106,0.18)',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statNumber: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#1f2025',
    lineHeight: 1,
    fontFamily: '"Inter Tight", sans-serif',
  },
  statLabel: { fontSize: '12px', color: '#8a8f99', marginTop: 3 },
  filterBar: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: theme.spacing(1.5),
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    minWidth: 200,
    maxWidth: 320,
    '& .MuiOutlinedInput-root': { borderRadius: 8, fontSize: 13 },
  },
  filterSelect: {
    minWidth: 160,
    '& .MuiOutlinedInput-root': { borderRadius: 8, fontSize: 13 },
  },
  dateField: {
    width: 160,
    '& .MuiOutlinedInput-root': { borderRadius: 8, fontSize: 13 },
  },
  tableCard: {
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    overflow: 'hidden',
  },
  tableHeadCell: {
    fontWeight: 700,
    fontSize: '11px',
    color: '#8a8f99',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: '#f8f9fa',
    padding: '10px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  tableCell: {
    fontSize: '13px',
    color: '#1f2025',
    padding: '11px 16px',
    borderBottom: '1px solid #f8f8f8',
  },
  avatarCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #fe3a6a, #fe8c45)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 12,
    flexShrink: 0,
  },
  studentName: { fontWeight: 600, fontSize: 13, color: '#1f2025' },
  studentEmail: { fontSize: 11, color: '#8a8f99' },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(6),
    color: '#8a8f99',
  },
  viewToggle: {
    display: 'flex',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewToggleBtn: {
    padding: '6px 10px',
    borderRadius: 0,
    minWidth: 'unset',
    border: 'none',
  },
  gridCard: {
    borderRadius: 12,
    border: '1px solid #f0f0f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    padding: theme.spacing(2),
    cursor: 'pointer',
    transition: 'box-shadow 0.15s',
    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
  },
}));

const HUB_COLORS: Record<string, { bg: string; color: string }> = {
  katanga: { bg: '#fee2e9', color: '#fe3a6a' },
  kosovo: { bg: '#ede9ff', color: '#6366f1' },
  jinja: { bg: '#fef3c7', color: '#d97706' },
  namayemba: { bg: '#dcfce7', color: '#16a34a' },
  lyantode: { bg: '#dbeafe', color: '#2563eb' },
};

const COURSE_COLORS: Record<string, { bg: string; color: string }> = {
  'graphic-design': { bg: '#f3e8ff', color: '#7c3aed' },
  'website-development': { bg: '#dbeafe', color: '#2563eb' },
  'film-photography': { bg: '#fef3c7', color: '#d97706' },
  'alx-course': { bg: '#dcfce7', color: '#16a34a' },
};

const COURSE_LABELS: Record<string, string> = {
  'graphic-design': 'Graphic Design',
  'website-development': 'Website Dev',
  'film-photography': 'Film & Photo',
  'alx-course': 'ALX Course',
};

const HUB_OPTIONS = [
  { value: '', label: 'All Hubs' },
  { value: 'katanga', label: 'Katanga Hub' },
  { value: 'kosovo', label: 'Kosovo Hub' },
  { value: 'jinja', label: 'Jinja Hub' },
  { value: 'namayemba', label: 'Namayemba Hub' },
  { value: 'lyantode', label: 'Lyantode Hub' },
];

const COURSE_OPTIONS = [
  { value: '', label: 'All Courses' },
  { value: 'graphic-design', label: 'Graphic Design' },
  { value: 'website-development', label: 'Website Development' },
  { value: 'film-photography', label: 'Film & Photography' },
  { value: 'alx-course', label: 'ALX Course' },
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');

const Contacts = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { data, loading }: ICrmState = useSelector((state: any) => state.crm);
  const user = useSelector((state: IState) => state.core.user);

  const [createDialog, setCreateDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [query, setQuery] = useState('');
  const [hub, setHub] = useState('');
  const [course, setCourse] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'week'>(
    'all',
  );

  const [totalCount, setTotalCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);

  const buildFilter = () => {
    const f: any = { limit: 200, skip: 0 };
    if (query.trim()) f.query = query.trim();
    if (hub) f.hub = hub;
    if (course) f.course = course;
    if (dateFrom) f.dateFrom = dateFrom;
    if (dateTo) f.dateTo = dateTo;
    if (quickFilter === 'today') f.dateFrom = format(new Date(), 'yyyy-MM-dd');
    if (quickFilter === 'week') {
      const s = new Date();
      s.setDate(s.getDate() - s.getDay());
      f.dateFrom = format(s, 'yyyy-MM-dd');
    }
    return f;
  };

  const fetchStudents = () => {
    dispatch({ type: crmConstants.crmFetchLoading, payload: true });
    search(
      remoteRoutes.contacts,
      buildFilter(),
      (resp: any) => {
        const list: any[] = Array.isArray(resp) ? resp : resp.data || [];
        dispatch({ type: crmConstants.crmFetchAll, payload: list });
        setTotalCount(
          Array.isArray(resp) ? list.length : resp.total ?? list.length,
        );
        setTodayCount(
          resp.todayCount ??
            list.filter(
              (s) => s.registeredAt && isToday(parseISO(s.registeredAt)),
            ).length,
        );
        setWeekCount(
          resp.weekCount ??
            list.filter(
              (s) => s.registeredAt && isThisWeek(parseISO(s.registeredAt)),
            ).length,
        );
      },
      undefined,
      () => dispatch({ type: crmConstants.crmFetchLoading, payload: false }),
    );
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, hub, course, dateFrom, dateTo, quickFilter]);

  const handleQuickFilter = (f: 'all' | 'today' | 'week') => {
    setQuickFilter(f);
    setDateFrom('');
    setDateTo('');
    setShowDateRange(false);
  };

  const clearFilters = () => {
    setQuery('');
    setHub('');
    setCourse('');
    setDateFrom('');
    setDateTo('');
    setQuickFilter('all');
    setShowDateRange(false);
  };

  const hasActiveFilters = !!(
    query ||
    hub ||
    course ||
    dateFrom ||
    dateTo ||
    quickFilter !== 'all'
  );
  const students: any[] = data || [];

  const activeLabel = () => {
    const parts: string[] = [];
    if (quickFilter === 'today') parts.push('today');
    else if (quickFilter === 'week') parts.push('this week');
    if (hub) parts.push(HUB_OPTIONS.find((h) => h.value === hub)?.label || hub);
    if (course)
      parts.push(
        COURSE_OPTIONS.find((c) => c.value === course)?.label || course,
      );
    if (dateFrom && !quickFilter.match(/today|week/))
      parts.push(`from ${dateFrom}`);
    if (dateTo) parts.push(`to ${dateTo}`);
    return parts.join(' · ');
  };

  return (
    <Navigation>
      <div className={classes.root}>
        {/* Header */}
        <div className={classes.header}>
          <div>
            <div className={classes.title}>Students</div>
            <div className={classes.subtitle}>
              Manage and track all enrolled students across hubs
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {hasAnyRole(user, [appPermissions.roleCrmEdit]) && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadDialog(true)}
                  style={{
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    borderColor: '#e0e0e0',
                    color: '#5a5e6b',
                  }}
                >
                  Import
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  className={classes.addButton}
                  onClick={() => setCreateDialog(true)}
                >
                  Add Student
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Clickable stat cards for quick filtering */}
        <Grid container spacing={2} className={classes.statsRow}>
          <Grid item xs={6} sm={4}>
            <Card
              className={`${classes.statCard} ${
                quickFilter === 'all' && !hasActiveFilters
                  ? classes.statCardActive
                  : ''
              }`}
              onClick={() => handleQuickFilter('all')}
            >
              <div
                className={classes.statIcon}
                style={{ background: '#fee2e9' }}
              >
                <PeopleIcon style={{ color: '#fe3a6a', fontSize: 20 }} />
              </div>
              <div>
                <div className={classes.statNumber}>
                  {totalCount || students.length}
                </div>
                <div className={classes.statLabel}>Total Students</div>
              </div>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Card
              className={`${classes.statCard} ${
                quickFilter === 'today' ? classes.statCardActive : ''
              }`}
              onClick={() => handleQuickFilter('today')}
            >
              <div
                className={classes.statIcon}
                style={{ background: '#dcfce7' }}
              >
                <TodayIcon style={{ color: '#16a34a', fontSize: 20 }} />
              </div>
              <div>
                <div className={classes.statNumber}>{todayCount}</div>
                <div className={classes.statLabel}>Registered Today</div>
              </div>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Card
              className={`${classes.statCard} ${
                quickFilter === 'week' ? classes.statCardActive : ''
              }`}
              onClick={() => handleQuickFilter('week')}
            >
              <div
                className={classes.statIcon}
                style={{ background: '#dbeafe' }}
              >
                <DateRangeIcon style={{ color: '#2563eb', fontSize: 20 }} />
              </div>
              <div>
                <div className={classes.statNumber}>{weekCount}</div>
                <div className={classes.statLabel}>This Week</div>
              </div>
            </Card>
          </Grid>
        </Grid>

        {/* Filter controls */}
        <div className={classes.filterBar}>
          <TextField
            placeholder="Search name, email, phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            size="small"
            className={classes.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ fontSize: 18, color: '#8a8f99' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            value={hub}
            onChange={(e) => setHub(e.target.value)}
            variant="outlined"
            size="small"
            className={classes.filterSelect}
            SelectProps={{ displayEmpty: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon style={{ fontSize: 15, color: '#8a8f99' }} />
                </InputAdornment>
              ),
            }}
          >
            {HUB_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            variant="outlined"
            size="small"
            className={classes.filterSelect}
            SelectProps={{ displayEmpty: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SchoolIcon style={{ fontSize: 15, color: '#8a8f99' }} />
                </InputAdornment>
              ),
            }}
          >
            {COURSE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip title="Filter by date range">
            <IconButton
              size="small"
              onClick={() => setShowDateRange(!showDateRange)}
              style={{
                border: `1px solid ${showDateRange ? '#fe3a6a' : '#e0e0e0'}`,
                borderRadius: 8,
                padding: 6,
                color: showDateRange ? '#fe3a6a' : '#8a8f99',
              }}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {hasActiveFilters && (
            <Button
              size="small"
              onClick={clearFilters}
              style={{
                textTransform: 'none',
                color: '#8a8f99',
                fontSize: 12,
                padding: '4px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
              }}
            >
              Clear
            </Button>
          )}

          <div style={{ marginLeft: 'auto' }}>
            <div className={classes.viewToggle}>
              <Button
                className={classes.viewToggleBtn}
                onClick={() => setViewMode('table')}
                style={{
                  backgroundColor:
                    viewMode === 'table' ? '#f5f5f5' : 'transparent',
                }}
              >
                <ViewListIcon
                  style={{
                    fontSize: 18,
                    color: viewMode === 'table' ? '#1f2025' : '#8a8f99',
                  }}
                />
              </Button>
              <Button
                className={classes.viewToggleBtn}
                onClick={() => setViewMode('grid')}
                style={{
                  backgroundColor:
                    viewMode === 'grid' ? '#f5f5f5' : 'transparent',
                }}
              >
                <ViewModuleIcon
                  style={{
                    fontSize: 18,
                    color: viewMode === 'grid' ? '#1f2025' : '#8a8f99',
                  }}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Date range expander */}
        {showDateRange && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 12,
              alignItems: 'center',
            }}
          >
            <TextField
              label="From"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setQuickFilter('all');
              }}
              variant="outlined"
              size="small"
              className={classes.dateField}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setQuickFilter('all');
              }}
              variant="outlined"
              size="small"
              className={classes.dateField}
              InputLabelProps={{ shrink: true }}
            />
          </div>
        )}

        {/* Context label */}
        {hasActiveFilters && (
          <Box mb={1.5}>
            <Typography style={{ fontSize: 13, color: '#8a8f99' }}>
              Showing{' '}
              <strong style={{ color: '#1f2025' }}>{students.length}</strong>{' '}
              student{students.length !== 1 ? 's' : ''}
              {activeLabel() && <span> · {activeLabel()}</span>}
            </Typography>
          </Box>
        )}

        {/* Main content */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress style={{ color: '#fe3a6a' }} />
          </Box>
        ) : students.length === 0 ? (
          <div className={classes.emptyState}>
            <PersonIcon
              style={{ fontSize: 56, color: '#e0e0e0', marginBottom: 8 }}
            />
            <Typography
              style={{ fontWeight: 600, color: '#8a8f99', fontSize: 15 }}
            >
              No students found
            </Typography>
            <Typography
              style={{ fontSize: 13, color: '#c0c4ce', marginTop: 4 }}
            >
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Add your first student to get started'}
            </Typography>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                style={{
                  marginTop: 12,
                  textTransform: 'none',
                  color: '#fe3a6a',
                  fontWeight: 600,
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <Card className={classes.tableCard}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableHeadCell}>
                    Student
                  </TableCell>
                  <TableCell className={classes.tableHeadCell}>Hub</TableCell>
                  <TableCell className={classes.tableHeadCell}>
                    Course
                  </TableCell>
                  <TableCell className={classes.tableHeadCell}>Phone</TableCell>
                  <TableCell className={classes.tableHeadCell}>
                    Registered
                  </TableCell>
                  <TableCell className={classes.tableHeadCell}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s: any) => {
                  const name =
                    s.name ||
                    `${s.firstName || ''} ${s.lastName || ''}`.trim() ||
                    'Unknown';
                  const hubSlug = (s.hub || s.hubName || '')
                    .toLowerCase()
                    .replace(/\s+hub.*/, '')
                    .trim();
                  const courseSlug = s.course || s.interestedInCourses || '';
                  const hubStyle = HUB_COLORS[hubSlug] || {
                    bg: '#f0f0f0',
                    color: '#8a8f99',
                  };
                  const courseStyle = COURSE_COLORS[courseSlug] || {
                    bg: '#f0f0f0',
                    color: '#8a8f99',
                  };
                  const regDate = s.registeredAt || s.createdAt;
                  const isNew = regDate && isToday(parseISO(regDate));
                  return (
                    <TableRow
                      key={s.id}
                      hover
                      onClick={() =>
                        history.push(`${localRoutes.students}/${s.id}`)
                      }
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell className={classes.tableCell}>
                        <div className={classes.avatarCell}>
                          {s.avatar ? (
                            <Avatar
                              src={s.avatar}
                              style={{ width: 34, height: 34 }}
                            />
                          ) : (
                            <div className={classes.avatarCircle}>
                              {getInitials(name)}
                            </div>
                          )}
                          <div>
                            <div className={classes.studentName}>{name}</div>
                            <div className={classes.studentEmail}>
                              {s.email || '—'}
                            </div>
                          </div>
                          {isNew && (
                            <Chip
                              label="New"
                              size="small"
                              style={{
                                height: 17,
                                fontSize: 10,
                                fontWeight: 700,
                                backgroundColor: '#dcfce7',
                                color: '#16a34a',
                                borderRadius: 4,
                                marginLeft: 4,
                              }}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {hubSlug ? (
                          <Chip
                            label={s.hubName || s.hub || hubSlug}
                            size="small"
                            style={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              borderRadius: 6,
                              backgroundColor: hubStyle.bg,
                              color: hubStyle.color,
                            }}
                          />
                        ) : (
                          <span style={{ color: '#c0c4ce' }}>—</span>
                        )}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {courseSlug ? (
                          <Chip
                            label={COURSE_LABELS[courseSlug] || courseSlug}
                            size="small"
                            style={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: 6,
                              backgroundColor: courseStyle.bg,
                              color: courseStyle.color,
                            }}
                          />
                        ) : (
                          <span style={{ color: '#c0c4ce' }}>—</span>
                        )}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {s.phone || '—'}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        {regDate
                          ? format(parseISO(regDate), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <Chip
                          label={s.status || 'Active'}
                          size="small"
                          style={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: 6,
                            backgroundColor:
                              s.status === 'pending' ? '#fff7ed' : '#dcfce7',
                            color:
                              s.status === 'pending' ? '#d97706' : '#16a34a',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {students.map((s: any) => {
              const name =
                s.name ||
                `${s.firstName || ''} ${s.lastName || ''}`.trim() ||
                'Unknown';
              const hubSlug = (s.hub || s.hubName || '')
                .toLowerCase()
                .replace(/\s+hub.*/, '')
                .trim();
              const courseSlug = s.course || s.interestedInCourses || '';
              const hubStyle = HUB_COLORS[hubSlug] || {
                bg: '#f0f0f0',
                color: '#8a8f99',
              };
              const courseStyle = COURSE_COLORS[courseSlug] || {
                bg: '#f0f0f0',
                color: '#8a8f99',
              };
              const regDate = s.registeredAt || s.createdAt;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={s.id}>
                  <Card
                    className={classes.gridCard}
                    onClick={() =>
                      history.push(`${localRoutes.students}/${s.id}`)
                    }
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      {s.avatar ? (
                        <Avatar
                          src={s.avatar}
                          style={{ width: 44, height: 44 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background:
                              'linear-gradient(135deg, #fe3a6a, #fe8c45)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 15,
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(name)}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: '#1f2025',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#8a8f99',
                            marginTop: 1,
                          }}
                        >
                          {s.email || s.phone || '—'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {hubSlug && (
                        <Chip
                          label={s.hubName || s.hub || hubSlug}
                          size="small"
                          style={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            borderRadius: 6,
                            backgroundColor: hubStyle.bg,
                            color: hubStyle.color,
                          }}
                        />
                      )}
                      {courseSlug && (
                        <Chip
                          label={COURSE_LABELS[courseSlug] || courseSlug}
                          size="small"
                          style={{
                            height: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: 6,
                            backgroundColor: courseStyle.bg,
                            color: courseStyle.color,
                          }}
                        />
                      )}
                    </div>
                    {regDate && (
                      <div
                        style={{ fontSize: 11, color: '#c0c4ce', marginTop: 8 }}
                      >
                        Registered {format(parseISO(regDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </div>

      <EditDialog
        title="Add New Student"
        open={createDialog}
        onClose={() => setCreateDialog(false)}
      >
        <NewPersonForm
          data={{}}
          done={() => {
            setCreateDialog(false);
            fetchStudents();
          }}
        />
      </EditDialog>

      <ContactUpload
        show={uploadDialog}
        onClose={() => setUploadDialog(false)}
        onDone={() => {
          setUploadDialog(false);
          fetchStudents();
        }}
      />
    </Navigation>
  );
};

export default Contacts;
