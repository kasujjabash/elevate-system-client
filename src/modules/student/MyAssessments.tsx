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
import { useSelector } from 'react-redux';
import { remoteRoutes } from '../../data/constants';
import { search } from '../../utils/ajax';
import { IState } from '../../data/types';

const CORAL = '#fe3a6a';

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
  const user = useSelector((state: IState) => state.core.user);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const sid = user?.contactId || user?.id;
    let mounted = true;
    search(
      remoteRoutes.examResults,
      { contactId: sid, studentId: sid },
      (data: any) => {
        if (mounted) {
          setResults(Array.isArray(data) ? data : data?.data || []);
          setLoading(false);
        }
      },
      () => {
        if (mounted) {
          setResults([]);
          setLoading(false);
        }
      },
      undefined,
    );
    return () => {
      mounted = false;
    };
  }, [user?.contactId]);

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
          <span style={{ color: CORAL }}>Results</span>
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
              borderColor: CORAL,
              color: CORAL,
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
          TabIndicatorProps={{ style: { backgroundColor: CORAL } }}
          style={{ marginBottom: 16 }}
        >
          {tabs.map((t, i) => (
            <Tab
              key={t}
              label={t}
              style={{
                textTransform: 'none',
                fontWeight: tab === i ? 600 : 400,
                color: tab === i ? CORAL : '#5a5e6b',
                fontSize: 13,
              }}
            />
          ))}
        </Tabs>

        {/* GPA row */}
        <Box display="flex" justifyContent="flex-end" mb={1}>
          <Typography
            variant="body2"
            style={{ color: '#5a5e6b', marginRight: 24 }}
          >
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
                    <CircularProgress size={28} style={{ color: CORAL }} />
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
      </Box>
    </Layout>
  );
};

export default MyAssessments;
