export enum AttendanceStatus {
    PRESENT = 'present',
    ABSENT = 'absent',
    LATE = 'late',
    EXCUSED = 'excused'
}

export interface AttendanceRecord {
    id: string;
    studentId: string;
    date: string; // ISO 8601 date string (YYYY-MM-DD)
    status: AttendanceStatus;
    scheduleSlotId?: string;
    remarks?: string;
    markedBy: string; // User ID who marked attendance
    markedAt: string; // ISO 8601 timestamp
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
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendanceRate: number; // Percentage
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

export interface AttendanceResponse {
    success: boolean;
    data?: AttendanceRecord | AttendanceRecord[];
    stats?: AttendanceStats | AttendanceStats[];
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
    };
}
