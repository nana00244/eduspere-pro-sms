import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Autocomplete,
    Box,
    Typography,
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { createStaff, updateStaff } from '../../store/slices/staffSlice';
import type { StaffCategory } from '../../types/staff.types';
import { StaffCategories } from '../../types/staff.types';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface StaffFormProps {
    open: boolean;
    onClose: () => void;
    initialData?: any;
}

const StaffForm: React.FC<StaffFormProps> = ({ open, onClose, initialData }) => {
    const dispatch = useAppDispatch();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        userId: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        category: StaffCategories.TEACHING,
        specialization: [] as string[],
        joinedDate: new Date().toISOString().split('T')[0],
        qualification: '',
        experience: '',
    });

    useEffect(() => {
        if (open) {
            fetchUsers();
            if (initialData) {
                setFormData({
                    ...initialData,
                    specialization: initialData.specialization || [],
                    joinedDate: initialData.joinedDate ? initialData.joinedDate.split('T')[0] : '',
                });
            } else {
                setFormData({
                    userId: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                    category: StaffCategories.TEACHING,
                    specialization: [],
                    joinedDate: new Date().toISOString().split('T')[0],
                    qualification: '',
                    experience: '',
                });
            }
        }
    }, [open, initialData]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData) {
                await dispatch(updateStaff({ id: initialData.id, data: formData })).unwrap();
            } else {
                await dispatch(createStaff(formData)).unwrap();
            }
            onClose();
        } catch (error) {
            console.error('Failed to save staff:', error);
            alert('Failed to save staff profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUserChange = (_: any, newValue: any | null) => {
        if (newValue) {
            setFormData(prev => ({
                ...prev,
                userId: newValue.id,
                firstName: newValue.firstName,
                lastName: newValue.lastName,
                email: newValue.email,
            }));
        }
    };

    const handleSpecializationChange = (_: any, newValue: string[]) => {
        setFormData(prev => ({ ...prev, specialization: newValue }));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {initialData ? 'Edit Staff Profile' : 'Add New Staff Member'}
            </DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        {!initialData && (
                            <Grid size={{ xs: 12 }}>
                                <Autocomplete
                                    options={users}
                                    getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email} - ${option.role})`}
                                    renderInput={(params) => <TextField {...params} label="Select User Account" required />}
                                    onChange={handleUserChange}
                                    sx={{ mb: 2 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Linking a staff profile to an existing user account.
                                </Typography>
                            </Grid>
                        )}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                fullWidth
                                label="Category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as StaffCategory })}
                                required
                            >
                                {['Teaching', 'Administrative', 'Support', 'Management'].map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Joined Date"
                                type="date"
                                value={formData.joinedDate}
                                onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Autocomplete
                                multiple
                                freeSolo
                                options={['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'ICT', 'Arts']}
                                value={formData.specialization}
                                onChange={handleSpecializationChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Specialization / Subjects Taught" placeholder="Add more..." />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Qualification"
                                placeholder="e.g., M.Sc in Education"
                                value={formData.qualification}
                                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Experience"
                                placeholder="e.g., 5 years"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : initialData ? 'Update Profile' : 'Create Profile'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default StaffForm;
