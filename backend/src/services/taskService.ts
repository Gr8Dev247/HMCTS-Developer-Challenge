import { PrismaClient, TaskStatus, Task } from '@prisma/client';
import { CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class TaskService {
  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskRequest, userId: string): Promise<Task> {
    try {
      const { title, description, status = TaskStatus.PENDING, dueDate } = taskData;

      const task = await prisma.task.create({
        data: {
          title,
          description,
          status,
          dueDate: dueDate ? new Date(dueDate) : null,
          userId,
        },
      });

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw createError('Failed to create task', 500);
    }
  }

  /**
   * Get all tasks with optional filtering and pagination
   */
  async getAllTasks(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: TaskStatus
  ): Promise<{ tasks: Task[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      const where = { 
        userId,
        ...(status && { status })
      };

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.task.count({ where }),
      ]);

      const pages = Math.ceil(total / limit);

      return { tasks, total, pages };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw createError('Failed to fetch tasks', 500);
    }
  }

  /**
   * Get a task by ID
   */
  async getTaskById(id: string, userId: string): Promise<Task> {
    try {
      const task = await prisma.task.findFirst({
        where: { 
          id,
          userId
        },
      });

      if (!task) {
        throw createError('Task not found', 404);
      }

      return task;
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        throw error;
      }
      console.error('Error fetching task:', error);
      throw createError('Failed to fetch task', 500);
    }
  }

  /**
   * Update a task
   */
  async updateTask(id: string, updateData: UpdateTaskRequest, userId: string): Promise<Task> {
    try {
      // Check if task exists and belongs to user
      await this.getTaskById(id, userId);

      const updatePayload: any = {};
      
      if (updateData.title !== undefined) updatePayload.title = updateData.title;
      if (updateData.description !== undefined) updatePayload.description = updateData.description;
      if (updateData.status !== undefined) updatePayload.status = updateData.status;
      if (updateData.dueDate !== undefined) {
        updatePayload.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
      }

      const task = await prisma.task.update({
        where: { id },
        data: updatePayload,
      });

      return task;
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        throw error;
      }
      console.error('Error updating task:', error);
      throw createError('Failed to update task', 500);
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string, userId: string): Promise<void> {
    try {
      // Check if task exists and belongs to user
      await this.getTaskById(id, userId);

      await prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        throw error;
      }
      console.error('Error deleting task:', error);
      throw createError('Failed to delete task', 500);
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      const where = { userId };
      
      const [total, pending, inProgress, completed, cancelled] = await Promise.all([
        prisma.task.count({ where }),
        prisma.task.count({ where: { ...where, status: TaskStatus.PENDING } }),
        prisma.task.count({ where: { ...where, status: TaskStatus.IN_PROGRESS } }),
        prisma.task.count({ where: { ...where, status: TaskStatus.COMPLETED } }),
        prisma.task.count({ where: { ...where, status: TaskStatus.CANCELLED } }),
      ]);

      return { total, pending, inProgress, completed, cancelled };
    } catch (error) {
      console.error('Error fetching task statistics:', error);
      throw createError('Failed to fetch task statistics', 500);
    }
  }
}
