import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { type Student, type CreateStudentDTO } from '../../types/student.types';
import { db } from '../../db/db';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface StudentsState {
    students: Student[];
    currentStudent: Student | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const initialState: StudentsState = {
    students: [],
    currentStudent: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    }
};

// Async thunks
export const fetchStudents = createAsyncThunk(
    'students/fetchAll',
    async (params: { page?: number; limit?: number; search?: string; classId?: string } = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/students`, { params });
            return response.data;
        } catch (error) {
            // If offline, fetch from IndexedDB
            const localStudents = await db.students.toArray();
            return {
                success: true,
                data: localStudents,
                pagination: {
                    page: 1,
                    limit: localStudents.length,
                    total: localStudents.length,
                    totalPages: 1
                }
            };
        }
    }
);

export const fetchStudentById = createAsyncThunk(
    'students/fetchById',
    async (id: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/students/${id}`);
            return response.data.data;
        } catch (error) {
            const localStudent = await db.students.get(id);
            return localStudent;
        }
    }
);

export const createStudent = createAsyncThunk(
    'students/create',
    async (data: CreateStudentDTO) => {
        // Save to IndexedDB first (offline-first)
        const localStudent = {
            id: Date.now().toString(),
            ...data,
            dateOfBirth: new Date(data.dateOfBirth),
            enrollmentDate: new Date(data.enrollmentDate),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.students.add(localStudent as any);

        try {
            // Try to sync to server
            const response = await axios.post(`${API_BASE_URL}/students`, data);
            return response.data.data;
        } catch (error) {
            // If offline, return local student
            return localStudent;
        }
    }
);

export const updateStudent = createAsyncThunk(
    'students/update',
    async ({ id, data }: { id: string; data: Partial<CreateStudentDTO> }) => {
        // Update IndexedDB first
        await db.students.update(id, data as any);

        try {
            const response = await axios.put(`${API_BASE_URL}/students/${id}`, data);
            return response.data.data;
        } catch (error) {
            const localStudent = await db.students.get(id);
            return localStudent;
        }
    }
);

export const deleteStudent = createAsyncThunk(
    'students/delete',
    async (id: string) => {
        // Delete from IndexedDB
        await db.students.delete(id);

        try {
            await axios.delete(`${API_BASE_URL}/students/${id}`);
            return id;
        } catch (error) {
            return id;
        }
    }
);

const studentsSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {
        setCurrentStudent: (state, action: PayloadAction<Student | null>) => {
            state.currentStudent = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch students
            .addCase(fetchStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.students = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch students';
            })
            // Fetch student by ID
            .addCase(fetchStudentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentStudent = action.payload;
            })
            .addCase(fetchStudentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch student';
            })
            // Create student
            .addCase(createStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.students.push(action.payload);
            })
            .addCase(createStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create student';
            })
            // Update student
            .addCase(updateStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateStudent.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.students.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.students[index] = action.payload;
                }
                if (state.currentStudent?.id === action.payload.id) {
                    state.currentStudent = action.payload;
                }
            })
            .addCase(updateStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update student';
            })
            // Delete student
            .addCase(deleteStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.students = state.students.filter(s => s.id !== action.payload);
            })
            .addCase(deleteStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete student';
            });
    }
});

export const { setCurrentStudent, clearError } = studentsSlice.actions;
export default studentsSlice.reducer;
