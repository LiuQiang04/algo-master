import { Router } from 'express';
import * as contestController from '../controllers/contestController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Joi from 'joi';

const router = Router();

// 验证规则
const createContestSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().allow('').optional(),
  startTime: Joi.date().iso().greater('now').required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
  isPublic: Joi.boolean().default(true),
  maxParticipants: Joi.number().integer().min(2).optional(),
  problemIds: Joi.array().items(
    Joi.object({
      problemId: Joi.string().uuid().required(),
      order: Joi.string().max(1).required(),
      score: Joi.number().integer().min(1).default(100),
    })
  ).optional(),
});

// 路由
router.get('/', contestController.getContests);
router.get('/:id', optionalAuth, contestController.getContestById);
router.post('/', authenticate, validate(createContestSchema), contestController.createContest);
router.post('/:id/join', authenticate, contestController.joinContest);
router.get('/:id/ranking', contestController.getContestRanking);
router.get('/:id/standings', contestController.getContestRanking);
router.get('/:id/problems', authenticate, contestController.getContestProblems);

export default router;
