import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import chaiHttp from 'chai-http';
import app from '../../server';
import { cleanupDatabase, seedTestData, prisma } from '../setup';
import { TaskStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';

const chai = require('chai');
chai.use(chaiHttp);

describe('Task Routes', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const { user } = await seedTestData();
    testUser = user;
    authToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key');
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      // Clean up tasks for this specific test
      await prisma.task.deleteMany({ where: { userId: testUser.id } });

      const res = await chai.request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.tasks).to.be.an('array').that.is.empty;
      expect(res.body.data.pagination.total).to.equal(0);
    });

    it('should return all tasks with pagination', async () => {
      const res = await chai.request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.tasks).to.have.length(3);
      expect(res.body.data.pagination.total).to.equal(3);
    });

    it('should filter tasks by status', async () => {
      const res = await chai.request(app)
        .get('/api/tasks?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.tasks).to.have.length(1);
      expect(res.body.data.tasks[0].status).to.equal('PENDING');
    });

    it('should handle pagination parameters', async () => {
      const res = await chai.request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.tasks).to.have.length(2);
      expect(res.body.data.pagination.page).to.equal(1);
      expect(res.body.data.pagination.limit).to.equal(2);
      expect(res.body.data.pagination.pages).to.equal(2);
    });

    it('should return error for invalid pagination parameters', async () => {
      const res = await chai.request(app)
        .get('/api/tasks?page=0&limit=200')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res).to.have.status(400);
      expect(res.body.success).to.be.false;
      expect(res.body.error.message).to.include('Invalid pagination parameters');
    });
  });

  describe('GET /api/tasks/stats', () => {
    it('should return task statistics', async () => {
      const res = await chai.request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.total).to.equal(3);
      expect(res.body.data.pending).to.equal(1);
      expect(res.body.data.inProgress).to.equal(1);
      expect(res.body.data.completed).to.equal(1);
    });
  });

  describe('GET /api/tasks/:id', () => {
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
      const res = await chai.request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.id).to.equal(taskId);
      expect(res.body.data.title).to.equal('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = 'non-existent-id';

      const res = await chai.request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res).to.have.status(404);
      expect(res.body.success).to.be.false;
      expect(res.body.error.message).to.equal('Task not found');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with all fields', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New description',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      };

      const res = await chai.request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(res).to.have.status(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.title).to.equal(taskData.title);
      expect(res.body.data.description).to.equal(taskData.description);
      expect(res.body.data.status).to.equal(taskData.status);
      expect(res.body.data).to.have.property('id');
    });

    it('should create a task with minimal required fields', async () => {
      const taskData = {
        title: 'Minimal Task',
      };

      const res = await chai.request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(res).to.have.status(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.title).to.equal(taskData.title);
      expect(res.body.data.status).to.equal('PENDING'); // Default status
    });

    it('should return validation error for missing title', async () => {
      const taskData = {
        description: 'Task without title',
      };

      const res = await chai.request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(res).to.have.status(400);
      expect(res.body.success).to.be.false;
    });

    it('should return validation error for invalid status', async () => {
      const taskData = {
        title: 'Task with invalid status',
        status: 'INVALID_STATUS',
      };

      const res = await chai.request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(res).to.have.status(400);
      expect(res.body.success).to.be.false;
    });

    it('should return validation error for invalid due date', async () => {
      const taskData = {
        title: 'Task with invalid date',
        dueDate: 'invalid-date',
      };

      const res = await chai.request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(res).to.have.status(400);
      expect(res.body.success).to.be.false;
    });
  });

  describe('PUT /api/tasks/:id', () => {
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

    it('should update a task', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'IN_PROGRESS',
      };

      const res = await chai.request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.title).to.equal(updateData.title);
      expect(res.body.data.status).to.equal(updateData.status);
      expect(res.body.data.description).to.equal('Original description'); // Should remain unchanged
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = 'non-existent-id';
      const updateData = { title: 'Updated Task' };

      const res = await chai.request(app)
        .put(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res).to.have.status(404);
      expect(res.body.success).to.be.false;
      expect(res.body.error.message).to.equal('Task not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
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
      const res = await chai.request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.message).to.equal('Task deleted successfully');

      // Verify task is deleted
      const deletedTask = await prisma.task.findUnique({
        where: { id: taskId },
      });
      expect(deletedTask).to.be.null;
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = 'non-existent-id';

      const res = await chai.request(app)
        .delete(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res).to.have.status(404);
      expect(res.body.success).to.be.false;
      expect(res.body.error.message).to.equal('Task not found');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await chai.request(app).get('/health');

      expect(res).to.have.status(200);
      expect(res.body.status).to.equal('OK');
      expect(res.body).to.have.property('timestamp');
      expect(res.body).to.have.property('environment');
    });
  });
});
