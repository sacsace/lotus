"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HotelImage } from "@/components/hotel-image";
import { useEffect, useState } from "react";

type Slide = { url: string; alt: string };

export function HeroSlider({ slides, children }: { slides: Slide[]; children?: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative min-h-[60vh] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.url}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <HotelImage src={current.url} alt={current.alt} fill priority variant="hero" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex min-h-[60vh] flex-col justify-end px-4 pb-10 pt-16 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-white" : "w-4 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
