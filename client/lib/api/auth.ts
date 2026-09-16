import { apiClient } from "./client";
import type { AuthResponse } from "../types/api";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function registerUser(input: RegisterInput) {
  return apiClient<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: LoginInput) {
  return apiClient<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logoutUser() {
  return apiClient<AuthResponse>("/api/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return apiClient<AuthResponse>("/api/auth/me");
}