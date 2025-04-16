"use client";

import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";
import { calculateMoonPath, getCurrentMoonPhase } from "@/utils/moon";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useMemo, useState, type ComponentProps } from "react";

export const ObserveMoon = ({
  className,
  ...props
}: Omit<ComponentProps<typeof motion.svg>, "ref">) => {
  const isMounted = useMounted();
  const { resolvedTheme: theme } = useTheme();
  const isLight = theme === "light";
  const radius = 200;
  const [time] = useState(Date.now());
  const currentAge = getCurrentMoonPhase(time);

  const [pathA, pathB, pathC] = useMemo(() => {
    return [
      calculateMoonPath(currentAge % 1, radius, 500, 500),
      calculateMoonPath((currentAge + 0.02) % 1, radius, 500, 500),
      calculateMoonPath((currentAge + 0.04) % 1, radius, 500, 500),
    ];
  }, [currentAge]);

  if (!isMounted) return null;

  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="250 250 500 500"
      className={cn("text-foreground rotate-[-24deg]", className)}
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <defs>
        <mask id="moon-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="black" />
          <circle cx="500" cy="500" r="200" fill="white" />
        </mask>
      </defs>
      <circle
        cx="500"
        cy="500"
        r={isLight ? "201" : "200"}
        fill={isLight ? "currentColor" : "bg-background"}
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
          className={cn(
            isLight ? "text-background" : `${color} mix-blend-screen`,
          )}
          strokeWidth="1"
          mask={`url(#moon-mask)`}
        />
      ))}
    </motion.svg>
  );
};
