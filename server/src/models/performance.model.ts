import { v4 as uuidv4 } from 'uuid';
import { PerformanceReview, CreatePerformanceReviewDTO } from '../types/performance.types';

export class PerformanceModel {
    private static reviews: PerformanceReview[] = [];

    static async findByStaffId(staffId: string): Promise<PerformanceReview[]> {
        return this.reviews.filter(r => r.staffId === staffId);
    }

    static async create(data: CreatePerformanceReviewDTO): Promise<PerformanceReview> {
        const newReview: PerformanceReview = {
            id: uuidv4(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.reviews.push(newReview);
        return newReview;
    }

    static async delete(id: string): Promise<boolean> {
        const initialLength = this.reviews.length;
        this.reviews = this.reviews.filter(r => r.id !== id);
        return this.reviews.length < initialLength;
    }

    static async getAllStats(): Promise<{ staffId: string, averageRating: number, reviewCount: number }[]> {
        const staffIds = Array.from(new Set(this.reviews.map(r => r.staffId)));
        return staffIds.map(staffId => {
            const staffReviews = this.reviews.filter(r => r.staffId === staffId);
            const averageRating = staffReviews.length > 0
                ? staffReviews.reduce((sum, r) => sum + r.rating, 0) / staffReviews.length
                : 0;
            return {
                staffId,
                averageRating: Math.round(averageRating * 10) / 10,
                reviewCount: staffReviews.length
            };
        });
    }
}
