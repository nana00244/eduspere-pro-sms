export interface PerformanceReview {
    id: string;
    staffId: string;
    reviewerId: string; // Admin who reviewed
    reviewDate: string;
    rating: number; // 1-5
    comments: string;
    strengths: string[];
    areasForImprovement: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreatePerformanceReviewDTO {
    staffId: string;
    reviewerId: string;
    reviewDate: string;
    rating: number;
    comments: string;
    strengths: string[];
    areasForImprovement: string[];
}
