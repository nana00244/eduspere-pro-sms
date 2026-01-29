export interface Grade {
    id: string;
    studentId: string;
    subject: string;
    score: number;
    maxScore: number;
    term: string;
    academicYear: string;
    date: string;
    remarks?: string;
    teacherId: string;
    createdAt: string;
    updatedAt: string;
}

export interface GradeEntryDTO {
    studentId: string;
    subject: string;
    score: number;
    maxScore: number;
    term: string;
    academicYear: string;
    remarks?: string;
}

export interface StudentGradeStats {
    average: number;
    total: number;
}
