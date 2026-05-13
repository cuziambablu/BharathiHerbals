import type { Metadata } from "next";
import { Cormorant_Garamond, Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import Preloader from "@/components/Preloader";
import CustomCursor from "@/components/CustomCursor";
import RitualConcierge from "@/components/RitualConcierge";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import PageTransition from "@/components/PageTransition";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "BHARATHI | Luxury Herbal Elixirs",
  description: "Experience the ultimate in Ayurvedic hair and skin care with Bharathi. Traditionally crafted, scientifically refined.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${cormorant.variable} ${poppins.variable} font-sans bg-[#0a1810] text-cream antialiased selection:bg-gold/30 selection:text-white`}>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <SmoothScrollProvider>
                  <Preloader />
                  <CustomCursor />
                  <RitualConcierge />
                  <PageTransition>
                    <div className="relative z-10">
                      {children}
                    </div>
                  </PageTransition>
                  <CartDrawer />
                </SmoothScrollProvider>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
