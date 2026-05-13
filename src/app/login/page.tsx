"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/account");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast("Welcome back to BHARATHI", "success");
        router.push("/account");
      } else {
        showToast(res.error || "Login failed", "error");
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
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-2xl">✨</span>
            </motion.div>
            <h1 className="font-cormorant text-5xl text-cream mb-3 tracking-tight">Welcome Back</h1>
            <p className="font-poppins text-cream/40 text-sm tracking-wide">Sign in to your luxury herbal experience</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="font-poppins text-[10px] text-cream/30 tracking-[0.2em] uppercase ml-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="priya@test.com" 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 focus:bg-white/[0.05] transition-all duration-300" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-poppins text-[10px] text-cream/30 tracking-[0.2em] uppercase">Password</label>
                <button type="button" className="text-[10px] text-gold/60 hover:text-gold tracking-widest uppercase transition-colors">Forgot?</button>
              </div>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••" 
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

            <div className="pt-2">
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
                    <span>Signing In...</span>
                  </div>
                ) : "Sign In"}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link href="/signup" className="group font-poppins text-xs text-cream/40 hover:text-cream transition-all duration-300">
              New to BHARATHI? <span className="text-gold group-hover:underline underline-offset-8 decoration-gold/30">Create an account</span>
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-1 rounded-full bg-gold/40" />
              <p className="font-poppins text-[10px] text-cream/20 tracking-[0.2em] uppercase">Test Credentials</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-cream/20 uppercase tracking-tighter mb-1">Email</p>
                <code className="text-xs text-gold/60 font-mono">priya@test.com</code>
              </div>
              <div>
                <p className="text-[9px] text-cream/20 uppercase tracking-tighter mb-1">Password</p>
                <code className="text-xs text-gold/60 font-mono">user123</code>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
