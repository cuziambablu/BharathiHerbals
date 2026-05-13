"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type OrderStatus } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { AdminRoute } from "@/components/RouteGuard";
import { bestSellers } from "@/data/product";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const supabase = createClient();

type AdminTab = "overview" | "orders" | "products" | "customers" | "inventory";

const statusLabels: Record<string, string> = {
  ordered: "New Order",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

const statusColors: Record<string, string> = {
  ordered: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confirmed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  packed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  shipped: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  out_for_delivery: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-400/20"
};

export default function AdminDashboard() {
  const { allOrders, allUsers, updateOrderStatus, logout } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        if (data) setProducts(data);
      } catch (err) {
        console.error("Failed to fetch admin products:", err);
        setProducts(bestSellers.map(p => ({
          product_name: p.name,
          bottle_size: p.variants[0].size,
          price: p.variants[0].price,
          stock: p.variants[0].stock,
          image_urls: p.images
        })));
      }
    };
    fetchProducts();
  }, []);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalRevenue = allOrders.filter(o => o.paymentStatus === "success").reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = allOrders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length;
    const deliveredOrders = allOrders.filter(o => o.status === "delivered").length;
    return {
      revenue: totalRevenue,
      orders: allOrders.length,
      pending: pendingOrders,
      delivered: deliveredOrders,
      customers: allUsers.length,
      products: products.length,
      salesGrowth: "+12.5%"
    };
  }, [allOrders, allUsers, products]);


  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allOrders, searchQuery]);

  return (
    <AdminRoute>
      <main className="min-h-screen bg-[#071A13] flex flex-col lg:flex-row">
        
        {/* Admin Sidebar */}
        <aside className="w-full lg:w-72 bg-black/20 border-r border-white/5 flex flex-col p-6 sticky top-0 h-screen">
          <div className="mb-12 px-2">
            <Link href="/" className="font-cormorant text-2xl tracking-[0.3em] text-gold font-semibold block">
              BHARATHI
            </Link>
            <p className="font-poppins text-[10px] text-cream/20 tracking-widest uppercase mt-2">Admin Control Panel</p>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "orders", label: "Orders", icon: "📦" },
              { id: "products", label: "Products", icon: "🧴" },
              { id: "customers", label: "Customers", icon: "👥" },
              { id: "inventory", label: "Inventory", icon: "🏭" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-poppins text-[11px] tracking-widest uppercase ${
                  activeTab === item.id 
                    ? "bg-gold text-[#071A13] font-bold shadow-lg shadow-gold/10" 
                    : "text-cream/40 hover:bg-white/5 hover:text-cream"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/5 mt-auto">
            <button 
              onClick={() => { logout(); showToast("Admin Session Ended", "info"); }}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400/50 hover:bg-red-400/5 hover:text-red-400 transition-all font-poppins text-[11px] tracking-widest uppercase"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </aside>

        {/* Admin Content Area */}
        <section className="flex-1 p-8 lg:p-12 overflow-y-auto">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="font-cormorant text-4xl text-cream capitalize">{activeTab}</h1>
              <p className="font-poppins text-xs text-cream/30 mt-2">Managing BHARATHI Luxury Herbal Products</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="font-poppins text-[10px] text-emerald-400/80 tracking-widest uppercase">Live System Active</p>
            </div>
          </header>

          <AnimatePresence mode="wait">
            
            {/* Overview View */}
            {activeTab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: "💰", color: "text-gold" },
                    { label: "Active Orders", value: stats.pending, icon: "🔥", color: "text-amber-400" },
                    { label: "Total Customers", value: stats.customers, icon: "👥", color: "text-blue-400" },
                    { label: "Sales Growth", value: stats.salesGrowth, icon: "📈", color: "text-emerald-400" },
                  ].map((stat, i) => (
                    <motion.div 
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/[0.03] border border-white/10 rounded-3xl p-8"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-2xl">{stat.icon}</span>
                        <span className="text-xs font-poppins text-cream/20 uppercase tracking-tighter">Live</span>
                      </div>
                      <h4 className="font-poppins text-[10px] text-cream/40 tracking-widest uppercase mb-1">{stat.label}</h4>
                      <p className={`font-cormorant text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Simplified Analytics Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
                    <h3 className="font-cormorant text-2xl text-cream mb-8">Monthly Sales Performance</h3>
                    <div className="flex items-end justify-between h-48 gap-2">
                      {[40, 65, 45, 80, 55, 90, 70].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${val}%` }}
                            className="w-full bg-gradient-to-t from-gold/5 to-gold/40 rounded-t-lg"
                          />
                          <span className="text-[9px] font-poppins text-cream/20 uppercase">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
                    <h3 className="font-cormorant text-2xl text-cream mb-8">Top Selling Variants</h3>
                    <div className="space-y-6">
                      {[
                        { label: "Herbal Oil 200ml", value: "42%", color: "bg-gold" },
                        { label: "Herbal Oil 500ml", value: "31%", color: "bg-gold/60" },
                        { label: "Herbal Oil 100ml", value: "18%", color: "bg-gold/30" },
                        { label: "Growth Serum", value: "9%", color: "bg-gold/10" },
                      ].map((item, i) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-poppins tracking-widest uppercase">
                            <span className="text-cream/60">{item.label}</span>
                            <span className="text-gold">{item.value}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: item.value }}
                              className={`h-full ${item.color} rounded-full`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders View */}
            {activeTab === "orders" && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-cream/20">🔍</span>
                    <input 
                      placeholder="Search Order ID, Customer Name..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-14 py-4 text-cream font-poppins text-sm outline-none focus:border-gold/40"
                    />
                  </div>
                  <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-cream/60 font-poppins text-xs tracking-widest uppercase hover:bg-white/10">Filter</button>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] text-cream/30 tracking-widest uppercase">
                          <th className="px-8 py-6">Order ID</th>
                          <th className="px-8 py-6">Customer</th>
                          <th className="px-8 py-6">Amount</th>
                          <th className="px-8 py-6">Payment</th>
                          <th className="px-8 py-6">Status</th>
                          <th className="px-8 py-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-8 py-6 font-poppins text-xs text-cream font-bold">#{order.id}</td>
                            <td className="px-8 py-6">
                              <p className="font-poppins text-xs text-cream">{order.customerName}</p>
                              <p className="font-poppins text-[10px] text-cream/30 mt-0.5">{order.customerPhone}</p>
                            </td>
                            <td className="px-8 py-6 font-cormorant text-lg text-gold font-bold">₹{order.total.toLocaleString()}</td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-poppins tracking-widest uppercase ${
                                order.paymentStatus === 'success' ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {order.paymentMethod} • {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <select 
                                value={order.status}
                                onChange={(e) => {
                                  updateOrderStatus(order.id, e.target.value as OrderStatus);
                                  showToast(`Order ${order.id} updated to ${e.target.value}`, "success");
                                }}
                                className={`px-4 py-2 rounded-xl border text-[9px] font-poppins tracking-widest uppercase outline-none bg-[#0a1810] ${statusColors[order.status]}`}
                              >
                                {Object.keys(statusLabels).map(s => (
                                  <option key={s} value={s}>{statusLabels[s]}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-8 py-6 text-cream/30 hover:text-gold cursor-pointer">•••</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Products View */}
            {activeTab === "products" && (
              <motion.div 
                key="products"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-cormorant text-2xl text-cream">Product Inventory</h3>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gold text-[#071A13] font-poppins text-[10px] tracking-widest uppercase font-bold rounded-xl shadow-lg shadow-gold/10 hover:scale-105 transition-transform"
                  >
                    + Add Product
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden group">
                      <div className="h-48 bg-black/20 flex items-center justify-center p-8">
                        <img src={product.image_urls?.[0] || "/images/bharathi-oil.png"} className="h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-poppins text-sm text-cream">{product.product_name}</h4>
                          <span className="bg-gold/10 text-gold text-[8px] font-poppins px-2 py-1 rounded uppercase tracking-tighter">{product.category}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="font-cormorant text-xl text-gold">₹{product.price}</p>
                          <p className="font-poppins text-[10px] text-cream/40 uppercase">Stock: <span className="text-cream">{product.stock} Units</span></p>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex gap-2">
                          <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] text-cream/60 font-poppins uppercase tracking-widest hover:bg-white/10">Edit</button>
                          <button className="px-4 py-3 bg-red-400/5 border border-red-400/10 rounded-xl text-[9px] text-red-400/60 font-poppins uppercase tracking-widest hover:bg-red-400/10">✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Product Modal */}
                <AnimatePresence>
                  {showAddModal && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                      <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-[#071A13] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                      >
                        <div className="flex justify-between items-center mb-10">
                          <h2 className="font-cormorant text-3xl text-cream">Add New Product</h2>
                          <button onClick={() => setShowAddModal(false)} className="text-cream/20 hover:text-cream">✕</button>
                        </div>

                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const newProduct = {
                            product_name: formData.get("name"),
                            slug: (formData.get("name") as string).toLowerCase().replace(/ /g, "-"),
                            category: formData.get("category"),
                            price: Number(formData.get("price")),
                            stock: Number(formData.get("stock")),
                            image_urls: [(formData.get("image") as string) || "/images/bharathi-oil.png"],
                            bottle_size: formData.get("size"),
                            tagline: formData.get("tagline"),
                            description: formData.get("description"),
                          };

                          const { data, error } = await supabase.from('products').insert([newProduct]).select();
                          if (error) {
                            showToast(error.message, "error");
                          } else {
                            showToast("Product added successfully", "success");
                            setProducts([...products, data[0]]);
                            setShowAddModal(false);
                          }
                        }} className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="font-poppins text-[10px] text-cream/30 uppercase tracking-widest">Name</label>
                              <input name="name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream outline-none focus:border-gold/40" />
                            </div>
                            <div className="space-y-2">
                              <label className="font-poppins text-[10px] text-cream/30 uppercase tracking-widest">Category</label>
                              <select name="category" className="w-full bg-[#071A13] border border-white/10 rounded-xl px-4 py-3 text-cream outline-none focus:border-gold/40">
                                <option value="Hair Oil">Hair Oil</option>
                                <option value="Serum">Serum</option>
                                <option value="Shampoo">Shampoo</option>
                                <option value="Conditioner">Conditioner</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="font-poppins text-[10px] text-cream/30 uppercase tracking-widest">Price (₹)</label>
                              <input name="price" type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream outline-none focus:border-gold/40" />
                            </div>
                            <div className="space-y-2">
                              <label className="font-poppins text-[10px] text-cream/30 uppercase tracking-widest">Stock</label>
                              <input name="stock" type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream outline-none focus:border-gold/40" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="font-poppins text-[10px] text-cream/30 uppercase tracking-widest">Image URL</label>
                            <input name="image" placeholder="/images/bharathi-oil.png" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream outline-none focus:border-gold/40" />
                          </div>

                          <div className="space-y-2">
                            <label className="font-poppins text-[10px] text-cream/30 uppercase tracking-widest">Description</label>
                            <textarea name="description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cream outline-none focus:border-gold/40" />
                          </div>

                          <button type="submit" className="w-full py-4 bg-gold text-[#071A13] font-poppins text-xs font-bold tracking-widest uppercase rounded-xl">Create Product</button>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Customers View */}
            {activeTab === "customers" && (
              <motion.div 
                key="customers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] text-cream/30 tracking-widest uppercase">
                        <th className="px-8 py-6">Customer</th>
                        <th className="px-8 py-6">Orders</th>
                        <th className="px-8 py-6">Total Spent</th>
                        <th className="px-8 py-6">Joined</th>
                        <th className="px-8 py-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-cormorant text-lg text-gold">{u.name[0]}</div>
                              <div>
                                <p className="font-poppins text-xs text-cream">{u.name}</p>
                                <p className="font-poppins text-[10px] text-cream/20 mt-0.5">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 font-poppins text-xs text-cream/60">{Math.floor(Math.random() * 10)} Orders</td>
                          <td className="px-8 py-6 font-cormorant text-lg text-gold">₹{(Math.random() * 5000 + 1000).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                          <td className="px-8 py-6 font-poppins text-[10px] text-cream/30 uppercase">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-poppins tracking-widest uppercase border border-emerald-500/20">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Inventory View */}
            {activeTab === "inventory" && (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
                  <h3 className="font-cormorant text-2xl text-cream mb-6">Low Stock Alerts</h3>
                  <div className="space-y-4">
                    {[
                      { name: "Herbal Oil 500ml", stock: 12, threshold: 20 },
                      { name: "Growth Serum 50ml", stock: 8, threshold: 15 },
                    ].map(item => (
                      <div key={item.name} className="p-4 bg-red-400/5 border border-red-400/10 rounded-2xl flex justify-between items-center">
                        <p className="font-poppins text-xs text-cream">{item.name}</p>
                        <p className="font-poppins text-[10px] text-red-400 font-bold uppercase tracking-widest">Only {item.stock} Left</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
                  <h3 className="font-cormorant text-2xl text-cream mb-6">Inventory Value</h3>
                  <p className="font-poppins text-[10px] text-cream/30 tracking-widest uppercase mb-2">Total Warehouse Valuation</p>
                  <p className="font-cormorant text-4xl text-gold font-bold">₹14,82,500</p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </main>
    </AdminRoute>
  );
}
