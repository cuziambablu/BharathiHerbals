"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "@/lib/db";
import { type Product } from "@/data/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import MagneticButton from "@/components/MagneticButton";

function ProductSkeleton() {
  return (
    <div className="space-y-6">
      <div className="aspect-[4/5] bg-white/[0.03] border border-white/[0.06] rounded-[2rem] overflow-hidden animate-pulse" />
      <div className="space-y-3 px-2">
        <div className="h-2 w-20 bg-white/[0.05] rounded-full animate-pulse" />
        <div className="h-6 w-48 bg-white/[0.05] rounded-full animate-pulse" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 w-16 bg-white/[0.05] rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-white/[0.05] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const liked = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
      className="group relative"
    >
      <div className="relative aspect-[4/5] bg-[#0c1c13] border border-white/[0.04] rounded-[2.5rem] overflow-hidden group-hover:border-gold/20 transition-all duration-700 ease-out">
        {/* Badge */}
        <div className="absolute top-6 left-6 z-20">
          {product.badge && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              className="bg-gold/90 backdrop-blur-md text-[#0a1810] font-poppins text-[8px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full shadow-xl shadow-black/20"
            >
              {product.badge}
            </motion.span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-6 right-6 z-20">
          <MagneticButton distance={0.3}>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
                showToast(liked ? "Removed from wishlist" : "Added to wishlist", "info");
              }}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all hover:bg-gold/10 group-hover:border-gold/30"
            >
              <motion.svg 
                animate={liked ? { scale: [1, 1.2, 1] } : {}}
                width="20" height="20" viewBox="0 0 24 24" 
                fill={liked ? "#C8A96B" : "none"} 
                stroke={liked ? "#C8A96B" : "white"} 
                strokeWidth="1.5" 
                className="transition-colors"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </motion.svg>
            </button>
          </MagneticButton>
        </div>

        {/* Product Image */}
        <Link href={`/product/${product.slug}`} className="block h-full w-full cursor-pointer relative overflow-hidden">
          <motion.div 
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 1.2, ease: [0.21, 0.45, 0.32, 0.9] }}
            className="h-full w-full flex items-center justify-center p-12 relative z-10"
          >
            <div className="absolute inset-0 bg-gradient-radial from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_30px_60px_rgba(200,169,107,0.2)] transition-all duration-700"
            />
          </motion.div>
        </Link>

        {/* Add to Cart Overlay */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          className="absolute bottom-6 left-6 right-6 z-20 md:opacity-0 group-hover:opacity-100 transition-all duration-500"
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
              showToast("Successfully added to your bag", "success");
            }}
            className="w-full py-4 bg-cream text-[#0a1810] font-poppins text-[10px] font-bold tracking-[0.2em] uppercase rounded-2xl shadow-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Add to Bag
          </button>
        </motion.div>
      </div>

      <div className="mt-6 space-y-2 px-2">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="font-poppins text-gold/60 text-[9px] tracking-[0.3em] uppercase">{product.category}</p>
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-cormorant text-2xl text-cream group-hover:text-gold transition-colors duration-300">{product.name}</h3>
            </Link>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-cormorant text-2xl text-cream/90 group-hover:text-gold transition-colors">₹{product.variants[0].price.toLocaleString()}</span>
            {product.variants[0].originalPrice > product.variants[0].price && (
              <span className="font-poppins text-[10px] text-cream/20 line-through tracking-tighter italic">Was ₹{product.variants[0].originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category))];
  const filteredProducts = filter === "All" ? products : products.filter(p => p.category === filter);

  return (
    <main className="min-h-screen bg-[#0a1810] selection:bg-gold/30">
      <Navbar />

      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gold/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <header className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="font-poppins text-gold text-[10px] tracking-[0.5em] uppercase mb-4">The Collection</p>
                <h1 className="font-cormorant text-6xl md:text-8xl text-cream leading-tight">Authentic <br /> <span className="italic text-cream/40">Potency.</span></h1>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-wrap gap-3"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-8 py-3 rounded-full font-poppins text-[10px] tracking-widest uppercase transition-all border ${
                      filter === cat 
                        ? "bg-gold border-gold text-[#0a1810] font-bold" 
                        : "bg-white/5 border-white/10 text-cream/40 hover:border-gold/30 hover:text-cream"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {loading ? (
              Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </AnimatePresence>
            )}
          </div>

          {!loading && filteredProducts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 text-center"
            >
              <span className="text-4xl mb-6 block">🍃</span>
              <h3 className="font-cormorant text-2xl text-cream/60 italic">This category is currently being harvested.</h3>
              <button onClick={() => setFilter("All")} className="mt-8 text-gold font-poppins text-[10px] tracking-widest uppercase border-b border-gold/20 pb-1 hover:border-gold transition-all">Back to Collection</button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Luxury Footer Teaser */}
      <section className="py-32 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-cormorant text-4xl text-cream mb-6 italic">Grown by Nature, Perfected by Tradition</h2>
          <div className="w-20 h-[1px] bg-gold/20 mx-auto mb-8" />
          <p className="font-poppins text-cream/40 text-sm leading-relaxed max-w-2xl mx-auto italic">
            Each bottle is crafted in small batches using traditional infusion methods passed down through generations of Ayurvedic practitioners.
          </p>
        </div>
      </section>
    </main>
  );
}
