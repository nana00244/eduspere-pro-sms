import { Request, Response } from 'express';
import { StudentModel } from '../models/student.model';
import { CreateStudentDTO, UpdateStudentDTO, StudentQuery } from '../types/student.types';

export class StudentController {
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const query: StudentQuery = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
                search: req.query.search as string,
                grade: req.query.grade as string,
                section: req.query.section as string,
                classId: req.query.classId as string
            };

            const result = await StudentModel.findAll(query);

            res.json({
                success: true,
                data: result.students,
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / (query.limit || 10))
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching students',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const student = await StudentModel.findById(id as string);

            if (!student) {
                res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
                return;
            }

            res.json({
                success: true,
                data: student
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching student',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const data: CreateStudentDTO = req.body;

            // Basic validation
            if (!data.firstName || !data.lastName || !data.email || !data.studentId) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
                return;
            }

            const student = await StudentModel.create(data);

            res.status(201).json({
                success: true,
                data: student,
                message: 'Student created successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating student',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const data: UpdateStudentDTO = req.body;

            const student = await StudentModel.update(id as string, data);

            if (!student) {
                res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
                return;
            }

            res.json({
                success: true,
                data: student,
                message: 'Student updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating student',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const success = await StudentModel.delete(id as string);

            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Student deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting student',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async bulkNotify(req: Request, res: Response): Promise<void> {
        try {
            const { studentIds, message, type } = req.body;

            if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'No students selected'
                });
                return;
            }

            // In a real app, this would trigger email/SMS via a service like SendGrid/Twilio
            console.log(`BULK NOTIFICATION [${type}]: "${message}" sent to ${studentIds.length} students:`, studentIds);

            res.json({
                success: true,
                message: `Successfully sent ${type} notifications to ${studentIds.length} students.`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error sending bulk notifications',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
