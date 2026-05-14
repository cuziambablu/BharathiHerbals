"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import SearchOverlay from "./SearchOverlay";
import MagneticButton from "./MagneticButton";

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const navBg = useTransform(scrollY, [0, 50], ["rgba(10, 24, 16, 0)", "rgba(10, 24, 16, 0.8)"]);
  const navBorder = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.05)"]);
  const navPadding = useTransform(scrollY, [0, 50], ["2rem", "1rem"]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        style={{ padding: navPadding }}
        className="fixed top-0 left-0 right-0 z-[9998] px-6 md:px-12 transition-all duration-500"
      >
        <motion.div 
          style={{ backgroundColor: navBg, borderColor: navBorder }}
          className="max-w-7xl mx-auto flex items-center justify-between backdrop-blur-2xl border rounded-[2rem] px-8 py-4 md:py-5 shadow-2xl transition-all"
        >
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <motion.span 
              whileHover={{ rotate: 180 }}
              className="text-gold text-2xl"
            >
              ✧
            </motion.span>
            <span className="font-cormorant text-2xl tracking-[0.4em] text-cream font-light group-hover:text-gold transition-all duration-500">
              BHARATHI
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-12">
            {["Home", "Products", "Account", "Admin"].map((item) => (
              <Link 
                key={item} 
                href={item === "Home" ? "/" : item === "Products" ? "/product" : `/${item.toLowerCase()}`}
                className="relative group font-poppins text-[10px] tracking-[0.3em] text-cream/40 hover:text-cream transition-all uppercase"
              >
                {item}
                <motion.span 
                  className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold group-hover:w-full transition-all duration-500"
                />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="relative w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 hover:border-gold/20 flex items-center justify-center text-cream/40 hover:text-gold transition-all group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="View wishlist"
              className="relative w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 hover:border-gold/20 flex items-center justify-center text-cream/40 hover:text-gold transition-all group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-[10px] text-[#0a1810] font-bold flex items-center justify-center border-2 border-[#0a1810]"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 hover:border-gold/20 flex items-center justify-center text-cream/40 hover:text-gold transition-all group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-[10px] text-[#0a1810] font-bold flex items-center justify-center border-2 border-[#0a1810]"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            {/* Buy Now CTA */}
            <div className="hidden md:block">
              <MagneticButton>
                <Link
                  href="/product"
                  className="px-8 py-3 bg-cream text-[#0a1810] font-poppins text-[10px] font-bold tracking-[0.2em] uppercase rounded-full shadow-2xl hover:bg-gold transition-all"
                >
                  Shop Ritual
                </Link>
              </MagneticButton>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-cream/40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 overflow-hidden"
            >
              <div className="bg-[#0a1810]/95 backdrop-blur-3xl border border-white/10 rounded-3xl px-8 py-10 space-y-6">
                {["Home", "Products", "Account", "Admin"].map((item) => (
                  <Link 
                    key={item} 
                    href={item === "Home" ? "/" : item === "Products" ? "/product" : `/${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="block font-cormorant text-4xl text-cream italic"
                  >
                    {item}
                  </Link>
                ))}
                <Link
                  href="/product"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-5 bg-gold text-[#0a1810] font-poppins text-[11px] font-bold tracking-[0.3em] uppercase rounded-2xl"
                >
                  Shop Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
