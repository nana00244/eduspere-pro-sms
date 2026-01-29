import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    Chip,
    Stack,
    Tooltip
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Add, Edit, Delete, Email, Phone, BusinessCenter, Visibility } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStaff, deleteStaff } from '../../store/slices/staffSlice';
import { format } from 'date-fns';
import StaffForm from './StaffForm';

const StaffList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { staffList, loading } = useAppSelector(state => state.staff);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchStaff());
    }, [dispatch]);

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this staff profile?')) {
            dispatch(deleteStaff(id));
        }
    };

    const handleEdit = (staff: any) => {
        setSelectedStaff(staff);
        setFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedStaff(null);
        setFormOpen(true);
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" fontWeight="medium">
                    {params.row.firstName} {params.row.lastName}
                </Typography>
            )
        },
        {
            field: 'category',
            headerName: 'Category',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'Teaching' ? 'primary' : 'default'}
                    variant="outlined"
                />
            )
        },
        {
            field: 'specialization',
            headerName: 'Specialization',
            width: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={0.5}>
                    {params.value.map((s: string, i: number) => (
                        <Chip key={i} label={s} size="small" variant="outlined" />
                    ))}
                </Stack>
            )
        },
        {
            field: 'contact',
            headerName: 'Contact',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title={params.row.email}>
                        <IconButton size="small"><Email fontSize="inherit" /></IconButton>
                    </Tooltip>
                    <Tooltip title={params.row.phoneNumber}>
                        <IconButton size="small"><Phone fontSize="inherit" /></IconButton>
                    </Tooltip>
                </Stack>
            )
        },
        {
            field: 'joinedDate',
            headerName: 'Joined Date',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2">
                    {params.value ? format(new Date(params.value), 'MMM dd, yyyy') : '-'}
                </Typography>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <IconButton size="small" onClick={() => navigate(`/staff/${params.row.id}`)} title="View Profile">
                        <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEdit(params.row)} color="primary">
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <BusinessCenter color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" fontWeight="bold">Staff Directory</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAdd}
                    sx={{ borderRadius: 2 }}
                >
                    Add Staff Member
                </Button>
            </Box>

            <Paper sx={{ height: 600, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={staffList}
                    columns={columns}
                    loading={loading}
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                    }}
                />
            </Paper>

            <StaffForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                initialData={selectedStaff}
            />
        </Box>
    );
};

export default StaffList;
