import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(request: Request, response: Response, next: NextFunction): void {
  const token = request.cookies?.token;

  if (typeof token !== "string") {
    response.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  const userId = verifyAccessToken(token);

  if (!userId) {
    response.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }

  request.userId = userId;
  next();
}
