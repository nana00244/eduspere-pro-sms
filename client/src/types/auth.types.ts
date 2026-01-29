export const UserRole = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
    PARENT: 'parent'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface AuthResponse {
    success: boolean;
    data?: {
        user: User;
        token: string;
        refreshToken: string;
    };
    message?: string;
}
