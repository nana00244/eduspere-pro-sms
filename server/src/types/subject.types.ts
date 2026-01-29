export interface Subject {
    id: string;
    name: string;
    code: string;
    department: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubjectDTO {
    name: string;
    code: string;
    department: string;
    description?: string;
}

export interface UpdateSubjectDTO extends Partial<CreateSubjectDTO> {
    isActive?: boolean;
}
