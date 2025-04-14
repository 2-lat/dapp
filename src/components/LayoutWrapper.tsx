"use client";

import { useMounted } from "@/hooks/useMounted";
import { motion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Logotype } from "./Logotype";
import { Navigation } from "./Navigation";
export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inLogoVisible, setInLogoVisible] = useState(true);

  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const unsubscribeScrollY = scrollY.on("change", (latest) => {
      const previous = scrollY.getPrevious();
      if (previous && latest > previous && latest > 150) {
        setInLogoVisible(false);
      } else {
        setInLogoVisible(true);
      }
    });
    const unsubscribeScrollYProgress = scrollYProgress.on(
      "change",
      (latest) => {
        setTimeout(() => {
          console.log("latest progress", latest);
          if (latest === 0 || latest === 1) {
            console.log("setting nav visible");
            setInLogoVisible(true);
          }
        }, 100);
      },
    );

    return () => {
      unsubscribeScrollY();
      unsubscribeScrollYProgress();
    };
  }, [scrollY, scrollYProgress]);

  return (
    <div className="relative min-h-screen" ref={containerRef}>
      <Logotype isVisible={inLogoVisible} />
      <div className="relative min-h-screen">
        {/* Top gradient mask */}
        <motion.div
          className="from-background via-background/80 pointer-events-none fixed top-0 right-0 left-0 z-[5] h-48 bg-gradient-to-b to-transparent"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          animate={mounted ? (inLogoVisible ? "visible" : "hidden") : "hidden"}
        />
        {/* Bottom gradient mask */}
        <motion.div
          className="from-background via-background/80 pointer-events-none fixed right-0 bottom-0 left-0 z-[5] h-48 bg-gradient-to-t to-transparent"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
          animate={mounted ? (inLogoVisible ? "visible" : "hidden") : "hidden"}
        />

        {/* Content with padding */}
        <div className="py-40">{children}</div>
      </div>

      <Navigation isVisible={inLogoVisible} />
      {/* <Stars starsOpacity={isHome ? starsOpacity : undefined} starsScale={isHome ? starsScale : undefined} /> */}
    </div>
  );
};
