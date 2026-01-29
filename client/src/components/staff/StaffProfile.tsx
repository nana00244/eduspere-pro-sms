import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Avatar,
    Chip,
    Divider,
    Stack,
    IconButton,
} from '@mui/material';
import {
    ArrowBack,
    Email,
    Phone,
    BusinessCenter,
    DateRange,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStaff } from '../../store/slices/staffSlice';
import { format } from 'date-fns';
import PerformanceReviewSection from './PerformanceReview';

const StaffProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { staffList, loading } = useAppSelector(state => state.staff);

    const staff = staffList.find(s => s.id === id);

    useEffect(() => {
        if (staffList.length === 0) {
            dispatch(fetchStaff());
        }
    }, [dispatch, staffList.length]);

    if (loading) return <Box sx={{ p: 3 }}><Typography>Loading...</Typography></Box>;
    if (!staff) return <Box sx={{ p: 3 }}><Typography>Staff member not found.</Typography></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/staff')}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4" fontWeight="bold">Staff Profile</Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <Avatar
                            sx={{ width: 120, height: 120, margin: '0 auto 16px', bgcolor: 'primary.main', fontSize: 48 }}
                        >
                            {staff.firstName[0]}{staff.lastName[0]}
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold">
                            {staff.firstName} {staff.lastName}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>{staff.category}</Typography>
                        <Chip
                            label={staff.isActive ? 'Active' : 'Inactive'}
                            color={staff.isActive ? 'success' : 'default'}
                            size="small"
                            sx={{ mb: 2 }}
                        />

                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={2} sx={{ textAlign: 'left' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Email color="action" fontSize="small" />
                                <Typography variant="body2">{staff.email}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Phone color="action" fontSize="small" />
                                <Typography variant="body2">{staff.phoneNumber}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <BusinessCenter color="action" fontSize="small" />
                                <Typography variant="body2">{staff.qualification}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <DateRange color="action" fontSize="small" />
                                <Typography variant="body2">
                                    Joined {format(new Date(staff.joinedDate), 'MMM yyyy')}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Professional Details</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" color="text.secondary">Specializations</Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {staff.specialization.map((s, i) => (
                                        <Chip key={i} label={s} variant="outlined" />
                                    ))}
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Experience</Typography>
                                <Typography variant="body1">{staff.experience}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <PerformanceReviewSection staffId={staff.id} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StaffProfile;
