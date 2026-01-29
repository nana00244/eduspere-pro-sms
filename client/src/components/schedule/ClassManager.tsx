import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip
} from '@mui/material';
import { Add, School, Group, Schedule } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchClasses, createClass } from '../../store/slices/scheduleSlice';
import { useNavigate } from 'react-router-dom';

const ClassManager: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { classes } = useAppSelector(state => state.schedule);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        grade: '',
        section: '',
        academicYear: '2025-2026'
    });

    useEffect(() => {
        dispatch(fetchClasses());
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(createClass(formData));
        setOpen(false);
        setFormData({ grade: '', section: '', academicYear: '2025-2026' });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <School color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" fontWeight="bold">Class Management</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Add New Class
                </Button>
            </Box>

            <Grid container spacing={3}>
                {classes.map((c) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.id}>
                        <Card sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h5" fontWeight="bold">Grade {c.grade}-{c.section}</Typography>
                                    <Chip label={c.academicYear} size="small" color="primary" variant="outlined" />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 1 }}>
                                    <Group fontSize="small" />
                                    <Typography variant="body2">Section: {c.section}</Typography>
                                </Box>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Schedule />}
                                    onClick={() => navigate(`/schedule/${c.id}`)}
                                >
                                    Timetable
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Group />}
                                    onClick={() => navigate(`/classes/${c.id}/students`)}
                                >
                                    Students
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add New Class</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Grade"
                                    placeholder="e.g., 10"
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Section"
                                    placeholder="e.g., A"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Academic Year"
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                    required
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Create Class</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default ClassManager;
