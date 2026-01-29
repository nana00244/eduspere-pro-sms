export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    TEACHER = 'teacher',
    STUDENT = 'student',
    PARENT = 'parent'
}

export interface User {
    id: string;
    email: string;
    passwordHash: string;
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

export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export interface AuthResponse {
    success: boolean;
    data?: {
        user: Omit<User, 'passwordHash'>;
        token: string;
        refreshToken: string;
    };
    message?: string;
}

export interface JWTConfig {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
}

export interface CreateUserDTO {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}
