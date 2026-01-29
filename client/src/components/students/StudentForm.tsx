import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    MenuItem,
    Alert,
    CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createStudent } from '../../store/slices/studentsSlice';
import { fetchClasses } from '../../store/slices/scheduleSlice';
import { type CreateStudentDTO } from '../../types/student.types';
import { useEffect } from 'react';

const StudentForm: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { classes } = useAppSelector(state => state.schedule);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (classes.length === 0) {
            dispatch(fetchClasses());
        }
    }, [dispatch, classes.length]);

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<CreateStudentDTO>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            dateOfBirth: '',
            grade: '',
            section: '',
            classId: '',
            gender: undefined,
            studentId: '',
            enrollmentDate: new Date().toISOString().split('T')[0],
        }
    });

    const onSubmit = async (data: CreateStudentDTO) => {
        try {
            setLoading(true);
            setError(null);
            await dispatch(createStudent(data)).unwrap();
            navigate('/students');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                Add New Student
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Personal Information
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                        <Controller
                            name="firstName"
                            control={control}
                            rules={{ required: 'First name is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="First Name"
                                    fullWidth
                                    error={!!errors.firstName}
                                    helperText={errors.firstName?.message}
                                />
                            )}
                        />
                        <Controller
                            name="lastName"
                            control={control}
                            rules={{ required: 'Last name is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Last Name"
                                    fullWidth
                                    error={!!errors.lastName}
                                    helperText={errors.lastName?.message}
                                />
                            )}
                        />
                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            )}
                        />
                        <Controller
                            name="dateOfBirth"
                            control={control}
                            rules={{ required: 'Date of birth is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Date of Birth"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.dateOfBirth}
                                    helperText={errors.dateOfBirth?.message}
                                />
                            )}
                        />
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Gender"
                                    fullWidth
                                >
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </TextField>
                            )}
                        />
                        <Controller
                            name="studentId"
                            control={control}
                            rules={{ required: 'Student ID is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Student ID"
                                    fullWidth
                                    error={!!errors.studentId}
                                    helperText={errors.studentId?.message}
                                />
                            )}
                        />
                        <Controller
                            name="classId"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Assigned Class (Optional)"
                                    fullWidth
                                    onChange={(e) => {
                                        const selectedClassId = e.target.value;
                                        field.onChange(selectedClassId);
                                        const selectedClass = classes.find(c => c.id === selectedClassId);
                                        if (selectedClass) {
                                            setValue('grade', selectedClass.grade);
                                            setValue('section', selectedClass.section);
                                        }
                                    }}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {classes.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            Grade {c.grade}{c.section} ({c.academicYear})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                        <Controller
                            name="grade"
                            control={control}
                            rules={{ required: 'Grade is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Grade"
                                    fullWidth
                                    error={!!errors.grade}
                                    helperText={errors.grade?.message}
                                >
                                    {['KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((grade) => (
                                        <MenuItem key={grade} value={grade}>
                                            Grade {grade}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                        <Controller
                            name="section"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Section"
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="enrollmentDate"
                            control={control}
                            rules={{ required: 'Enrollment date is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Enrollment Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.enrollmentDate}
                                    helperText={errors.enrollmentDate?.message}
                                />
                            )}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/students')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                            {loading ? 'Creating...' : 'Create Student'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default StudentForm;
