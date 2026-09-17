"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  getCurrentUser,
  logoutUser,
} from "../../lib/api/auth";
import { getDocuments } from "../../lib/api/documents";

import type {
  Document,
  User,
} from "../../lib/types/api";

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
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
      <svg
        width="20"
        height="20"
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

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      {children}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
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
            : "Unable to load dashboard.";

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

    loadDashboard();
  }, [router]);

  const processedDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          document.status.toUpperCase() === "PROCESSED"
      ).length,
    [documents]
  );

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await logoutUser();

      router.replace("/login");
    } catch (error) {
      setLoggingOut(false);

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
          <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
            <div className="p-6">
              <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </aside>

          <section className="flex-1">
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              <div className="h-6 w-32 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
              <div className="h-32 animate-pulse rounded-2xl bg-white shadow-sm" />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="h-28 animate-pulse rounded-2xl bg-white" />
                <div className="h-28 animate-pulse rounded-2xl bg-white" />
                <div className="h-28 animate-pulse rounded-2xl bg-white" />
              </div>

              <div className="h-80 animate-pulse rounded-2xl bg-white" />
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

              <Link
  href="/chat"
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
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  </NavIcon>

  Chat
</Link>
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
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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

              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <section className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="border-b border-slate-200 bg-white">
            <div className="flex h-16 items-center justify-between px-5 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Workspace
                </p>

                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.name || "User"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {user?.email}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {(user?.name || user?.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-6 lg:p-8">
            {/* Welcome */}
            <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-100/50 blur-3xl" />

              <div className="relative">
                <p className="mb-2 text-sm font-medium text-indigo-600">
                  Your workspace
                </p>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Welcome back
                  {user?.name
                    ? `, ${user.name.split(" ")[0]}`
                    : ""}
                  .
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Upload your PDFs and use AI to ask questions,
                  find information, and understand your documents.
                </p>
              </div>
            </section>

            {/* Stats */}
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Total documents
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
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
                    </svg>
                  </div>
                </div>

                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {documents.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  PDFs in your workspace
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Processed
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                </div>

                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {processedDocuments}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Ready for questions
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Conversations
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
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
                  </div>
                </div>

                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  —
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Conversation history coming next
                </p>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Documents */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Recent documents
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Documents uploaded to your workspace
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  {documents.length} total
                </span>
              </div>

              {documents.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 16V4" />
                      <path d="M8 8l4-4 4 4" />
                      <path d="M5 20h14" />
                    </svg>
                  </div>

                  <h3 className="font-semibold text-slate-900">
                    No documents yet
                  </h3>

                  <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                    Upload your first PDF to start asking
                    questions about your documents.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {documents.slice(0, 5).map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                    >
                      <FileIcon />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {document.originalName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatFileSize(document.fileSize)}
                          {" · "}
                          {document.pageCount ?? "—"} pages
                          {" · "}
                          {formatDate(document.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${
                          document.status.toUpperCase() ===
                          "PROCESSED"
                            ? "bg-emerald-50 text-emerald-700"
                            : document.status.toUpperCase() ===
                                "FAILED"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {document.status}
                      </span>
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