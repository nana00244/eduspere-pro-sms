import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Subject {
    id: string;
    name: string;
    code: string;
}

interface SubjectsState {
    subjects: Subject[];
    loading: boolean;
    error: string | null;
}

const initialState: SubjectsState = {
    subjects: [],
    loading: false,
    error: null,
};

export const fetchSubjects = createAsyncThunk('subjects/fetchSubjects', async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
});

const subjectsSlice = createSlice({
    name: 'subjects',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.loading = false;
                state.subjects = action.payload;
            })
            .addCase(fetchSubjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch subjects';
            });
    },
});

export default subjectsSlice.reducer;
