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

    // VALIDATION
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
      console.log("Starting signup for:", form.email);
      const res = await signup({ 
        name: form.name, 
        email: form.email, 
        phone: form.phone, 
        password: form.password 
      }) as any;
      
      if (res.success) {
        showToast("Account created successfully!", "success");
        router.push(res.confirmationRequired ? "/login" : "/account");
      } else {
        showToast(res.error || "Could not create account", "error");
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
        <div className="w-full max-w-md bg-white/[0.02] border border-white/5 p-10 rounded-[2rem]">
          <div className="text-center mb-10">
            <h1 className="font-cormorant text-4xl text-cream mb-2">Join Bharathi</h1>
            <p className="font-poppins text-cream/40 text-xs tracking-widest uppercase">Create your heritage account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-4">
              <input 
                placeholder="Full Name" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold transition-colors" 
              />
              <input 
                type="email"
                placeholder="Email Address" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold transition-colors" 
              />
              <input 
                placeholder="Mobile Number" 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold transition-colors" 
              />
              <input 
                type="password"
                placeholder="Password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold transition-colors" 
              />
              <input 
                type="password"
                placeholder="Confirm Password" 
                value={form.confirm} 
                onChange={(e) => setForm({ ...form, confirm: e.target.value })} 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-cream font-poppins text-sm focus:border-gold transition-colors" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-red-600 text-white font-poppins font-bold text-xs tracking-[0.2em] uppercase rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Create Account (NEW VERSION)"}
            </button>
          </form>

          <p className="mt-8 text-center font-poppins text-[10px] text-cream/30 tracking-widest uppercase">
            Already have an account?{" "}
            <Link href="/login" className="text-gold">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
