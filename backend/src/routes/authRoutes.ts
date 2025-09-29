import { Router, Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse } from '../types/user';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  registerValidation,
  loginValidation,
  handleValidationErrors,
} from '../validation/userValidation';

const router = Router();
const userService = new UserService();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, handleValidationErrors, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authResponse = await userService.register(req.body);

    const response: ApiResponse = {
      success: true,
      data: authResponse,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, handleValidationErrors, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authResponse = await userService.login(req.body);

    const response: ApiResponse = {
      success: true,
      data: authResponse,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getUserProfile(req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.updateUserProfile(req.user!.id, req.body);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
