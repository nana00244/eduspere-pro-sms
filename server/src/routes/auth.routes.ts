import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.get('/me', authenticateToken, AuthController.getCurrentUser);
router.get('/users', authenticateToken, AuthController.getAllUsers);

export default router;
