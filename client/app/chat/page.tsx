"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { getCurrentUser, logoutUser } from "../../lib/api/auth";
import { getDocuments } from "../../lib/api/documents";
import { sendChatMessage } from "../../lib/api/chat";

import type {
  ChatSource,
  Document,
  Message,
  User,
} from "../../lib/types/api";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

function FileIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4z" />
    </svg>
  );
}

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      {children}
    </span>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const documentIdFromUrl = searchParams.get("documentId");

  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(
    documentIdFromUrl || ""
  );

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const selectedDocument = documents.find(
    (document) => document.id === selectedDocumentId
  );

  useEffect(() => {
    async function loadChat() {
      try {
        setLoading(true);
        setError("");

        const [userResponse, documentsResponse] =
          await Promise.all([
            getCurrentUser(),
            getDocuments(),
          ]);

        if (!userResponse.user) {
          router.replace("/login");
          return;
        }

        setUser(userResponse.user);

        const processedDocuments =
          documentsResponse.documents.filter(
            (document) =>
              document.status.toUpperCase() === "PROCESSED"
          );

        setDocuments(processedDocuments);

        if (
          documentIdFromUrl &&
          processedDocuments.some(
            (document) => document.id === documentIdFromUrl
          )
        ) {
          setSelectedDocumentId(documentIdFromUrl);
        } else if (processedDocuments.length > 0) {
          setSelectedDocumentId(processedDocuments[0].id);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load chat.";

        if (
          message.toLowerCase().includes("authentication") ||
          message.toLowerCase().includes("token") ||
          message.toLowerCase().includes("unauthorized")
        ) {
          router.replace("/login");
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, [documentIdFromUrl, router]);

  function handleDocumentChange(documentId: string) {
    setSelectedDocumentId(documentId);
    setMessages([]);

    router.replace(`/chat?documentId=${documentId}`);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    if (!selectedDocumentId) {
      setError("Please select a document first.");
      return;
    }

    try {
      setSending(true);
      setError("");

      const userMessage: LocalMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedQuestion,
      };

      setMessages((current) => [
        ...current,
        userMessage,
      ]);

      setQuestion("");

      const response = await sendChatMessage({
        question: trimmedQuestion,
        documentId: selectedDocumentId,
      });

      const assistantMessage: LocalMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to get an answer."
      );
    } finally {
      setSending(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
      router.replace("/login");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to log out."
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block" />

          <section className="flex-1">
            <div className="h-16 border-b border-slate-200 bg-white" />

            <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-6 lg:p-8">
              <div className="h-16 animate-pulse rounded-2xl bg-white" />
              <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-6 py-5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-600/20">
                R
              </div>

              <div>
                <p className="text-sm font-bold tracking-tight text-slate-900">
                  RAG Workspace
                </p>

                <p className="text-xs text-slate-400">
                  AI document assistant
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-5">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>

            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <NavIcon>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="7"
                      height="7"
                      rx="1"
                    />
                    <rect
                      x="14"
                      y="3"
                      width="7"
                      height="7"
                      rx="1"
                    />
                    <rect
                      x="3"
                      y="14"
                      width="7"
                      height="7"
                      rx="1"
                    />
                    <rect
                      x="14"
                      y="14"
                      width="7"
                      height="7"
                      rx="1"
                    />
                  </svg>
                </NavIcon>

                Dashboard
              </Link>

              <Link
                href="/documents"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <NavIcon>
                  <FileIcon />
                </NavIcon>

                Documents
              </Link>

              <div className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700">
                <NavIcon>
                  <ChatIcon />
                </NavIcon>

                Chat
              </div>
            </div>
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="mb-3 rounded-xl bg-slate-50 p-3">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <NavIcon>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
              </NavIcon>

              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="shrink-0 border-b border-slate-200 bg-white">
            <div className="flex h-16 items-center justify-between px-5 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Workspace
                </p>

                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Chat
                </h1>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {(user?.name || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 sm:p-6 lg:p-8">
            {/* Document selector */}
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileIcon />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Chatting with
                    </p>

                    <p className="truncate text-sm font-semibold text-slate-800">
                      {selectedDocument?.originalName ||
                        "Select a document"}
                    </p>
                  </div>
                </div>

                {documents.length > 0 && (
                  <select
                    value={selectedDocumentId}
                    onChange={(event) =>
                      handleDocumentChange(event.target.value)
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    {documents.map((document) => (
                      <option
                        key={document.id}
                        value={document.id}
                      >
                        {document.originalName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {documents.length === 0 ? (
                <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
                  <div>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <FileIcon />
                    </div>

                    <h2 className="text-lg font-semibold text-slate-900">
                      No processed documents
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Upload and process a PDF before starting a
                      conversation with your documents.
                    </p>

                    <Link
                      href="/documents"
                      className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
                    >
                      Go to documents
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    {messages.length === 0 ? (
                      <div className="flex h-full min-h-[390px] items-center justify-center text-center">
                        <div className="max-w-md">
                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <ChatIcon />
                          </div>

                          <h2 className="text-lg font-semibold text-slate-900">
                            Ask anything about your document
                          </h2>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            Ask a question and the RAG system will
                            retrieve relevant sections from your PDF
                            before generating an answer.
                          </p>

                          <div className="mt-5 flex flex-wrap justify-center gap-2">
                            {[
                              "Summarize this document",
                              "What are the key points?",
                              "Explain the main topic",
                            ].map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() =>
                                  setQuestion(suggestion)
                                }
                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[75%] ${
                                message.role === "user"
                                  ? "rounded-2xl rounded-br-md bg-indigo-600 px-4 py-3 text-white"
                                  : "rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
                              }`}
                            >
                              <p className="whitespace-pre-wrap text-sm leading-6">
                                {message.content}
                              </p>

                              {message.role ===
                                "assistant" &&
                                message.sources &&
                                message.sources.length >
                                  0 && (
                                  <div className="mt-4 border-t border-slate-200 pt-3">
                                    <p className="mb-2 text-xs font-semibold text-slate-500">
                                      Sources
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                      {message.sources.map(
                                        (
                                          source,
                                          index
                                        ) => (
                                          <span
                                            key={`${source.pageNumber}-${source.chunkIndex}-${index}`}
                                            className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200"
                                          >
                                            Page{" "}
                                            {
                                              source.pageNumber
                                            }
                                            {" · "}
                                            Section{" "}
                                            {
                                              source.chunkIndex
                                            }
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}

                        {sending && (
                          <div className="flex justify-start">
                            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400 [animation-delay:150ms]" />
                                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400 [animation-delay:300ms]" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
                      {error}
                    </div>
                  )}

                  {/* Composer */}
                  <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
                    <form
                      onSubmit={handleSubmit}
                      className="flex items-end gap-3"
                    >
                      <textarea
                        value={question}
                        onChange={(event) =>
                          setQuestion(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            !event.shiftKey
                          ) {
                            event.preventDefault();

                            if (!sending) {
                              event.currentTarget.form?.requestSubmit();
                            }
                          }
                        }}
                        disabled={sending}
                        rows={1}
                        placeholder="Ask a question about your document..."
                        className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <button
                        type="submit"
                        disabled={
                          sending || !question.trim()
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Send question"
                      >
                        <SendIcon />
                      </button>
                    </form>

                    <p className="mt-2 text-center text-[11px] text-slate-400">
                      Enter to send · Shift + Enter for a new line
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}