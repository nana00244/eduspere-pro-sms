import { Request, Response } from 'express';
import { ClassModel } from '../models/class.model';
import { ScheduleModel } from '../models/schedule.model';

export class ScheduleController {
    // Classes
    static async getAllClasses(req: Request, res: Response): Promise<void> {
        try {
            const classes = await ClassModel.findAll();
            res.json({ success: true, data: classes });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching classes' });
        }
    }

    static async createClass(req: Request, res: Response): Promise<void> {
        try {
            const newClass = await ClassModel.create(req.body);
            res.status(201).json({ success: true, data: newClass });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error creating class' });
        }
    }

    // Schedule Slots
    static async getScheduleByClass(req: Request, res: Response): Promise<void> {
        try {
            const classId = req.params.classId as string;
            const slots = await ScheduleModel.findByClassId(classId);
            res.json({ success: true, data: slots });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching schedule' });
        }
    }

    static async addScheduleSlot(req: Request, res: Response): Promise<void> {
        try {
            const slot = await ScheduleModel.create(req.body);
            res.status(201).json({ success: true, data: slot });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error adding schedule slot'
            });
        }
    }

    static async deleteScheduleSlot(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;
            const deleted = await ScheduleModel.delete(id);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Slot not found' });
                return;
            }
            res.json({ success: true, message: 'Slot deleted' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error deleting slot' });
        }
    }
}
