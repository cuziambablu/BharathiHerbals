"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

function useTransparentBottle(src: string) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Flood-fill from edges to remove black background
      const visited = new Uint8Array(w * h);
      const queue: number[] = [];

      const isDark = (idx: number) => {
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];
        return r < 40 && g < 40 && b < 40;
      };

      for (let x = 0; x < w; x++) {
        const top = x;
        const bottom = (h - 1) * w + x;
        if (isDark(top)) { queue.push(top); visited[top] = 1; }
        if (isDark(bottom)) { queue.push(bottom); visited[bottom] = 1; }
      }
      for (let y = 0; y < h; y++) {
        const left = y * w;
        const right = y * w + (w - 1);
        if (isDark(left)) { queue.push(left); visited[left] = 1; }
        if (isDark(right)) { queue.push(right); visited[right] = 1; }
      }

      while (queue.length > 0) {
        const idx = queue.shift()!;
        data[idx * 4 + 3] = 0;
        const x = idx % w;
        const y = Math.floor(idx / w);
        const neighbors: number[] = [];
        if (x > 0) neighbors.push(idx - 1);
        if (x < w - 1) neighbors.push(idx + 1);
        if (y > 0) neighbors.push(idx - w);
        if (y < h - 1) neighbors.push(idx + w);
        for (const nIdx of neighbors) {
          if (!visited[nIdx] && isDark(nIdx)) {
            visited[nIdx] = 1;
            queue.push(nIdx);
          }
        }
      }

      // Anti-alias edges
      const alphaSnap = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) alphaSnap[i] = data[i * 4 + 3];
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          if (alphaSnap[idx] > 0) {
            let tc = 0;
            if (alphaSnap[idx - 1] === 0) tc++;
            if (alphaSnap[idx + 1] === 0) tc++;
            if (alphaSnap[idx - w] === 0) tc++;
            if (alphaSnap[idx + w] === 0) tc++;
            if (tc > 0 && tc < 4) {
              data[idx * 4 + 3] = Math.round(data[idx * 4 + 3] * (1 - tc * 0.15));
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL("image/png"));
    };
    img.src = src;
  }, [src]);

  return dataUrl;
}

export default function TravelingBottle() {
  const { scrollYProgress } = useScroll();
  const bottleSrc = useTransparentBottle("/images/bharathi-oil.png");

  /*
   * IMPORTANT: The bottle ONLY appears AFTER the canvas sequence ends.
   * The canvas is ~1400vh of ~1900vh total page ≈ 0.74 scroll progress.
   *
   * Scroll map:
   *   0.00 – 0.70  → Completely hidden (canvas sequence is the hero)
   *   0.70 – 0.75  → Fade in smoothly, centered
   *   0.75 – 0.82  → Drift RIGHT with slight tilt
   *   0.82 – 0.90  → Drift LEFT with opposite tilt
   *   0.90 – 1.00  → Settle to CENTER, scale up → final hero
   */

  // Completely invisible during entire canvas sequence
  const opacity = useTransform(scrollYProgress, [0.70, 0.75], [0, 1]);

  const x = useTransform(
    scrollYProgress,
    [0.73, 0.78, 0.85, 0.92, 0.96, 1.0],
    ["0%", "25%", "-22%", "18%", "5%", "0%"]
  );

  const rotate = useTransform(
    scrollYProgress,
    [0.73, 0.78, 0.85, 0.92, 0.96, 1.0],
    [0, -6, 6, -4, -1, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [0.70, 0.75, 0.95, 1.0],
    [0.8, 1, 1, 1.1]
  );

  const y = useTransform(
    scrollYProgress,
    [0.75, 0.82, 0.88, 0.94, 1.0],
    ["0%", "-2%", "2%", "-1%", "0%"]
  );

  if (!bottleSrc) return null;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none flex items-center justify-center"
      style={{ opacity, zIndex: 9999 }}
    >
      <motion.div style={{ x, y, rotate, scale }} className="relative w-auto">
        <img
          src={bottleSrc}
          alt="BHARATHI Herbal Hair Oil"
          className="h-[50vh] max-h-[500px] w-auto object-contain"
          style={{
            filter: "drop-shadow(0 10px 40px rgba(200,169,107,0.3)) drop-shadow(0 20px 50px rgba(0,0,0,0.4))",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
