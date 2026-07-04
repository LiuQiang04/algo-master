/**
 * Unit tests for the validate middleware.
 * Tests request validation using Joi schemas.
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validate, commonSchemas } from '../../middleware/validate';
import { ValidationError } from '../../utils/errors';

describe('Validate Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('validate function', () => {
    it('should call next() when validation passes', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });
      mockReq.body = { name: 'Test' };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw ValidationError when validation fails', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });
      mockReq.body = {};

      const middleware = validate(schema);

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(ValidationError);
    });

    it('should strip unknown fields', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });
      mockReq.body = { name: 'Test', unknown: 'field' };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body).toEqual({ name: 'Test' });
    });

    it('should allow unknown fields in query source', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
      });
      mockReq.query = { page: '1', unknown: 'field' };

      const middleware = validate(schema, 'query');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate body source by default', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });
      mockReq.body = { name: 'Test' };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate query source when specified', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1).required(),
      });
      mockReq.query = { page: '1' };

      const middleware = validate(schema, 'query');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate params source when specified', () => {
      const schema = Joi.object({
        id: Joi.string().uuid().required(),
      });
      mockReq.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      const middleware = validate(schema, 'params');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should collect multiple validation errors', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });
      mockReq.body = {};

      const middleware = validate(schema);

      try {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.errors).toHaveProperty('name');
        expect(validationError.errors).toHaveProperty('email');
      }
    });

    it('should use default values when not provided', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
      });
      mockReq.query = {};

      const middleware = validate(schema, 'query');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.query).toEqual({ page: 1, limit: 20 });
    });

    it('should convert string numbers to numbers', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1).required(),
      });
      mockReq.query = { page: '5' };

      const middleware = validate(schema, 'query');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.query).toEqual({ page: 5 });
    });
  });

  describe('commonSchemas', () => {
    describe('pagination', () => {
      it('should validate valid pagination params', () => {
        const { error } = commonSchemas.pagination.validate({
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });

        expect(error).toBeUndefined();
      });

      it('should use default values', () => {
        const { value } = commonSchemas.pagination.validate({});

        expect(value).toEqual({
          page: 1,
          limit: 20,
          sortOrder: 'desc',
        });
      });

      it('should reject page less than 1', () => {
        const { error } = commonSchemas.pagination.validate({ page: 0 });

        expect(error).toBeDefined();
      });

      it('should reject limit greater than 100', () => {
        const { error } = commonSchemas.pagination.validate({ limit: 101 });

        expect(error).toBeDefined();
      });

      it('should reject invalid sortOrder', () => {
        const { error } = commonSchemas.pagination.validate({ sortOrder: 'invalid' });

        expect(error).toBeDefined();
      });
    });

    describe('id', () => {
      it('should validate valid UUID', () => {
        const { error } = commonSchemas.id.validate({
          id: '123e4567-e89b-12d3-a456-426614174000',
        });

        expect(error).toBeUndefined();
      });

      it('should reject invalid UUID', () => {
        const { error } = commonSchemas.id.validate({ id: 'invalid-uuid' });

        expect(error).toBeDefined();
      });

      it('should require id field', () => {
        const { error } = commonSchemas.id.validate({});

        expect(error).toBeDefined();
      });
    });

    describe('search', () => {
      it('should validate valid search params', () => {
        const { error } = commonSchemas.search.validate({
          q: 'test query',
          page: 1,
          limit: 20,
        });

        expect(error).toBeUndefined();
      });

      it('should require q field', () => {
        const { error } = commonSchemas.search.validate({});

        expect(error).toBeDefined();
      });

      it('should reject empty q', () => {
        const { error } = commonSchemas.search.validate({ q: '' });

        expect(error).toBeDefined();
      });

      it('should reject q longer than 100 characters', () => {
        const { error } = commonSchemas.search.validate({
          q: 'a'.repeat(101),
        });

        expect(error).toBeDefined();
      });

      it('should use default values', () => {
        const { value } = commonSchemas.search.validate({ q: 'test' });

        expect(value).toEqual({
          q: 'test',
          page: 1,
          limit: 20,
        });
      });
    });
  });
});
