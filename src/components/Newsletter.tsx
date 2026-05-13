"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { useToast } from "@/context/ToastContext";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();
  const container = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    showToast("The gates to our inner circle are open.", "success");
    setEmail("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section ref={container} className="py-40 px-6 bg-[#0a1810] relative overflow-hidden border-t border-white/5">
      {/* Parallax Background Text */}
      <motion.div style={{ y }} className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
        <h2 className="text-[30vw] font-cormorant font-bold whitespace-nowrap text-gold">BHARATHI</h2>
      </motion.div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-left"
          >
            <p className="font-poppins text-gold text-[10px] tracking-[0.5em] uppercase mb-6">The Inner Circle</p>
            <h2 className="font-cormorant text-5xl md:text-6xl text-cream leading-tight mb-8">
              Join the <span className="italic text-gold">Ritual Club</span> <br /> 
              <span className="text-cream/30">& discover yours.</span>
            </h2>
            <p className="font-poppins text-cream/40 text-sm leading-relaxed max-w-sm">
              Receive private invitations to new elixir launches, ancient hair wisdom, and exclusive luxury experiences.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 md:p-16 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="font-poppins text-[10px] text-cream/20 uppercase tracking-widest ml-1">Secret Transmission</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your private email"
                  required
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-cream font-poppins text-sm placeholder:text-cream/10 focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all"
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitted}
                className="w-full py-5 bg-cream text-[#0a1810] font-poppins text-[11px] font-bold tracking-[0.3em] uppercase rounded-2xl shadow-2xl hover:bg-gold transition-all disabled:opacity-50"
              >
                {submitted ? "Invitation Sent" : "Request Access"}
              </motion.button>
            </form>
            
            <p className="font-poppins text-cream/10 text-[9px] mt-8 text-center uppercase tracking-[0.2em]">
              We value your sanctuary. Zero noise. Only essence.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
