"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-[#0a1810] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/admin/login");
    else if (!isAdmin) router.replace("/");
  }, [isLoggedIn, isAdmin, router]);

  if (!isLoggedIn || !isAdmin) return (
    <div className="min-h-screen bg-[#0a1810] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return <>{children}</>;
}
