import { Router } from 'express';
import * as postController from '../controllers/postController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import Joi from 'joi';

const router = Router();

// 验证规则
const createPostSchema = Joi.object({
  title: Joi.string().max(200).required(),
  content: Joi.string().min(1).max(50000).required(),
  postType: Joi.string().valid('discussion', 'solution', 'question', 'announcement').required(),
  problemId: Joi.string().uuid().optional(),
});

const updatePostSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  content: Joi.string().min(1).max(50000).optional(),
});

const voteSchema = Joi.object({
  value: Joi.number().valid(1, -1).required(),
});

const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(10000).required(),
  parentCommentId: Joi.string().uuid().optional(),
});

// 路由
router.get('/', postController.getPosts);
router.get('/:id', optionalAuth, postController.getPostById);
router.post('/', authenticate, validate(createPostSchema), postController.createPost);
router.put('/:id', authenticate, validate(updatePostSchema), postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);
router.post('/:id/vote', authenticate, validate(voteSchema), postController.votePost);
router.get('/:id/comments', postController.getComments);
router.post('/:id/comments', authenticate, validate(createCommentSchema), postController.createComment);
router.put('/comments/:id', authenticate, postController.updateComment);

export default router;
