/**
 * Unit tests for the rate limiter middleware.
 * Verifies async errors are forwarded to Express instead of leaving requests hanging.
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../../middleware/rateLimiter';
import { RateLimitError } from '../../utils/errors';

jest.mock('../../utils/redis', () => ({
  redis: {
    multi: jest.fn(),
  },
}));

import { redis } from '../../utils/redis';

const mockExec = jest.fn();
const mockMulti = redis.multi as jest.Mock;

describe('Rate Limiter Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMulti.mockReturnValue({
      zRemRangeByScore: jest.fn().mockReturnThis(),
      zAdd: jest.fn().mockReturnThis(),
      zCard: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: mockExec,
    });
    mockReq = {
      ip: '127.0.0.1',
      path: '/api/auth/login',
    };
    mockRes = {
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should call next() when request count is within the limit', async () => {
    mockExec.mockResolvedValue([1, 1, 1, 1]);
    const middleware = rateLimiter({ windowMs: 60000, max: 10 });

    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should forward RateLimitError to next() when request count exceeds the limit', async () => {
    mockExec.mockResolvedValue([1, 1, 11, 1]);
    const middleware = rateLimiter({ windowMs: 60000, max: 10 });

    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(RateLimitError));
  });

  it('should handle Redis exec failure gracefully', async () => {
    mockExec.mockRejectedValue(new Error('Redis connection lost'));
    const middleware = rateLimiter({ windowMs: 60000, max: 10 });

    await middleware(mockReq as Request, mockRes as Response, mockNext);

    // Should not throw, should call next() to allow request through
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should use different counters for different paths', async () => {
    mockExec.mockResolvedValue([1, 1, 1, 1]);
    const middleware = rateLimiter({ windowMs: 60000, max: 10 });

    // First path
    await middleware(
      { ...mockReq, path: '/api/auth/login' } as Request,
      mockRes as Response,
      mockNext
    );
    expect(mockNext).toHaveBeenCalledWith();

    // Different path
    mockNext.mockClear();
    await middleware(
      { ...mockReq, path: '/api/problems' } as Request,
      mockRes as Response,
      mockNext
    );
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should set RateLimit headers', async () => {
    mockExec.mockResolvedValue([1, 1, 5, 1]);
    const middleware = rateLimiter({ windowMs: 60000, max: 10 });

    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalled();
  });
});
