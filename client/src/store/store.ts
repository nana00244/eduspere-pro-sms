import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from './slices/studentsSlice';
import authReducer from './slices/authSlice';
import attendanceReducer from './slices/attendanceSlice';
import gradesReducer from './slices/gradeSlice';
import staffReducer from './slices/staffSlice';
import scheduleReducer from './slices/scheduleSlice';
import subjectsReducer from './slices/subjectsSlice';

export const store = configureStore({
    reducer: {
        students: studentsReducer,
        auth: authReducer,
        attendance: attendanceReducer,
        grades: gradesReducer,
        staff: staffReducer,
        schedule: scheduleReducer,
        subjects: subjectsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
