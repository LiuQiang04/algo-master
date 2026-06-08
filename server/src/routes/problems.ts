import { Router } from 'express';
import * as problemController from '../controllers/problemController';
import { authenticate, adminOnly, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Joi from 'joi';

const router = Router();

// 验证规则
const createProblemSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().required(),
  inputFormat: Joi.string().allow('').optional(),
  outputFormat: Joi.string().allow('').optional(),
  sampleInput: Joi.string().allow('').optional(),
  sampleOutput: Joi.string().allow('').optional(),
  difficulty: Joi.number().integer().min(1).max(5).required(),
  timeLimit: Joi.number().integer().min(100).max(10000).default(1000),
  memoryLimit: Joi.number().integer().min(16).max(1024).default(256),
  tags: Joi.array().items(Joi.string()).optional(),
  testCases: Joi.array().items(
    Joi.object({
      input: Joi.string().required(),
      expectedOutput: Joi.string().required(),
      isSample: Joi.boolean().default(false),
    })
  ).optional(),
});

const updateProblemSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().optional(),
  inputFormat: Joi.string().allow('').optional(),
  outputFormat: Joi.string().allow('').optional(),
  sampleInput: Joi.string().allow('').optional(),
  sampleOutput: Joi.string().allow('').optional(),
  difficulty: Joi.number().integer().min(1).max(5).optional(),
  timeLimit: Joi.number().integer().min(100).max(10000).optional(),
  memoryLimit: Joi.number().integer().min(16).max(1024).optional(),
  isPublic: Joi.boolean().optional(),
});

// 路由
router.get('/', problemController.getProblems);
router.get('/tags', problemController.getTags);
router.get('/random', problemController.getRandomProblem);
router.get('/:id', optionalAuth, problemController.getProblemById);

// 管理员路由
router.post('/', authenticate, adminOnly, validate(createProblemSchema), problemController.createProblem);
router.put('/:id', authenticate, adminOnly, validate(updateProblemSchema), problemController.updateProblem);
router.delete('/:id', authenticate, adminOnly, problemController.deleteProblem);

export default router;
