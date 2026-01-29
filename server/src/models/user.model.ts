import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { User, CreateUserDTO, UserRole } from '../types/auth.types';

export class UserModel {
    private static users: User[] = [];

    // Initialize with a default admin user for testing
    static {
        const adminPassword = bcrypt.hashSync('admin123', 10);
        const teacherPassword = bcrypt.hashSync('teacher123', 10);

        this.users.push({
            id: uuidv4(),
            email: 'admin@edusphere.com',
            passwordHash: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.ADMIN,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        this.users.push({
            id: uuidv4(),
            email: 'teacher@edusphere.com',
            passwordHash: teacherPassword,
            firstName: 'Teacher',
            lastName: 'Demo',
            role: UserRole.TEACHER,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }

    static async findAll(): Promise<User[]> {
        return this.users;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        return user || null;
    }

    static async findById(id: string): Promise<User | null> {
        const user = this.users.find(u => u.id === id);
        return user || null;
    }

    static async create(data: CreateUserDTO): Promise<User> {
        const existingUser = await this.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const newUser: User = {
            id: uuidv4(),
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.users.push(newUser);
        return newUser;
    }

    static async verifyPassword(user: User, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.passwordHash);
    }

    static async updateLastLogin(userId: string): Promise<void> {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.lastLogin = new Date().toISOString();
            user.updatedAt = new Date().toISOString();
        }
    }

    static async findByRole(role: UserRole): Promise<User[]> {
        return this.users.filter(u => u.role === role && u.isActive);
    }

    static sanitizeUser(user: User): Omit<User, 'passwordHash'> {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }
}
