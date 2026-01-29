import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', AttendanceController.markAttendance);
router.post('/bulk', AttendanceController.markBulkAttendance);
router.get('/', AttendanceController.getAttendance);
router.get('/stats', AttendanceController.getAttendanceStats);
router.get('/trend', AttendanceController.getAttendanceTrend);
router.get('/alerts', AttendanceController.getLowAttendance);
router.get('/date/:date', AttendanceController.getAttendanceByDate);
router.delete('/:id', AttendanceController.deleteAttendance);

export default router;
