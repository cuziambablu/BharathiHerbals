"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { trustBadges } from "@/data/product";

function BadgeCard({ badge, i }: { badge: any, i: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  function handleMouseMove(e: any) {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative group p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] hover:border-gold/30 transition-colors cursor-none ${
        i === 0 ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <div style={{ transform: "translateZ(50px)" }} className="flex flex-col h-full">
        <span className="text-4xl md:text-5xl mb-6 block group-hover:scale-110 transition-transform duration-500">{badge.icon}</span>
        <div className="mt-auto">
          <h3 className="font-cormorant text-2xl text-cream mb-2 italic">{badge.title}</h3>
          <p className="font-poppins text-xs text-cream/40 leading-relaxed max-w-[200px]">{badge.desc}</p>
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl pointer-events-none" />
    </motion.div>
  );
}

export default function TrustBadges() {
  return (
    <section className="py-32 px-6 bg-[#0a1810] relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-20">
          <motion.p 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className="font-poppins text-gold text-[10px] tracking-[0.5em] uppercase mb-4"
          >
            The Bharathi Promise
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            className="font-cormorant text-5xl md:text-7xl text-cream italic"
          >
            Purity <span className="text-cream/30">meets</span> <br /> Performance.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
          {trustBadges.map((badge, i) => (
            <BadgeCard key={badge.title} badge={badge} i={i} />
          ))}
        </div>
      </div>
      
      {/* Background Decorative */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/10 to-transparent scale-x-150" />
    </section>
  );
}
