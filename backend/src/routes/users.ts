import { Router } from "express";
import Joi from "joi";
import { getUserProfile, updateProfile, getUserPosts, getFollowers, getFollowing } from "../controllers/userController.js";
import { followUser } from "../controllers/socialController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(50).optional(),
  bio: Joi.string().max(500).allow("").optional(),
  avatarUrl: Joi.string().uri().max(500).optional(),
});

router.get("/:id", optionalAuth, getUserProfile);
router.put("/me/profile", authenticate, validate(updateProfileSchema), updateProfile);
router.get("/:id/posts", getUserPosts);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);
router.post("/:id/follow", authenticate, followUser);

export default router;
