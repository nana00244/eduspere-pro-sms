import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { type User, type LoginCredentials, type AuthResponse } from '../../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

// Async thunks
export const login = createAsyncThunk<AuthResponse['data'], LoginCredentials>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials);
            if (response.data.success && response.data.data) {
                // Store in localStorage
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                return response.data.data;
            }
            return rejectWithValue(response.data.message || 'Login failed');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Login failed');
            }
            return rejectWithValue('Network error');
        }
    }
);

export const getCurrentUser = createAsyncThunk<User>(
    'auth/getCurrentUser',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: AuthState };
            const token = state.auth.token;

            const response = await axios.get<{ success: boolean; data: User }>(`${API_BASE_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue('Failed to get user');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Failed to get user');
            }
            return rejectWithValue('Network error');
        }
    }
);

export const refreshAccessToken = createAsyncThunk<string>(
    'auth/refreshToken',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: AuthState };
            const refreshToken = state.auth.refreshToken;

            const response = await axios.post<{ success: boolean; data: { token: string } }>(
                `${API_BASE_URL}/auth/refresh`,
                { refreshToken }
            );

            if (response.data.success) {
                localStorage.setItem('token', response.data.data.token);
                return response.data.data.token;
            }
            return rejectWithValue('Failed to refresh token');
        } catch (error) {
            return rejectWithValue('Token refresh failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload!.user;
                state.token = action.payload!.token;
                state.refreshToken = action.payload!.refreshToken;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Get current user
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            // Refresh token
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.token = action.payload;
            })
            .addCase(refreshAccessToken.rejected, (state) => {
                // If refresh fails, logout
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
