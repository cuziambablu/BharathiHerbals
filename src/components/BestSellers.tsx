"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Product, bestSellers } from "@/data/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { getProducts } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import MagneticButton from "./MagneticButton";

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const liked = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
      className="group relative min-w-[320px] max-w-[320px] flex-shrink-0"
    >
      <div className="relative aspect-[3/4] bg-[#0c1c13] border border-white/5 rounded-[2.5rem] overflow-hidden group-hover:border-gold/20 transition-all duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {/* Badge */}
        {product.badge && (
          <span className="absolute top-6 left-6 z-10 bg-gold/90 backdrop-blur-md text-[#0a1810] font-poppins text-[8px] font-bold tracking-[0.3em] uppercase px-4 py-1.5 rounded-full">
            {product.badge}
          </span>
        )}

        {/* Wishlist */}
        <div className="absolute top-6 right-6 z-20">
          <MagneticButton distance={0.3}>
            <button
              onClick={() => {
                toggleWishlist(product.id);
                showToast(liked ? "Removed from wishlist" : "Added to wishlist", "info");
              }}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all hover:bg-gold/10 group-hover:border-gold/30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#C8A96B" : "none"} stroke={liked ? "#C8A96B" : "white"} strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </MagneticButton>
        </div>

        <Link href={`/product/${product.slug}`} className="block h-full p-12">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 2 }}
            transition={{ duration: 1.2, ease: [0.21, 0.45, 0.32, 0.9] }}
            className="relative h-full w-full"
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </motion.div>
        </Link>

        {/* Quick Add */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          className="absolute bottom-6 left-6 right-6"
        >
          <button
            onClick={() => {
              addToCart({
                productId: product.id,
                name: product.name,
                size: product.variants[0].size,
                price: product.variants[0].price,
                image: product.images[0],
              });
              showToast("Added to bag!", "success");
            }}
            className="w-full py-4 bg-cream text-[#0a1810] font-poppins text-[9px] font-bold tracking-[0.2em] uppercase rounded-2xl shadow-2xl transition-transform hover:scale-[1.02]"
          >
            Express Bag
          </button>
        </motion.div>
      </div>

      <div className="mt-6 px-2 space-y-1">
        <p className="font-poppins text-gold/40 text-[9px] tracking-[0.3em] uppercase">{product.category}</p>
        <div className="flex justify-between items-baseline">
          <h3 className="font-cormorant text-2xl text-cream italic">{product.name}</h3>
          <span className="font-cormorant text-xl text-gold">₹{product.variants[0].price.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>(bestSellers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);

    getProducts().then(data => {
      setProducts(data.slice(0, 4));
      setLoading(false);
      clearTimeout(timer);
    }).catch(() => {
      setLoading(false);
      clearTimeout(timer);
    });

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[1px] bg-gold/40" />
              <p className="font-poppins text-gold text-[10px] tracking-[0.4em] uppercase">Customer Favorites</p>
            </div>
            <h2 className="font-cormorant text-6xl md:text-7xl text-cream leading-tight">
              Best <span className="italic font-light text-cream/40 text-5xl">Sellers</span>
            </h2>
          </motion.div>

          <Link href="/product">
            <MagneticButton>
              <span className="font-poppins text-[10px] tracking-[0.2em] uppercase text-gold/60 hover:text-gold transition-colors border-b border-gold/20 pb-2">
                Explore Full Collection
              </span>
            </MagneticButton>
          </Link>
        </div>

        <div className="flex justify-center gap-8 overflow-x-auto pb-12 scrollbar-hide px-2">
          {loading && products.length === 0 ? (
            [...Array(1)].map((_, i) => (
              <div key={i} className="min-w-[320px] h-[450px] bg-white/[0.02] border border-white/5 rounded-[2.5rem] animate-pulse" />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}
