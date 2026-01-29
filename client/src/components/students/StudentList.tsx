import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    IconButton
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Add, Edit, Delete, Visibility, Search, Notifications } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStudents, deleteStudent } from '../../store/slices/studentsSlice';
import BulkActionDialog from './BulkActionDialog';
import { format } from 'date-fns';

const StudentList: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { students, loading, pagination } = useAppSelector(state => state.students);
    const [searchQuery, setSearchQuery] = useState('');
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const [selectionModel, setSelectionModel] = useState<any>([]);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchStudents({
            page: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            search: searchQuery || undefined
        }));
    }, [dispatch, paginationModel, searchQuery]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            await dispatch(deleteStudent(id));
            dispatch(fetchStudents({
                page: paginationModel.page + 1,
                limit: paginationModel.pageSize
            }));
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(fetchStudents({
            page: 1,
            limit: paginationModel.pageSize,
            search: searchQuery || undefined
        }));
    };

    const columns: GridColDef[] = [
        {
            field: 'studentId',
            headerName: 'Student ID',
            width: 120,
        },
        {
            field: 'firstName',
            headerName: 'First Name',
            width: 150,
        },
        {
            field: 'lastName',
            headerName: 'Last Name',
            width: 150,
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 200,
        },
        {
            field: 'grade',
            headerName: 'Grade',
            width: 100,
        },
        {
            field: 'section',
            headerName: 'Section',
            width: 100,
        },
        {
            field: 'enrollmentDate',
            headerName: 'Enrollment Date',
            width: 150,
            renderCell: (params: GridRenderCellParams) => {
                return params.value ? format(new Date(params.value), 'MMM dd, yyyy') : '-';
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <IconButton
                        size="small"
                        onClick={() => navigate(`/students/${params.row.id}`)}
                        title="View"
                    >
                        <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => navigate(`/students/${params.row.id}/edit`)}
                        title="Edit"
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleDelete(params.row.id)}
                        title="Delete"
                        color="error"
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Students
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {selectionModel.length > 0 && (
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Notifications />}
                            onClick={() => setBulkDialogOpen(true)}
                        >
                            Bulk Notify ({selectionModel.length})
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/students/new')}
                    >
                        Add Student
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search by name, email, or student ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                    />
                    <Button type="submit" variant="contained">
                        Search
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{ height: 600, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={students}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 25, 50]}
                    rowCount={pagination.total}
                    paginationMode="server"
                    loading={loading}
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectionModel(newSelection);
                    }}
                    rowSelectionModel={selectionModel}
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                    }}
                />
            </Paper>

            <BulkActionDialog
                open={bulkDialogOpen}
                onClose={() => setBulkDialogOpen(false)}
                selectedIds={selectionModel}
                onSuccess={(msg) => alert(msg)}
            />
        </Box>
    );
};

export default StudentList;
