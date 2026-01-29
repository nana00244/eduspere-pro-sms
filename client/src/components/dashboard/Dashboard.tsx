import React, { useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    LinearProgress,
} from '@mui/material';
import {
    PeopleAlt,
    CheckCircle,
    Error,
    PersonAdd,
    AssignmentTurnedIn,
    TrendingUp,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { fetchAttendance, fetchAttendanceTrend } from '../../store/slices/attendanceSlice';
import { AttendanceStatus } from '../../types/attendance.types';
import AttendanceTrendChart from '../attendance/AttendanceTrendChart';
import NotificationCenter from '../common/NotificationCenter';

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { pagination } = useAppSelector((state) => state.students);
    const { records, trendData } = useAppSelector((state) => state.attendance);
    const { user } = useAppSelector((state) => state.auth);

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    useEffect(() => {
        dispatch(fetchStudents({ page: 1, limit: 1 })); // Just to get the total count
        dispatch(fetchAttendance({ startDate: today, endDate: today }));
        dispatch(fetchAttendanceTrend({ startDate, endDate: today }));
    }, [dispatch, today, startDate]);

    const totalStudents = pagination.total;
    const todayRecords = records.filter((r) => r.date === today);
    const presentCount = todayRecords.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const lateCount = todayRecords.filter((r) => r.status === AttendanceStatus.LATE).length;
    const attendanceRate = todayRecords.length > 0
        ? Math.round(((presentCount + lateCount) / todayRecords.length) * 100)
        : 0;

    const cards = [
        {
            title: 'Total Students',
            value: totalStudents,
            icon: <PeopleAlt sx={{ fontSize: 40, color: 'primary.main' }} />,
            color: 'primary.main',
            trend: '+2 this month',
        },
        {
            title: 'Attendance Today',
            value: `${attendanceRate}%`,
            icon: <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />,
            color: 'success.main',
            detail: `${presentCount + lateCount} / ${todayRecords.length} marked`,
        },
        {
            title: 'Absent Today',
            value: todayRecords.filter(r => r.status === AttendanceStatus.ABSENT).length,
            icon: <Error sx={{ fontSize: 40, color: 'error.main' }} />,
            color: 'error.main',
        },
    ];

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Welcome back, {user?.firstName || 'User'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Here's what's happening at Edusphere today.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {cards.map((card, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                        <Card sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '4px',
                                height: '100%',
                                bgcolor: card.color
                            }} />
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                            {card.title}
                                        </Typography>
                                        <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>
                                            {card.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: `${card.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {card.icon}
                                    </Box>
                                </Box>
                                {card.detail && (
                                    <Typography variant="body2" color="text.secondary">
                                        {card.detail}
                                    </Typography>
                                )}
                                {card.trend && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                                        <Typography variant="body2" color="success.main" fontWeight="medium">
                                            {card.trend}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Quick Actions
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PersonAdd />}
                                    component={RouterLink}
                                    to="/students/new"
                                    sx={{ py: 1.5, justifyContent: 'flex-start', px: 2 }}
                                >
                                    Add New Student
                                </Button>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<AssignmentTurnedIn />}
                                    component={RouterLink}
                                    to="/attendance"
                                    sx={{ py: 1.5, justifyContent: 'flex-start', px: 2 }}
                                >
                                    Mark Attendance
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Attendance Status
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Daily Target</Typography>
                                <Typography variant="body2" fontWeight="bold">95%</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={attendanceRate}
                                sx={{ height: 10, borderRadius: 5, mb: 3 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                Current attendance is {attendanceRate < 95 ? 'below' : 'above'} the school's target.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <NotificationCenter />
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Recent Student Activity
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            No recent activity recorded.
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Attendance Trends (Last 30 Days)
                        </Typography>
                        <Box sx={{ mt: 2, height: 300 }}>
                            <AttendanceTrendChart data={trendData} height="100%" />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
