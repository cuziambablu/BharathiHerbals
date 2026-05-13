"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { productData } from "@/data/product";

/* ─── Reusable animated section wrapper ─── */
function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Ingredient Card ─── */
function IngredientCard({ name, index }: { name: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-emerald/50 to-forest/80 p-8 backdrop-blur-sm hover:border-gold/50 transition-all duration-500"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/0 group-hover:from-gold/5 group-hover:to-gold/10 transition-all duration-500" />
      <div className="relative z-10">
        <span className="block font-serif text-gold/40 text-5xl font-light mb-3">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h4 className="font-serif text-2xl text-cream font-semibold tracking-wide">
          {name}
        </h4>
      </div>
    </motion.div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ number, label, desc, index }: { number: string; label: string; desc: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className="rounded-2xl border border-gold/15 bg-emerald/30 backdrop-blur-sm p-8 hover:border-gold/40 transition-colors duration-500"
    >
      <span className="block font-serif text-gold text-6xl font-bold mb-3 text-glow">
        {number}
      </span>
      <h4 className="font-serif text-xl text-cream mb-3">
        {label}
      </h4>
      <p className="font-sans text-cream/60 text-sm leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}

/* ─── Benefit Item ─── */
function BenefitItem({ text, index }: { text: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.06, ease: "easeOut" }}
      className="flex items-center gap-4 py-4 border-b border-gold/10 last:border-b-0"
    >
      <span className="flex-shrink-0 w-3 h-3 rounded-full bg-gold shadow-[0_0_12px_rgba(200,169,107,0.5)]" />
      <span className="font-sans text-lg text-cream/90 tracking-wide">
        {text}
      </span>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   POST-SEQUENCE CONTENT
   ═══════════════════════════════════════════════ */
export default function PostSequenceContent() {
  return (
    <div className="relative z-30">
      {/* ─── SECTION 1 — Herbal Science ─── */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-emerald via-forest to-brown overflow-hidden">
        {/* Decorative radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <RevealSection className="text-center mb-20">
            <p className="font-sans text-gold tracking-[0.35em] uppercase text-sm mb-6">
              The Science of Nature
            </p>
            <h2 className="font-serif text-5xl md:text-7xl text-cream font-bold mb-8 text-glow">
              Herbal Science
            </h2>
            <p className="font-sans text-cream/70 text-lg max-w-2xl mx-auto leading-relaxed">
              Each ingredient is hand-selected from ancient Ayurvedic texts and
              modern botanical research. Eight powerful herbs converge in a
              single luxurious oil.
            </p>
          </RevealSection>

          {/* Ingredient Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {productData.ingredients.map((ingredient, i) => (
              <IngredientCard key={ingredient} name={ingredient} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2 — Hair Transformation ─── */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-brown via-forest to-emerald overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <RevealSection className="text-center mb-20">
            <p className="font-sans text-gold tracking-[0.35em] uppercase text-sm mb-6">
              Visible Results
            </p>
            <h2 className="font-serif text-5xl md:text-7xl text-cream font-bold mb-8 text-glow">
              Hair Transformation
            </h2>
            <p className="font-sans text-cream/70 text-lg max-w-2xl mx-auto leading-relaxed">
              From the very first application, BHARATHI Herbal Hair Oil
              penetrates deep into the scalp — nourishing roots, reducing
              breakage, and restoring natural lustre.
            </p>
          </RevealSection>

          {/* Benefits List */}
          <div className="max-w-xl mx-auto">
            {productData.benefits.map((benefit, i) => (
              <BenefitItem key={benefit} text={benefit} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3 — Ayurvedic Formula ─── */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-emerald to-forest overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

        <div className="max-w-5xl mx-auto relative z-10 grid md:grid-cols-2 gap-16 items-center">
          <RevealSection>
            <p className="font-sans text-gold tracking-[0.35em] uppercase text-sm mb-6">
              Ancient Wisdom
            </p>
            <h2 className="font-serif text-5xl md:text-6xl text-cream font-bold mb-8 text-glow">
              Ayurvedic
              <br />
              Formula
            </h2>
            <p className="font-sans text-cream/70 text-lg leading-relaxed mb-6">
              Our preparation follows centuries-old Ayurvedic processes —
              slow-cooked infusions, cold-pressed extractions, and traditional
              herbal blending techniques passed down through generations.
            </p>
            <p className="font-sans text-cream/70 text-lg leading-relaxed">
              Every drop carries the essence of India&apos;s ancient wellness
              heritage, refined with modern quality standards.
            </p>
          </RevealSection>

          <RevealSection className="space-y-6">
            {[
              {
                title: "Cold-Pressed Extraction",
                desc: "Preserves the vital nutrients and natural potency of every herb.",
              },
              {
                title: "Slow-Cooked Infusion",
                desc: "48-hour traditional process ensures deep herbal integration.",
              },
              {
                title: "Zero Chemicals",
                desc: "No parabens, sulfates, or synthetic additives — ever.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-gold/15 bg-forest/60 backdrop-blur-sm p-6 hover:border-gold/40 transition-colors duration-500"
              >
                <h4 className="font-serif text-xl text-gold mb-2">
                  {item.title}
                </h4>
                <p className="font-sans text-cream/60 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </RevealSection>
        </div>
      </section>

      {/* ─── SECTION 4 — Customer Trust ─── */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-forest to-brown overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <RevealSection className="mb-16">
            <p className="font-sans text-gold tracking-[0.35em] uppercase text-sm mb-6">
              Pure Promise
            </p>
            <h2 className="font-serif text-5xl md:text-7xl text-cream font-bold mb-8 text-glow">
              Trusted by Nature
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                number: "100%",
                label: "Natural Ingredients",
                desc: "Every ingredient is sourced from nature — nothing artificial, nothing synthetic.",
              },
              {
                number: "0%",
                label: "Chemicals",
                desc: "Completely free of parabens, sulfates, silicones, and artificial fragrances.",
              },
              {
                number: "∞",
                label: "All Hair Types",
                desc: "Formulated for every hair type — curly, straight, wavy, thick, or fine.",
              },
            ].map((stat, i) => (
              <StatCard key={i} number={stat.number} label={stat.label} desc={stat.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA SECTION ─── */}
      <section className="relative py-40 px-6 bg-gradient-to-b from-brown via-forest to-black overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <RevealSection>
            <p className="font-sans text-gold tracking-[0.35em] uppercase text-sm mb-8">
              {productData.name}
            </p>
            <h2 className="font-serif text-5xl md:text-8xl text-cream font-bold mb-6 text-glow leading-tight">
              {productData.finalTagline}
            </h2>
            <p className="font-sans text-cream/50 text-xl mb-4">
              {productData.price}
            </p>
            <div className="mt-12">
              <button className="px-12 py-4 bg-cream text-forest font-sans font-bold tracking-widest text-lg hover:bg-gold hover:text-forest transition-all duration-500 shadow-[0_0_40px_rgba(200,169,107,0.3)]">
                SHOP NOW
              </button>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-6 bg-black text-center border-t border-gold/10">
        <p className="font-sans text-cream/40 text-sm tracking-wider">
          © 2026 BHARATHI BEAUTY PRODUCTS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
