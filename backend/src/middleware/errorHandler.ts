import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import { sendError } from "../utils/response.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  return sendError(res, "Internal server error", 500);
}
