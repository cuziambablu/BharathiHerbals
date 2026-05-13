"use client";

import { useEffect, useRef, useCallback } from "react";
import { useScroll, useTransform } from "framer-motion";

const FRAME_COUNT = 120;

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, FRAME_COUNT]);

  /* ── Resize handler ── */
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    sizeRef.current = { w: rect.width, h: rect.height, dpr };
  }, []);

  useEffect(() => {
    // Preload all frames
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/images/sequence/frame-${String(i).padStart(3, "0")}.jpg`;
      images.push(img);
    }
    imagesRef.current = images;

    // Initial size
    handleResize();
    window.addEventListener("resize", handleResize);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;

    const render = () => {
      const idx = Math.min(Math.max(Math.round(frameIndex.get()), 1), FRAME_COUNT);
      const img = imagesRef.current[idx - 1];
      const { w, h, dpr } = sizeRef.current;

      if (img && img.complete && img.naturalWidth > 0) {
        // Reset transform
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Fill entire canvas with pure black first
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);

        // CONTAIN logic — fit the entire frame inside the viewport
        // The bottle is NEVER cropped. Black fills any empty space.
        const hRatio = w / img.naturalWidth;
        const vRatio = h / img.naturalHeight;
        const ratio = Math.min(hRatio, vRatio); // contain = min (never crop)

        const drawW = img.naturalWidth * ratio;
        const drawH = img.naturalHeight * ratio;
        const offsetX = (w - drawW) / 2;
        const offsetY = (h - drawH) / 2;

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

        // ── Cover Veo watermark ──────────────────────────────────────────────
        // The watermark sits in the bottom-right corner of the frame.
        // Paint a black rect over the last ~14% width × 9% height of the frame.
        const patchW = drawW * 0.14;
        const patchH = drawH * 0.09;
        ctx.fillStyle = "#000000";
        ctx.fillRect(
          offsetX + drawW - patchW,  // x: right edge of frame minus patch width
          offsetY + drawH - patchH,  // y: bottom edge of frame minus patch height
          patchW,
          patchH
        );
      }

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [frameIndex, handleResize]);

  return (
    <div ref={containerRef} className="h-[1400vh] w-full relative bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        {/* Subtle gradient fade at very bottom for section transition */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
