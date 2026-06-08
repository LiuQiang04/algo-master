// 基础应用错误类
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误', code: string = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问', code: string = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message: string = '禁止访问', code: string = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在', code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message: string = '资源冲突', code: string = 'CONFLICT') {
    super(message, 409, code);
  }
}

// 422 Unprocessable Entity
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(
    errors: Record<string, string[]>,
    message: string = '验证失败'
  ) {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

// 429 Too Many Requests
export class RateLimitError extends AppError {
  constructor(message: string = '请求过于频繁，请稍后再试') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// 错误响应接口
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    stack?: string;
  };
}
