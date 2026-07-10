/**
 * Integration tests for API request/contract patterns.
 * Tests the actual validate middleware + errorHandler composition with supertest,
 * rather than reimplementing mock routes.
 */

import express from 'express';
import request from 'supertest';
import Joi from 'joi';
import { validate, commonSchemas } from '../../middleware/validate';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';

describe('API Contract: Validation + Error Handling', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Body validation', () => {
    it('should accept valid request body', async () => {
      app.post('/api/test', validate(Joi.object({
        title: Joi.string().required(),
        content: Joi.string().required(),
      })), (req, res) => {
        res.status(201).json({ received: req.body });
      });
      app.use(errorHandler);

      const res = await request(app)
        .post('/api/test')
        .send({ title: 'Hello', content: 'World' });

      expect(res.status).toBe(201);
      expect(res.body.received.title).toBe('Hello');
    });

    it('should reject request with missing required fields', async () => {
      app.post('/api/test', validate(Joi.object({
        title: Joi.string().required(),
      })), (req, res) => {
        res.status(201).json({ received: req.body });
      });
      app.use(errorHandler);

      const res = await request(app)
        .post('/api/test')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Pagination schema', () => {
    it('should accept default pagination values', () => {
      const { value, error } = commonSchemas.pagination.validate({});
      expect(error).toBeUndefined();
      expect(value.page).toBe(1);
      expect(value.limit).toBe(20);
    });

    it('should reject page < 1', () => {
      const { error } = commonSchemas.pagination.validate({ page: 0 });
      expect(error).toBeDefined();
    });
  });

  describe('Error response format', () => {
    it('should return standardized 404 error shape for unknown routes', async () => {
      app.use(notFoundHandler);
      app.use(errorHandler);

      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(res.body.error).toHaveProperty('message');
    });
  });
});
