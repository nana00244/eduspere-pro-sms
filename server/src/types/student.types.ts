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

    // Guardian Information
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    guardianRelation?: string;

    // Academic Information
    enrollmentDate: Date;
    studentId: string; // Unique student ID
    section?: string;
    rollNumber?: string;

    // Medical Information
    medicalConditions?: string;
    allergies?: string;

    // System Fields
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

export interface UpdateStudentDTO extends Partial<CreateStudentDTO> { }

export interface StudentQuery {
    page?: number;
    limit?: number;
    search?: string;
    grade?: string;
    section?: string;
    classId?: string;
}
