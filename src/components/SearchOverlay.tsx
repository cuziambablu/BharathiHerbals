"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { bestSellers } from "@/data/product";
import { getProducts } from "@/lib/db";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      getProducts().then(setProducts);
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const results = query.length > 1
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10003] bg-black/80 backdrop-blur-xl flex flex-col items-center pt-32 px-6"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-cream text-xl transition-all"
          >
            ✕
          </button>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-xl"
          >
            <div className="relative">
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-cream/30" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-5 text-cream font-poppins text-lg placeholder:text-cream/20 focus:outline-none focus:border-gold/40 transition-colors"
              />
            </div>

            {/* Results */}
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href="/product"
                    onClick={onClose}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    <div className="w-12 h-14 bg-black/30 rounded-lg flex-shrink-0 overflow-hidden">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-poppins text-sm text-cream">{product.name}</p>
                      <p className="text-gold text-xs mt-0.5">₹{product.variants[0].price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}

            {query.length > 1 && results.length === 0 && (
              <p className="mt-6 text-center text-cream/30 font-poppins text-sm">No products found for &quot;{query}&quot;</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
