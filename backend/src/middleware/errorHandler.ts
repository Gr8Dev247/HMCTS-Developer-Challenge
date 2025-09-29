import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Prisma validation error
  if (err.name === 'PrismaClientValidationError') {
    const message = 'Invalid data provided';
    error = { ...error, message, statusCode: 400 };
  }

  // Prisma unique constraint error
  if (err.name === 'PrismaClientKnownRequestError') {
    const message = 'Resource already exists';
    error = { ...error, message, statusCode: 409 };
  }

  // Prisma not found error
  if (err.name === 'NotFoundError') {
    const message = 'Resource not found';
    error = { ...error, message, statusCode: 404 };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
