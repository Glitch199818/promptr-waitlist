"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ProfileDropdown from "@/components/ProfileDropdown";

type Memory = {
  id: string;
  text: string;
  tool: string | null;
  name: string | null;
  model: string | null;
  created_at: string;
};

export default function MemoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAndLoad = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error || !sessionData.session) {
        router.replace("/login");
        return;
      }
      const userId = sessionData.session.user.id;
      setUserId(userId);
      await fetchMemories(userId);
      setLoading(false);
    };

    checkAndLoad();
  }, [router]);

  const fetchMemories = async (userId: string) => {
    setErrorMsg(null);
    // Try to select with name and model first, fallback if columns don't exist
    let { data, error } = await supabase
      .from("memories")
      .select("id,text,tool,name,model,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    // If name or model columns don't exist, retry without them
    if (error && (error.message?.includes("name") || error.message?.includes("model"))) {
      const retry = await supabase
        .from("memories")
        .select("id,text,tool,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      data = retry.data;
      error = retry.error;
    }
    
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    
    // Ensure all items have name and model fields (null if not present or empty)
    const normalizedData = (data ?? []).map((item: any) => {
      const nameValue = item.name?.trim();
      const modelValue = item.model?.trim();
      return {
        ...item,
        name: nameValue && nameValue.length > 0 ? nameValue : null,
        model: modelValue && modelValue.length > 0 ? modelValue : null,
      };
    });
    
    setMemories(normalizedData);
  };

  const handleCopy = async (memory: Memory) => {
    setCopyingId(memory.id);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(memory.text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = memory.text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
    } finally {
      setCopyingId(null);
    }
  };

  const handleDelete = async (memory: Memory) => {
    setDeletingId(memory.id);
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      currentUserId = sessionData.session?.user.id ?? null;
    }

    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", memory.id)
      .eq("user_id", currentUserId ?? "");
    if (error) {
      setErrorMsg(error.message);
    } else if (currentUserId) {
      await fetchMemories(currentUserId);
    }
    setDeletingId(null);
  };

  const content = useMemo(() => {
    if (memories.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm text-neutral-300">
          <p className="text-base font-medium text-white">No memories yet</p>
          <p className="mt-1 text-neutral-400">
            Capture insights from your AI tools and they’ll appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {memories.map((memory) => {
          const preview =
            memory.text.length > 200
              ? `${memory.text.slice(0, 197)}...`
              : memory.text;
          const date = memory.created_at
            ? new Date(memory.created_at).toLocaleString()
            : "";
          
          // Always use the saved name as the title
          // Only fallback to first few words for display if name is null/undefined/empty
          const nameValue = memory.name?.trim();
          const title = (nameValue && nameValue.length > 0) ? nameValue : (() => {
            const words = memory.text.trim().split(/\s+/);
            const wordCount = Math.min(Math.max(5, Math.floor(words.length * 0.3)), 7);
            const fallback = words.slice(0, wordCount).join(" ");
            return fallback.length > 50 ? fallback.substring(0, 47) + "..." : fallback;
          })();
          
          return (
            <div
              key={memory.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur"
            >
              <div className="flex flex-col gap-3">
                <h3 className="text-base font-semibold text-white">
                  {title}
                </h3>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed text-white whitespace-pre-wrap">
                    {preview}
                  </p>
                  <div className="flex flex-col gap-2 text-xs text-neutral-400 items-end">
                    <div className="flex flex-col gap-1 items-end">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-200">
                        {memory.tool || "Unknown"}
                      </span>
                      {memory.model && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-300 text-xs">
                          {memory.model}
                        </span>
                      )}
                    </div>
                    <span className="text-neutral-400">{date}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopy(memory)}
                    disabled={copyingId === memory.id}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 px-4 py-2 text-xs font-semibold text-neutral-950 shadow-[0_10px_40px_rgba(255,255,255,0.16)] transition hover:brightness-110 disabled:opacity-60"
                    style={{ borderRadius: '0px' }}
                  >
                    {copyingId === memory.id ? "Copying..." : "Copy to clipboard"}
                  </button>
                  <button
                    onClick={() => handleDelete(memory)}
                    disabled={deletingId === memory.id}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 px-4 py-2 text-xs font-semibold text-neutral-950 shadow-[0_10px_40px_rgba(255,255,255,0.16)] transition hover:brightness-110 disabled:opacity-60"
                    style={{ borderRadius: '0px' }}
                  >
                    {deletingId === memory.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [copyingId, deletingId, memories]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
        <p className="text-sm text-neutral-300">Loading memories...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur relative z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm text-neutral-300">Library</p>
              <h1 className="text-3xl font-semibold">Your memories</h1>
              <p className="text-sm text-neutral-400 max-w-2xl">
                Saved snippets from your AI tools, ready to drop back into your work.
              </p>
            </div>
            <div className="flex items-center gap-3 relative z-50">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-200">
                <p className="text-neutral-300">Saved</p>
                <p className="text-2xl font-semibold text-white">
                  {memories.length}
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 px-4 py-2 text-sm font-semibold text-neutral-950 shadow-[0_10px_40px_rgba(255,255,255,0.16)] transition hover:brightness-110"
                style={{ borderRadius: '0px' }}
              >
                Back home
              </Link>
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-200/40 bg-red-500/10 p-4 text-sm text-red-100">
            {errorMsg}
          </div>
        )}

        {content}
      </div>
    </main>
  );
}

