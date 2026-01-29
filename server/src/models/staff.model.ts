import { v4 as uuidv4 } from 'uuid';
import { Staff, CreateStaffDTO, UpdateStaffDTO } from '../types/staff.types';

export class StaffModel {
    private static staffMembers: Staff[] = [];

    static async findAll(): Promise<Staff[]> {
        return this.staffMembers;
    }

    static async findById(id: string): Promise<Staff | null> {
        return this.staffMembers.find(s => s.id === id) || null;
    }

    static async findByUserId(userId: string): Promise<Staff | null> {
        return this.staffMembers.find(s => s.userId === userId) || null;
    }

    static async create(data: CreateStaffDTO): Promise<Staff> {
        const newStaff: Staff = {
            id: uuidv4(),
            ...data,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.staffMembers.push(newStaff);
        return newStaff;
    }

    static async update(id: string, data: UpdateStaffDTO): Promise<Staff | null> {
        const index = this.staffMembers.findIndex(s => s.id === id);
        if (index === -1) return null;

        const updatedStaff = {
            ...this.staffMembers[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        this.staffMembers[index] = updatedStaff;
        return updatedStaff;
    }

    static async delete(id: string): Promise<boolean> {
        const initialLength = this.staffMembers.length;
        this.staffMembers = this.staffMembers.filter(s => s.id !== id);
        return this.staffMembers.length < initialLength;
    }
}
