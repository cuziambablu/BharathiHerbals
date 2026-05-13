"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { productData } from "@/data/product";

export default function TextOverlays() {
  const { scrollYProgress } = useScroll();

  // We have 4 sections over the first 50% of the scroll.
  // We'll map scroll ranges to opacity.
  // 0.0 - 0.1: Section 1
  // 0.12 - 0.22: Section 2
  // 0.24 - 0.34: Section 3
  // 0.36 - 0.46: Section 4

  const opacities = [
    useTransform(scrollYProgress, [0.0, 0.02, 0.08, 0.1], [0, 1, 1, 0]),
    useTransform(scrollYProgress, [0.12, 0.14, 0.2, 0.22], [0, 1, 1, 0]),
    useTransform(scrollYProgress, [0.24, 0.26, 0.32, 0.34], [0, 1, 1, 0]),
    useTransform(scrollYProgress, [0.36, 0.38, 0.44, 0.46], [0, 1, 1, 0]),
  ];

  const scales = [
    useTransform(scrollYProgress, [0.0, 0.1], [0.95, 1.05]),
    useTransform(scrollYProgress, [0.12, 0.22], [0.95, 1.05]),
    useTransform(scrollYProgress, [0.24, 0.34], [0.95, 1.05]),
    useTransform(scrollYProgress, [0.36, 0.46], [0.95, 1.05]),
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {productData.sections.map((text, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 flex items-center justify-center text-center px-4"
          style={{ opacity: opacities[i], scale: scales[i] }}
        >
          <h2 className="font-serif text-5xl md:text-7xl lg:text-9xl uppercase font-black text-cream text-glow leading-tight max-w-6xl mx-auto drop-shadow-2xl">
            {text}
          </h2>
        </motion.div>
      ))}
    </div>
  );
}
