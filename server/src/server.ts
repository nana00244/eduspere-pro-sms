import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import studentRoutes from './routes/student.routes';
import authRoutes from './routes/auth.routes';
import attendanceRoutes from './routes/attendance.routes';
import gradeRoutes from './routes/grade.routes';
import staffRoutes from './routes/staff.routes';
import subjectRoutes from './routes/subject.routes';
import scheduleRoutes from './routes/schedule.routes';
import performanceRoutes from './routes/performance.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Edusphere Pro SMS API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/performance', performanceRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
