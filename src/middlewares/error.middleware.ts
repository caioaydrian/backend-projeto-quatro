import { type NextFunction, type Request, type Response } from "express";
import { AppError } from "../errors/AppError.js";

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (error instanceof Error) {
    console.error("Internal server error:", error.message);
    return res.status(500).json({ error: error.message || "Internal server error." });
  }

  console.error("Internal server error:", error);
  return res.status(500).json({ error: "Internal server error." });
}

export default errorMiddleware;
