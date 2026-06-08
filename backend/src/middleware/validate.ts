import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError } from "../utils/response.js";

export function validate(schema: Joi.ObjectSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === "body" ? req.body : source === "query" ? req.query : req.params;
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      return sendError(res, message, 400);
    }
    next();
  };
}
