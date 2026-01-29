import { Request, Response } from 'express';
import { AttendanceModel } from '../models/attendance.model';
import { MarkAttendanceDTO, BulkAttendanceDTO, AttendanceFilters } from '../types/attendance.types';

export class AttendanceController {
    static async markAttendance(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const data: MarkAttendanceDTO = req.body;

            if (!data.studentId || !data.date || !data.status) {
                res.status(400).json({
                    success: false,
                    message: 'Student ID, date, and status are required'
                });
                return;
            }

            const record = await AttendanceModel.markAttendance(data, req.user.userId);

            res.json({
                success: true,
                data: record,
                message: 'Attendance marked successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to mark attendance',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async markBulkAttendance(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const data: BulkAttendanceDTO = req.body;

            if (!data.date || !data.records || !Array.isArray(data.records)) {
                res.status(400).json({
                    success: false,
                    message: 'Date and records array are required'
                });
                return;
            }

            const records = await AttendanceModel.markBulkAttendance(
                data.records,
                data.date,
                req.user.userId,
                data.scheduleSlotId
            );

            res.json({
                success: true,
                data: records,
                message: `Marked attendance for ${records.length} students`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to mark bulk attendance',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getAttendance(req: Request, res: Response): Promise<void> {
        try {
            const filters: AttendanceFilters = {
                studentId: req.query.studentId as string,
                grade: req.query.grade as string,
                section: req.query.section as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
                status: req.query.status as any,
                scheduleSlotId: req.query.scheduleSlotId as string
            };

            const records = await AttendanceModel.getAttendance(filters);

            res.json({
                success: true,
                data: records,
                pagination: {
                    page: 1,
                    limit: records.length,
                    total: records.length
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get attendance',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getAttendanceStats(req: Request, res: Response): Promise<void> {
        try {
            const filters: AttendanceFilters = {
                studentId: req.query.studentId as string,
                grade: req.query.grade as string,
                section: req.query.section as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
            };

            const stats = await AttendanceModel.getAttendanceStats(filters);

            res.json({
                success: true,
                stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get attendance statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getAttendanceTrend(req: Request, res: Response): Promise<void> {
        try {
            const filters: AttendanceFilters = {
                studentId: req.query.studentId as string,
                grade: req.query.grade as string,
                section: req.query.section as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
            };

            const trend = await AttendanceModel.getAttendanceTrend(filters);

            res.json({
                success: true,
                data: trend
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get attendance trend',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getLowAttendance(req: Request, res: Response): Promise<void> {
        try {
            const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 85;
            const alerts = await AttendanceModel.getLowAttendanceStudents(threshold);

            res.json({
                success: true,
                data: alerts
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get low attendance alerts',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getAttendanceByDate(req: Request, res: Response): Promise<void> {
        try {
            const date = req.params.date as string;

            if (!date) {
                res.status(400).json({
                    success: false,
                    message: 'Date is required'
                });
                return;
            }

            const records = await AttendanceModel.getAttendanceByDate(date);

            res.json({
                success: true,
                data: records
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get attendance by date',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async deleteAttendance(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Attendance ID is required'
                });
                return;
            }

            const deleted = await AttendanceModel.deleteAttendance(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Attendance record not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Attendance deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete attendance',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
