import { Student, CreateStudentDTO, UpdateStudentDTO, StudentQuery } from '../types/student.types';

// In-memory storage for MVP (will be replaced with PostgreSQL)
let students: Student[] = [];

export class StudentModel {
    static async findAll(query: StudentQuery): Promise<{ students: Student[]; total: number }> {
        let filtered = students.filter(s => !s.isDeleted);

        // Search
        if (query.search) {
            const search = query.search.toLowerCase();
            filtered = filtered.filter(s =>
                s.firstName.toLowerCase().includes(search) ||
                s.lastName.toLowerCase().includes(search) ||
                s.email.toLowerCase().includes(search) ||
                s.studentId.toLowerCase().includes(search)
            );
        }

        // Filter by grade
        if (query.grade) {
            filtered = filtered.filter(s => s.grade === query.grade);
        }

        // Filter by section
        if (query.section) {
            filtered = filtered.filter(s => s.section === query.section);
        }

        // Filter by classId
        if (query.classId) {
            filtered = filtered.filter(s => s.classId === query.classId);
        }

        const total = filtered.length;

        // Pagination
        const page = query.page || 1;
        const limit = query.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        return {
            students: filtered.slice(startIndex, endIndex),
            total
        };
    }

    static async findById(id: string): Promise<Student | null> {
        const student = students.find(s => s.id === id && !s.isDeleted);
        return student || null;
    }

    static async create(data: CreateStudentDTO): Promise<Student> {
        const student: Student = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            dateOfBirth: new Date(data.dateOfBirth),
            grade: data.grade,
            gender: data.gender,
            bloodGroup: data.bloodGroup,
            address: data.address,
            phone: data.phone,
            guardianName: data.guardianName,
            guardianPhone: data.guardianPhone,
            guardianEmail: data.guardianEmail,
            guardianRelation: data.guardianRelation,
            enrollmentDate: new Date(data.enrollmentDate),
            studentId: data.studentId,
            classId: data.classId,
            section: data.section,
            rollNumber: data.rollNumber,
            medicalConditions: data.medicalConditions,
            allergies: data.allergies,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false
        };

        students.push(student);
        return student;
    }

    static async update(id: string, data: UpdateStudentDTO): Promise<Student | null> {
        const index = students.findIndex(s => s.id === id && !s.isDeleted);
        if (index === -1) return null;

        const student = students[index];

        students[index] = {
            ...student,
            ...data,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : student.dateOfBirth,
            enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : student.enrollmentDate,
            updatedAt: new Date()
        };

        return students[index];
    }

    static async delete(id: string): Promise<boolean> {
        const index = students.findIndex(s => s.id === id && !s.isDeleted);
        if (index === -1) return false;

        // Soft delete
        students[index].isDeleted = true;
        students[index].deletedAt = new Date();
        students[index].updatedAt = new Date();

        return true;
    }
}
