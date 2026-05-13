"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import MagneticButton from "@/components/MagneticButton";

const paymentMethods = [
  { id: "upi", label: "Instant UPI", icon: "📱", desc: "Google Pay, PhonePe, Paytm", highlight: "Recommeded" },
  { id: "card", label: "Secure Card", icon: "💳", desc: "Visa, Mastercard, RuPay", highlight: "Points" },
  { id: "cod", label: "Delivery Cash", icon: "💵", desc: "Pay at your doorstep", highlight: "" },
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const delivery: number = 99;
  const discount = couponApplied ? 150 : 0;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    line1: "", line2: "", city: "", state: "", pincode: "",
  });

  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + delivery + tax;

  const handleApplyCoupon = () => {
    if (coupon.toLowerCase() === "ritual15") {
      setCouponApplied(true);
      showToast("Premium discount applied!", "success");
    } else {
      showToast("This token has expired", "error");
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    console.log("Button clicked. Starting handlePlaceOrder...");
    if (paymentMethod === "cod") {
      (addOrder as any)({
        items: items.map((i) => ({ name: i.name, size: i.size, qty: i.quantity, price: i.price })),
        total,
        status: "ordered",
        paymentMethod: "Cash on Delivery",
        address: `${form.line1}, ${form.city}, ${form.state} - ${form.pincode}`,
      });
      setOrderPlaced(true);
      clearCart();
      showToast("Order initiated successfully.", "success");
      return;
    }

    setLoading(true);
    const res = await loadRazorpay();

    if (!res) {
      showToast("Communication error with Razorpay.", "error");
      setLoading(false);
      return;
    }

    try {
      console.log("Initiating order creation...");
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Order API failed:", errorData);
        showToast(errorData.error || `Server error: ${response.status}`, "error");
        setLoading(false);
        return;
      }

      const order = await response.json();
      console.log("Order created successfully:", order.id);

      if (!order.id) {
        showToast("Order ID missing from response", "error");
        setLoading(false);
        return;
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        console.error("NEXT_PUBLIC_RAZORPAY_KEY_ID is missing!");
        showToast("Payment configuration missing. Please check .env.local", "error");
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "BHARATHI",
        description: "The Ayurvedic Ritual",
        image: "/logo.png",
        order_id: order.id,
        handler: async function (response: any) {
          console.log("Payment successful, verifying...");
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: total,
                orderData: {
                  items: items.map((i) => ({ name: i.name, size: i.size, qty: i.quantity, price: i.price })),
                  address: `${form.line1}, ${form.city}, ${form.state} - ${form.pincode}`,
                  name: form.name,
                  email: form.email,
                  phone: form.phone
                }
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setOrderPlaced(true);
              clearCart();
              showToast("Transaction secured. Ritual begins.", "success");
            } else {
              showToast(verifyData.error || "Verification failed.", "error");
            }
          } catch (vErr) {
            console.error("Verification error:", vErr);
            showToast("Failed to verify transaction.", "error");
          }
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#C8A96B" },
      };

      console.log("Opening Razorpay modal...");
      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error);
        showToast(response.error.description || "Payment failed", "error");
      });

      paymentObject.open();
    } catch (error) {
      console.error("Checkout crash:", error);
      showToast("The vault is currently inaccessible.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-[#0a1810]">
        <Navbar />
        <div className="pt-28 px-6 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-xl"
          >
            <div className="relative mb-12">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
                className="w-32 h-32 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto"
              >
                <span className="text-6xl">✨</span>
              </motion.div>
              <motion.div 
                animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-dashed border-gold/20 rounded-full scale-125"
              />
            </div>
            <h1 className="font-cormorant text-5xl md:text-6xl text-cream mb-6 italic leading-tight">Your Ritual is <br /> <span className="text-gold">Initiated.</span></h1>
            <p className="font-poppins text-cream/30 text-sm tracking-widest uppercase mb-12">We are preparing your elixir with utmost care.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/account/orders" className="px-12 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-poppins text-[10px] tracking-widest uppercase text-cream/60 hover:text-gold hover:border-gold/30 transition-all">
                Track Shipment
              </Link>
              <Link href="/" className="px-12 py-4 bg-cream text-[#0a1810] font-poppins text-[10px] font-bold tracking-widest uppercase rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                Return Home
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a1810] selection:bg-gold/30">
      <Navbar />
      <div className="pt-32 md:pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="font-poppins text-gold text-[9px] tracking-[0.5em] uppercase mb-4">Secure Gateway</p>
              <h1 className="font-cormorant text-6xl text-cream leading-tight">Complete <span className="italic text-cream/40">Ritual</span></h1>
            </motion.div>

            <div className="flex items-center gap-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-poppins text-[10px] font-bold transition-all duration-700 ${
                    step >= s ? "bg-gold text-[#0a1810]" : "bg-white/5 text-cream/20 border border-white/10"
                  }`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`w-12 h-[1px] ${step > s ? "bg-gold" : "bg-white/10"}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            <div className="lg:col-span-7 space-y-12">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                    <h2 className="font-poppins text-gold/40 text-[9px] tracking-[0.3em] uppercase">Shipment Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-poppins text-[10px] text-cream/20 uppercase tracking-widest ml-1">Full Name</label>
                        <input placeholder="E.g. Elena Gilbert" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 focus:bg-white/[0.05] transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="font-poppins text-[10px] text-cream/20 uppercase tracking-widest ml-1">Mobile Contact</label>
                        <input placeholder="+91 00000 00000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 focus:bg-white/[0.05] transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-poppins text-[10px] text-cream/20 uppercase tracking-widest ml-1">Email Address</label>
                      <input placeholder="you@resort.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 focus:bg-white/[0.05] transition-all" />
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="font-poppins text-[10px] text-cream/20 uppercase tracking-widest ml-1">Street Address</label>
                        <input placeholder="Building, Suite, Street" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/40 focus:bg-white/[0.05] transition-all" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:outline-none focus:border-gold/40 transition-all" />
                        <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:outline-none focus:border-gold/40 transition-all" />
                        <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-cream font-poppins text-sm focus:outline-none focus:border-gold/40 transition-all" />
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} className="w-full py-5 bg-cream text-[#0a1810] font-poppins font-bold text-[11px] tracking-[0.3em] uppercase rounded-2xl shadow-2xl hover:bg-gold hover:scale-[1.02] transition-all">
                      Continue to Payment
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                    <h2 className="font-poppins text-gold/40 text-[9px] tracking-[0.3em] uppercase">Select Method</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {paymentMethods.map((pm) => (
                        <button
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`group w-full flex items-center gap-6 px-8 py-6 rounded-3xl border transition-all duration-500 ${
                            paymentMethod === pm.id ? "border-gold bg-gold/5 shadow-lg shadow-gold/5" : "border-white/5 bg-white/[0.02] hover:border-white/20"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${paymentMethod === pm.id ? "bg-gold text-[#0a1810]" : "bg-white/5"}`}>
                            {pm.icon}
                          </div>
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-3">
                              <p className="font-poppins text-sm text-cream font-semibold">{pm.label}</p>
                              {pm.highlight && <span className="text-[8px] font-poppins text-gold border border-gold/20 px-2 py-0.5 rounded uppercase tracking-tighter">{pm.highlight}</span>}
                            </div>
                            <p className="font-poppins text-[11px] text-cream/30 mt-1">{pm.desc}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === pm.id ? "border-gold bg-gold" : "border-white/10"}`}>
                            {paymentMethod === pm.id && <span className="text-[10px] text-[#0a1810] font-bold">✓</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white/[0.03] border border-white/10 rounded-2xl font-poppins text-[10px] font-bold tracking-[0.2em] uppercase text-cream/40 hover:text-cream transition-all">Previous</button>
                      <button onClick={() => setStep(3)} className="flex-1 py-5 bg-cream text-[#0a1810] font-poppins font-bold text-[11px] tracking-[0.3em] uppercase rounded-2xl shadow-2xl hover:bg-gold transition-all">Review Order</button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                    <div className="space-y-6">
                      <h2 className="font-poppins text-gold/40 text-[9px] tracking-[0.3em] uppercase">Order Review</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                          <p className="font-poppins text-[9px] text-gold tracking-widest uppercase">Destination</p>
                          <div className="space-y-1">
                            <p className="font-poppins text-sm text-cream">{form.name}</p>
                            <p className="font-poppins text-[11px] text-cream/40 leading-relaxed">{form.line1}, {form.city}, {form.state} - {form.pincode}</p>
                            <p className="font-poppins text-[11px] text-cream/40">{form.phone}</p>
                          </div>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                          <p className="font-poppins text-[9px] text-gold tracking-widest uppercase">Payment</p>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{paymentMethods.find(p => p.id === paymentMethod)?.icon}</span>
                            <p className="font-poppins text-sm text-cream">{paymentMethods.find(p => p.id === paymentMethod)?.label}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="font-cormorant text-2xl text-cream italic">The Final Bag</h3>
                        <p className="font-poppins text-[10px] text-cream/30 uppercase tracking-widest">{items.length} Elixirs</p>
                      </div>
                      <div className="space-y-6">
                        {items.map(item => (
                          <div key={item.productId} className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-black/40 rounded-2xl p-3 flex-shrink-0">
                              <img src={item.image} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1">
                              <p className="font-poppins text-xs text-cream font-semibold tracking-wide">{item.name}</p>
                              <p className="font-poppins text-[10px] text-cream/30 uppercase mt-1">{item.size} · Qty {item.quantity}</p>
                            </div>
                            <p className="font-poppins text-sm text-gold">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setStep(2)} className="flex-1 py-5 bg-white/[0.03] border border-white/10 rounded-2xl font-poppins text-[10px] font-bold tracking-[0.2em] uppercase text-cream/40 hover:text-cream transition-all">Back</button>
                      <button 
                        onClick={handlePlaceOrder} 
                        disabled={loading}
                        className="flex-1 py-5 bg-cream text-[#0a1810] font-poppins font-bold text-[11px] tracking-[0.3em] uppercase rounded-2xl shadow-2xl hover:bg-gold disabled:opacity-50 relative overflow-hidden"
                      >
                        {loading ? <span className="animate-pulse">Securing...</span> : `Place Ritual — ₹${total.toLocaleString()}`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-40 space-y-8">
                <div className="p-10 rounded-[2.5rem] bg-[#0c1c13] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
                  
                  <h3 className="font-cormorant text-3xl text-cream mb-8">Summary</h3>
                  
                  <div className="space-y-5 mb-10 pb-10 border-b border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="font-poppins text-[10px] text-cream/30 uppercase tracking-widest">Ritual Subtotal</span>
                      <span className="font-poppins text-sm text-cream/80">₹{subtotal.toLocaleString()}</span>
                    </div>
                    {couponApplied && (
                      <div className="flex justify-between items-center">
                        <span className="font-poppins text-[10px] text-emerald-400 uppercase tracking-widest">Premium Discount</span>
                        <span className="font-poppins text-sm text-emerald-400">−₹{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-poppins text-[10px] text-cream/30 uppercase tracking-widest">Handled & Shipping</span>
                      <span className="font-poppins text-sm text-cream/80">{delivery === 0 ? "Complimentary" : `₹${delivery}`}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-poppins text-[10px] text-cream/30 uppercase tracking-widest">Legacy Tax (5%)</span>
                      <span className="font-poppins text-sm text-cream/80">₹{tax.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <p className="font-poppins text-[9px] text-gold tracking-[0.3em] uppercase mb-1">Total Investment</p>
                      <p className="font-cormorant text-5xl text-cream">₹{total.toLocaleString()}</p>
                    </div>
                    <span className="font-poppins text-[8px] text-cream/20 uppercase tracking-widest mb-2">Incl. All Rituals</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input placeholder="Ritual Token" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-cream font-poppins text-[10px] placeholder:text-cream/10 focus:outline-none focus:border-gold/30" />
                      <button onClick={handleApplyCoupon} className="px-6 py-3 border border-gold/20 text-gold font-poppins text-[9px] font-bold uppercase rounded-xl hover:bg-gold/10 transition-all">Apply</button>
                    </div>
                    <p className="text-[8px] font-poppins text-cream/20 text-center tracking-[0.2em] uppercase mt-4">Safe & Encrypted Session</p>
                  </div>
                </div>

                <div className="flex gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 items-center">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold text-lg">🛡️</div>
                  <p className="font-poppins text-[10px] text-cream/40 leading-relaxed uppercase tracking-wider">Your transaction is protected by 256-bit AES encryption & Secure Razorpay Tunneling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
