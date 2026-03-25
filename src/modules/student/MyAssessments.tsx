import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Tabs,
  Tab,
  CircularProgress,
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import { remoteRoutes } from '../../data/constants';
import { get } from '../../utils/ajax';

const tabs = [
  'All Results',
  'MA: Missed Assessments',
  'RE: Retake',
  'EXL Exempted',
  'OT: Others',
];

const gradeColor = (grade: string) => {
  if (!grade) return '#8a8f99';
  if (['A', 'A+'].includes(grade)) return '#10b981';
  if (grade.startsWith('B')) return '#0ea5e9';
  if (grade.startsWith('C')) return '#f59e0b';
  return '#ef4444';
};

const MyAssessments = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    get(
      remoteRoutes.examResults,
      (data: any[]) => setResults(data || []),
      () => setResults([]),
      () => setLoading(false),
    );
  }, []);

  const gpa = results.length
    ? (
        results.reduce((s, r) => s + (r.gradePoints || 0), 0) / results.length
      ).toFixed(2)
    : '0.00';

  return (
    <Layout>
      <Box p={3}>
        {/* Breadcrumb */}
        <Box mb={1} style={{ fontSize: 13, color: '#8a8f99' }}>
          <span>Home</span>
          <span style={{ margin: '0 6px', color: '#c4c8d0' }}>›</span>
          <span>Students</span>
          <span style={{ margin: '0 6px', color: '#c4c8d0' }}>›</span>
          <span style={{ color: '#fe3a6a' }}>Results</span>
        </Box>

        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h5"
            style={{ fontWeight: 700, color: '#1f2025' }}
          >
            My Results
          </Typography>
          <Button
            variant="outlined"
            startIcon={<GetAppIcon />}
            style={{
              borderColor: '#fe3a6a',
              color: '#fe3a6a',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Export To PDF
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: '#fe3a6a' } }}
          style={{ marginBottom: 16 }}
        >
          {tabs.map((t, i) => (
            <Tab
              key={t}
              label={t}
              style={{
                textTransform: 'none',
                fontWeight: tab === i ? 600 : 400,
                color: tab === i ? '#fe3a6a' : '#5a5e6b',
                fontSize: 13,
              }}
            />
          ))}
        </Tabs>

        {/* GPA row */}
        <Box
          display="flex"
          justifyContent="flex-end"
          mb={1}
          style={{ gap: 24 }}
        >
          <Typography variant="body2" style={{ color: '#5a5e6b' }}>
            GPA: <strong style={{ color: '#1f2025' }}>{gpa}</strong>
          </Typography>
          <Typography variant="body2" style={{ color: '#5a5e6b' }}>
            CGPA: <strong style={{ color: '#1f2025' }}>{gpa}</strong>
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  '#',
                  'Academic Year',
                  'Code',
                  'Module',
                  'Credit Units',
                  'Score',
                  'Grade',
                  'Grade Pts',
                ].map((h) => (
                  <TableCell
                    key={h}
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      color: '#5a5e6b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" style={{ padding: 40 }}>
                    <CircularProgress size={28} style={{ color: '#fe3a6a' }} />
                  </TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    style={{ padding: 40, color: '#8a8f99' }}
                  >
                    No results found
                  </TableCell>
                </TableRow>
              ) : (
                results.map((r, i) => (
                  <TableRow key={r.id || i} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{r.academicYear || '2025-2026'}</TableCell>
                    <TableCell style={{ fontWeight: 600 }}>
                      {r.code || r.moduleCode || '-'}
                    </TableCell>
                    <TableCell>{r.moduleName || r.name || '-'}</TableCell>
                    <TableCell align="center">{r.creditUnits || '-'}</TableCell>
                    <TableCell align="center">{r.score ?? '-'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={r.grade || '-'}
                        size="small"
                        style={{
                          backgroundColor: `${gradeColor(r.grade)}20`,
                          color: gradeColor(r.grade),
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">{r.gradePoints ?? '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {results.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mt={2}
            style={{ fontSize: 13, color: '#5a5e6b' }}
          >
            <Box display="flex" alignItems="center" style={{ gap: 8 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                ‹
              </span>
              <span
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fe3a6a',
                  color: '#fff',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                1
              </span>
              <span
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                ›
              </span>
              <span style={{ marginLeft: 8 }}>
                Go to:{' '}
                <input
                  defaultValue="1"
                  style={{
                    width: 40,
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 12,
                    textAlign: 'center',
                  }}
                />
              </span>
              <span>| 20/page</span>
            </Box>
            <span>Total {results.length}</span>
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default MyAssessments;
