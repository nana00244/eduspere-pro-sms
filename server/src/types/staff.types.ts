export type StaffCategory = 'Teaching' | 'Administrative' | 'Support' | 'Management';

export const StaffCategories = {
    TEACHING: 'Teaching' as StaffCategory,
    ADMINISTRATIVE: 'Administrative' as StaffCategory,
    SUPPORT: 'Support' as StaffCategory,
    MANAGEMENT: 'Management' as StaffCategory,
};

export interface Staff {
    id: string;
    userId: string; // Link to the Auth User
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    category: StaffCategory;
    specialization: string[]; // e.g., ["Mathematics", "Physics"]
    joinedDate: string;
    qualification: string;
    experience: string; // e.g., "5 years"
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStaffDTO {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    category: StaffCategory;
    specialization: string[];
    joinedDate: string;
    qualification: string;
    experience: string;
}

export interface UpdateStaffDTO extends Partial<CreateStaffDTO> {
    isActive?: boolean;
}
