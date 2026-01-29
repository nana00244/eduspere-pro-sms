export const AttendanceStatus = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    EXCUSED: 'excused'
} as const;

export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];

export interface AttendanceRecord {
    id: string;
    studentId: string;
    date: string; // ISO 8601 date string (YYYY-MM-DD)
    status: AttendanceStatus;
    scheduleSlotId?: string;
    remarks?: string;
    markedBy: string;
    markedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface MarkAttendanceDTO {
    studentId: string;
    date: string;
    status: AttendanceStatus;
    scheduleSlotId?: string;
    remarks?: string;
}

export interface BulkAttendanceDTO {
    date: string;
    scheduleSlotId?: string;
    records: {
        studentId: string;
        status: AttendanceStatus;
        remarks?: string;
    }[];
}

export interface AttendanceStats {
    studentId?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
    };
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendanceRate: number;
}

export interface AttendanceAlert {
    studentId: string;
    rate: number;
}

export interface AttendanceFilters {
    studentId?: string;
    grade?: string;
    section?: string;
    startDate?: string;
    endDate?: string;
    status?: AttendanceStatus;
    scheduleSlotId?: string;
}
