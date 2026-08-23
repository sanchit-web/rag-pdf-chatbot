import type { Request, Response } from "express";

import {
  AuthServiceError,
  getSafeUserById,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import { signAccessToken } from "../utils/jwt.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function sendAuthError(response: Response, error: unknown): void {

  console.error("AUTH ERROR:", error);

  if (error instanceof AuthServiceError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message
    });
    return;
  }

  response.status(500).json({
    success: false,
    message: "Internal server error"
  });
}

export async function register(request: Request, response: Response): Promise<void> {
  const result = registerSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({ success: false, errors: result.error.flatten() });
    return;
  }

  try {
    const user = await registerUser(result.data);
    response.status(201).json({ success: true, user });
  } catch (error) {
    sendAuthError(response, error);
  }
}

export async function login(request: Request, response: Response): Promise<void> {

  console.log("LOGIN REQUEST RECEIVED");


  const result = loginSchema.safeParse(request.body);

  if (!result.success) {
    response.status(400).json({ success: false, errors: result.error.flatten() });
    return;
  }

  try {
    const user = await loginUser(result.data);
    response.cookie("token", signAccessToken(user.id), authCookieOptions);
    response.json({ success: true, user });
  } catch (error) {
    sendAuthError(response, error);
  }
}

export function logout(_request: Request, response: Response): void {
  response.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  response.json({ success: true, message: "Logged out" });
}

export async function me(request: Request, response: Response): Promise<void> {
  const user = await getSafeUserById(request.userId!);

  if (!user) {
    response.status(401).json({ success: false, message: "User not found" });
    return;
  }

  response.json({ success: true, user });
}
