"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, loading, router]);

  if (loading || !isLoggedIn) return (
    <div className="min-h-screen bg-[#0a1810] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) router.replace("/admin/login");
      else if (!isAdmin) router.replace("/");
    }
  }, [isLoggedIn, isAdmin, loading, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a1810] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!isLoggedIn || !isAdmin) return (
    <div className="min-h-screen bg-[#0a1810] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="font-cormorant text-3xl text-cream mb-4 italic">Unauthorized Access</h2>
      <p className="font-poppins text-xs text-cream/40 mb-8 uppercase tracking-widest">Redirecting to home...</p>
      <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return <>{children}</>;
}
