"use client";

import { motion } from "motion/react";

export const RevealText = ({ children }: { children: string }) => {
  if (typeof children !== "string") {
    return children;
  } else {
    return (
      <motion.div
        className="relative"
        data-testid="reveal-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <span className="" data-testid="inner">
          {children}
        </span>
        <div
          className="absolute top-0 left-0 h-full w-full select-none pointer-events-none"
          data-testid="mask"
        >
          {children?.split?.("").map((char, index) => (
            <span
              key={index}
              className="relative"
              data-testid={`mask-${index}`}
            >
              {char}
            </span>
          ))}
        </div>
      </motion.div>
    );
  }
};
