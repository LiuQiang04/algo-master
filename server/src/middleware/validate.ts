import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';

// 验证中间件工厂函数
export function validate(schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: source === 'query',
    });

    if (error) {
      const errors: Record<string, string[]> = {};
      error.details.forEach((detail) => {
        const key = detail.path.join('.');
        if (!errors[key]) {
          errors[key] = [];
        }
        errors[key].push(detail.message);
      });
      throw new ValidationError(errors);
    }

    // 将验证后的数据写回请求
    req[source] = value;
    next();
  };
}

// 常用验证规则
export const commonSchemas = {
  // 分页参数
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.valid('asc', 'desc').default('desc'),
  }),

  // UUID参数
  id: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // 搜索参数
  search: Joi.object({
    q: Joi.string().min(1).max(100).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};
