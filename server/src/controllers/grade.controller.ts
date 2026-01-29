import { Request, Response } from 'express';
import { gradeModel } from '../models/grade.model';
import { GradeEntryDTO } from '../types/grade.types';

export class GradeController {
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const dto: GradeEntryDTO = req.body;
            const teacherId = (req as any).user.userId;
            const grade = await gradeModel.create(dto, teacherId);

            res.status(201).json({
                success: true,
                data: grade
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create grade',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getByStudent(req: Request, res: Response): Promise<void> {
        try {
            const { studentId } = req.params;
            const grades = await gradeModel.findByStudent(studentId as string);
            const stats = await gradeModel.getStudentStats(studentId as string);

            res.json({
                success: true,
                data: grades,
                stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch grades',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const success = await gradeModel.delete(id as string);

            if (success) {
                res.json({ success: true, message: 'Grade deleted successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Grade not found' });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete grade',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getSubjectStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await gradeModel.getSubjectStats();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch subject statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
