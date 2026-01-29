import { Request, Response } from 'express';
import { StaffModel } from '../models/staff.model';
import { CreateStaffDTO, UpdateStaffDTO } from '../types/staff.types';

export class StaffController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const staff = await StaffModel.findAll();
            res.json({ success: true, data: staff });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching staff',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const staff = await StaffModel.findById(id as string);
            if (!staff) {
                res.status(404).json({ success: false, message: 'Staff not found' });
                return;
            }
            res.json({ success: true, data: staff });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching staff profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const data: CreateStaffDTO = req.body;
            if (!data.userId || !data.email || !data.firstName) {
                res.status(400).json({ success: false, message: 'Missing required fields' });
                return;
            }
            const staff = await StaffModel.create(data);
            res.status(201).json({ success: true, data: staff, message: 'Staff profile created' });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating staff profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data: UpdateStaffDTO = req.body;
            const staff = await StaffModel.update(id as string, data);
            if (!staff) {
                res.status(404).json({ success: false, message: 'Staff not found' });
                return;
            }
            res.json({ success: true, data: staff, message: 'Staff profile updated' });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating staff profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await StaffModel.delete(id as string);
            if (!deleted) {
                res.status(404).json({ success: false, message: 'Staff not found' });
                return;
            }
            res.json({ success: true, message: 'Staff profile deleted' });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting staff profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
