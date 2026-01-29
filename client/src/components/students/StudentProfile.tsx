import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Avatar,
    Divider,
    Button,
    Stack,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
} from '@mui/material';
import {
    ArrowBack,
    Edit,
    Email,
    Cake,
    School,
    CalendarToday,
    Wc,
    Fingerprint,
    CheckCircle,
    Cancel,
    AccessTime,
    Help,
    Assessment,
    Delete,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { fetchAttendance, fetchAttendanceStats, fetchAttendanceTrend } from '../../store/slices/attendanceSlice';
import { fetchStudentGrades, deleteGrade } from '../../store/slices/gradeSlice';
import { AttendanceStatus } from '../../types/attendance.types';
import AttendanceTrendChart from '../attendance/AttendanceTrendChart';
import GradeEntry from '../grades/GradeEntry';
import { format, parseISO } from 'date-fns';

const StudentProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { students } = useAppSelector((state) => state.students);
    const { stats, trendData, records } = useAppSelector((state) => state.attendance);
    const { studentGrades, studentStats } = useAppSelector((state) => state.grades);
    const student = students.find((s) => s.id === id);

    const [tabValue, setTabValue] = React.useState(0);
    const [gradeEntryOpen, setGradeEntryOpen] = React.useState(false);

    useEffect(() => {
        if (id) {
            if (students.length === 0) {
                dispatch(fetchStudents({}));
            }
            dispatch(fetchAttendanceStats({ studentId: id }));
            dispatch(fetchAttendance({ studentId: id }));
            dispatch(fetchStudentGrades(id));
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dispatch(fetchAttendanceTrend({
                studentId: id,
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
            }));
        }
    }, [dispatch, id, students.length]);

    if (!student) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Student not found.</Typography>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/students')} sx={{ mt: 2 }}>
                    Back to Students
                </Button>
            </Box>
        );
    }

    const formatDate = (dateValue: string | Date | undefined): string => {
        if (!dateValue) return 'N/A';
        const d = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
        return format(d, 'PPP');
    };

    const infoItems = [
        { icon: <Fingerprint fontSize="small" />, label: 'Student ID', value: student.studentId },
        { icon: <Email fontSize="small" />, label: 'Email', value: student.email },
        { icon: <Wc fontSize="small" />, label: 'Gender', value: student.gender || 'Not specified' },
        { icon: <Cake fontSize="small" />, label: 'Date of Birth', value: formatDate(student.dateOfBirth) },
        { icon: <School fontSize="small" />, label: 'Grade & Section', value: `${student.grade} - ${student.section || 'N/A'}` },
        { icon: <CalendarToday fontSize="small" />, label: 'Enrollment Date', value: formatDate(student.enrollmentDate) },
    ];

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/students')} size="small">
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4" fontWeight="bold">Student Profile</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/students/${id}/edit`)}>
                    Edit Profile
                </Button>
            </Box>

            <Paper sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ px: 2 }}
                >
                    <Tab label="Attendance" />
                    <Tab label="Academic Reports" />
                </Tabs>
            </Paper>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                margin: '0 auto 24px',
                                bgcolor: 'primary.main',
                                fontSize: '3rem'
                            }}
                        >
                            {student.firstName[0]}{student.lastName[0]}
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold">
                            {student.firstName} {student.lastName}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                            Grade {student.grade} Student
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        <Stack spacing={2} sx={{ textAlign: 'left' }}>
                            {infoItems.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Box sx={{ color: 'primary.main', display: 'flex' }}>{item.icon}</Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {item.label}
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {item.value}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    {tabValue === 0 ? (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Attendance Overview</Typography>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        {[
                                            { label: 'Attendance Rate', value: `${stats?.attendanceRate || 0}%`, color: 'primary.main' },
                                            { label: 'Total Days', value: stats?.totalDays || 0, color: 'text.primary' },
                                            { label: 'Present', value: stats?.presentDays || 0, color: 'success.main' },
                                            { label: 'Absent', value: stats?.absentDays || 0, color: 'error.main' },
                                        ].map((stat, index) => (
                                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                                    <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color }}>
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {stat.label}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Recent Attendance History</Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Notes</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {records.slice(0, 5).map((record) => (
                                                    <TableRow key={record.id}>
                                                        <TableCell>{format(parseISO(record.date), 'MMM dd, yyyy')}</TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {record.status === AttendanceStatus.PRESENT && <CheckCircle color="success" fontSize="small" />}
                                                                {record.status === AttendanceStatus.ABSENT && <Cancel color="error" fontSize="small" />}
                                                                {record.status === AttendanceStatus.LATE && <AccessTime color="warning" fontSize="small" />}
                                                                {record.status === AttendanceStatus.EXCUSED && <Help color="info" fontSize="small" />}
                                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                                    {record.status}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                                                {record.remarks || '-'}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {records.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                                            <Typography variant="body2" color="text.secondary">No attendance records found.</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Attendance Trend (Last 30 Days)</Typography>
                                    <Box sx={{ height: 300, mt: 2 }}>
                                        <AttendanceTrendChart data={trendData} height="100%" />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold">Academic Performance</Typography>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<Assessment />}
                                            onClick={() => setGradeEntryOpen(true)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Add Grade
                                        </Button>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                                            <Box sx={{
                                                textAlign: 'center',
                                                p: 3,
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                                borderRadius: 2,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}>
                                                <Typography variant="h3" fontWeight="bold">
                                                    {studentStats?.average || 0}%
                                                </Typography>
                                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                                                    Overall Average
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                                            <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="h3" fontWeight="bold">
                                                    {studentStats?.total || 0}
                                                </Typography>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Recorded Assessments
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Full Assessment History</Typography>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Subject</TableCell>
                                                    <TableCell>Term/Period</TableCell>
                                                    <TableCell align="center">Score</TableCell>
                                                    <TableCell align="center">Performance</TableCell>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell align="right">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {studentGrades.map((grade) => (
                                                    <TableRow key={grade.id} hover>
                                                        <TableCell><strong>{grade.subject}</strong></TableCell>
                                                        <TableCell>{grade.term}</TableCell>
                                                        <TableCell align="center">{grade.score} / {grade.maxScore}</TableCell>
                                                        <TableCell align="center">
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    {Math.round((grade.score / grade.maxScore) * 100)}%
                                                                </Typography>
                                                                <Box sx={{
                                                                    width: '100%',
                                                                    maxWidth: 60,
                                                                    height: 4,
                                                                    bgcolor: 'divider',
                                                                    borderRadius: 2,
                                                                    mt: 0.5,
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <Box sx={{
                                                                        width: `${(grade.score / grade.maxScore) * 100}%`,
                                                                        height: '100%',
                                                                        bgcolor: (grade.score / grade.maxScore) >= 0.5 ? 'success.main' : 'error.main'
                                                                    }} />
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>{format(parseISO(grade.date), 'MMM dd, yyyy')}</TableCell>
                                                        <TableCell align="right">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => {
                                                                    if (window.confirm('Are you sure you want to delete this assessment record?')) {
                                                                        dispatch(deleteGrade(grade.id));
                                                                    }
                                                                }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {studentGrades.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                                            <Assessment sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                                                            <Typography variant="body1" color="text.secondary">No academic records found for this student.</Typography>
                                                            <Button
                                                                variant="text"
                                                                onClick={() => setGradeEntryOpen(true)}
                                                                sx={{ mt: 1 }}
                                                            >
                                                                Add First Grade
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </Grid>

            {id && (
                <GradeEntry
                    open={gradeEntryOpen}
                    onClose={() => setGradeEntryOpen(false)}
                    studentId={id}
                />
            )}
        </Box>
    );
};

export default StudentProfile;
