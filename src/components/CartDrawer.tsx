"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, totalItems, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-[#0d1f15] to-[#0a1810] border-l border-white/10 z-[10002] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <h2 className="font-cormorant text-2xl text-cream">
                Shopping Bag <span className="text-gold text-lg">({totalItems})</span>
              </h2>
              <button
                onClick={closeCart}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cream/70 hover:text-cream transition-all"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-5xl mb-4 opacity-30">🛒</span>
                  <p className="font-poppins text-cream/50 text-sm">Your bag is empty</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 text-gold text-sm underline underline-offset-4 hover:text-cream transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.size}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                      >
                        {/* Image */}
                        <div className="w-16 h-20 rounded-lg bg-black/30 flex-shrink-0 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-poppins text-sm text-cream truncate">{item.name}</h3>
                          <p className="text-cream/40 text-xs mt-0.5">{item.size}</p>
                          <p className="text-gold font-semibold text-sm mt-1">₹{item.price.toLocaleString()}</p>

                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-cream/70 hover:text-cream flex items-center justify-center text-sm transition-all"
                            >
                              −
                            </button>
                            <span className="font-poppins text-sm text-cream w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-cream/70 hover:text-cream flex items-center justify-center text-sm transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-cream/30 hover:text-red-400 transition-colors self-start text-lg"
                        >
                          ✕
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-poppins text-cream/60 text-sm">Subtotal</span>
                  <span className="font-cormorant text-2xl text-gold">₹{subtotal.toLocaleString()}</span>
                </div>
                <p className="text-cream/30 text-xs font-poppins">Shipping calculated at checkout</p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full py-4 bg-gradient-to-r from-[#C8A96B] to-[#B8964F] text-[#0a1810] text-center font-poppins font-semibold text-sm tracking-widest uppercase rounded-xl hover:shadow-lg hover:shadow-gold/20 transition-all"
                >
                  Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full text-center text-cream/40 text-xs font-poppins hover:text-cream/70 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
