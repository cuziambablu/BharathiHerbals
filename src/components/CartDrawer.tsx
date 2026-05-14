"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect } from "react";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, totalItems, subtotal } = useCart();

  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-[999999] pointer-events-none ${isOpen ? "pointer-events-auto" : ""}`}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10]"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a1810] border-l border-gold/10 z-[20] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                <div>
                  <h2 className="font-cormorant text-2xl text-cream">Shopping Bag</h2>
                  <p className="font-poppins text-[10px] text-gold tracking-widest uppercase mt-1">
                    {totalItems} {totalItems === 1 ? "Item" : "Items"} in Ritual
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cream/40 hover:text-cream transition-all group"
                >
                  <span className="text-xl group-hover:rotate-90 transition-transform">✕</span>
                </button>
              </div>

              {/* Items Area */}
              <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-3xl opacity-20">🛒</div>
                    <p className="font-poppins text-cream/30 text-sm">Your ritual is empty</p>
                    <button
                      onClick={closeCart}
                      className="px-8 py-3 border border-gold/20 rounded-full text-gold font-poppins text-[10px] tracking-widest uppercase hover:bg-gold/5 transition-all"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.size}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-gold/20 transition-all"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-24 rounded-xl bg-black/40 p-2 flex-shrink-0 overflow-hidden relative">
                          <img
                            src={item.image || "/images/sequence/frame-001.jpg"}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-cormorant text-lg text-cream leading-tight truncate pr-2">{item.name}</h3>
                              <button
                                onClick={() => removeFromCart(item.productId, item.size)}
                                className="text-cream/20 hover:text-red-400 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="font-poppins text-[10px] text-cream/30 tracking-widest uppercase mt-1">{item.size}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center bg-black/40 rounded-full border border-white/5 px-2 py-1">
                              <button
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-cream/40 hover:text-gold"
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-poppins text-xs text-cream">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-cream/40 hover:text-gold"
                              >
                                +
                              </button>
                            </div>
                            <p className="font-poppins text-sm text-gold font-medium">₹{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Checkout */}
              {items.length > 0 && (
                <div className="px-8 py-8 border-t border-white/5 space-y-6 bg-black/20">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-poppins text-cream/40 text-[10px] tracking-widest uppercase">Subtotal</span>
                      <span className="font-cormorant text-2xl text-cream">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-40">
                      <span className="font-poppins text-[10px] tracking-widest uppercase">Shipping</span>
                      <span className="font-poppins text-xs uppercase">Calculated at Checkout</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex items-center justify-center w-full py-5 bg-gold text-[#0a1810] rounded-2xl font-poppins font-bold text-xs tracking-[0.3em] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(200,169,107,0.3)]"
                  >
                    Proceed to Checkout
                  </Link>
                  
                  <button
                    onClick={closeCart}
                    className="w-full text-center font-poppins text-[10px] text-cream/20 tracking-widest uppercase hover:text-cream/50 transition-colors"
                  >
                    Continue Ritual
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
