import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAttendance, fetchAttendanceTrend } from '../../store/slices/attendanceSlice';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { AttendanceStatus } from '../../types/attendance.types';
import AttendanceTrendChart from './AttendanceTrendChart';

const AttendanceReport: React.FC = () => {
    const dispatch = useAppDispatch();
    const { students } = useAppSelector(state => state.students);
    const { records, trendData } = useAppSelector(state => state.attendance);

    const [startDate, setStartDate] = useState<Date>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
    });
    const [endDate, setEndDate] = useState<Date>(new Date());

    useEffect(() => {
        const filters = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
        dispatch(fetchStudents({}));
        dispatch(fetchAttendance(filters));
        dispatch(fetchAttendanceTrend(filters));
    }, [dispatch, startDate, endDate]);

    const calculateStats = (studentId: string) => {
        const studentRecords = records.filter(r => r.studentId === studentId);
        const totalDays = studentRecords.length;
        const presentDays = studentRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
        const absentDays = studentRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
        const lateDays = studentRecords.filter(r => r.status === AttendanceStatus.LATE).length;
        const excusedDays = studentRecords.filter(r => r.status === AttendanceStatus.EXCUSED).length;

        const attendanceRate = totalDays > 0
            ? Math.round(((presentDays + lateDays) / totalDays) * 100 * 100) / 100
            : 0;

        return {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            excusedDays,
            attendanceRate
        };
    };

    const overallStats = students.reduce((acc, student) => {
        const stats = calculateStats(student.id);
        return {
            totalStudents: acc.totalStudents + 1,
            totalDays: acc.totalDays + stats.totalDays,
            presentDays: acc.presentDays + stats.presentDays,
            absentDays: acc.absentDays + stats.absentDays,
            lateDays: acc.lateDays + stats.lateDays,
            excusedDays: acc.excusedDays + stats.excusedDays,
        };
    }, {
        totalStudents: 0,
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        excusedDays: 0
    });

    const overallRate = overallStats.totalDays > 0
        ? Math.round(((overallStats.presentDays + overallStats.lateDays) / overallStats.totalDays) * 100 * 100) / 100
        : 0;

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Attendance Report
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(date) => date && setStartDate(date)}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(date) => date && setEndDate(date)}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </LocalizationProvider>
                </Box>

                {/* Overall Stats Cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom variant="body2">
                                Overall Attendance Rate
                            </Typography>
                            <Typography variant="h4" color={overallRate >= 90 ? 'success.main' : overallRate >= 75 ? 'warning.main' : 'error.main'}>
                                {overallRate}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={overallRate}
                                color={overallRate >= 90 ? 'success' : overallRate >= 75 ? 'warning' : 'error'}
                                sx={{ mt: 1 }}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom variant="body2">
                                Present Days
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {overallStats.presentDays}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {overallStats.totalDays > 0
                                    ? `${Math.round((overallStats.presentDays / overallStats.totalDays) * 100)}%`
                                    : '0%'}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom variant="body2">
                                Absent Days
                            </Typography>
                            <Typography variant="h4" color="error.main">
                                {overallStats.absentDays}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {overallStats.totalDays > 0
                                    ? `${Math.round((overallStats.absentDays / overallStats.totalDays) * 100)}%`
                                    : '0%'}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom variant="body2">
                                Late Arrivals
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {overallStats.lateDays}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {overallStats.totalDays > 0
                                    ? `${Math.round((overallStats.lateDays / overallStats.totalDays) * 100)}%`
                                    : '0%'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Trend Chart */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <AttendanceTrendChart
                        data={trendData}
                        title="Attendance Rate Trend"
                        height={350}
                    />
                </Paper>

                {/* Student-wise Table */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Student-wise Breakdown
                </Typography>

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Student Name</TableCell>
                                <TableCell>Grade/Section</TableCell>
                                <TableCell align="center">Total Days</TableCell>
                                <TableCell align="center">Present</TableCell>
                                <TableCell align="center">Absent</TableCell>
                                <TableCell align="center">Late</TableCell>
                                <TableCell align="center">Excused</TableCell>
                                <TableCell align="right">Attendance Rate</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map(student => {
                                const stats = calculateStats(student.id);
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            {student.firstName} {student.lastName}
                                        </TableCell>
                                        <TableCell>{student.grade} / {student.section}</TableCell>
                                        <TableCell align="center">{stats.totalDays}</TableCell>
                                        <TableCell align="center">
                                            <Chip label={stats.presentDays} color="success" size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={stats.absentDays} color="error" size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={stats.lateDays} color="warning" size="small" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={stats.excusedDays} color="info" size="small" />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    color={stats.attendanceRate >= 90 ? 'success.main' : stats.attendanceRate >= 75 ? 'warning.main' : 'error.main'}
                                                >
                                                    {stats.attendanceRate}%
                                                </Typography>
                                                {stats.attendanceRate >= 90 ? (
                                                    <TrendingUp color="success" fontSize="small" />
                                                ) : (
                                                    <TrendingDown color="error" fontSize="small" />
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {students.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                        No attendance data available for the selected date range.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default AttendanceReport;
