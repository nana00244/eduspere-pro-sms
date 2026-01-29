import { v4 as uuidv4 } from 'uuid';
import { Grade, GradeEntryDTO } from '../types/grade.types';

class GradeModel {
    private grades: Grade[] = [];

    async create(dto: GradeEntryDTO, teacherId: string): Promise<Grade> {
        const newGrade: Grade = {
            id: uuidv4(),
            ...dto,
            teacherId,
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.grades.push(newGrade);
        return newGrade;
    }

    async findByStudent(studentId: string): Promise<Grade[]> {
        return this.grades.filter(g => g.studentId === studentId);
    }

    async findById(id: string): Promise<Grade | undefined> {
        return this.grades.find(g => g.id === id);
    }

    async update(id: string, updates: Partial<GradeEntryDTO>): Promise<Grade | undefined> {
        const index = this.grades.findIndex(g => g.id === id);
        if (index === -1) return undefined;

        this.grades[index] = {
            ...this.grades[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        return this.grades[index];
    }

    async delete(id: string): Promise<boolean> {
        const initialLength = this.grades.length;
        this.grades = this.grades.filter(g => g.id !== id);
        return this.grades.length < initialLength;
    }

    async getStudentStats(studentId: string): Promise<{ average: number; total: number }> {
        const studentGrades = this.grades.filter(g => g.studentId === studentId);
        if (studentGrades.length === 0) return { average: 0, total: 0 };

        const sum = studentGrades.reduce((acc, g) => acc + (g.score / g.maxScore) * 100, 0);
        return {
            average: Math.round(sum / studentGrades.length),
            total: studentGrades.length
        };
    }

    async getSubjectStats(): Promise<{ subject: string; average: number; total: number }[]> {
        const subjects = Array.from(new Set(this.grades.map(g => g.subject)));
        return subjects.map(subject => {
            const subjectGrades = this.grades.filter(g => g.subject === subject);
            const sum = subjectGrades.reduce((acc, g) => acc + (g.score / g.maxScore) * 100, 0);
            return {
                subject,
                average: Math.round(sum / subjectGrades.length),
                total: subjectGrades.length
            };
        });
    }
}

export const gradeModel = new GradeModel();
