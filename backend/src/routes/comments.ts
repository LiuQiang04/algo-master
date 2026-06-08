import { Router } from "express";
import Joi from "joi";
import {
  createComment, getComments, voteComment, deleteComment, reportComment,
} from "../controllers/commentController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
  parentCommentId: Joi.string().uuid().allow(null).optional(),
});

const voteSchema = Joi.object({
  value: Joi.number().valid(1, -1).required(),
});

const reportSchema = Joi.object({
  reason: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional(),
});

router.get("/post/:postId", optionalAuth, getComments);
router.post("/post/:postId", authenticate, validate(createCommentSchema), createComment);
router.post("/:commentId/vote", authenticate, validate(voteSchema), voteComment);
router.delete("/:commentId", authenticate, deleteComment);
router.post("/:commentId/report", authenticate, validate(reportSchema), reportComment);

export default router;
