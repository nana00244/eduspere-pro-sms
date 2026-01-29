import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
    Chip
} from '@mui/material';
import { ArrowBack, Add, Delete, AccessTime, Person, LibraryBooks } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSchedule, addScheduleSlot, deleteScheduleSlot } from '../../store/slices/scheduleSlice';
import { fetchStaff } from '../../store/slices/staffSlice';
import axios from 'axios';
import { DaysOfWeek } from '../../types/schedule.types';
import type { DayOfWeek } from '../../types/schedule.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Timetable: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { activeSchedule, classes } = useAppSelector(state => state.schedule);
    const { staffList } = useAppSelector(state => state.staff);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    const currentClass = classes.find(c => c.id === classId);

    const [formData, setFormData] = useState({
        classId: classId || '',
        subjectId: '',
        staffId: '',
        day: DaysOfWeek.MONDAY,
        startTime: '08:00',
        endTime: '09:00',
        room: ''
    });

    useEffect(() => {
        if (classId) {
            dispatch(fetchSchedule(classId));
            dispatch(fetchStaff());
            fetchSubjects();
        }
    }, [classId, dispatch]);

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/subjects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) setSubjects(response.data.data);
        } catch (error) { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(addScheduleSlot(formData)).unwrap();
            setOpen(false);
        } catch (error: any) {
            alert(error.message || 'Failed to add slot');
        }
    };

    const getStaffName = (id: string) => {
        const staff = staffList.find(s => s.id === id);
        return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';
    };

    const getSubjectName = (id: string) => {
        const sub = subjects.find(s => s.id === id);
        return sub ? sub.name : 'Unknown';
    };

    const days = Object.values(DaysOfWeek);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <IconButton onClick={() => navigate('/classes')}>
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Timetable: Grade {currentClass?.grade}{currentClass?.section}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                    sx={{ ml: 'auto' }}
                >
                    Add Slot
                </Button>
            </Box>

            <Grid container spacing={2}>
                {days.map(day => (
                    <Grid size={{ xs: 12 }} key={day}>
                        <Paper sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                                {day}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {activeSchedule
                                    .filter(s => s.day === day)
                                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                    .map(slot => (
                                        <Paper
                                            key={slot.id}
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                minWidth: 200,
                                                bgcolor: 'action.hover',
                                                borderRadius: 2,
                                                position: 'relative'
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                color="error"
                                                sx={{ position: 'absolute', top: 5, right: 5 }}
                                                onClick={() => dispatch(deleteScheduleSlot(slot.id))}
                                            >
                                                <Delete fontSize="inherit" />
                                            </IconButton>
                                            <Stack spacing={1}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AccessTime fontSize="small" color="primary" />
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {slot.startTime} - {slot.endTime}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LibraryBooks fontSize="small" />
                                                    <Typography variant="body2">{getSubjectName(slot.subjectId)}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Person fontSize="small" />
                                                    <Typography variant="body2">{getStaffName(slot.staffId)}</Typography>
                                                </Box>
                                                {slot.room && <Chip label={`Room: ${slot.room}`} size="small" variant="outlined" />}
                                            </Stack>
                                        </Paper>
                                    ))
                                }
                                {activeSchedule.filter(s => s.day === day).length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        No classes scheduled
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Schedule Slot</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Day"
                                    value={formData.day}
                                    onChange={(e) => setFormData({ ...formData, day: e.target.value as DayOfWeek })}
                                    required
                                >
                                    {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Subject"
                                    value={formData.subjectId}
                                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                    required
                                >
                                    {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Teacher"
                                    value={formData.staffId}
                                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                    required
                                >
                                    {staffList.map(s => (
                                        <MenuItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Start Time"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="End Time"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Room / Location"
                                    value={formData.room}
                                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Add to Timetable</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Timetable;
