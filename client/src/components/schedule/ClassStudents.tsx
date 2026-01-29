import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Button,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress
} from '@mui/material';
import { ArrowBack, PersonAdd } from '@mui/icons-material';
import axios from 'axios';
import type { Student } from '../../types/student.types';
import type { Class } from '../../types/schedule.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ClassStudents: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [classInfo, setClassInfo] = useState<Class | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [studentsRes, classesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/students?classId=${classId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_BASE_URL}/schedule/classes`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (studentsRes.data.success) {
                    setStudents(studentsRes.data.data);
                }

                if (classesRes.data.success) {
                    const currentClass = classesRes.data.data.find((c: Class) => c.id === classId);
                    setClassInfo(currentClass || null);
                }
            } catch (error) {
                console.error('Failed to fetch class students:', error);
            } finally {
                setLoading(false);
            }
        };

        if (classId) fetchData();
    }, [classId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/classes')}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            Class Students
                        </Typography>
                        {classInfo && (
                            <Typography color="text.secondary">
                                Grade {classInfo.grade}{classInfo.section} • {classInfo.academicYear}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => navigate('/students/new')}
                >
                    Enroll Student
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>Student ID</TableCell>
                                <TableCell>Gender</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">No students enrolled in this class yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => (
                                    <TableRow key={student.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32, fontSize: '0.875rem' }}>
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {student.firstName} {student.lastName}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{student.studentId}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={student.gender || 'N/A'}
                                                size="small"
                                                variant="outlined"
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                onClick={() => navigate(`/students/profile/${student.id}`)}
                                            >
                                                View Profile
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default ClassStudents;
