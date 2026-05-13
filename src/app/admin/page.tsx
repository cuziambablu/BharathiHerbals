"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const tabs = ["Overview", "Orders", "Products", "Customers", "Analytics"];

const statusColors: Record<string, string> = {
  ordered: "bg-blue-400/20 text-blue-400",
  packed: "bg-amber-400/20 text-amber-400",
  shipped: "bg-purple-400/20 text-purple-400",
  out_for_delivery: "bg-orange-400/20 text-orange-400",
  delivered: "bg-emerald-400/20 text-emerald-400",
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const { allOrders, allUsers, updateOrderStatus } = useAuth();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        if (data) setProducts(data);
      } catch (err) {
        console.error("Failed to fetch admin products:", err);
      }
    };
    fetchProducts();
  }, []);

  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.paymentStatus === 'success' ? o.total : 0), 0);

  const stats = [
    { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, change: "+12.5%", icon: "💰" },
    { label: "Orders", value: allOrders.length.toString(), change: "+8.3%", icon: "📦" },
    { label: "Customers", value: allUsers.length.toString(), change: "+15.7%", icon: "👥" },
    { label: "Products", value: products.length.toString(), change: "+2", icon: "🧴" },
  ];

  return (
    <main className="min-h-screen bg-[#0a1810]">
      <Navbar />
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-cormorant text-4xl text-cream">Admin Dashboard</h1>
              <p className="font-poppins text-cream/30 text-sm mt-1">BHARATHI Beauty Products</p>
            </div>
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 font-poppins text-[10px] tracking-widest uppercase rounded-full">Live</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 rounded-lg font-poppins text-xs tracking-widest uppercase whitespace-nowrap transition-all ${
                  activeTab === tab ? "bg-gold/20 text-gold" : "text-cream/40 hover:text-cream/60"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === "Overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-emerald-400 font-poppins text-xs">{stat.change}</span>
                    </div>
                    <p className="font-cormorant text-2xl text-cream">{stat.value}</p>
                    <p className="font-poppins text-xs text-cream/30 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Revenue chart placeholder */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-poppins text-sm text-cream mb-4">Revenue (Last 7 Days)</h3>
                <div className="flex items-end gap-2 h-40">
                  {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-gold/40 to-gold/10 rounded-t-lg"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <span key={d} className="font-poppins text-[10px] text-cream/20 flex-1 text-center">{d}</span>
                  ))}
                </div>
              </div>

              {/* Recent orders */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-poppins text-sm text-cream mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {allOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                      <div>
                        <p className="font-poppins text-xs text-cream">{order.customerName}</p>
                        <p className="font-poppins text-[10px] text-cream/30">{order.id.slice(0, 8)} · {new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-poppins tracking-wider uppercase ${statusColors[order.status]}`}>
                          {order.status.replace("_", " ")}
                        </span>
                        <span className="font-poppins text-sm text-cream">₹{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders tab */}
          {activeTab === "Orders" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left font-poppins text-[10px] text-cream/30 tracking-widest uppercase pb-3">Order ID</th>
                      <th className="text-left font-poppins text-[10px] text-cream/30 tracking-widest uppercase pb-3">Customer</th>
                      <th className="text-left font-poppins text-[10px] text-cream/30 tracking-widest uppercase pb-3">Date</th>
                      <th className="text-left font-poppins text-[10px] text-cream/30 tracking-widest uppercase pb-3">Status</th>
                      <th className="text-right font-poppins text-[10px] text-cream/30 tracking-widest uppercase pb-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((order) => (
                      <tr key={order.id} className="border-b border-white/[0.03]">
                        <td className="py-4 font-poppins text-xs text-cream">{order.id.slice(0, 8)}</td>
                        <td className="py-4 font-poppins text-xs text-cream/60">{order.customerName}</td>
                        <td className="py-4 font-poppins text-xs text-cream/30">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="py-4">
                          <select 
                            value={order.status} 
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                            className={`bg-transparent border-none font-poppins text-[9px] tracking-wider uppercase focus:outline-none ${statusColors[order.status]}`}
                          >
                            {Object.keys(statusColors).map(s => <option key={s} value={s} className="bg-[#0a1810] text-cream">{s.replace("_", " ")}</option>)}
                          </select>
                        </td>
                        <td className="py-4 font-poppins text-sm text-cream text-right">₹{order.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Products tab */}
          {activeTab === "Products" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left font-poppins text-[10px] text-cream/30 tracking-widest uppercase pb-3">Product</th>
                      <th className="text-left font-poppins text-[10px] text-cream/30 tracking-widest uppercase pb-3">Size</th>
                      <th className="text-left font-poppins text-[10px] text-cream/30 tracking-widest uppercase pb-3">Stock</th>
                      <th className="text-right font-poppins text-[10px] text-cream/30 tracking-widest uppercase pb-3">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={i} className="border-b border-white/[0.03]">
                        <td className="py-4 font-poppins text-xs text-cream">{p.product_name}</td>
                        <td className="py-4 font-poppins text-xs text-cream/60">{p.bottle_size}</td>
                        <td className="py-4">
                          <span className={`font-poppins text-xs ${p.stock < 50 ? "text-amber-400" : "text-emerald-400/70"}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-4 font-poppins text-sm text-cream text-right">₹{p.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Customers tab */}
          {activeTab === "Customers" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-poppins text-gold text-sm font-bold">
                    {u.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-poppins text-sm text-cream">{u.name}</p>
                    <p className="font-poppins text-[10px] text-cream/30">{u.role} · Member since {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Analytics tab */}
          {activeTab === "Analytics" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="font-poppins text-xs text-cream/30 mb-2">Conversion Rate</p>
                  <p className="font-cormorant text-3xl text-cream">4.8%</p>
                  <p className="font-poppins text-xs text-emerald-400 mt-1">↑ 0.3% from last month</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="font-poppins text-xs text-cream/30 mb-2">Avg. Order Value</p>
                  <p className="font-cormorant text-3xl text-cream">₹{(totalRevenue / (allOrders.length || 1)).toFixed(0)}</p>
                  <p className="font-poppins text-xs text-emerald-400 mt-1">↑ ₹120 from last month</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="font-poppins text-xs text-cream/30 mb-2">Return Rate</p>
                  <p className="font-cormorant text-3xl text-cream">1.2%</p>
                  <p className="font-poppins text-xs text-emerald-400 mt-1">↓ 0.5% from last month</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-poppins text-sm text-cream mb-4">Top Selling Products</h3>
                <div className="space-y-3">
                  {products.slice(0, 5).map((p, i) => (
                    <div key={p.id}>
                      <div className="flex justify-between font-poppins text-xs mb-1">
                        <span className="text-cream/60">{p.product_name}</span>
                        <span className="text-cream/30">{40 - i * 5}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${40 - i * 5}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

