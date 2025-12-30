"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProfileDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          email: session.user.email || undefined,
          id: session.user.id,
        });
      }
      setLoading(false);
    };
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email || undefined,
          id: session.user.id,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    
    // Notify extension to clear tokens
    try {
      if (typeof window !== "undefined" && (window as any).chrome?.runtime?.id) {
        (window as any).chrome.runtime.sendMessage((window as any).chrome.runtime.id, { type: "logout" }).catch(() => {
          // Extension might not be available, ignore
        });
      }
    } catch (e) {
      // Extension not available, ignore
    }
    
    router.push("/login");
  };

  if (loading || !user) {
    return null;
  }

  const initials = user.email
    ? user.email
        .split("@")[0]
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 px-3 py-2 text-sm font-semibold text-neutral-950 shadow-[0_10px_40px_rgba(255,255,255,0.16)] transition hover:brightness-110"
        style={{ borderRadius: '0px' }}
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-neutral-200 via-neutral-50 to-neutral-400 flex items-center justify-center text-xs font-semibold text-neutral-900">
          {initials}
        </div>
        <span className="hidden sm:inline">{user.email?.split("@")[0] || "Profile"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur z-[100]">
          <div className="px-3 py-2 border-b border-white/10">
            <p className="text-xs text-neutral-400 mb-1">Signed in as</p>
            <p className="text-sm font-medium text-white truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-400 text-neutral-950 font-semibold transition hover:brightness-110"
              style={{ borderRadius: '0px' }}
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

