/**
 * Unit tests for the errorHandler middleware.
 * Tests error handling for different error types.
 */

import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { AppError, ValidationError } from '../../utils/errors';

// Mock dependencies
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../config', () => ({
  config: {
    isDev: true,
  },
}));

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      path: '/test',
      method: 'GET',
      ip: '127.0.0.1',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error',
          stack: expect.any(String),
        },
      });
    });

    it('should handle ValidationError correctly', () => {
      const errors = { email: ['Invalid email'] };
      const error = new ValidationError(errors, 'Validation failed');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors,
          stack: expect.any(String),
        },
      });
    });

    it('should handle PrismaClientKnownRequestError with code P2002', () => {
      const error = new Error('Unique constraint failed');
      error.name = 'PrismaClientKnownRequestError';
      (error as any).code = 'P2002';
      (error as any).meta = { target: ['email'] };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: '记录已存在',
          details: { field: ['email'] },
        },
      });
    });

    it('should handle PrismaClientKnownRequestError with code P2025', () => {
      const error = new Error('Record not found');
      error.name = 'PrismaClientKnownRequestError';
      (error as any).code = 'P2025';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '记录不存在',
        },
      });
    });

    it('should handle PrismaClientKnownRequestError with other codes', () => {
      const error = new Error('Database error');
      error.name = 'PrismaClientKnownRequestError';
      (error as any).code = 'P9999';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database error',
        },
      });
    });

    it('should handle JsonWebTokenError', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '无效的认证令牌',
        },
      });
    });

    it('should handle TokenExpiredError', () => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: '认证令牌已过期',
        },
      });
    });

    it('should handle unknown errors with 500 status', () => {
      const error = new Error('Unknown error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Unknown error',
          stack: expect.any(String),
        },
      });
    });

    it('should log errors', () => {
      const { logger } = require('../../utils/logger');
      const error = new Error('Test error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(logger.error).toHaveBeenCalledWith('Error:', {
        message: 'Test error',
        stack: expect.any(String),
        path: '/test',
        method: 'GET',
        ip: '127.0.0.1',
      });
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 for unknown routes', () => {
      mockReq = {
        path: '/unknown',
        method: 'GET',
      };

      notFoundHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '路由 GET /unknown 不存在',
        },
      });
    });

    it('should include method and path in error message', () => {
      mockReq = {
        path: '/api/test',
        method: 'POST',
      };

      notFoundHandler(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '路由 POST /api/test 不存在',
        },
      });
    });
  });
});
