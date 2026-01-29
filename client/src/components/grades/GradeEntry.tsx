import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch } from '../../hooks';
import { createGrade } from '../../slices/gradeSlice';
import type { GradeEntryDTO } from '../../types/grade.types';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface GradeEntryProps {
    open: boolean;
    onClose: () => void;
    studentId: string;
}

const GradeEntry: React.FC<GradeEntryProps> = ({ open, onClose, studentId }) => {
    const dispatch = useAppDispatch();
    const { control, handleSubmit, reset, formState: { errors } } = useForm<GradeEntryDTO>({
        defaultValues: {
            studentId,
            subject: '',
            score: 0,
            maxScore: 100,
            term: 'Term 1',
            academicYear: '2025-2026',
            remarks: ''
        }
    });

    const [catalogSubjects, setCatalogSubjects] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/subjects`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setCatalogSubjects(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch subjects:', error);
            }
        };
        fetchSubjects();
    }, []);

    const onSubmit = async (data: GradeEntryDTO) => {
        const resultAction = await dispatch(createGrade(data));
        if (createGrade.fulfilled.match(resultAction)) {
            reset();
            onClose();
        }
    };

    const terms = ['Term 1', 'Term 2', 'Term 3'];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle fontWeight="bold">Enter Grade</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="subject"
                                control={control}
                                rules={{ required: 'Subject is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Subject"
                                        error={!!errors.subject}
                                        helperText={errors.subject?.message}
                                    >
                                        {catalogSubjects.length > 0 ? (
                                            catalogSubjects.map((s) => (
                                                <MenuItem key={s.id} value={s.name}>{s.name} ({s.code})</MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled value="">Loading subjects...</MenuItem>
                                        )}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Controller
                                name="score"
                                control={control}
                                rules={{ required: 'Score is required', min: 0 }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="number"
                                        label="Score"
                                        error={!!errors.score}
                                        helperText={errors.score?.message}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Controller
                                name="maxScore"
                                control={control}
                                rules={{ required: 'Max score is required', min: 1 }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="number"
                                        label="Max Score"
                                        error={!!errors.maxScore}
                                        helperText={errors.maxScore?.message}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Controller
                                name="term"
                                control={control}
                                rules={{ required: 'Term is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Term"
                                        error={!!errors.term}
                                        helperText={errors.term?.message}
                                    >
                                        {terms.map((t) => (
                                            <MenuItem key={t} value={t}>{t}</MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Controller
                                name="academicYear"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth label="Academic Year" />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Controller
                                name="remarks"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} fullWidth multiline rows={2} label="Remarks" />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">Save Grade</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default GradeEntry;
