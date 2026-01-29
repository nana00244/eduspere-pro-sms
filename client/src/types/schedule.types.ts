export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DaysOfWeek = {
    MONDAY: 'Monday' as DayOfWeek,
    TUESDAY: 'Tuesday' as DayOfWeek,
    WEDNESDAY: 'Wednesday' as DayOfWeek,
    THURSDAY: 'Thursday' as DayOfWeek,
    FRIDAY: 'Friday' as DayOfWeek,
    SATURDAY: 'Saturday' as DayOfWeek,
    SUNDAY: 'Sunday' as DayOfWeek,
};

export interface Class {
    id: string;
    grade: string;
    section: string;
    academicYear: string;
    classTeacherId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ScheduleSlot {
    id: string;
    classId: string;
    subjectId: string;
    staffId: string;
    day: DayOfWeek;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    room?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClassDTO {
    grade: string;
    section: string;
    academicYear: string;
    classTeacherId?: string;
}

export interface CreateScheduleSlotDTO {
    classId: string;
    subjectId: string;
    staffId: string;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    room?: string;
}
