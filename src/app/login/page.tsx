"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function LoginPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.replace("/account");
    };
    checkUser();
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!form.email || !form.password) {
      showToast("Please enter your credentials", "error");
      return;
    }

    setLoading(true);
    console.log("🚀 EMERGENCY AUTH: Starting direct login for", form.email);
    
    try {
      // DIRECT LOGIN - Bypassing AuthContext for maximum stability
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      });

      if (error) {
        console.error("❌ Login failed:", error.message);
        showToast(error.message, "error");
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("✅ Login successful! Forcing redirect...");
        showToast("Welcome back!", "success");
        
        // NUCLEAR OPTION: Wait 500ms for cookies, then force refresh
        setTimeout(() => {
          window.location.href = "/account";
        }, 500);
      }
    } catch (err: any) {
      console.error("💥 Critical login crash:", err);
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
                placeholder="Email Address" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold/40 focus:outline-none transition-all placeholder:text-cream/20" 
              />
              <input 
                type="password"
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
              {loading ? "Establishing Ritual..." : "Sign In"}
            </button>
          </form>

          <p className="mt-10 text-center font-poppins text-[10px] text-cream/30 tracking-widest uppercase relative z-10">
            New to BHARATHI?{" "}
            <Link href="/signup" className="text-gold hover:text-white transition-colors">Create an account</Link>
          </p>

          <div className="absolute bottom-4 left-0 w-full text-center opacity-20">
            <p className="text-[8px] text-gold tracking-[0.5em] uppercase font-bold italic">System v3.0 - Direct Auth Active</p>
          </div>
        </div>
      </div>
    </main>
  );
}
