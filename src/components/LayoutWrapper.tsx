"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Navigation } from "./Navigation";
import { Stars } from "./Stars";
import { usePathname } from "next/navigation";

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const containerRef = useRef<HTMLDivElement>(null);
  const [showNav, setShowNav] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(!isHome);
  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    if (isHome) setIsNavVisible(scrollYProgress.get() > 0.9);
    else setIsNavVisible(true);
  }, [isHome, scrollYProgress])

  useEffect(() => {
    if (!isHome) return;

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setIsNavVisible(latest > 0.9);
    });

    return () => unsubscribe();
  }, [isHome, scrollYProgress]);

  return (
    <div className="relative min-h-screen" ref={containerRef}>
      <Navigation isVisible={isNavVisible} />
      <div className="relative min-h-screen">
        {/* Top gradient mask */}
        <motion.div className="fixed top-0 left-0 right-0 h-48 bg-gradient-to-b from-background via-background/80 to-transparent z-[5] pointer-events-none" />
        
        {/* Bottom gradient mask */}
        <motion.div className="fixed bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent z-[5] pointer-events-none" />
        
        {/* Content with padding */}
        <div className="py-40">
          {children}
        </div>
      </div>
      {/* <Stars starsOpacity={isHome ? starsOpacity : undefined} starsScale={isHome ? starsScale : undefined} /> */}
    </div>
  );
}; 