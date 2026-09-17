export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface Document {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: string;
  pageCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsResponse {
  success: boolean;
  documents: Document[];
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsResponse {
  success: boolean;
  conversations: ConversationSummary[];
}

export interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface ConversationResponse {
  success: boolean;
  conversation: Conversation;
}

export interface DocumentResponse {
  success: boolean;
  document: Document;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
}

export interface ChatSource {
  pageNumber: number;
  chunkIndex: number;
}

export interface ChatResponse {
  success: boolean;
  answer: string;
  sources: ChatSource[];
  conversationId: string;
}

export interface ChatInput {
  question: string;
  documentId: string;
  conversationId?: string;
}