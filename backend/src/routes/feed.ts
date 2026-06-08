import { Router } from "express";
import { getActivityFeed } from "../controllers/socialController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getActivityFeed);

export default router;
