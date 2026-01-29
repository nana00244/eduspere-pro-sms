import { Router, Request, Response } from 'express';
import { SubjectModel } from '../models/subject.model';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const subjects = await SubjectModel.findAll();
        res.json({ success: true, data: subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching subjects' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const subject = await SubjectModel.create(req.body);
        res.status(201).json({ success: true, data: subject });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating subject' });
    }
});

export default router;
