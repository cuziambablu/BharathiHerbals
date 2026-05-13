"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/account");
    }
  }, [isLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!form.email || !form.password) {
      showToast("Please enter your credentials", "error");
      return;
    }

    setLoading(true);
    
    // DEADMAN'S SWITCH: If the UI hangs for 4 seconds, force the move.
    // The logs show the database ALWAYS finishes, so we can safely force this.
    const deadmanTimer = setTimeout(() => {
      console.log("⏰ Deadman's switch triggered - moving to account");
      window.location.href = "/account";
    }, 4000);

    try {
      console.log("🚀 AUTH: Login request started");
      const res = await login(form.email, form.password);
      
      clearTimeout(deadmanTimer);
      
      if (res.success) {
        showToast("Welcome back!", "success");
        // HARD REDIRECT to ensure session cookies sync
        window.location.href = "/account";
      } else {
        showToast(res.error || "Login failed", "error");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      showToast("A connection error occurred", "error");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a1810]">
      <Navbar />
      
      <div className="pt-40 pb-20 px-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
          
          <div className="text-center mb-10 relative z-10">
            <h1 className="font-cormorant text-4xl text-cream mb-2 italic">Welcome Back</h1>
            <p className="font-poppins text-cream/40 text-[10px] tracking-[0.4em] uppercase">Sign in to your luxury experience</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div className="space-y-4">
              <input 
                type="email"
                autoComplete="email"
                placeholder="Email Address" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold/40 focus:outline-none transition-all placeholder:text-cream/20" 
              />
              <input 
                type="password"
                autoComplete="current-password"
                placeholder="Password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold/40 focus:outline-none transition-all placeholder:text-cream/20" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 bg-gold text-[#0a1810] font-poppins font-bold text-[10px] tracking-[0.3em] uppercase rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-gold/10"
            >
              {loading ? "Establishing Connection..." : "Sign In"}
            </button>
          </form>

          <p className="mt-10 text-center font-poppins text-[10px] text-cream/30 tracking-widest uppercase relative z-10">
            New to BHARATHI?{" "}
            <Link href="/signup" className="text-gold hover:text-white transition-colors">Create an account</Link>
          </p>

          <div className="absolute bottom-4 left-0 w-full text-center opacity-20">
            <p className="text-[8px] text-gold tracking-[0.5em] uppercase font-bold">System v2.0 - Active</p>
          </div>
        </div>
      </div>
    </main>
  );
}
