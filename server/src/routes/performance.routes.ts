import { Router, Request, Response } from 'express';
import { PerformanceModel } from '../models/performance.model';

const router = Router();

router.get('/:staffId', async (req: Request, res: Response) => {
    try {
        const staffId = req.params.staffId as string;
        const reviews = await PerformanceModel.findByStaffId(staffId);
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching reviews' });
    }
});

router.get('/stats/all', async (req: Request, res: Response) => {
    try {
        const stats = await PerformanceModel.getAllStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching performance stats' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const review = await PerformanceModel.create(req.body);
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating review' });
    }
});

export default router;
