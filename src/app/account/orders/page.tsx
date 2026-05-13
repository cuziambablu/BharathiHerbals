"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const statusSteps = ["ordered", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"] as const;
const statusLabels: Record<string, string> = {
  ordered: "Ordered",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const { orders } = useAuth();

  return (
    <main className="min-h-screen bg-[#0a1810]">
      <Navbar />
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cormorant text-4xl text-cream mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl opacity-20 block mb-6">📦</span>
              <h2 className="font-cormorant text-2xl text-cream/50 mb-4">No orders yet</h2>
              <Link href="/product" className="inline-block px-8 py-3 bg-gold text-[#0a1810] font-poppins text-xs font-semibold tracking-widest uppercase rounded-xl">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                const stepIdx = order.status === "cancelled" ? -1 : statusSteps.indexOf(order.status as any);
                return (
                  <div key={order.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-poppins text-xs text-cream/30">Order #{order.id}</p>
                        <p className="font-poppins text-[10px] text-cream/20">
                          {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-poppins text-[10px] tracking-wider uppercase ${
                        order.status === "delivered" ? "bg-emerald-500/20 text-emerald-400" : "bg-gold/20 text-gold"
                      }`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-1 mb-4">
                      {statusSteps.map((_, i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full ${i <= stepIdx ? "bg-gold" : "bg-white/10"}`} />
                      ))}
                    </div>

                    {/* Items */}
                    <div className="space-y-2 mb-3">
                      {order.items.map((item, i) => (
                        <p key={i} className="font-poppins text-xs text-cream/50">
                          {item.name} ({item.size}) × {item.qty} — ₹{(item.price * item.qty).toLocaleString()}
                        </p>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/[0.06]">
                      <p className="font-poppins text-xs text-cream/30">{order.paymentMethod}</p>
                      <p className="font-cormorant text-xl text-gold">₹{order.total.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
