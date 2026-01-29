import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ExitToApp } from '@mui/icons-material';
import StudentList from './components/students/StudentList';
import StudentForm from './components/students/StudentForm';
import StudentProfile from './components/students/StudentProfile';
import StaffList from './components/staff/StaffList';
import StaffProfile from './components/staff/StaffProfile';
import ClassManager from './components/schedule/ClassManager';
import Timetable from './components/schedule/Timetable';
import ClassStudents from './components/schedule/ClassStudents';
import AttendanceMarking from './components/attendance/AttendanceMarking';
import AttendanceReport from './components/attendance/AttendanceReport';
import AdvancedAnalytics from './components/analytics/AdvancedAnalytics';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { logout } from './store/slices/authSlice';

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated && (
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Edusphere Pro SMS
            </Typography>
            {user && (
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.firstName} {user.lastName} ({user.role})
              </Typography>
            )}
            <Button color="inherit" component={RouterLink} to="/">
              Dashboard
            </Button>
            <Button color="inherit" component={RouterLink} to="/students">
              Students
            </Button>
            <Button color="inherit" component={RouterLink} to="/staff">
              Staff
            </Button>
            <Button color="inherit" component={RouterLink} to="/classes">
              Classes
            </Button>
            <Button color="inherit" component={RouterLink} to="/attendance">
              Mark Attendance
            </Button>
            <Button color="inherit" component={RouterLink} to="/analytics">
              Analytics
            </Button>
            <Button color="inherit" component={RouterLink} to="/attendance/report">
              Reports
            </Button>
            <IconButton color="inherit" onClick={handleLogout} title="Logout">
              <ExitToApp />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      <Container component="main" sx={{ mt: isAuthenticated ? 4 : 0, mb: 4, flexGrow: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <StudentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/new"
            element={
              <ProtectedRoute>
                <StudentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <StaffList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/:id"
            element={
              <ProtectedRoute>
                <StaffProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <ClassManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/:classId"
            element={
              <ProtectedRoute>
                <Timetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:classId/students"
            element={
              <ProtectedRoute>
                <ClassStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendanceMarking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/report"
            element={
              <ProtectedRoute>
                <AttendanceReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdvancedAnalytics />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
