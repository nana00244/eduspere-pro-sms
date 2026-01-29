import { Router } from 'express';
import { GradeController } from '../controllers/grade.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', GradeController.create);
router.get('/student/:studentId', GradeController.getByStudent);
router.get('/stats/subjects', GradeController.getSubjectStats);
router.delete('/:id', GradeController.delete);

export default router;
