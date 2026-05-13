"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const { adminLogin, isLoggedIn, isAdmin } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as admin
  if (isLoggedIn && isAdmin) {
    router.replace("/admin/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await adminLogin(email, password);
    setLoading(false);
    if (res.success) {
      showToast("Access Granted. Welcome, Admin.", "success");
      router.push("/admin/dashboard");
    } else {
      showToast(res.error || "Access Denied", "error");
    }
  };

  return (
    <main className="min-h-screen bg-[#071A13] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="font-cormorant text-2xl tracking-[0.3em] text-gold font-semibold mb-6 block">
            BHARATHI
          </Link>
          <h1 className="font-cormorant text-3xl text-cream mb-2">Admin Portal</h1>
          <p className="font-poppins text-cream/40 text-xs tracking-widest uppercase">Secure Restricted Access</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="font-poppins text-[10px] text-cream/30 tracking-widest uppercase ml-1">Admin Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="admin@bharathi.in" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="font-poppins text-[10px] text-cream/30 tracking-widest uppercase ml-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 transition-all" 
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }} 
              whileTap={{ scale: 0.99 }} 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-gradient-to-r from-gold to-[#B8964F] text-[#071A13] font-poppins font-semibold text-xs tracking-[0.2em] uppercase rounded-2xl shadow-lg shadow-gold/10 disabled:opacity-50 transition-all mt-4"
            >
              {loading ? "Authenticating..." : "Authorize Access"}
            </motion.button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="font-poppins text-[10px] text-cream/20 tracking-widest uppercase mb-4">Credentials for Evaluation</p>
            <div className="flex flex-col gap-1 text-[11px] font-poppins text-cream/40">
              <p>Email: <span className="text-gold/60">admin@bharathi.in</span></p>
              <p>Password: <span className="text-gold/60">admin123</span></p>
            </div>
          </div>
        </div>
        
        <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-cream/30 hover:text-gold transition-colors font-poppins text-[10px] tracking-widest uppercase">
          <span>←</span> Back to Website
        </Link>
      </motion.div>
    </main>
  );
}
