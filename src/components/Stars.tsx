"use client";

import { motion, useTransform } from "motion/react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

export const Stars = ({ starsOpacity, starsScale }: { starsOpacity: any; starsScale: any }) => {
  const { resolvedTheme: theme } = useTheme();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isWhite = theme === "light";

  if (isWhite) return null;

  return (
    <motion.div
      className="fixed top-1/2 left-1/2 size-0 z-[10]"
      style={{
        opacity: isHome ? starsOpacity : 1,
        scale: isHome ? starsScale : 1,
      }}
    >
      <motion.div
        className="stars-1"
        style={{
          scale: isHome ? starsScale : 1,
        }}
      ></motion.div>
      <motion.div
        className="stars-2"
        style={{
          scale: isHome ? starsScale : 1,
        }}
      ></motion.div>
      <motion.div
        className="stars-3"
        style={{
          scale: isHome ? starsScale : 1,
        }}
      ></motion.div>
      <motion.div
        className="stars-4"
        style={{
          scale: isHome ? starsScale : 1,
        }}
      ></motion.div>
      <motion.div
        className="stars-5"
        style={{
          scale: isHome ? starsScale : 1,
        }}
      ></motion.div>
    </motion.div>
  );
}; 