import { v4 as uuidv4 } from 'uuid';
import { ScheduleSlot, CreateScheduleSlotDTO } from '../types/schedule.types';

export class ScheduleModel {
    private static slots: ScheduleSlot[] = [];

    static async findByClassId(classId: string): Promise<ScheduleSlot[]> {
        return this.slots.filter(s => s.classId === classId);
    }

    static async findByStaffId(staffId: string): Promise<ScheduleSlot[]> {
        return this.slots.filter(s => s.staffId === staffId);
    }

    static async create(data: CreateScheduleSlotDTO): Promise<ScheduleSlot> {
        // Basic conflict check
        const conflicts = this.slots.filter(s =>
            s.day === data.day &&
            ((data.startTime >= s.startTime && data.startTime < s.endTime) ||
                (data.endTime > s.startTime && data.endTime <= s.endTime)) &&
            (s.classId === data.classId || s.staffId === data.staffId)
        );

        if (conflicts.length > 0) {
            throw new Error('Schedule conflict detected for this teacher or class at the given time.');
        }

        const newSlot: ScheduleSlot = {
            id: uuidv4(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.slots.push(newSlot);
        return newSlot;
    }

    static async delete(id: string): Promise<boolean> {
        const initialLength = this.slots.length;
        this.slots = this.slots.filter(s => s.id !== id);
        return this.slots.length < initialLength;
    }
}
