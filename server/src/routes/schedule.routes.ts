import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller';

const router = Router();

// Classes
router.get('/classes', ScheduleController.getAllClasses);
router.post('/classes', ScheduleController.createClass);

// Slots
router.get('/slots/:classId', ScheduleController.getScheduleByClass);
router.post('/slots', ScheduleController.addScheduleSlot);
router.delete('/slots/:id', ScheduleController.deleteScheduleSlot);

export default router;
