import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterRequest, LoginRequest, UserResponse, AuthResponse } from '../types/user';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class UserService {
  private readonly jwtSecret: string;
  private readonly saltRounds: number = 12;

  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    this.jwtSecret = jwtSecret;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { name, email, password, role = 'caseworker' } = userData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw createError('User with this email already exists', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const token = this.generateToken(user.id);

      return {
        user,
        token,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'User with this email already exists') {
        throw error;
      }
      console.error('Error registering user:', error);
      throw createError('Failed to register user', 500);
    }
  }

  /**
   * Login user
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      const { email, password } = loginData;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw createError('Invalid email or password', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401);
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Return user data without password
      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      };

      return {
        user: userResponse,
        token,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email or password') {
        throw error;
      }
      console.error('Error logging in user:', error);
      throw createError('Failed to login', 500);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      return user;
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        throw error;
      }
      console.error('Error getting user profile:', error);
      throw createError('Failed to get user profile', 500);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateData: { name?: string; email?: string }): Promise<UserResponse> {
    try {
      const { name, email } = updateData;

      // Check if email is being updated and if it's already taken
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email
          },
        });

        if (existingUser) {
          throw createError('Email is already taken', 409);
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Error && error.message === 'Email is already taken') {
        throw error;
      }
      console.error('Error updating user profile:', error);
      throw createError('Failed to update user profile', 500);
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }
}
