"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { getProductBySlug } from "@/lib/db";
import { type Product } from "@/data/product";
import Navbar from "@/components/Navbar";
import ReviewsSection from "@/components/ReviewsSection";
import FAQSection from "@/components/FAQSection";
import Newsletter from "@/components/Newsletter";
import Link from "next/link";
import MagneticButton from "@/components/MagneticButton";

function ProductGallery({ images }: { images: string[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }}
        className="relative aspect-[4/5] bg-[#0c1c13] border border-white/5 rounded-[3rem] overflow-hidden cursor-zoom-in group"
        onClick={() => setZoomed(true)}
      >
        <div className="absolute inset-0 bg-gradient-radial from-gold/5 via-transparent to-transparent opacity-50" />
        <motion.img
          key={activeIdx}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          src={images[activeIdx]}
          alt="Product"
          className="w-full h-full object-contain p-12 relative z-10 group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i === activeIdx ? "w-8 bg-gold" : "w-2 bg-white/20"}`} 
            />
          ))}
        </div>
      </motion.div>

      <div className="flex gap-4 px-2">
        {images.map((img, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -4 }}
            onClick={() => setActiveIdx(i)}
            className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-500 bg-[#0c1c13] p-2 ${
              i === activeIdx ? "border-gold shadow-lg shadow-gold/10 scale-105" : "border-white/5 opacity-40 hover:opacity-100 hover:border-white/20"
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-contain" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/98 flex items-center justify-center p-8 md:p-20 cursor-zoom-out backdrop-blur-2xl"
            onClick={() => setZoomed(false)}
          >
            <motion.img
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              src={images[activeIdx]}
              alt="Product"
              className="max-w-full max-h-full object-contain drop-shadow-[0_0_100px_rgba(200,169,107,0.1)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductSlugPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      try {
        const data = await getProductBySlug(slug as string);
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a1810] flex items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-2 border-gold/10 rounded-full" />
        <div className="absolute inset-0 border-2 border-t-gold rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#0a1810] flex flex-col items-center justify-center gap-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="text-6xl mb-6">🌿</div>
        <h1 className="font-cormorant text-4xl text-cream mb-4 italic">Product has vanished</h1>
        <p className="font-poppins text-cream/30 text-sm tracking-widest uppercase mb-12">It may have been moved to the archives</p>
        <Link href="/product">
          <MagneticButton>
            <span className="px-12 py-4 bg-gold text-[#0a1810] font-poppins text-xs font-bold tracking-[0.2em] uppercase rounded-full">Return to Shop</span>
          </MagneticButton>
        </Link>
      </motion.div>
    </div>
  );

  const variant = product.variants[selectedVariant];
  const liked = isInWishlist(product.id);
  const discount = Math.round((1 - variant.price / variant.originalPrice) * 100);

  const handleAddToCart = () => {
    addToCart(
      { productId: product.id, name: product.name, size: variant.size, price: variant.price, image: product.images[0] },
      quantity
    );
    showToast(`The ritual begins. ${product.name} added.`, "success");
  };

  return (
    <main className="min-h-screen bg-[#0a1810] selection:bg-gold/30">
      <Navbar />

      <div className="relative pt-32 md:pt-40 pb-20 px-6">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            <ProductGallery images={product.images} />

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="h-[1px] w-8 bg-gold/40" />
                  <p className="font-poppins text-gold text-[10px] tracking-[0.4em] uppercase">{product.category}</p>
                </div>
                <h1 className="font-cormorant text-6xl md:text-7xl text-cream leading-[0.9] tracking-tight">{product.name}</h1>
                <p className="font-poppins text-cream/50 text-sm leading-relaxed max-w-lg italic">{product.tagline || product.description}</p>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? "text-gold" : "text-white/10"}`}>★</span>
                    ))}
                    <span className="font-poppins text-cream/40 text-[10px] ml-2 tracking-widest uppercase">{product.rating} Rating</span>
                  </div>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <span className="font-poppins text-cream/30 text-[10px] tracking-widest uppercase">{product.reviewCount.toLocaleString()} Verified Reviews</span>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-end gap-6">
                  <span className="font-cormorant text-5xl text-gold">₹{variant.price.toLocaleString()}</span>
                  {variant.originalPrice > variant.price && (
                    <div className="flex items-center gap-4 mb-1">
                      <span className="font-poppins text-xl text-cream/20 line-through">₹{variant.originalPrice.toLocaleString()}</span>
                      <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold font-poppins tracking-widest uppercase rounded-lg border border-gold/20">-{discount}% Exclusive</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="font-poppins text-gold/40 text-[9px] tracking-[0.3em] uppercase">Select Presentation</p>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedVariant(i)}
                        className={`px-8 py-4 rounded-2xl border font-poppins text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-500 ${
                          i === selectedVariant
                            ? "border-gold bg-gold/10 text-gold shadow-lg shadow-gold/5 scale-105"
                            : "border-white/5 text-cream/30 hover:border-white/20 hover:text-cream/60"
                        }`}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center justify-between w-full md:w-32 bg-white/[0.03] rounded-2xl px-6 py-4 border border-white/5">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-cream/30 hover:text-gold transition-colors font-bold">−</button>
                    <span className="font-poppins text-sm text-cream">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="text-cream/30 hover:text-gold transition-colors font-bold">+</button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    className="w-full md:flex-1 py-5 bg-cream text-[#0a1810] font-poppins text-[10px] font-bold tracking-[0.3em] uppercase rounded-2xl shadow-2xl transition-all hover:bg-gold hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Experience Now — ₹{(variant.price * quantity).toLocaleString()}
                  </button>

                  <MagneticButton distance={0.2}>
                    <button
                      onClick={() => {
                        toggleWishlist(product.id);
                        showToast(liked ? "Removed from sanctuary" : "Saved to sanctuary", "info");
                      }}
                      className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-500 ${
                        liked ? "border-gold bg-gold/10" : "border-white/10 bg-white/[0.04] hover:border-white/30"
                      }`}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "#C8A96B" : "none"} stroke={liked ? "#C8A96B" : "currentColor"} strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </button>
                  </MagneticButton>
                </div>
              </div>

              <div className="pt-12 border-t border-white/5 grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-poppins text-gold text-[9px] tracking-[0.3em] uppercase mb-4">The Essence</h4>
                  <ul className="space-y-3">
                    {product.ingredients.slice(0, 3).map(ing => (
                      <li key={ing} className="font-poppins text-[10px] text-cream/40 tracking-wider flex items-center gap-3">
                        <span className="w-1 h-1 rounded-full bg-gold/30" /> {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-poppins text-gold text-[9px] tracking-[0.3em] uppercase mb-4">Benefits</h4>
                  <ul className="space-y-3">
                    {product.benefits.slice(0, 3).map(ben => (
                      <li key={ben} className="font-poppins text-[10px] text-cream/40 tracking-wider flex items-center gap-3">
                        <span className="w-1 h-1 rounded-full bg-gold/30" /> {ben}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ReviewsSection />
      <FAQSection />
      
      <section className="py-40 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-poppins text-gold/40 text-[9px] tracking-[0.5em] uppercase mb-8">The Ritual</p>
            <h2 className="font-cormorant text-5xl md:text-7xl text-cream italic leading-tight">Gently massage into the <br /> <span className="text-gold/90">roots of existence.</span></h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-poppins text-cream/30 text-sm leading-relaxed max-w-xl mx-auto"
          >
            Apply 5-10ml of oil to the scalp and hair. Massage using circular motions for 10 minutes. 
            Leave for at least 2 hours or overnight for profound results.
          </motion.p>
          <div className="flex justify-center pt-8">
            <div className="w-[1px] h-20 bg-gradient-to-b from-gold/40 to-transparent" />
          </div>
        </div>
      </section>

      <Newsletter />
    </main>
  );
}
