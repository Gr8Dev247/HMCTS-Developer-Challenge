import { Router, Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { TaskStatus } from '@prisma/client';
import {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  handleValidationErrors,
} from '../validation/taskValidation';
import { ApiResponse } from '../types/task';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const taskService = new TaskService();

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with optional filtering and pagination
 * @access  Private
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as TaskStatus;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
        },
      });
      return;
    }

    const result = await taskService.getAllTasks(req.user!.id, page, limit, status);

    const response: ApiResponse = {
      success: true,
      data: {
        tasks: result.tasks,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: result.pages,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await taskService.getTaskStats(req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, taskIdValidation, handleValidationErrors, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id, req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: task,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', authenticateToken, createTaskValidation, handleValidationErrors, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await taskService.createTask(req.body, req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: task,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', 
  authenticateToken,
  [...taskIdValidation, ...updateTaskValidation], 
  handleValidationErrors, 
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await taskService.updateTask(id, req.body, req.user!.id);

      const response: ApiResponse = {
        success: true,
        data: task,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', authenticateToken, taskIdValidation, handleValidationErrors, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await taskService.deleteTask(id, req.user!.id);

    const response: ApiResponse = {
      success: true,
      data: { message: 'Task deleted successfully' },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
