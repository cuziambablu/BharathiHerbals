"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100000] bg-[#0a1810] flex flex-col items-center justify-center"
        >
          <div className="relative text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-cormorant text-5xl md:text-7xl text-cream tracking-[0.2em] mb-8"
            >
              BHARATHI
            </motion.h1>
            
            <div className="w-64 h-[1px] bg-white/5 mx-auto relative overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gold"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="mt-6 font-poppins text-gold text-[10px] tracking-[0.4em] uppercase opacity-40">
              The Elixir of Eternal Radiance
            </p>
            
            <motion.span 
              className="absolute -top-12 left-1/2 -translate-x-1/2 font-poppins text-gold/20 text-[60px] font-bold pointer-events-none"
              style={{ opacity: progress / 100 }}
            >
              {progress}%
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
