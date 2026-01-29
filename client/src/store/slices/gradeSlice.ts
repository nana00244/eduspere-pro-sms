import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Grade, GradeEntryDTO, StudentGradeStats } from '../../types/grade.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface GradeState {
    studentGrades: Grade[];
    studentStats: StudentGradeStats | null;
    loading: boolean;
    error: string | null;
}

const initialState: GradeState = {
    studentGrades: [],
    studentStats: null,
    loading: false,
    error: null,
};

export const fetchStudentGrades = createAsyncThunk<
    { data: Grade[]; stats: StudentGradeStats },
    string
>(
    'grades/fetchByStudent',
    async (studentId, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const response = await axios.get(`${API_BASE_URL}/grades/student/${studentId}`, {
                headers: { Authorization: `Bearer ${state.auth.token}` }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch grades');
        }
    }
);

export const createGrade = createAsyncThunk<Grade, GradeEntryDTO>(
    'grades/create',
    async (dto, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const response = await axios.post(`${API_BASE_URL}/grades`, dto, {
                headers: { Authorization: `Bearer ${state.auth.token}` }
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create grade');
        }
    }
);

export const deleteGrade = createAsyncThunk<string, string>(
    'grades/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            await axios.delete(`${API_BASE_URL}/grades/${id}`, {
                headers: { Authorization: `Bearer ${state.auth.token}` }
            });
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete grade');
        }
    }
);

const gradeSlice = createSlice({
    name: 'grades',
    initialState,
    reducers: {
        clearGradeError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch student grades
            .addCase(fetchStudentGrades.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentGrades.fulfilled, (state, action) => {
                state.loading = false;
                state.studentGrades = action.payload.data;
                state.studentStats = action.payload.stats;
            })
            .addCase(fetchStudentGrades.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create grade
            .addCase(createGrade.fulfilled, (state, action) => {
                state.studentGrades.unshift(action.payload);
            })
            // Delete grade
            .addCase(deleteGrade.fulfilled, (state, action) => {
                state.studentGrades = state.studentGrades.filter(g => g.id !== action.payload);
            });
    },
});

export const { clearGradeError } = gradeSlice.actions;
export default gradeSlice.reducer;
