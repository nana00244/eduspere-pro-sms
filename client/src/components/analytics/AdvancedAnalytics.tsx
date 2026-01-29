import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Card,
    CardContent
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchStaff } from '../../store/slices/staffSlice';
import { fetchSubjects } from '../../store/slices/subjectsSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdvancedAnalytics: React.FC = () => {
    const dispatch = useAppDispatch();
    const { staffList } = useAppSelector(state => state.staff);
    const { subjects } = useAppSelector(state => state.subjects);
    const [performanceStats, setPerformanceStats] = useState<any[]>([]);
    const [subjectStats, setSubjectStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                // Fetch staff and subjects if not loaded
                await Promise.all([
                    dispatch(fetchStaff()).unwrap(),
                    dispatch(fetchSubjects()).unwrap()
                ]);

                // Fetch analytics data
                const [perfRes, subjRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/performance/stats/all`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_BASE_URL}/grades/stats/subjects`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (perfRes.data.success) {
                    setPerformanceStats(perfRes.data.data);
                }
                if (subjRes.data.success) {
                    setSubjectStats(subjRes.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dispatch]);

    const performanceData = performanceStats.map(stat => {
        const s = staffList.find((st: any) => st.id === stat.staffId);
        return {
            name: s ? `${s.firstName} ${s.lastName}` : stat.staffId,
            rating: stat.averageRating,
            reviews: stat.reviewCount
        };
    });

    const subjectData = subjectStats.map(stat => {
        const sub = subjects.find(s => s.id === stat.subject);
        return {
            name: sub ? sub.name : stat.subject,
            average: stat.average,
            total: stat.total
        };
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Advanced Analytics
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
                Insights into academic performance and staff effectiveness.
            </Typography>

            <Grid container spacing={3}>
                {/* Staff Performance Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Staff Performance Ratings
                        </Typography>
                        <Box sx={{ height: 300, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="rating" name="Avg Rating" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Subject Averages Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Subject Grade Averages (%)
                        </Typography>
                        <Box sx={{ height: 300, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 100]} />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="average" name="Avg Score (%)" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Summary Cards */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent>
                            <Typography variant="overline" sx={{ opacity: 0.8 }}>Total Reviews</Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {performanceStats.reduce((sum, s) => sum + s.reviewCount, 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 2, bgcolor: 'secondary.main', color: 'white' }}>
                        <CardContent>
                            <Typography variant="overline" sx={{ opacity: 0.8 }}>Top Performing Subject</Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {subjectData.length > 0 ? subjectData.sort((a, b) => b.average - a.average)[0].name : 'N/A'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdvancedAnalytics;
