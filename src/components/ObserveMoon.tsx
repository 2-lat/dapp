"use client";

import { useMounted } from "@/hooks/useMounted";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useMemo, type ComponentProps } from "react";
import { calculateMoonPath, getCurrentMoonPhase } from "@/utils/moon";
import { cn } from "@/lib/utils";

export const ObserveMoon = ({
  className,
  ...props
}: Omit<ComponentProps<typeof motion.svg>, 'ref'>) => {
  const isMounted = useMounted();
  const { resolvedTheme: theme } = useTheme();
  const isLight = theme === "light";
  const radius = 200;
  const currentAge = getCurrentMoonPhase();

  const [pathA, pathB, pathC] = useMemo(() => {
    return [
      calculateMoonPath(currentAge % 1, radius, 500, 500),
      calculateMoonPath((currentAge + 0.01) % 1, radius, 500, 500),
      calculateMoonPath((currentAge + 0.02) % 1, radius, 500, 500),
    ];
  }, [currentAge]);

  if (!isMounted) return null;

  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="250 250 500 500"
      className={cn("text-foreground", className)}
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <circle
        cx="500"
        cy="500"
        r={isLight ? "201" : "200"}
        fill={isLight ? "currentColor" : "transparent"}
        stroke="currentColor"
        strokeWidth="1"
      />
      {[
        { path: pathA, color: "text-[#f00]" },
        { path: pathB, color: "text-[#0f0]" },
        { path: pathC, color: "text-[#00f]" },
      ].map(({ path, color }) => (
        <motion.path
          key={color}
          d={path}
          fill="currentColor"
          className={isLight ? "text-background" : `${color} mix-blend-screen`}
          strokeWidth="1"
        />
      ))}
    </motion.svg>
  );
};
