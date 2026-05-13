"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const steps = [
  { key: "ordered", label: "Ordered", icon: "📋", desc: "Your order has been confirmed" },
  { key: "packed", label: "Packed", icon: "📦", desc: "Items are being packed" },
  { key: "shipped", label: "Shipped", icon: "🚛", desc: "On the way to your city" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🏍️", desc: "Arriving today" },
  { key: "delivered", label: "Delivered", icon: "✅", desc: "Delivered successfully" },
];

export default function TrackOrderPage() {
  const { orders } = useAuth();
  const [trackingId, setTrackingId] = useState("");
  const latestOrder = orders[0];

  const order = trackingId
    ? orders.find((o) => o.id.toLowerCase() === trackingId.toLowerCase()) || null
    : latestOrder || null;

  const statusIdx = order ? steps.findIndex((s) => s.key === order.status) : -1;

  return (
    <main className="min-h-screen bg-[#0a1810]">
      <Navbar />
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-cormorant text-4xl text-cream mb-8">Track Order</h1>

          <div className="flex gap-3 mb-10">
            <input
              placeholder="Enter Order ID (e.g. BHR-...)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-cream font-poppins text-sm placeholder:text-cream/20 focus:outline-none focus:border-gold/40"
            />
          </div>

          {order ? (
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="font-poppins text-sm text-cream">Order #{order.id}</p>
                  <p className="font-poppins text-xs text-cream/30 mt-1">
                    {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <p className="font-cormorant text-2xl text-gold">₹{order.total.toLocaleString()}</p>
              </div>

              {/* Tracking steps */}
              <div className="space-y-0">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        i <= statusIdx ? "bg-gold/20" : "bg-white/5"
                      }`}>
                        {step.icon}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-0.5 h-12 ${i < statusIdx ? "bg-gold/40" : "bg-white/10"}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`font-poppins text-sm ${i <= statusIdx ? "text-cream" : "text-cream/30"}`}>{step.label}</p>
                      <p className="font-poppins text-xs text-cream/30 mt-0.5">{step.desc}</p>
                      {i === statusIdx && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gold/20 text-gold text-[10px] font-poppins tracking-wider rounded">Current</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="text-5xl opacity-20 block mb-4">🔍</span>
              <p className="font-poppins text-cream/30 text-sm">
                {trackingId ? "No order found with that ID" : "No orders to track yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
