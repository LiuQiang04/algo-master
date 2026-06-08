import { Router } from "express";
import Joi from "joi";
import {
  getNotifications, markAsRead, markAllAsRead, getUnreadCount, getSettings, updateSettings,
} from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const updateSettingsSchema = Joi.object({
  emailNotification: Joi.boolean().optional(),
  followNotification: Joi.boolean().optional(),
  commentNotification: Joi.boolean().optional(),
  voteNotification: Joi.boolean().optional(),
  messageNotification: Joi.boolean().optional(),
  systemNotification: Joi.boolean().optional(),
});

router.get("/", authenticate, getNotifications);
router.get("/unread", authenticate, getUnreadCount);
router.get("/settings", authenticate, getSettings);
router.put("/settings", authenticate, validate(updateSettingsSchema), updateSettings);
router.put("/read-all", authenticate, markAllAsRead);
router.put("/:id/read", authenticate, markAsRead);

export default router;
