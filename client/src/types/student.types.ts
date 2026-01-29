// Frontend Student types (matching backend)
export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: Date;
    grade: string;
    classId?: string;
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: string;
    address?: string;
    phone?: string;

    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    guardianRelation?: string;

    enrollmentDate: Date;
    studentId: string;
    section?: string;
    rollNumber?: string;

    medicalConditions?: string;
    allergies?: string;

    createdAt: Date;
    updatedAt: Date;
    isDeleted?: boolean;
    deletedAt?: Date;
}

export interface CreateStudentDTO {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    grade: string;
    classId?: string;
    gender?: 'male' | 'female' | 'other';
    bloodGroup?: string;
    address?: string;
    phone?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    guardianRelation?: string;
    enrollmentDate: string;
    studentId: string;
    section?: string;
    rollNumber?: string;
    medicalConditions?: string;
    allergies?: string;
}
