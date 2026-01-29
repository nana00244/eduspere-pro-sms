import { v4 as uuidv4 } from 'uuid';
import { AttendanceRecord, AttendanceStatus, MarkAttendanceDTO, AttendanceStats, AttendanceFilters } from '../types/attendance.types';

export class AttendanceModel {
    private static records: AttendanceRecord[] = [];

    static async markAttendance(data: MarkAttendanceDTO, markedBy: string): Promise<AttendanceRecord> {
        // Check if attendance already exists for this student on this date
        const existingIndex = this.records.findIndex(
            r => r.studentId === data.studentId &&
                r.date === data.date &&
                r.scheduleSlotId === data.scheduleSlotId
        );

        if (existingIndex !== -1) {
            // Update existing record
            const updated: AttendanceRecord = {
                ...this.records[existingIndex],
                status: data.status,
                remarks: data.remarks,
                markedBy,
                markedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            this.records[existingIndex] = updated;
            return updated;
        }

        // Create new record
        const newRecord: AttendanceRecord = {
            id: uuidv4(),
            studentId: data.studentId,
            date: data.date,
            status: data.status,
            scheduleSlotId: data.scheduleSlotId,
            remarks: data.remarks,
            markedBy,
            markedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.records.push(newRecord);
        return newRecord;
    }

    static async markBulkAttendance(
        records: { studentId: string; status: AttendanceStatus; remarks?: string }[],
        date: string,
        markedBy: string,
        scheduleSlotId?: string
    ): Promise<AttendanceRecord[]> {
        const results: AttendanceRecord[] = [];

        for (const record of records) {
            const marked = await this.markAttendance(
                {
                    studentId: record.studentId,
                    date,
                    status: record.status,
                    remarks: record.remarks,
                    scheduleSlotId
                },
                markedBy
            );
            results.push(marked);
        }

        return results;
    }

    static async getAttendance(filters: AttendanceFilters): Promise<AttendanceRecord[]> {
        let filtered = [...this.records];

        if (filters.studentId) {
            filtered = filtered.filter(r => r.studentId === filters.studentId);
        }

        if (filters.startDate) {
            filtered = filtered.filter(r => r.date >= filters.startDate!);
        }

        if (filters.endDate) {
            filtered = filtered.filter(r => r.date <= filters.endDate!);
        }

        if (filters.status) {
            filtered = filtered.filter(r => r.status === filters.status);
        }

        if (filters.scheduleSlotId) {
            filtered = filtered.filter(r => r.scheduleSlotId === filters.scheduleSlotId);
        }

        // Sort by date descending
        return filtered.sort((a, b) => b.date.localeCompare(a.date));
    }

    static async getAttendanceStats(filters: AttendanceFilters): Promise<AttendanceStats | AttendanceStats[]> {
        const records = await this.getAttendance(filters);

        if (filters.studentId) {
            // Return stats for single student
            return this.calculateStats(records);
        }

        // Return stats for multiple students (grouped by student)
        const studentIds = [...new Set(records.map(r => r.studentId))];
        return studentIds.map(studentId => {
            const studentRecords = records.filter(r => r.studentId === studentId);
            return {
                studentId,
                ...this.calculateStats(studentRecords),
            };
        });
    }

    private static calculateStats(records: AttendanceRecord[]): Omit<AttendanceStats, 'studentId'> {
        const totalDays = records.length;
        const presentDays = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
        const absentDays = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
        const lateDays = records.filter(r => r.status === AttendanceStatus.LATE).length;
        const excusedDays = records.filter(r => r.status === AttendanceStatus.EXCUSED).length;

        const attendanceRate = totalDays > 0
            ? Math.round(((presentDays + lateDays) / totalDays) * 100 * 100) / 100
            : 0;

        return {
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            excusedDays,
            attendanceRate,
        };
    }

    static async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
        return this.records.filter(r => r.date === date);
    }

    static async getAttendanceTrend(filters: AttendanceFilters): Promise<{ date: string; rate: number; total: number }[]> {
        const records = await this.getAttendance(filters);
        const groupedByDate: Record<string, AttendanceRecord[]> = {};

        records.forEach(r => {
            if (!groupedByDate[r.date]) {
                groupedByDate[r.date] = [];
            }
            groupedByDate[r.date].push(r);
        });

        const trend = Object.entries(groupedByDate).map(([date, dateRecords]) => {
            const stats = this.calculateStats(dateRecords);
            return {
                date,
                rate: stats.attendanceRate,
                total: stats.totalDays
            };
        });

        // Sort by date ascending for the chart
        return trend.sort((a, b) => a.date.localeCompare(b.date));
    }

    static async getLowAttendanceStudents(threshold: number = 85): Promise<{ studentId: string; rate: number }[]> {
        // In a real DB, this would be a single aggregation query
        const allRecords = this.records;
        const studentIds = [...new Set(allRecords.map(r => r.studentId))];

        const lowAttendance: { studentId: string; rate: number }[] = [];

        for (const studentId of studentIds) {
            const studentRecords = allRecords.filter(r => r.studentId === studentId);
            const stats = this.calculateStats(studentRecords);
            if (stats.attendanceRate < threshold) {
                lowAttendance.push({
                    studentId,
                    rate: stats.attendanceRate
                });
            }
        }

        return lowAttendance;
    }

    static async deleteAttendance(id: string): Promise<boolean> {
        const index = this.records.findIndex(r => r.id === id);
        if (index !== -1) {
            this.records.splice(index, 1);
            return true;
        }
        return false;
    }

    // Utility method to seed some demo data
    static seedDemoData(studentIds: string[], teacherId: string): void {
        const today = new Date();
        const dates: string[] = [];

        // Generate last 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }

        // Create sample attendance for each student for the past week
        studentIds.forEach(studentId => {
            dates.forEach((date, index) => {
                // Simulate realistic attendance patterns
                let status: AttendanceStatus;
                const random = Math.random();

                if (random < 0.75) {
                    status = AttendanceStatus.PRESENT;
                } else if (random < 0.85) {
                    status = AttendanceStatus.LATE;
                } else if (random < 0.95) {
                    status = AttendanceStatus.EXCUSED;
                } else {
                    status = AttendanceStatus.ABSENT;
                }

                this.records.push({
                    id: uuidv4(),
                    studentId,
                    date,
                    status,
                    remarks: status === AttendanceStatus.ABSENT ? 'Not reported' : undefined,
                    markedBy: teacherId,
                    markedAt: new Date(date + 'T08:00:00').toISOString(),
                    createdAt: new Date(date + 'T08:00:00').toISOString(),
                    updatedAt: new Date(date + 'T08:00:00').toISOString(),
                });
            });
        });
    }
}
