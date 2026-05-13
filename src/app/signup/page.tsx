"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

/**
 * EMERGENCY DEBUG MODE: SIGNUP PAGE
 * Focus: Reliability and Redirection
 */
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // REDIRECT IF LOGGED IN
  useEffect(() => {
    if (isLoggedIn) {
      console.log("🚀 [DEBUG] User already logged in, redirecting to /account");
      router.replace("/account");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) return null;

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // DIAGNOSTIC ALERT: If you see this, the click is working!
    window.alert("🚀 CLICK REGISTERED! Starting signup process...");
    
    console.log("🚀 [DEBUG] 1. Form click handler triggered");

    if (loading) {
      console.log("⚠️ [DEBUG] Already loading, ignoring click");
      return;
    }

    // MANUAL VALIDATION (Bypasses hidden browser issues)
    if (!form.name || !form.email || !form.phone || !form.password) {
      console.warn("⚠️ [DEBUG] Missing fields:", { 
        name: !!form.name, 
        email: !!form.email, 
        phone: !!form.phone, 
        password: !!form.password 
      });
      showToast("Please fill in all fields", "error");
      return;
    }

    if (form.password !== form.confirm) {
      console.warn("⚠️ [DEBUG] Passwords mismatch");
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    console.log("🚀 [DEBUG] 2. Starting signup process for:", form.email);

    try {
      const res = await signup({ 
        name: form.name, 
        email: form.email, 
        phone: form.phone, 
        password: form.password 
      }) as any;
      
      console.log("🚀 [DEBUG] 3. Signup function response:", res);

      if (res.success) {
        if (res.confirmationRequired) {
          console.log("✅ [DEBUG] 4. Signup success (Confirmation Required)");
          showToast("Account created! Check your email to verify.", "success");
          router.push("/login");
          
          // Force fallback redirect if router hangs
          setTimeout(() => {
            if (window.location.pathname.includes('signup')) {
              console.log("🔄 [DEBUG] Router hang detected, forcing window redirect to /login");
              window.location.href = '/login';
            }
          }, 3000);
        } else {
          console.log("✅ [DEBUG] 4. Signup success (Instant Login)");
          showToast("Account created! Welcome to BHARATHI.", "success");
          router.replace("/account");
          
          // Force fallback redirect
          setTimeout(() => {
            if (window.location.pathname.includes('signup')) {
              console.log("🔄 [DEBUG] Router hang detected, forcing window redirect to /account");
              window.location.href = '/account';
            }
          }, 3000);
        }
      } else {
        console.error("❌ [DEBUG] 5. Signup failed:", res.error);
        showToast(res.error || "Signup failed. Try again.", "error");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("💥 [DEBUG] 6. Signup system crash:", err);
      showToast("System error. Please check your connection.", "error");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a1810] selection:bg-gold/30 selection:text-white relative z-[200000]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-cormorant text-5xl text-cream mb-3 tracking-tight">Create Account</h1>
            <p className="font-poppins text-cream/40 text-sm tracking-wide">Join the BHARATHI luxury heritage</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="font-poppins text-[10px] text-cream/30 tracking-[0.2em] uppercase ml-1">Full Name</label>
                <input 
                  placeholder="Your Name" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 transition-all" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-poppins text-[10px] text-cream/30 tracking-[0.2em] uppercase ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="email@example.com" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 transition-all" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-poppins text-[10px] text-cream/30 tracking-[0.2em] uppercase ml-1">Mobile Number</label>
                <input 
                  placeholder="+91 98765 43210" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 transition-all" 
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
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 transition-all" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-cream/20 hover:text-gold transition-colors"
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
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 transition-all" 
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="button" 
                onClick={handleSignup}
                disabled={loading} 
                className="w-full py-5 bg-gold text-[#0a1810] font-poppins font-bold text-xs tracking-[0.2em] uppercase rounded-2xl disabled:opacity-50 hover:bg-gold/90 transition-all shadow-xl shadow-gold/10 relative overflow-hidden"
              >
                <span className={loading ? "opacity-0" : "opacity-100"}>
                  Create Account
                </span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#0a1810]/20 border-t-[#0a1810] rounded-full animate-spin" />
                  </div>
                )}
              </button>
            </div>
          </div> { /* Replaced form with div to avoid onSubmit interference */ }

          <p className="mt-8 text-center font-poppins text-xs text-cream/30 tracking-wide">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
