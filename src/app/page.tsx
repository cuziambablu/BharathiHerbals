"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroCanvas from "@/components/HeroCanvas";
import TextOverlays from "@/components/TextOverlays";
import TravelingBottle from "@/components/TravelingBottle";
import PostSequenceContent from "@/components/PostSequenceContent";
import BestSellers from "@/components/BestSellers";
import TrustBadges from "@/components/TrustBadges";

const ReviewsSection = dynamic(() => import("@/components/ReviewsSection"), { ssr: false });
const FAQSection = dynamic(() => import("@/components/FAQSection"), { ssr: false });
const Newsletter = dynamic(() => import("@/components/Newsletter"), { ssr: false });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen bg-[#0a1810]" />;

  return (
    <main className="relative bg-[#0a1810]">
      <Navbar />
      <TextOverlays />
      <TravelingBottle />
      <HeroCanvas />
      <PostSequenceContent />
      <BestSellers />
      <TrustBadges />
      <ReviewsSection />
      <FAQSection />
      <Newsletter />
    </main>
  );
}
