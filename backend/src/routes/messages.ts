import { Router } from "express";
import Joi from "joi";
import { sendMessage, getConversation, getInbox, getUnreadCount } from "../controllers/socialController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const sendMessageSchema = Joi.object({
  receiverId: Joi.string().uuid().required(),
  content: Joi.string().min(1).max(5000).required(),
});

router.get("/", authenticate, getInbox);
router.get("/unread", authenticate, getUnreadCount);
router.get("/:userId", authenticate, getConversation);
router.post("/", authenticate, validate(sendMessageSchema), sendMessage);

export default router;
