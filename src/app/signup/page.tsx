"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function SignupPage() {
  const { signup, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isLoggedIn) { router.replace("/account"); return null; }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (form.password !== form.confirm) { 
      showToast("Passwords do not match", "error"); 
      return; 
    }
    if (form.password.length < 6) { 
      showToast("Password must be at least 6 characters", "error"); 
      return; 
    }

    setLoading(true);
    try {
      const res = await signup({ 
        name: form.name, 
        email: form.email, 
        phone: form.phone, 
        password: form.password 
      }) as any;
      
      if (res.success) {
        if (res.confirmationRequired) {
          showToast("Welcome! Please check your email to confirm your account.", "success");
          router.push("/login");
        } else {
          showToast("Account created! Welcome to BHARATHI", "success");
          router.push("/account");
        }
      } else {
        showToast(res.error || "Signup failed", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a1810] selection:bg-gold/30">
      <Navbar />
      
      <div className="pt-28 pb-16 px-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-2xl">🌱</span>
            </motion.div>
            <h1 className="font-cormorant text-5xl text-cream mb-3 tracking-tight">Create Account</h1>
            <p className="font-poppins text-cream/40 text-sm tracking-wide">Join the BHARATHI luxury heritage</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="font-poppins text-[10px] text-cream/30 tracking-[0.2em] uppercase ml-1">Full Name</label>
                <input 
                  placeholder="Priya Sharma" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  required 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 focus:bg-white/[0.05] transition-all duration-300" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-poppins text-[10px] text-cream/30 tracking-[0.2em] uppercase ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="priya@example.com" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  required 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 focus:bg-white/[0.05] transition-all duration-300" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-poppins text-[10px] text-cream/30 tracking-[0.2em] uppercase ml-1">Mobile Number</label>
                <input 
                  placeholder="+91 98765 43210" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  required 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 focus:bg-white/[0.05] transition-all duration-300" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-poppins text-[10px] text-cream/30 tracking-[0.2em] uppercase ml-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    required 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 focus:bg-white/[0.05] transition-all duration-300" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-cream/20 hover:text-cream/60 transition-colors"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-poppins text-[10px] text-cream/30 tracking-[0.2em] uppercase ml-1">Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={form.confirm} 
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })} 
                  required 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 focus:bg-white/[0.05] transition-all duration-300" 
                />
              </div>
            </div>

            <div className="pt-4">
              <motion.button 
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.99 }} 
                type="submit" 
                disabled={loading} 
                className="w-full py-5 bg-gradient-to-r from-[#C8A96B] to-[#B8964F] text-[#0a1810] font-poppins font-bold text-xs tracking-[0.2em] uppercase rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gold/5 hover:shadow-gold/15 transition-all duration-500"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 border-2 border-[#0a1810]/30 border-t-[#0a1810] rounded-full animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : "Create Account"}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="group font-poppins text-xs text-cream/40 hover:text-cream transition-all duration-300">
              Already have an account? <span className="text-gold group-hover:underline underline-offset-8 decoration-gold/30">Sign in</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
