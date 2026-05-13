"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function SignupPage() {
  const { signup, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    password: "", 
    confirm: "" 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/account");
    }
  }, [isLoggedIn, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!form.name || !form.email || !form.phone || !form.password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (form.password !== form.confirm) {
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    
    try {
      console.log("🚀 AUTH: Signup request started");
      const res = await signup(form);
      
      if (res.success) {
        showToast("Account created successfully!", "success");
        if (res.confirmationRequired) {
          router.push("/login?confirmed=false");
        } else {
          // HARD REDIRECT to ensure session cookies sync
          window.location.href = "/account";
        }
      } else {
        showToast(res.error || "Signup failed", "error");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
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
            <h1 className="font-cormorant text-4xl text-cream mb-2 italic">Join the Heritage</h1>
            <p className="font-poppins text-cream/40 text-[10px] tracking-[0.4em] uppercase">Create your BHARATHI account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5 relative z-10">
            <div className="space-y-4">
              <input 
                placeholder="Full Name" 
                autoComplete="name"
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold/40 focus:outline-none transition-all placeholder:text-cream/20" 
              />
              <input 
                type="email"
                autoComplete="email"
                placeholder="Email Address" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold/40 focus:outline-none transition-all placeholder:text-cream/20" 
              />
              <input 
                type="tel"
                autoComplete="tel"
                placeholder="Mobile Number" 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold/40 focus:outline-none transition-all placeholder:text-cream/20" 
              />
              <input 
                type="password"
                autoComplete="new-password"
                placeholder="Password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold/40 focus:outline-none transition-all placeholder:text-cream/20" 
              />
              <input 
                type="password"
                autoComplete="new-password"
                placeholder="Confirm Password" 
                value={form.confirm} 
                onChange={(e) => setForm({ ...form, confirm: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold/40 focus:outline-none transition-all placeholder:text-cream/20" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 bg-gold text-[#0a1810] font-poppins font-bold text-[10px] tracking-[0.3em] uppercase rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-gold/10"
            >
              {loading ? "Establishing Ritual..." : "Create Account"}
            </button>
          </form>

          <p className="mt-10 text-center font-poppins text-[10px] text-cream/30 tracking-widest uppercase relative z-10">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:text-white transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
