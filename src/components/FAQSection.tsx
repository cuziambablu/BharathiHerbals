"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { faqData } from "@/data/product";

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#0d1f15] to-[#0a1810]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-poppins text-gold/80 text-[11px] tracking-[0.3em] uppercase mb-3">Got Questions?</p>
          <h2 className="font-cormorant text-5xl md:text-6xl text-cream">FAQ</h2>
        </motion.div>

        <div className="space-y-3">
          {faqData.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.02]"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-poppins text-sm text-cream/80 pr-4">{faq.q}</span>
                <motion.span
                  animate={{ rotate: openIdx === i ? 45 : 0 }}
                  className="text-gold text-xl flex-shrink-0"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 font-poppins text-sm text-cream/40 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
