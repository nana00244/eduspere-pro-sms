import Dexie, { type Table } from 'dexie';
import { AttendanceStatus } from '../types/attendance.types';

export interface Student {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: Date;
    grade: string;
    section?: string;
    admissionNumber?: string;
}

export interface AttendanceRecord {
    id: string;
    studentId: string;
    date: string;
    status: AttendanceStatus;
    remarks?: string;
    markedBy: string;
    markedAt: string;
    createdAt: string;
    updatedAt: string;
}

export class SMSDatabase extends Dexie {
    students!: Table<Student>;
    attendance!: Table<AttendanceRecord>;

    constructor() {
        super('SMSDatabase');
        this.version(2).stores({
            students: '++id, firstName, lastName, grade, admissionNumber',
            attendance: 'id, studentId, date, [studentId+date]'
        });
    }
}

export const db = new SMSDatabase();
