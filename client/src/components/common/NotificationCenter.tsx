import React, { useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Alert,
    AlertTitle,
    Stack,
} from '@mui/material';
import {
    Notifications,
    TrendingDown,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAttendanceAlerts } from '../../store/slices/attendanceSlice';
import { fetchStudents } from '../../store/slices/studentsSlice';

const NotificationCenter: React.FC = () => {
    const dispatch = useAppDispatch();
    const { alerts } = useAppSelector((state) => state.attendance);
    const { students } = useAppSelector((state) => state.students);

    useEffect(() => {
        dispatch(fetchAttendanceAlerts());
        if (students.length === 0) {
            dispatch(fetchStudents({}));
        }
    }, [dispatch, students.length]);

    const getStudentName = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
    };

    if (alerts.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: 'background.paper', border: '1px dashed #e0e0e0' }}>
                <Notifications sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No new notifications</Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications color="primary" /> Notifications
            </Typography>
            <Stack spacing={2}>
                {alerts.map((alert, index) => (
                    <Alert
                        key={index}
                        severity="warning"
                        variant="standard"
                        icon={<TrendingDown />}
                        sx={{ borderRadius: 2 }}
                    >
                        <AlertTitle fontWeight="bold">Low Attendance Alert</AlertTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2">
                                <strong>{getStudentName(alert.studentId)}</strong> has an attendance rate of <strong>{alert.rate}%</strong>, which is below the school's threshold.
                            </Typography>
                        </Box>
                    </Alert>
                ))}
            </Stack>
        </Box>
    );
};

export default NotificationCenter;
