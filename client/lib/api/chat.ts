import { apiClient } from "./client";
import type { ChatInput, ChatResponse } from "../types/api";

export function sendChatMessage(input: ChatInput) {
  return apiClient<ChatResponse>("/api/chat", {
    method: "POST",
    body: JSON.stringify(input),
  });
}