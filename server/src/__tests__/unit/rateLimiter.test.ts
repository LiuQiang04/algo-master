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
});
