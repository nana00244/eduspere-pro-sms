import { v4 as uuidv4 } from 'uuid';
import { Subject, CreateSubjectDTO, UpdateSubjectDTO } from '../types/subject.types';

export class SubjectModel {
    private static subjects: Subject[] = [];

    static {
        // Seed some initial subjects
        const initialSubjects: CreateSubjectDTO[] = [
            { name: 'Mathematics', code: 'MATH101', department: 'Science' },
            { name: 'Physics', code: 'PHYS101', department: 'Science' },
            { name: 'English Literature', code: 'ENG101', department: 'Languages' },
            { name: 'History', code: 'HIS101', department: 'Humanities' },
            { name: 'ICT', code: 'ICT101', department: 'Technology' },
        ];

        initialSubjects.forEach(s => {
            this.subjects.push({
                id: uuidv4(),
                ...s,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        });
    }

    static async findAll(): Promise<Subject[]> {
        return this.subjects;
    }

    static async findById(id: string): Promise<Subject | null> {
        return this.subjects.find(s => s.id === id) || null;
    }

    static async create(data: CreateSubjectDTO): Promise<Subject> {
        const newSubject: Subject = {
            id: uuidv4(),
            ...data,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.subjects.push(newSubject);
        return newSubject;
    }

    static async update(id: string, data: UpdateSubjectDTO): Promise<Subject | null> {
        const index = this.subjects.findIndex(s => s.id === id);
        if (index === -1) return null;

        const updatedSubject = {
            ...this.subjects[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        this.subjects[index] = updatedSubject;
        return updatedSubject;
    }

    static async delete(id: string): Promise<boolean> {
        const initialLength = this.subjects.length;
        this.subjects = this.subjects.filter(s => s.id !== id);
        return this.subjects.length < initialLength;
    }
}
