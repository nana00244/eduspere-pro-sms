import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Class, ScheduleSlot, CreateClassDTO, CreateScheduleSlotDTO } from '../../types/schedule.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ScheduleState {
    classes: Class[];
    activeSchedule: ScheduleSlot[];
    loading: boolean;
    error: string | null;
}

const initialState: ScheduleState = {
    classes: [],
    activeSchedule: [],
    loading: false,
    error: null,
};

export const fetchClasses = createAsyncThunk('schedule/fetchClasses', async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/schedule/classes`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
});

export const createClass = createAsyncThunk('schedule/createClass', async (data: CreateClassDTO) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/schedule/classes`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
});

export const fetchSchedule = createAsyncThunk('schedule/fetchSchedule', async (classId: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/schedule/slots/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
});

export const addScheduleSlot = createAsyncThunk('schedule/addSlot', async (data: CreateScheduleSlotDTO) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/schedule/slots`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
});

export const deleteScheduleSlot = createAsyncThunk('schedule/deleteSlot', async (id: string) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/schedule/slots/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return id;
});

const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        clearActiveSchedule: (state) => {
            state.activeSchedule = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClasses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClasses.fulfilled, (state, action) => {
                state.loading = false;
                state.classes = action.payload;
            })
            .addCase(createClass.fulfilled, (state, action) => {
                state.classes.push(action.payload);
            })
            .addCase(fetchSchedule.fulfilled, (state, action) => {
                state.activeSchedule = action.payload;
            })
            .addCase(addScheduleSlot.fulfilled, (state, action) => {
                state.activeSchedule.push(action.payload);
            })
            .addCase(deleteScheduleSlot.fulfilled, (state, action) => {
                state.activeSchedule = state.activeSchedule.filter(s => s.id !== action.payload);
            });
    },
});

export const { clearActiveSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;
