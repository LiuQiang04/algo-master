import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Joi from 'joi';

const router = Router();

// 验证规则
const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).optional(),
  avatarUrl: Joi.string().uri().allow(null, '').optional(),
  bio: Joi.string().max(500).allow('').optional(),
  region: Joi.string().max(100).allow('').optional(),
});

// 路由
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.get('/:id/stats', userController.getUserStats);
router.put('/me', authenticate, validate(updateUserSchema), userController.updateUser);

// 管理员路由
router.get('/', authenticate, adminOnly, userController.getUsers);

export default router;
