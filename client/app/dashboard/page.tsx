"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "../../lib/api/auth";
import type { User } from "../../lib/types/api";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();

        if (!response.user) {
          router.replace("/login");
          return;
        }

        setUser(response.user);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">
          Loading...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              PDF RAG Chatbot
            </h1>

            <p className="text-sm text-zinc-500">
              Welcome, {user.name || user.email}
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Dashboard
          </h2>

          <p className="mt-2 text-zinc-600">
            Your documents and conversations will appear
            here.
          </p>
        </div>
      </section>
    </main>
  );
}