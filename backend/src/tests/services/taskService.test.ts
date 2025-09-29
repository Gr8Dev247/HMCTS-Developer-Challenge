import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { TaskService } from '../../services/taskService';
import { TaskStatus } from '@prisma/client';
import { cleanupDatabase, seedTestData, prisma } from '../setup';

describe('TaskService', () => {
  let taskService: TaskService;
  let testUser: any;

  beforeEach(async () => {
    taskService = new TaskService();
    await cleanupDatabase();
    const { user } = await seedTestData();
    testUser = user;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('createTask', () => {
    it('should create a task with all required fields', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        status: TaskStatus.PENDING,
        dueDate: '2024-12-31T00:00:00.000Z',
      };

      const task = await taskService.createTask(taskData, testUser.id);

      expect(task).to.have.property('id');
      expect(task.title).to.equal(taskData.title);
      expect(task.description).to.equal(taskData.description);
      expect(task.status).to.equal(taskData.status);
      expect(task.dueDate).to.be.instanceOf(Date);
    });

    it('should create a task with minimal required fields', async () => {
      const taskData = {
        title: 'Minimal Task',
      };

      const task = await taskService.createTask(taskData, testUser.id);

      expect(task.title).to.equal(taskData.title);
      expect(task.description).to.be.null;
      expect(task.status).to.equal(TaskStatus.PENDING);
      expect(task.dueDate).to.be.null;
    });
  });

  describe('getAllTasks', () => {
    beforeEach(async () => {
      await seedTestData();
    });

    it('should return all tasks with pagination', async () => {
      const result = await taskService.getAllTasks(testUser.id, 1, 10);

      expect(result.tasks).to.have.length(3);
      expect(result.total).to.equal(3);
      expect(result.pages).to.equal(1);
    });

    it('should filter tasks by status', async () => {
      const result = await taskService.getAllTasks(testUser.id, 1, 10, TaskStatus.PENDING);

      expect(result.tasks).to.have.length(1);
      expect(result.tasks[0].status).to.equal(TaskStatus.PENDING);
    });

    it('should handle pagination correctly', async () => {
      const result = await taskService.getAllTasks(testUser.id, 1, 2);

      expect(result.tasks).to.have.length(2);
      expect(result.total).to.equal(3);
      expect(result.pages).to.equal(2);
    });
  });

  describe('getTaskById', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          description: 'Test description',
          status: TaskStatus.PENDING,
          userId: testUser.id,
        },
      });
      taskId = task.id;
    });

    it('should return a task by ID', async () => {
      const task = await taskService.getTaskById(taskId, testUser.id);

      expect(task.id).to.equal(taskId);
      expect(task.title).to.equal('Test Task');
    });

    it('should throw error for non-existent task', async () => {
      const nonExistentId = 'non-existent-id';

      try {
        await taskService.getTaskById(nonExistentId, testUser.id);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).to.equal('Task not found');
        expect(error.statusCode).to.equal(404);
      }
    });
  });

  describe('updateTask', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Original Task',
          description: 'Original description',
          status: TaskStatus.PENDING,
          userId: testUser.id,
        },
      });
      taskId = task.id;
    });

    it('should update task fields', async () => {
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      const updatedTask = await taskService.updateTask(taskId, updateData, testUser.id);

      expect(updatedTask.title).to.equal(updateData.title);
      expect(updatedTask.status).to.equal(updateData.status);
      expect(updatedTask.description).to.equal('Original description'); // Should remain unchanged
    });

    it('should throw error for non-existent task', async () => {
      const nonExistentId = 'non-existent-id';
      const updateData = { title: 'Updated Task' };

      try {
        await taskService.updateTask(nonExistentId, updateData, testUser.id);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).to.equal('Task not found');
        expect(error.statusCode).to.equal(404);
      }
    });
  });

  describe('deleteTask', () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to Delete',
          status: TaskStatus.PENDING,
          userId: testUser.id,
        },
      });
      taskId = task.id;
    });

    it('should delete a task', async () => {
      await taskService.deleteTask(taskId, testUser.id);

      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      expect(task).to.be.null;
    });

    it('should throw error for non-existent task', async () => {
      const nonExistentId = 'non-existent-id';

      try {
        await taskService.deleteTask(nonExistentId, testUser.id);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).to.equal('Task not found');
        expect(error.statusCode).to.equal(404);
      }
    });
  });

  describe('getTaskStats', () => {
    beforeEach(async () => {
      await seedTestData();
    });

    it('should return correct task statistics', async () => {
      const stats = await taskService.getTaskStats(testUser.id);

      expect(stats.total).to.equal(3);
      expect(stats.pending).to.equal(1);
      expect(stats.inProgress).to.equal(1);
      expect(stats.completed).to.equal(1);
      expect(stats.cancelled).to.equal(0);
    });
  });
});
