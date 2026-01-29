import { v4 as uuidv4 } from 'uuid';
import { Class, CreateClassDTO } from '../types/schedule.types';

export class ClassModel {
    private static classes: Class[] = [];

    static {
        // Seed some classes
        const initialClasses: CreateClassDTO[] = [
            { grade: '10', section: 'A', academicYear: '2025-2026' },
            { grade: '10', section: 'B', academicYear: '2025-2026' },
            { grade: '11', section: 'A', academicYear: '2025-2026' },
            { grade: '12', section: 'S1', academicYear: '2025-2026' },
        ];

        initialClasses.forEach(c => {
            this.classes.push({
                id: uuidv4(),
                ...c,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        });
    }

    static async findAll(): Promise<Class[]> {
        return this.classes;
    }

    static async findById(id: string): Promise<Class | null> {
        return this.classes.find(c => c.id === id) || null;
    }

    static async create(data: CreateClassDTO): Promise<Class> {
        const newClass: Class = {
            id: uuidv4(),
            ...data,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.classes.push(newClass);
        return newClass;
    }

    static async update(id: string, data: Partial<CreateClassDTO> & { isActive?: boolean }): Promise<Class | null> {
        const index = this.classes.findIndex(c => c.id === id);
        if (index === -1) return null;

        const updatedClass = {
            ...this.classes[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        this.classes[index] = updatedClass;
        return updatedClass;
    }

    static async delete(id: string): Promise<boolean> {
        const initialLength = this.classes.length;
        this.classes = this.classes.filter(c => c.id !== id);
        return this.classes.length < initialLength;
    }
}
