"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { signup, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) router.replace("/account");
  }, [isLoggedIn, router]);

  const handleSignup = async () => {
    if (loading) return;

    if (!form.name || !form.email || !form.phone || !form.password) {
      showToast("Fields missing", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await signup(form) as any;
      if (res.success) {
        showToast("Success!", "success");
        router.push("/account");
      } else {
        showToast(res.error, "error");
      }
    } catch (err) {
      showToast("Error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999999] bg-[#0a1810] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#1a2e23] p-8 rounded-3xl border border-white/10">
        <h1 className="text-3xl font-cormorant text-center mb-8">Create Account</h1>
        
        <div className="space-y-4">
          <input 
            placeholder="Full Name" 
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white" 
          />
          <input 
            placeholder="Email" 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white" 
          />
          <input 
            placeholder="Phone" 
            value={form.phone} 
            onChange={(e) => setForm({ ...form, phone: e.target.value })} 
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white" 
          />
          <input 
            type="password"
            placeholder="Password" 
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white" 
          />
          <input 
            type="password"
            placeholder="Confirm" 
            value={form.confirm} 
            onChange={(e) => setForm({ ...form, confirm: e.target.value })} 
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white" 
          />
          
          <button 
            onClick={() => {
              console.log("CLICKED");
              handleSignup();
            }}
            disabled={loading}
            className="w-full py-4 bg-gold text-black font-bold rounded-xl active:scale-95 transition-all"
          >
            {loading ? "Processing..." : "REGISTER NOW"}
          </button>
        </div>
      </div>
    </div>
  );
}
