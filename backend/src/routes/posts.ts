import { Router } from "express";
import Joi from "joi";
import {
  createPost, getPosts, getPost, updatePost, deletePost, votePost, getTags,
} from "../controllers/postController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const createPostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).required(),
  postType: Joi.string().valid("discussion", "solution", "question").default("discussion"),
  problemId: Joi.string().uuid().allow(null).optional(),
  tagNames: Joi.array().items(Joi.string().max(50)).max(10).optional(),
});

const updatePostSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  content: Joi.string().min(1).optional(),
  tagNames: Joi.array().items(Joi.string().max(50)).max(10).optional(),
});

const voteSchema = Joi.object({
  value: Joi.number().valid(1, -1).required(),
});

router.get("/", optionalAuth, getPosts);
router.get("/tags", getTags);
router.get("/:id", optionalAuth, getPost);
router.post("/", authenticate, validate(createPostSchema), createPost);
router.put("/:id", authenticate, validate(updatePostSchema), updatePost);
router.delete("/:id", authenticate, deletePost);
router.post("/:id/vote", authenticate, validate(voteSchema), votePost);

export default router;
