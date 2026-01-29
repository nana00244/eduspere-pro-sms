import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Typography,
    Box,
} from '@mui/material';
import { Notifications } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface BulkActionDialogProps {
    open: boolean;
    onClose: () => void;
    selectedIds: string[];
    onSuccess: (message: string) => void;
}

const BulkActionDialog: React.FC<BulkActionDialogProps> = ({ open, onClose, selectedIds, onSuccess }) => {
    const [message, setMessage] = React.useState('');
    const [type, setType] = React.useState('General');
    const [loading, setLoading] = React.useState(false);

    const handleSend = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/students/bulk-notify`,
                { studentIds: selectedIds, message, type },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                onSuccess(response.data.message);
                onClose();
                setMessage('');
            }
        } catch (error) {
            console.error('Failed to send bulk notification:', error);
            alert('Failed to send notifications');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                <Notifications color="primary" /> Bulk Notification
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        You have selected <strong>{selectedIds.length}</strong> students.
                    </Typography>
                </Box>
                <TextField
                    select
                    fullWidth
                    label="Notification Type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    sx={{ mb: 2 }}
                >
                    <MenuItem value="General">General Announcement</MenuItem>
                    <MenuItem value="Attendance">Attendance Warning</MenuItem>
                    <MenuItem value="Academic">Academic Update</MenuItem>
                    <MenuItem value="Emergency">Emergency Alert</MenuItem>
                </TextField>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Message Content"
                    placeholder="Enter your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={!message || loading}
                >
                    {loading ? 'Sending...' : `Send to ${selectedIds.length} Students`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BulkActionDialog;
