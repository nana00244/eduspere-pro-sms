import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Staff, CreateStaffDTO, UpdateStaffDTO } from '../../types/staff.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface StaffState {
    staffList: Staff[];
    loading: boolean;
    error: string | null;
}

const initialState: StaffState = {
    staffList: [],
    loading: false,
    error: null,
};

export const fetchStaff = createAsyncThunk('staff/fetchStaff', async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/staff`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
});

export const createStaff = createAsyncThunk('staff/createStaff', async (data: CreateStaffDTO) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/staff`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
});

export const updateStaff = createAsyncThunk('staff/updateStaff', async ({ id, data }: { id: string; data: UpdateStaffDTO }) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/staff/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
});

export const deleteStaff = createAsyncThunk('staff/deleteStaff', async (id: string) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return id;
});

const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStaff.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.staffList = action.payload;
            })
            .addCase(fetchStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch staff';
            })
            .addCase(createStaff.fulfilled, (state, action) => {
                state.staffList.push(action.payload);
            })
            .addCase(updateStaff.fulfilled, (state, action) => {
                const index = state.staffList.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.staffList[index] = action.payload;
                }
            })
            .addCase(deleteStaff.fulfilled, (state, action) => {
                state.staffList = state.staffList.filter(s => s.id !== action.payload);
            });
    },
});

export default staffSlice.reducer;
