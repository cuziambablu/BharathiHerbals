"use client";

import { motion } from "framer-motion";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { bestSellers } from "@/data/product";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const products = bestSellers.filter((p) => items.includes(p.id));

  return (
    <main className="min-h-screen bg-[#0a1810]">
      <Navbar />
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-cormorant text-4xl text-cream mb-2">Wishlist</h1>
          <p className="font-poppins text-cream/30 text-sm mb-10">{products.length} saved items</p>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl opacity-20 block mb-6">♡</span>
              <h2 className="font-cormorant text-2xl text-cream/50 mb-4">Your wishlist is empty</h2>
              <Link href="/product" className="inline-block px-8 py-3 bg-gold text-[#0a1810] font-poppins text-xs font-semibold tracking-widest uppercase rounded-xl">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
                >
                  <Link href="/product" className="block h-52 bg-black/20 flex items-center justify-center p-6">
                    <img src={product.images[0]} alt={product.name} className="h-full w-auto object-contain" />
                  </Link>
                  <div className="p-5 space-y-3">
                    <h3 className="font-cormorant text-xl text-cream">{product.name}</h3>
                    <p className="font-cormorant text-2xl text-gold">₹{product.variants[0].price.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          addToCart({
                            productId: product.id,
                            name: product.name,
                            size: product.variants[0].size,
                            price: product.variants[0].price,
                            image: product.images[0],
                          });
                          showToast("Added to bag!", "cart");
                        }}
                        className="flex-1 py-3 bg-white/[0.06] border border-white/10 rounded-xl font-poppins text-xs tracking-widest uppercase text-cream hover:text-gold hover:border-gold/40 transition-all"
                      >
                        Add to Bag
                      </button>
                      <button
                        onClick={() => {
                          removeFromWishlist(product.id);
                          showToast("Removed from wishlist", "info");
                        }}
                        className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-red-400/60 hover:text-red-400 hover:border-red-400/30 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
