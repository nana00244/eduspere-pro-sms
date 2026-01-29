import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { db } from '../../db/db';
import { type AttendanceRecord, type MarkAttendanceDTO, type BulkAttendanceDTO, type AttendanceStats, type AttendanceFilters, type AttendanceAlert } from '../../types/attendance.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AttendanceState {
    records: AttendanceRecord[];
    stats: AttendanceStats | null;
    trendData: { date: string; rate: number; total: number }[];
    alerts: AttendanceAlert[];
    loading: boolean;
    error: string | null;
    selectedDate: string;
}

const today = new Date().toISOString().split('T')[0];

const initialState: AttendanceState = {
    records: [],
    stats: null,
    trendData: [],
    alerts: [],
    loading: false,
    error: null,
    selectedDate: today,
};

// Async thunks
export const fetchAttendanceAlerts = createAsyncThunk<AttendanceAlert[], number | undefined>(
    'attendance/fetchAlerts',
    async (threshold, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            if (!token) return []; // Skip for offline for now or implement local calculation

            const thresholdParam = threshold ? `?threshold=${threshold}` : '';
            const response = await axios.get<{ success: boolean; data: AttendanceAlert[] }>(
                `${API_BASE_URL}/attendance/alerts${thresholdParam}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                return response.data.data;
            }

            return rejectWithValue('Failed to fetch alerts');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Failed to fetch alerts');
            }
            return rejectWithValue('Network error');
        }
    }
);

export const fetchAttendanceTrend = createAsyncThunk<{ date: string; rate: number; total: number }[], AttendanceFilters>(
    'attendance/fetchTrend',
    async (filters, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            if (!token) {
                // Return local data if offline-ish (mock some data from records)
                const records = await db.attendance.toArray();
                const groupedByDate: Record<string, AttendanceRecord[]> = {};

                records.forEach(r => {
                    if (!groupedByDate[r.date]) {
                        groupedByDate[r.date] = [];
                    }
                    groupedByDate[r.date].push(r);
                });

                const trend = Object.entries(groupedByDate).map(([date, dateRecords]) => {
                    const totalDays = dateRecords.length;
                    const presentPlusLate = dateRecords.filter(r => r.status === 'present' || r.status === 'late').length;
                    const attendanceRate = totalDays > 0 ? Math.round((presentPlusLate / totalDays) * 100) : 0;
                    return {
                        date,
                        rate: attendanceRate,
                        total: totalDays
                    };
                });

                return trend.sort((a, b) => a.date.localeCompare(b.date));
            }

            const params = new URLSearchParams();
            if (filters.studentId) params.append('studentId', filters.studentId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await axios.get<{ success: boolean; data: { date: string; rate: number; total: number }[] }>(
                `${API_BASE_URL}/attendance/trend?${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                return response.data.data;
            }

            return rejectWithValue('Failed to fetch trend');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Failed to fetch trend');
            }
            return rejectWithValue('Network error');
        }
    }
);

export const fetchAttendance = createAsyncThunk<AttendanceRecord[], AttendanceFilters>(
    'attendance/fetch',
    async (filters, { getState }) => {
        try {
            // Try offline first
            let records = await db.attendance.toArray();

            // Apply filters locally
            if (filters.studentId) {
                records = records.filter(r => r.studentId === filters.studentId);
            }
            if (filters.startDate) {
                records = records.filter(r => r.date >= filters.startDate!);
            }
            if (filters.endDate) {
                records = records.filter(r => r.date <= filters.endDate!);
            }
            if (filters.status) {
                records = records.filter(r => r.status === filters.status);
            }

            // Try to fetch from server if online
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            if (token) {
                const params = new URLSearchParams();
                if (filters.studentId) params.append('studentId', filters.studentId);
                if (filters.grade) params.append('grade', filters.grade);
                if (filters.section) params.append('section', filters.section);
                if (filters.startDate) params.append('startDate', filters.startDate);
                if (filters.endDate) params.append('endDate', filters.endDate);
                if (filters.status) params.append('status', filters.status);

                const response = await axios.get<{ success: boolean; data: AttendanceRecord[] }>(
                    `${API_BASE_URL}/attendance?${params}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (response.data.success) {
                    // Update IndexedDB
                    await db.attendance.clear();
                    await db.attendance.bulkAdd(response.data.data);
                    return response.data.data;
                }
            }

            return records;
        } catch (error) {
            // Return offline data on error
            const records = await db.attendance.toArray();
            return records;
        }
    }
);

export const markAttendance = createAsyncThunk<AttendanceRecord, MarkAttendanceDTO>(
    'attendance/mark',
    async (data, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null; user: { id: string } | null } };
            const token = state.auth.token;

            // Create optimistic record for offline
            const optimisticRecord: AttendanceRecord = {
                id: `temp-${Date.now()}`,
                studentId: data.studentId,
                date: data.date,
                status: data.status,
                remarks: data.remarks,
                markedBy: state.auth.user?.id || 'unknown',
                markedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Save offline first
            await db.attendance.put(optimisticRecord);

            if (token) {
                // Try to sync with server
                const response = await axios.post<{ success: boolean; data: AttendanceRecord }>(
                    `${API_BASE_URL}/attendance`,
                    data,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (response.data.success) {
                    // Replace temp record with server record
                    await db.attendance.delete(optimisticRecord.id);
                    await db.attendance.put(response.data.data);
                    return response.data.data;
                }
            }

            return optimisticRecord;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Failed to mark attendance');
            }
            // Return optimistic record on error (offline mode)
            return rejectWithValue('Network error - saved locally');
        }
    }
);

export const markBulkAttendance = createAsyncThunk<AttendanceRecord[], BulkAttendanceDTO>(
    'attendance/markBulk',
    async (data, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null; user: { id: string } | null } };
            const token = state.auth.token;

            if (!token) {
                return rejectWithValue('Authentication required');
            }

            const response = await axios.post<{ success: boolean; data: AttendanceRecord[] }>(
                `${API_BASE_URL}/attendance/bulk`,
                data,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // Update IndexedDB
                await db.attendance.bulkPut(response.data.data);
                return response.data.data;
            }

            return rejectWithValue('Failed to mark bulk attendance');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Failed to mark bulk attendance');
            }
            return rejectWithValue('Network error');
        }
    }
);

export const fetchAttendanceStats = createAsyncThunk<AttendanceStats, AttendanceFilters>(
    'attendance/fetchStats',
    async (filters, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            if (!token) {
                return rejectWithValue('Authentication required');
            }

            const params = new URLSearchParams();
            if (filters.studentId) params.append('studentId', filters.studentId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await axios.get<{ success: boolean; stats: AttendanceStats }>(
                `${API_BASE_URL}/attendance/stats?${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                return response.data.stats;
            }

            return rejectWithValue('Failed to fetch stats');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Failed to fetch stats');
            }
            return rejectWithValue('Network error');
        }
    }
);

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        setSelectedDate: (state, action) => {
            state.selectedDate = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch attendance
            .addCase(fetchAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload;
            })
            .addCase(fetchAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Mark attendance
            .addCase(markAttendance.fulfilled, (state, action) => {
                const index = state.records.findIndex(
                    r => r.studentId === action.payload.studentId && r.date === action.payload.date
                );
                if (index !== -1) {
                    state.records[index] = action.payload;
                } else {
                    state.records.push(action.payload);
                }
            })
            // Mark bulk attendance
            .addCase(markBulkAttendance.fulfilled, (state, action) => {
                action.payload.forEach(record => {
                    const index = state.records.findIndex(
                        r => r.studentId === record.studentId && r.date === record.date
                    );
                    if (index !== -1) {
                        state.records[index] = record;
                    } else {
                        state.records.push(record);
                    }
                });
            })
            // Fetch stats
            .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            // Fetch trend
            .addCase(fetchAttendanceTrend.fulfilled, (state, action) => {
                state.trendData = action.payload;
            })
            // Fetch alerts
            .addCase(fetchAttendanceAlerts.fulfilled, (state, action) => {
                state.alerts = action.payload;
            });
    },
});

export const { setSelectedDate, clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
