import { PrismaClient } from '@prisma/client';

// Test database setup - using in-memory SQLite for tests
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db', // In-memory SQLite database
    },
  },
});

// Clean up test database before each test
export const cleanupDatabase = async (): Promise<void> => {
  // Delete in correct order due to foreign key constraints
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
};

// Seed test data
export const seedTestData = async (): Promise<{ user: any; tasks: any[] }> => {
  // Create a test user with unique email
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`, // Unique email
      password: 'hashedpassword',
      role: 'caseworker',
    },
  });

  // Create tasks associated with the user
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Test Task 1',
        description: 'Test description 1',
        status: 'PENDING',
        dueDate: new Date('2024-12-31'),
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Test Task 2',
        description: 'Test description 2',
        status: 'IN_PROGRESS',
        dueDate: new Date('2024-12-30'),
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Test Task 3',
        description: 'Test description 3',
        status: 'COMPLETED',
        userId: user.id,
      },
    }),
  ]);

  return { user, tasks };
};
