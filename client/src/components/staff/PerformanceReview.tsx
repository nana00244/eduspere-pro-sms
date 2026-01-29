import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Rating,
    TextField,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    Chip
} from '@mui/material';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import type { PerformanceReview, CreatePerformanceReviewDTO } from '../../types/performance.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface PerformanceReviewSectionProps {
    staffId: string;
}

const PerformanceReviewSection: React.FC<PerformanceReviewSectionProps> = ({ staffId }) => {
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<CreatePerformanceReviewDTO>({
        staffId,
        reviewerId: 'admin-id', // Simplified for demo
        reviewDate: new Date().toISOString().split('T')[0],
        rating: 3,
        comments: '',
        strengths: [],
        areasForImprovement: []
    });

    useEffect(() => {
        fetchReviews();
    }, [staffId]);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/performance/${staffId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) setReviews(response.data.data);
        } catch (error) { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/performance`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setReviews([...reviews, response.data.data]);
                setOpen(false);
                setFormData({
                    staffId,
                    reviewerId: 'admin-id',
                    reviewDate: new Date().toISOString().split('T')[0],
                    rating: 3,
                    comments: '',
                    strengths: [],
                    areasForImprovement: []
                });
            }
        } catch (error) { } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Performance History</Typography>
                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                    size="small"
                >
                    Add Review
                </Button>
            </Box>

            <Stack spacing={2}>
                {reviews.length === 0 && (
                    <Typography color="text.secondary">No performance reviews recorded yet.</Typography>
                )}
                {reviews.map((review) => (
                    <Paper key={review.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }} elevation={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Rating value={review.rating} readOnly size="small" />
                                <Typography variant="caption" color="text.secondary">
                                    on {format(new Date(review.reviewDate), 'MMM dd, yyyy')}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>{review.comments}</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {review.strengths.map((s, i) => (
                                <Chip key={i} label={s} size="small" color="success" variant="outlined" />
                            ))}
                            {review.areasForImprovement.map((a, i) => (
                                <Chip key={i} label={a} size="small" color="warning" variant="outlined" />
                            ))}
                        </Stack>
                    </Paper>
                ))}
            </Stack>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add Performance Review</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={3}>
                            <Box>
                                <Typography gutterBottom>Overall Rating</Typography>
                                <Rating
                                    value={formData.rating}
                                    onChange={(_, val) => setFormData({ ...formData, rating: val || 3 })}
                                />
                            </Box>
                            <TextField
                                fullWidth
                                label="Review Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={formData.reviewDate}
                                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                                required
                            />
                            <TextField
                                fullWidth
                                label="General Comments"
                                multiline
                                rows={3}
                                value={formData.comments}
                                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                required
                            />
                            <Autocomplete
                                multiple
                                freeSolo
                                options={['Communication', 'Punctuality', 'Subject Mastery', 'Student Engagement']}
                                value={formData.strengths}
                                onChange={(_, val) => setFormData({ ...formData, strengths: val })}
                                renderInput={(params) => (
                                    <TextField {...params} label="Strengths" placeholder="Add..." />
                                )}
                            />
                            <Autocomplete
                                multiple
                                freeSolo
                                options={['Assessment Timeliness', 'Classroom Control', 'Admin Tasks']}
                                value={formData.areasForImprovement}
                                onChange={(_, val) => setFormData({ ...formData, areasForImprovement: val })}
                                renderInput={(params) => (
                                    <TextField {...params} label="Areas for Improvement" placeholder="Add..." />
                                )}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>Save Review</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default PerformanceReviewSection;
