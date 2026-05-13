"use client";

import { motion } from "framer-motion";
import { heroProduct } from "@/data/product";

export default function ReviewsSection() {
  const { reviews, rating, reviewCount } = heroProduct;

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0a1810] to-[#0d1f15]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-poppins text-gold/80 text-[11px] tracking-[0.3em] uppercase mb-3">Customer Love</p>
          <h2 className="font-cormorant text-5xl md:text-6xl text-cream mb-4">Reviews</h2>
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-lg ${i < Math.floor(rating) ? "text-gold" : "text-cream/20"}`}>★</span>
              ))}
            </div>
            <span className="font-cormorant text-3xl text-gold">{rating}</span>
            <span className="font-poppins text-cream/40 text-sm">({reviewCount.toLocaleString()} reviews)</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-gold/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-poppins text-gold text-sm font-bold">
                  {review.name[0]}
                </div>
                <div>
                  <h4 className="font-poppins text-sm text-cream">{review.name}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <span key={j} className={`text-[10px] ${j < review.rating ? "text-gold" : "text-cream/20"}`}>★</span>
                      ))}
                    </div>
                    {review.verified && (
                      <span className="text-[9px] font-poppins text-emerald-400/70 tracking-wider uppercase">✓ Verified</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="font-poppins text-cream/50 text-sm leading-relaxed">{review.text}</p>
              <p className="font-poppins text-cream/20 text-[10px] mt-3">
                {new Date(review.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
