import { Router } from 'express';
import * as submissionController from '../controllers/submissionController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { submissionLimiter } from '../middleware/rateLimiter';
import Joi from 'joi';

const router = Router();

// 验证规则
const createSubmissionSchema = Joi.object({
  problemId: Joi.string().uuid().required(),
  language: Joi.string().valid('cpp', 'java', 'python', 'javascript').required(),
  sourceCode: Joi.string().min(1).max(50000).required(),
  contestId: Joi.string().uuid().optional(),
});

// 路由
router.post(
  '/',
  authenticate,
  submissionLimiter,
  validate(createSubmissionSchema),
  submissionController.createSubmission
);

router.get('/', authenticate, submissionController.getSubmissions);
router.get('/:id', authenticate, submissionController.getSubmissionById);
router.get('/:id/status', optionalAuth, submissionController.getSubmissionStatus);

export default router;
