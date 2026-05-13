"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "./MagneticButton";

const QUESTIONS = [
  {
    id: "hair_type",
    text: "Describe the nature of your hair.",
    options: [
      { label: "Fine & Silky", val: "fine" },
      { label: "Thick & Coarse", val: "thick" },
      { label: "Wavy & Spirited", val: "wavy" },
      { label: "Coiled & Divine", val: "coiled" }
    ]
  },
  {
    id: "concern",
    text: "What is your primary ritual goal?",
    options: [
      { label: "Profound Growth", val: "growth" },
      { label: "Restorative Repair", val: "repair" },
      { label: "Scalp Sanctuary", val: "scalp" },
      { label: "Luminous Shine", val: "shine" }
    ]
  },
  {
    id: "lifestyle",
    text: "How often do you expose your hair to the elements?",
    options: [
      { label: "Rarely (Sanctuary life)", val: "low" },
      { label: "Daily (Urban traveler)", val: "high" },
      { label: "Frequent Styling", val: "styling" }
    ]
  }
];

export default function RitualConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnswer = (val: string) => {
    const newAnswers = { ...answers, [QUESTIONS[step].id]: val };
    setAnswers(newAnswers);
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setCalculating(true);
    setTimeout(() => {
      setCalculating(false);
      setResult({
        name: "Bharathi Mahabala Elixir",
        desc: "Based on your unique profile, your hair requires the grounding essence of Mahabala and the cooling touch of Neelamari.",
        image: "/images/bharathi-oil.png",
        slug: "bharathi-herbal-oil"
      });
    }, 2500);
  };

  const reset = () => {
    setIsOpen(false);
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-10 right-10 z-[9990] hidden md:block">
        <MagneticButton>
          <button 
            onClick={() => setIsOpen(true)}
            className="w-20 h-20 rounded-full bg-cream text-[#0a1810] shadow-2xl flex items-center justify-center group overflow-hidden border border-gold/20"
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-dashed border-gold/40 rounded-full scale-90"
            />
            <span className="relative font-cormorant text-2xl group-hover:scale-110 transition-transform">✨</span>
          </button>
        </MagneticButton>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10005] bg-[#0a1810]/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full relative">
              <button onClick={reset} className="absolute -top-12 right-0 text-cream/40 hover:text-cream font-poppins text-xs tracking-widest uppercase">Close Ritual</button>

              <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full" />
                
                <AnimatePresence mode="wait">
                  {calculating ? (
                    <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8">
                      <div className="w-20 h-20 border-2 border-gold/10 border-t-gold rounded-full animate-spin mx-auto" />
                      <p className="font-cormorant text-3xl text-cream italic">Consulting the ancient wisdom...</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
                      <p className="font-poppins text-gold text-[10px] tracking-[0.4em] uppercase">Your Prescribed Ritual</p>
                      <h2 className="font-cormorant text-5xl text-cream italic">{result.name}</h2>
                      <div className="w-48 h-48 bg-black/40 rounded-full mx-auto p-8 border border-white/5 shadow-2xl">
                        <img src={result.image} className="w-full h-full object-contain" />
                      </div>
                      <p className="font-poppins text-cream/40 text-sm leading-relaxed max-w-sm mx-auto">{result.desc}</p>
                      <a href={`/product/${result.slug}`} className="inline-block px-12 py-4 bg-gold text-[#0a1810] font-poppins text-[10px] font-bold tracking-[0.2em] uppercase rounded-full hover:scale-105 transition-transform">
                        Begin The Journey
                      </a>
                    </motion.div>
                  ) : (
                    <motion.div key="question" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                      <div className="space-y-4">
                        <p className="font-poppins text-gold text-[10px] tracking-[0.4em] uppercase">Step {step + 1} of {QUESTIONS.length}</p>
                        <h2 className="font-cormorant text-5xl md:text-6xl text-cream leading-tight">{QUESTIONS[step].text}</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {QUESTIONS[step].options.map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => handleAnswer(opt.val)}
                            className="text-left px-8 py-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-gold/40 hover:bg-gold/5 transition-all group"
                          >
                            <span className="font-poppins text-sm text-cream/60 group-hover:text-gold transition-colors">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
