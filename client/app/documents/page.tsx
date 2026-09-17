"use client";

import type { DragEvent } from "react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getCurrentUser, logoutUser } from "../../lib/api/auth";
import {
  deleteDocument,
  getDocuments,
  uploadDocument,
} from "../../lib/api/documents";

import type { Document, User } from "../../lib/types/api";

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function FileIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v6h6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 16V4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8l4-4 4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20h14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toUpperCase();

  if (normalizedStatus === "PROCESSED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Processed
      </span>
    );
  }

  if (normalizedStatus === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Processing
    </span>
  );
}

export default function DocumentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadDocuments() {
    const response = await getDocuments();
    setDocuments(response.documents);
  }

  useEffect(() => {
    async function loadPage() {
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
        setDocuments(documentsResponse.documents);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load documents.";

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

    loadPage();
  }, [router]);

  async function handleUpload(file: File) {
    setError("");
    setSuccess("");

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    try {
      setUploading(true);

      await uploadDocument(file);
      await loadDocuments();

      setSuccess(`${file.name} uploaded successfully.`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to upload the PDF."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      void handleUpload(file);
    }

    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void handleUpload(file);
    }
  }

  async function handleDelete(document: Document) {
    const confirmed = window.confirm(
      `Delete "${document.originalName}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(document.id);
      setError("");
      setSuccess("");

      await deleteDocument(document.id);

      setDocuments((current) =>
        current.filter((item) => item.id !== document.id)
      );

      setSuccess(`${document.originalName} was deleted.`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete the document."
      );
    } finally {
      setDeletingId(null);
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
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              <div className="h-6 w-32 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-6 lg:p-8">
              <div className="h-36 animate-pulse rounded-2xl bg-white" />
              <div className="h-24 animate-pulse rounded-2xl bg-white" />
              <div className="h-96 animate-pulse rounded-2xl bg-white" />
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
                className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700"
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8" />
                    <path d="M8 17h6" />
                  </svg>
                </NavIcon>

                Documents
              </Link>

              <button
                type="button"
                disabled
                title="Coming next"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-400"
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
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                  </svg>
                </NavIcon>

                Conversations
              </button>
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
        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex h-16 items-center justify-between px-5 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Workspace
                </p>

                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Documents
                </h1>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {(user?.name || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-6 lg:p-8">
            {/* Intro */}
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Your documents
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Upload PDFs to build your searchable AI knowledge
                base.
              </p>
            </section>

            {/* Upload */}
            <section
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed bg-white p-8 text-center transition sm:p-10 ${
                dragging
                  ? "border-indigo-400 bg-indigo-50/40"
                  : "border-slate-200 hover:border-indigo-300"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <UploadIcon />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                {uploading
                  ? "Uploading your PDF..."
                  : "Upload a PDF"}
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                Drag and drop a PDF here, or choose a file from
                your computer.
              </p>

              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Choose PDF"}
              </button>

              <p className="mt-3 text-xs text-slate-400">
                PDF files only
              </p>
            </section>

            {/* Messages */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {success}
              </div>
            )}

            {/* Documents */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    All documents
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {documents.length}{" "}
                    {documents.length === 1
                      ? "document"
                      : "documents"}{" "}
                    in your workspace
                  </p>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <FileIcon />
                  </div>

                  <h4 className="font-semibold text-slate-900">
                    No documents yet
                  </h4>

                  <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                    Upload your first PDF above and it will
                    appear here once added to your workspace.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-6"
                    >
                      <FileIcon />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {document.originalName}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400">
                          <span>
                            {formatFileSize(document.fileSize)}
                          </span>

                          <span>·</span>

                          <span>
                            {document.pageCount ?? "—"} pages
                          </span>

                          <span>·</span>

                          <span>
                            {formatDate(document.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
  <StatusBadge status={document.status} />

  {document.status.toUpperCase() === "PROCESSED" && (
    <Link
      href={`/chat?documentId=${document.id}`}
      className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
    >
      Chat
    </Link>
  )}

  <button
    type="button"
    onClick={() => void handleDelete(document)}
    disabled={deletingId === document.id}
    className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deletingId === document.id
      ? "Deleting..."
      : "Delete"}
  </button>
</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}