import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    Alert
} from '@mui/material';
import { Check, Close, AccessTime, Save } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { markBulkAttendance, setSelectedDate, fetchAttendance } from '../../store/slices/attendanceSlice';
import { fetchClasses, fetchSchedule } from '../../store/slices/scheduleSlice';
import { fetchSubjects } from '../../store/slices/subjectsSlice';
import { AttendanceStatus } from '../../types/attendance.types';
import { format } from 'date-fns';

const AttendanceMarking: React.FC = () => {
    const dispatch = useAppDispatch();
    const { students } = useAppSelector(state => state.students);
    const { selectedDate, records } = useAppSelector(state => state.attendance);
    const { classes, activeSchedule } = useAppSelector(state => state.schedule);
    const { subjects } = useAppSelector(state => state.subjects);

    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSlotId, setSelectedSlotId] = useState<string>('');
    const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        dispatch(fetchClasses());
        dispatch(fetchSubjects());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClassId) {
            dispatch(fetchStudents({ classId: selectedClassId }));
            dispatch(fetchSchedule(selectedClassId));
        }
    }, [dispatch, selectedClassId]);

    useEffect(() => {
        const filters: any = {
            startDate: selectedDate,
            endDate: selectedDate
        };
        if (selectedSlotId) {
            filters.scheduleSlotId = selectedSlotId;
        }
        dispatch(fetchAttendance(filters));
    }, [dispatch, selectedDate, selectedSlotId]);

    useEffect(() => {
        // Populate existing attendance
        const data: Record<string, string> = {};
        records.forEach(record => {
            if (record.date === selectedDate && (!selectedSlotId || record.scheduleSlotId === selectedSlotId)) {
                data[record.studentId] = record.status;
            }
        });
        setAttendanceData(data);
    }, [records, selectedDate, selectedSlotId]);

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleMarkAll = (status: string) => {
        const data: Record<string, string> = {};
        students.forEach(student => {
            data[student.id] = status;
        });
        setAttendanceData(data);
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);

        const recordsToSave = Object.entries(attendanceData).map(([studentId, status]) => ({
            studentId,
            status: status as any,
        }));

        try {
            await dispatch(markBulkAttendance({
                date: selectedDate,
                scheduleSlotId: selectedSlotId || undefined,
                records: recordsToSave
            })).unwrap();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save attendance:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Mark Attendance
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Select Date"
                            value={new Date(selectedDate)}
                            onChange={(date) => {
                                if (date) {
                                    dispatch(setSelectedDate(date.toISOString().split('T')[0]));
                                }
                            }}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </LocalizationProvider>

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Typography variant="caption" color="text.secondary">Select Class</Typography>
                        <Select
                            value={selectedClassId}
                            onChange={(e) => {
                                setSelectedClassId(e.target.value);
                                setSelectedSlotId('');
                            }}
                            displayEmpty
                        >
                            <MenuItem value=""><em>Select Class</em></MenuItem>
                            {classes.map(c => (
                                <MenuItem key={c.id} value={c.id}>
                                    Grade {c.grade}{c.section}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Typography variant="caption" color="text.secondary">Select Subject Slot</Typography>
                        <Select
                            value={selectedSlotId}
                            onChange={(e) => setSelectedSlotId(e.target.value)}
                            displayEmpty
                            disabled={!selectedClassId}
                        >
                            <MenuItem value=""><em>Daily Attendance (General)</em></MenuItem>
                            {activeSchedule
                                .filter(slot => slot.day === format(new Date(selectedDate), 'EEEE'))
                                .map(slot => {
                                    const subject = subjects.find(s => s.id === slot.subjectId);
                                    return (
                                        <MenuItem key={slot.id} value={slot.id}>
                                            {slot.startTime} - {slot.endTime} ({subject?.name || 'Unknown Subject'})
                                        </MenuItem>
                                    );
                                })}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleMarkAll(AttendanceStatus.PRESENT)}
                        >
                            Mark All Present
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleMarkAll(AttendanceStatus.ABSENT)}
                        >
                            Mark All Absent
                        </Button>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        disabled={saving || Object.keys(attendanceData).length === 0}
                    >
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                </Box>

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Attendance saved successfully!
                    </Alert>
                )}

                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Student ID</TableCell>
                                <TableCell>Student Name</TableCell>
                                <TableCell>Grade/Section</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Quick Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.studentId}</TableCell>
                                    <TableCell>
                                        {student.firstName} {student.lastName}
                                    </TableCell>
                                    <TableCell>
                                        {student.grade} / {student.section}
                                    </TableCell>
                                    <TableCell>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <Select
                                                value={attendanceData[student.id] || ''}
                                                onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                                displayEmpty
                                            >
                                                <MenuItem value="">
                                                    <em>Not Marked</em>
                                                </MenuItem>
                                                <MenuItem value={AttendanceStatus.PRESENT}>Present</MenuItem>
                                                <MenuItem value={AttendanceStatus.ABSENT}>Absent</MenuItem>
                                                <MenuItem value={AttendanceStatus.LATE}>Late</MenuItem>
                                                <MenuItem value={AttendanceStatus.EXCUSED}>Excused</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                            <IconButton
                                                size="small"
                                                color="success"
                                                onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)}
                                                title="Present"
                                            >
                                                <Check />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)}
                                                title="Absent"
                                            >
                                                <Close />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="warning"
                                                onClick={() => handleStatusChange(student.id, AttendanceStatus.LATE)}
                                                title="Late"
                                            >
                                                <AccessTime />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {students.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                        No students found. Please add students first.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default AttendanceMarking;
