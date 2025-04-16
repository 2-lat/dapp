"use client";

import { motion, type MotionValue } from "motion/react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
export const Stars = ({
  starsOpacity,
  starsScale,
}: {
  starsOpacity?: MotionValue<number>;
  starsScale?: MotionValue<number>;
}) => {
  const isMounted = useMounted();
  const { resolvedTheme: theme } = useTheme();
  const isWhite = theme === "light";

  if (!isMounted || isWhite) return null;

  return (
    <motion.div
      className="fixed top-1/2 left-1/2 z-10 size-0"
      style={{
        opacity: starsOpacity,
        scale: starsScale,
      }}
    >
      <motion.div
        className="stars-1"
        style={{
          scale: starsScale,
        }}
      ></motion.div>
      <motion.div
        className="stars-2"
        style={{
          scale: starsScale,
        }}
      ></motion.div>
      <motion.div
        className="stars-3"
        style={{
          scale: starsScale,
        }}
      ></motion.div>
      <motion.div
        className="stars-4"
        style={{
          scale: starsScale,
        }}
      ></motion.div>
      <motion.div
        className="stars-5"
        style={{
          scale: starsScale,
        }}
      ></motion.div>
    </motion.div>
  );
};
