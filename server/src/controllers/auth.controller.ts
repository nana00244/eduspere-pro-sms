import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { LoginCredentials, TokenPayload, AuthResponse } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'edusphere-dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = '1h'; // Use literal instead of env var to avoid type issues
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // Use literal instead of env var to avoid type issues

export class AuthController {
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, rememberMe }: LoginCredentials = req.body;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
                return;
            }

            // Find user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            // Check if user is active
            if (!user.isActive) {
                res.status(403).json({
                    success: false,
                    message: 'Account is deactivated'
                });
                return;
            }

            // Verify password
            const isPasswordValid = await UserModel.verifyPassword(user, password);
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            // Update last login
            await UserModel.updateLastLogin(user.id);

            // Generate tokens
            const tokenPayload: TokenPayload = {
                userId: user.id,
                email: user.email,
                role: user.role
            };

            const expiresIn = rememberMe ? REFRESH_TOKEN_EXPIRES_IN : JWT_EXPIRES_IN;
            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn } as SignOptions);
            const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, {
                expiresIn: REFRESH_TOKEN_EXPIRES_IN
            } as SignOptions);

            const response: AuthResponse = {
                success: true,
                data: {
                    user: UserModel.sanitizeUser(user),
                    token,
                    refreshToken
                },
                message: 'Login successful'
            };

            res.json(response);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const user = await UserModel.findById(req.user.userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                data: UserModel.sanitizeUser(user)
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get user',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token required'
                });
                return;
            }

            const decoded = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload;

            // Generate new access token
            const tokenPayload: TokenPayload = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };

            const newToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);

            res.json({
                success: true,
                data: {
                    token: newToken
                }
            });
        } catch (error) {
            res.status(403).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        // In a stateless JWT setup, logout is handled client-side
        // For production, you might want to implement token blacklisting
        res.json({
            success: true,
            message: 'Logout successful'
        });
    }

    static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserModel.findAll();
            const sanitized = users.map(u => UserModel.sanitizeUser(u));
            res.json({ success: true, data: sanitized });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching users',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
