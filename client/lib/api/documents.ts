import { apiClient } from "./client";
import type {
  DeleteDocumentResponse,
  DocumentResponse,
  DocumentsResponse,
} from "../types/api";

export function getDocuments() {
  return apiClient<DocumentsResponse>("/api/documents");
}

export function uploadDocument(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  return apiClient<DocumentResponse>("/api/documents/upload", {
    method: "POST",
    body: formData,
  });
}

export function deleteDocument(documentId: string) {
  return apiClient<DeleteDocumentResponse>(
    `/api/documents/${documentId}`,
    {
      method: "DELETE",
    }
  );
}